/**
 * Project Aegis - Biometric Authentication Service
 * Handles fingerprint/face ID authentication on Android & iOS
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export class BiometricAuthService {
  private static isAvailable = false;
  private static readonly BIOMETRIC_ENABLED_KEY = 'biometric_unlock_enabled';

  /**
   * Initialize and check biometric availability
   */
  static async initialize(): Promise<void> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      this.isAvailable = compatible;
      
      if (compatible) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        console.log(`✓ Biometric authentication available: ${types.join(', ')}`);
      } else {
        console.warn('⚠️ Device does not support biometric authentication');
      }
    } catch (error) {
      console.error('Failed to initialize biometric service:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Check if biometric authentication is available on this device
   */
  static isBiometricAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Get the type of biometric authentication available
   * Possible values: FACIAL_RECOGNITION, IRIS_RECOGNITION, FINGERPRINT
   */
  static async getAvailableBiometrics(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Failed to get biometric types:', error);
      return [];
    }
  }

  /**
   * Authenticate user with biometric (fingerprint/face ID)
   */
  static async authenticate(): Promise<{ success: boolean; error?: string }> {
    if (!this.isAvailable) {
      return { success: false, error: 'Biometric authentication not available' };
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
        requireConfirmation: true,
      });

      if (result.success) {
        console.log('✅ Biometric authentication successful');
        return { success: true };
      } else {
        console.warn('❌ Biometric authentication failed or cancelled');
        return { success: false, error: 'Authentication cancelled' };
      }
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Require biometric for app unlock
   * Stores preference in secure storage
   */
  static async enableBiometricUnlock(): Promise<void> {
    if (!this.isAvailable) {
      throw new Error('Biometric authentication not available on this device');
    }

    // Verify fingerprint once
    const result = await this.authenticate();
    if (!result.success) {
      throw new Error('Biometric authentication failed');
    }

    // Store preference
    await SecureStore.setItemAsync(this.BIOMETRIC_ENABLED_KEY, 'true');
    console.log('✓ Biometric unlock enabled');
  }

  /**
   * Disable biometric unlock
   */
  static async disableBiometricUnlock(): Promise<void> {
    await SecureStore.setItemAsync(this.BIOMETRIC_ENABLED_KEY, 'false');
    console.log('✓ Biometric unlock disabled');
  }

  /**
   * Check if biometric unlock is enabled
   */
  static async isBiometricUnlockEnabled(): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync(this.BIOMETRIC_ENABLED_KEY);
      return value === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Authenticate for critical operation (higher security)
   * This might use a stricter timeout or require confirmation
   */
  static async authenticateCritical(reason: string = 'Confirm this critical action'): Promise<boolean> {
    if (!this.isAvailable) {
      console.warn('Biometric not available, skipping critical auth');
      return true; // Allow if device doesn't support biometric
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
        requireConfirmation: true,
      });

      return result.success;
    } catch (error) {
      console.error('Critical authentication error:', error);
      return false;
    }
  }
}

export default BiometricAuthService;
