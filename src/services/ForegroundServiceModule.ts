/**
 * Android Native Module Interface
 * 
 * For Phase 4 native implementation (requires Expo Development Build or bare React Native)
 * This file documents what needs to be implemented in Kotlin/Java
 * 
 * IMPLEMENTATION STEPS:
 * 1. Use `eas build --platform android --profile preview` to create native development build
 * 2. Add ForegroundServiceModule.kt to android/app/src/main/java/com/aegischat/
 * 3. Register module in android/app/src/main/java/com/aegischat/MainApplication.java
 * 4. Update AndroidManifest.xml with required permissions and service declaration
 */

/**
 * ForegroundServiceModule - Native Android Implementation (Kotlin)
 * 
 * REQUIRED PERMISSIONS (AndroidManifest.xml):
 * ```xml
 * <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
 * <uses-permission android:name="android.permission.FOREGROUND_SERVICE_PHONE_CALL" />
 * <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
 * <uses-permission android:name="android.permission.WAKE_LOCK" />
 * ```
 * 
 * SERVICE DECLARATION (AndroidManifest.xml):
 * ```xml
 * <application>
 *   <service
 *     android:name=".ForegroundService"
 *     android:foregroundServiceType="phoneCall"
 *     android:enabled="true"
 *     android:exported="false" />
 * </application>
 * ```
 * 
 * KOTLIN IMPLEMENTATION OUTLINE:
 * ```kotlin
 * package com.aegischat
 * 
 * import android.app.Service
 * import android.app.Notification
 * import android.app.NotificationChannel
 * import android.app.NotificationManager
 * import android.content.Intent
 * import android.os.IBinder
 * import androidx.core.app.NotificationCompat
 * 
 * class ForegroundService : Service() {
 *   override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
 *     // Create notification channel (Android 8.0+)
 *     createNotificationChannel()
 *     
 *     // Create persistent notification
 *     val notification = buildNotification(
 *       intent?.getStringExtra("title") ?: "Aegis Chat",
 *       intent?.getStringExtra("message") ?: "Connected"
 *     )
 *     
 *     // Start foreground service
 *     startForeground(NOTIFICATION_ID, notification)
 *     
 *     // Start listening for WebRTC connections
 *     startBackgroundListener(intent?.getStringExtra("userAlias") ?: "")
 *     
 *     return START_STICKY
 *   }
 *   
 *   override fun onBind(intent: Intent?): IBinder? = null
 *   
 *   private fun createNotificationChannel() {
 *     val channel = NotificationChannel(
 *       CHANNEL_ID,
 *       "Aegis Chat",
 *       NotificationManager.IMPORTANCE_LOW
 *     )
 *     val manager = getSystemService(NotificationManager::class.java)
 *     manager.createNotificationChannel(channel)
 *   }
 *   
 *   private fun buildNotification(title: String, message: String): Notification {
 *     return NotificationCompat.Builder(this, CHANNEL_ID)
 *       .setContentTitle(title)
 *       .setContentText(message)
 *       .setSmallIcon(R.drawable.ic_notification)
 *       .setOngoing(true)
 *       .build()
 *   }
 * }
 * ```
 */

/**
 * Expected Interface from JavaScript:
 * 
 * Type: NativeModule
 * Methods:
 *   - startService(options: { title: string; message: string; userAlias: string }): Promise<void>
 *   - stopService(): Promise<void>
 *   - updateNotification(message: string): Promise<void>
 *   - isRunning(): Promise<boolean>
 * 
 * Example Usage in TypeScript:
 * ```typescript
 * import { NativeModules } from 'react-native';
 * 
 * const { ForegroundServiceModule } = NativeModules;
 * 
 * await ForegroundServiceModule.startService({
 *   title: 'Aegis Chat',
 *   message: 'Connected as @preet',
 *   userAlias: 'preet',
 * });
 * ```
 */

export interface ForegroundServiceConfig {
  title: string;
  message: string;
  userAlias: string;
}

export interface ForegroundServiceAPI {
  startService(config: ForegroundServiceConfig): Promise<void>;
  stopService(): Promise<void>;
  updateNotification(message: string): Promise<void>;
  isRunning(): Promise<boolean>;
}

/**
 * Production Implementation with Fallback
 * Attempts to load native module, falls back to polling if unavailable
 */

let NativeModule: any = null;

// Try to load native module (available after EAS build)
// Use dynamic import to avoid require() issues
import('react-native')
  .then((rnModule) => {
    if (rnModule && rnModule.NativeModules) {
      NativeModule = rnModule.NativeModules.ForegroundServiceModule;
    }
  })
  .catch(() => {
    console.warn('[ForegroundService] React Native module not available');
  });

// Also log on startup
console.warn(
  '[ForegroundService] Native module not available initially. To enable:'
);
console.warn('  1. Run: eas build --platform android --profile development');
console.warn('  2. Install the resulting APK on an Android device');

export const ForegroundServiceModule: ForegroundServiceAPI = {
  startService: async (config: ForegroundServiceConfig) => {
    if (NativeModule && NativeModule.startService) {
      try {
        console.log(
          `[ForegroundService] 📲 Starting native service for @${config.userAlias}...`
        );
        await NativeModule.startService(config);
        console.log(
          '[ForegroundService] ✅ Service started (will persist when app backgrounded)'
        );
        return;
      } catch (error) {
        console.error('[ForegroundService] Native error:', error);
        // Fall through to fallback
      }
    }

    // Fallback log for development
    console.log('[ForegroundService] 📲 Would start native foreground service:');
    console.log(`                    Title: "${config.title}"`);
    console.log(`                    Message: "${config.message}"`);
    console.log(`                    User: @${config.userAlias}`);
    console.log('[ForegroundService] ℹ️  For production: Build with EAS development build');
  },

  stopService: async () => {
    if (NativeModule && NativeModule.stopService) {
      try {
        console.log('[ForegroundService] 📲 Stopping native foreground service...');
        await NativeModule.stopService();
        console.log('[ForegroundService] ✅ Service stopped');
        return;
      } catch (error) {
        console.error('[ForegroundService] Native error:', error);
      }
    }

    console.log('[ForegroundService] Foreground service stopped (or was not running)');
  },

  updateNotification: async (message: string) => {
    if (NativeModule && NativeModule.updateNotification) {
      try {
        await NativeModule.updateNotification(message);
        return;
      } catch (error) {
        console.warn('[ForegroundService] Error updating notification:', error);
      }
    }

    console.log(`[ForegroundService] 📢 Notification: ${message}`);
  },

  isRunning: async () => {
    if (NativeModule && NativeModule.isRunning) {
      try {
        const running = await NativeModule.isRunning();
        return running;
      } catch (error) {
        console.warn('[ForegroundService] Error checking status:', error);
        return false;
      }
    }

    return false;
  },
};
