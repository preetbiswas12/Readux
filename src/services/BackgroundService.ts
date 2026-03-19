/**
 * Project Aegis - Background Service
 * Handles background listening for messages/calls when app is not in foreground
 * Works in conjunction with:
 * - BatteryModeService (manages check intervals)
 * - Native Foreground Service (Android)
 * - Background Fetch (iOS)
 */

import { GunDBService } from './gundbService';
import { SQLiteService } from './SQLiteService';
import BatteryModeService from './BatteryModeService';
import WebRTCService from './WebRTCService';

interface BackgroundCheckResult {
  messagesChecked: number;
  incomingCalls: number;
  errorsEncountered: number;
  lastCheckTime: number;
  messagesFlushed?: number;
}

export class BackgroundService {
  private isBackgroundActive = false;
  private lastCheckTime = 0;
  private lastCallCheckTime = 0; // Track last call check to avoid duplicates
  private checkHandlers: ((result: BackgroundCheckResult) => void)[] = [];

  /**
   * Initialize background service
   * Called once at app startup
   */
  async initialize(): Promise<void> {
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
  async enableBackgroundListening(userAlias: string): Promise<void> {
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
   * Query recent calls from GunDB DHT
   * Returns the count of new incoming call requests since last check
   */
  private async queryRecentCalls(userAlias: string): Promise<number> {
    return new Promise<number>((resolve) => {
      let callCount = 0;
      let mainTimeout: any;
      // 3 second timeout as safety net
      setTimeout(() => {
        console.log('[Background] Call query timeout - resolving with count:', callCount);
        resolve(callCount);
      }, 3000);

      try {
        // Subscribe to incoming calls for this user
        // Real-time subscription will capture any new calls
        const unsubscribe = GunDBService.subscribeCallRequests(userAlias, (callData: any) => {
          if (!callData) return;

          // Check if call is newer than last check time
          const callTimestamp = callData.timestamp || Date.now();
          if (callTimestamp > this.lastCallCheckTime) {
            callCount++;
            console.log(
              `[Background] 📞 New call from @${callData.from} (type: ${callData.type || 'unknown'})`
            );
          }
        });

        // Clean up subscription after timeout
        let cleanupTimeout: NodeJS.Timeout;
        cleanupTimeout = setTimeout(() => {
          unsubscribe();
          clearTimeout(mainTimeout);
          resolve(callCount);
        }, 2500); // Slightly before the main timeout

        // Store main timeout for cleanup
        mainTimeout = cleanupTimeout;

        // Store cleanup for potential later reference
        this.lastCallCheckTime = Date.now();
      } catch (error) {
        console.error('[Background] Failed to query calls:', error);
        clearTimeout(mainTimeout);
        resolve(0);
      }
    });
  }

  /**
   * Disable background listening
   */
  async disableBackgroundListening(): Promise<void> {
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
  async checkForMessagesAndCalls(userAlias: string): Promise<void> {
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
          console.log(`[Background] Found ${pending.length} pending messages, flushing...`);
          // ✅ FLUSH pending messages by re-sending each one
          const msgsByPeer = new Map<string, any[]>();
          for (const msg of pending) {
            const key = msg.to;
            if (!msgsByPeer.has(key)) msgsByPeer.set(key, []);
            msgsByPeer.get(key)!.push(msg);
          }
          result.messagesFlushed = 0;
          for (const [peerAlias, msgs] of msgsByPeer) {
            try {
              // Establish peer connection first
              console.log(`[Background] Connecting to @${peerAlias} for message flush...`);
              await WebRTCService.createPeerConnection(peerAlias, true);
              
              // Import MessageService for re-sending
              const { MessageService } = await import('./MessageService');
              
              // Re-send each pending message
              for (const msg of msgs) {
                try {
                  await MessageService.sendMessage(
                    msg.from,
                    msg.to,
                    msg.content,
                    msg.recipientPublicKey
                  );
                  // Remove from pending queue after successful send
                  await SQLiteService.removePendingMessage(msg.id);
                  result.messagesFlushed! += 1;
                  console.log(`[Background] ✓ Flushed pending message: ${msg.id}`);
                } catch (sendError) {
                  console.warn(`[Background] Failed to flush message ${msg.id}:`, sendError);
                  // Increment retry count in DB (handled by retry logic)
                }
              }
              console.log(`[Background] ✓ Flushed ${result.messagesFlushed} message(s) to @${peerAlias}`);
            } catch (error) {
              console.warn(`[Background] Failed to flush to @${peerAlias}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('[Background] Failed to check pending messages:', error);
        result.errorsEncountered++;
      }

      // Check for incoming calls via GunDB presence
      console.log('[Background] 📞 Checking for incoming calls...');
      try {
        // Query recent call requests from GunDB DHT
        // Uses lastCallCheckTime to only count new calls since last check
        result.incomingCalls = await this.queryRecentCalls(userAlias);
        
        if (result.incomingCalls > 0) {
          console.log(`[Background] ✓ Found ${result.incomingCalls} incoming call(s)`);
        } else {
          console.log('[Background] No new incoming calls');
        }
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
  private async startForegroundService(userAlias: string): Promise<void> {
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
  private async stopForegroundService(): Promise<void> {
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
  onBackgroundCheck(handler: (result: BackgroundCheckResult) => void): () => void {
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
  getLastCheckTime(): number {
    return this.lastCheckTime;
  }

  /**
   * Check if background listening is active
   */
  isActive(): boolean {
    return this.isBackgroundActive;
  }

  /**
   * Get battery mode
   */
  getBatteryMode() {
    return BatteryModeService.getMode();
  }

  /**
   * Set battery mode (saver or always)
   */
  setBatteryMode(mode: 'saver' | 'always'): void {
    BatteryModeService.setMode(mode);
  }

  /**
   * Toggle battery mode
   */
  toggleBatteryMode(): void {
    BatteryModeService.toggleMode();
  }

  /**
   * Manual check trigger (for testing or user-initiated)
   */
  async manualCheck(userAlias: string): Promise<void> {
    console.log('[Background] Manual check triggered');
    await this.checkForMessagesAndCalls(userAlias);
  }
}

export default new BackgroundService();
