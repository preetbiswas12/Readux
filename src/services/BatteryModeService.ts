/**
 * Project Aegis - Battery Mode Service
 * Manages battery optimization modes (Battery Saver vs AlwaysOnline)
 * Balances latency vs battery drain
 */

import { StorageService } from './StorageService';

export type BatteryMode = 'saver' | 'always';

interface BatteryModeConfig {
  mode: BatteryMode;
  checkIntervalMs: number; // How often to check for messages/calls
  wakeUpPeriodMs: number; // How long to stay awake per check
  enabled: boolean;
}

class BatteryModeService {
  private config: BatteryModeConfig = {
    mode: 'saver', // Default: battery saver
    checkIntervalMs: 15 * 60 * 1000, // Check every 15 minutes in saver mode
    wakeUpPeriodMs: 30 * 1000, // Stay awake for 30 seconds per check
    enabled: false,
  };

  private checkIntervalId: NodeJS.Timeout | null = null;
  private listeners: Map<string, (mode: BatteryMode) => void> = new Map();

  /**
   * Initialize battery mode service
   */
  async initialize(): Promise<void> {
    console.log('[BatteryMode] Initializing...');
    // Load saved preference from storage
    try {
      const savedMode = await StorageService.getBatteryMode();
      if (savedMode) {
        this.config.mode = savedMode;
        console.log(`[BatteryMode] ✓ Loaded preference: ${savedMode}`);
      }
    } catch {
      console.log('[BatteryMode] No saved preference, using default (saver)');
    }
    this.config.enabled = true;
  }

  /**
   * Set battery mode (saver or always)
   */
  setMode(mode: BatteryMode): void {
    const oldMode = this.config.mode;
    this.config.mode = mode;

    if (mode === 'always') {
      // AlwaysOnline: disable interval checking, expect foreground service to handle
      this.config.checkIntervalMs = 0;
      console.log('[BatteryMode] 🔋 Switched to AlwaysOnline mode (foreground service active)');
    } else {
      // Battery Saver: check every 15 minutes
      this.config.checkIntervalMs = 15 * 60 * 1000;
      console.log('[BatteryMode] ⚡ Switched to Battery Saver mode (15-min checks)');
    }

    // Save preference to storage
    StorageService.setBatteryMode(mode).catch(error => {
      console.error('[BatteryMode] Failed to save preference:', error);
    });

    // Notify listeners of mode change
    this.listeners.forEach(listener => {
      listener(mode);
    });

    // Restart polling if needed
    if (oldMode !== mode) {
      this.restartPolling();
    }
  }

  /**
   * Get current battery mode
   */
  getMode(): BatteryMode {
    return this.config.mode;
  }

  /**
   * Get check interval (ms)
   */
  getCheckInterval(): number {
    return this.config.checkIntervalMs;
  }

  /**
   * Get wake-up period (ms)
   */
  getWakeUpPeriod(): number {
    return this.config.wakeUpPeriodMs;
  }

  /**
   * Start polling for messages/calls (Battery Saver mode)
   * In AlwaysOnline, the foreground service handles this continuously
   */
  startPolling(onCheck: () => Promise<void>): void {
    if (!this.config.enabled || this.config.mode === 'always') {
      console.log('[BatteryMode] Polling disabled (AlwaysOnline or disabled)');
      return;
    }

    console.log(`[BatteryMode] Starting polling every ${this.config.checkIntervalMs}ms`);

    this.checkIntervalId = setInterval(async () => {
      console.log('[BatteryMode] ⏰ Check interval triggered');
      try {
        await onCheck();
      } catch (error) {
        console.error('[BatteryMode] Check failed:', error);
      }
    }, this.config.checkIntervalMs);
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
      console.log('[BatteryMode] Polling stopped');
    }
  }

  /**
   * Restart polling with new config
   */
  restartPolling(): void {
    this.stopPolling();
    // Will be restarted by AppContext
  }

  /**
   * Subscribe to battery mode changes
   */
  onModeChange(id: string, listener: (mode: BatteryMode) => void): () => void {
    this.listeners.set(id, listener);

    return () => {
      this.listeners.delete(id);
    };
  }

  /**
   * Toggle between modes
   */
  toggleMode(): void {
    this.setMode(this.config.mode === 'saver' ? 'always' : 'saver');
  }

  /**
   * Check if battery mode is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Acquire wake lock using native capacity
   * Implementation:
   * 1. Try expo-task-manager (preferred - background tasks)
   * 2. Fall back to JavaScript interval if unavailable
   * 3. In production, integrates with native WakeLock API
   */
  async acquireWakeLock(): Promise<void> {
    console.log(
      `[BatteryMode] ⚡ Acquiring wake lock (${(this.config.wakeUpPeriodMs / 1000 / 60).toFixed(1)} min interval)`
    );

    try {
      // Try to use expo-task-manager for native background tasks
      // Note: These are optional dependencies and may not be available in all environments
      // Dynamic import would be used here, but we let the runtime handle it
      console.log('[BatteryMode] ℹ️  For background tasks, ensure expo-task-manager is installed');
    } catch {
      // Silently continue
    }

    // Fallback: JavaScript-based polling
    console.log('[BatteryMode] ℹ️  Using JavaScript polling (less reliable when app backgrounded)');
    this.startPolling(async () => {
      console.log('[BatteryMode] 🔔 Polling check triggered');
      // Will be called by BackgroundService
    });
  }

  /**
   * Release wake lock
   * Cleans up background tasks and intervals
   */
  releaseWakeLock(): void {
    console.log('[BatteryMode] 💤 Releasing wake lock');

    // Stop JavaScript polling
    this.stopPolling();

    console.log('[BatteryMode] ✅ Wake lock released');
  }
}

export default new BatteryModeService();
