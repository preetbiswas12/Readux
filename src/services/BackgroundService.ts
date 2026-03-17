/**
 * Project Aegis - Background Service
 * Handles background listening for messages/calls when app is not in foreground
 * Works in conjunction with:
 * - BatteryModeService (manages check intervals)
 * - Native Foreground Service (Android)
 * - Background Fetch (iOS)
 */

import type { Message } from '../types';
import { GunDBService } from './gundbService';
import WebRTCService from './WebRTCService';
import { MessageService } from './MessageService';
import { SQLiteService } from './SQLiteService';
import BatteryModeService from './BatteryModeService';

interface BackgroundCheckResult {
  messagesChecked: number;
  incomingCalls: number;
  errorsEncountered: number;
  lastCheckTime: number;
}

export class BackgroundService {
  private static isBackgroundActive = false;
  private static lastCheckTime = 0;
  private static checkHandlers: ((result: BackgroundCheckResult) => void)[] = [];

  /**
   * Initialize background service
   * Called once at app startup
   */
  static async initialize(): Promise<void> {
    console.log('[Background] Initializing background service...');
    try {
      await BatteryModeService.initialize();
      console.log('[Background] ✅ Initialized');
    } catch (error) {
      console.error('[Background] Failed to initialize:', error);
    }
  }

  /**
   * Enable background listening
   * Starts polling or foreground service based on battery mode
   */
  static async enableBackgroundListening(userAlias: string): Promise<void> {
    if (this.isBackgroundActive) {
      console.log('[Background] Already listening in background');
      return;
    }

    console.log('[Background] 🔊 Enabling background listening...');
    this.isBackgroundActive = true;

    const mode = BatteryModeService.getMode();

    if (mode === 'always') {
      // AlwaysOnline: Start native foreground service
      console.log('[Background] 🟢 Starting foreground service (AlwaysOnline mode)');
      await this.startForegroundService(userAlias);
    } else {
      // Battery Saver: Start periodic polling
      console.log('[Background] 🟡 Starting periodic polling (Battery Saver mode)');
      BatteryModeService.startPolling(() => this.checkForMessagesAndCalls(userAlias));
    }
  }

  /**
   * Disable background listening
   */
  static async disableBackgroundListening(): Promise<void> {
    console.log('[Background] 🔇 Disabling background listening...');
    this.isBackgroundActive = false;

    const mode = BatteryModeService.getMode();
    if (mode === 'always') {
      await this.stopForegroundService();
    } else {
      BatteryModeService.stopPolling();
    }
  }

  /**
   * Check for messages and calls (called periodically in Battery Saver mode)
   */
  static async checkForMessagesAndCalls(userAlias: string): Promise<void> {
    const startTime = Date.now();
    const result: BackgroundCheckResult = {
      messagesChecked: 0,
      incomingCalls: 0,
      errorsEncountered: 0,
      lastCheckTime: startTime,
    };

    try {
      // Acquire wake lock to stay awake during check
      await BatteryModeService.acquireWakeLock();

      // Check for pending messages in offline queue
      console.log('[Background] 🔍 Checking for offline messages...');
      try {
        const pending = await SQLiteService.getPendingMessages();
        result.messagesChecked = pending.length;

        if (pending.length > 0) {
          console.log(`[Background] Found ${pending.length} offline messages to flush`);
          // TODO: Flush via WebRTC when peer comes online
        }
      } catch (error) {
        console.error('[Background] Failed to check pending messages:', error);
        result.errorsEncountered++;
      }

      // Check for incoming calls via GunDB presence
      console.log('[Background] 📞 Checking for incoming calls...');
      try {
        // TODO: Query recent call requests from GunDB
        // This would check for new call-requests published to DHT
        result.incomingCalls = 0;
      } catch (error) {
        console.error('[Background] Failed to check calls:', error);
        result.errorsEncountered++;
      }

      // Release wake lock after check
      BatteryModeService.releaseWakeLock();

      // Log results
      this.lastCheckTime = Date.now();
      const durationMs = this.lastCheckTime - startTime;
      console.log(
        `[Background] ✅ Check complete in ${durationMs}ms (${result.messagesChecked} messages, ${result.incomingCalls} calls)`
      );

      // Notify listeners
      this.checkHandlers.forEach(handler => handler(result));
    } catch (error) {
      console.error('[Background] Check failed:', error);
      result.errorsEncountered++;
      BatteryModeService.releaseWakeLock();
    }
  }

  /**
   * Start native foreground service (Android only)
   * Requires AndroidManifest.xml setup and native service implementation
   */
  private static async startForegroundService(userAlias: string): Promise<void> {
    console.log('[Background] 📲 Starting native foreground service...');

    try {
      // TODO: Call native Android module via Expo Modules
      // const { ForegroundServiceModule } = NativeModules;
      // await ForegroundServiceModule.startService({
      //   title: 'Aegis Chat',
      //   message: `Connected as @${userAlias}`,
      //   userAlias,
      // });

      console.log('[Background] Foreground service started (stub implementation)');
    } catch (error) {
      console.error('[Background] Failed to start foreground service:', error);
      // Fallback to polling
      BatteryModeService.startPolling(() => this.checkForMessagesAndCalls(userAlias));
    }
  }

  /**
   * Stop native foreground service (Android only)
   */
  private static async stopForegroundService(): Promise<void> {
    console.log('[Background] 📲 Stopping native foreground service...');

    try {
      // TODO: Call native Android module via Expo Modules
      // const { ForegroundServiceModule } = NativeModules;
      // await ForegroundServiceModule.stopService();

      console.log('[Background] Foreground service stopped (stub implementation)');
    } catch (error) {
      console.error('[Background] Failed to stop foreground service:', error);
    }
  }

  /**
   * Subscribe to background check results
   */
  static onBackgroundCheck(handler: (result: BackgroundCheckResult) => void): () => void {
    this.checkHandlers.push(handler);

    return () => {
      const index = this.checkHandlers.indexOf(handler);
      if (index > -1) {
        this.checkHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Get last check time (timestamp)
   */
  static getLastCheckTime(): number {
    return this.lastCheckTime;
  }

  /**
   * Check if background listening is active
   */
  static isActive(): boolean {
    return this.isBackgroundActive;
  }

  /**
   * Get battery mode
   */
  static getBatteryMode() {
    return BatteryModeService.getMode();
  }

  /**
   * Set battery mode (saver or always)
   */
  static setBatteryMode(mode: 'saver' | 'always'): void {
    BatteryModeService.setMode(mode);
  }

  /**
   * Toggle battery mode
   */
  static toggleBatteryMode(): void {
    BatteryModeService.toggleMode();
  }

  /**
   * Manual check trigger (for testing or user-initiated)
   */
  static async manualCheck(userAlias: string): Promise<void> {
    console.log('[Background] Manual check triggered');
    await this.checkForMessagesAndCalls(userAlias);
  }
}

export default new BackgroundService();
