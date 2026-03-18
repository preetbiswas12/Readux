/**
 * Project Aegis - Android Foreground Service Module
 * Handles persistent background service for P2P listening on Android
 */

import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'aegis-foreground-service' doesn't seem to be linked. Make sure: ` +
  '* You rebuilt the app after installing the package\n' +
  '* You are not using Expo managed workflow\n';

const ForegroundServiceModule = NativeModules.AegisForegroundService
  ? NativeModules.AegisForegroundService
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export interface ServiceConfig {
  channelId: string;
  channelName: string;
  notificationId: number;
  title: string;
  message: string;
  icon?: string;
  priority?: number;
}

export class AndroidForegroundService {
  /**
   * Start the foreground service
   */
  static async startForegroundService(config: ServiceConfig): Promise<void> {
    if (Platform.OS !== 'android') {
      console.warn('Foreground service only available on Android');
      return;
    }

    try {
      await ForegroundServiceModule.startForegroundService({
        channelId: config.channelId || 'aegis_p2p_channel',
        channelName: config.channelName || 'AegisChat P2P',
        notificationId: config.notificationId || 1,
        title: config.title || 'AegisChat',
        message: config.message || 'Listening for messages...',
        priority: config.priority || 1,
        icon: config.icon,
      });
      console.log('✅ Foreground service started');
    } catch (error) {
      console.error('Failed to start foreground service:', error);
      throw error;
    }
  }

  /**
   * Stop the foreground service
   */
  static async stopForegroundService(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      await ForegroundServiceModule.stopForegroundService();
      console.log('✅ Foreground service stopped');
    } catch (error) {
      console.error('Failed to stop foreground service:', error);
      throw error;
    }
  }

  /**
   * Update the foreground service notification
   */
  static async updateNotification(title: string, message: string): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      await ForegroundServiceModule.updateNotification(title, message);
      console.log('✅ Notification updated');
    } catch (error) {
      console.error('Failed to update notification:', error);
      throw error;
    }
  }

  /**
   * Check if service is running
   */
  static async isServiceRunning(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      return await ForegroundServiceModule.isServiceRunning();
    } catch (error) {
      console.error('Failed to check service status:', error);
      return false;
    }
  }
}

export default AndroidForegroundService;
