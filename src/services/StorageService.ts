/**
 * Project Aegis - Storage Service
 * Secure local storage for user identity and sensitive data
 */

import * as SecureStore from 'expo-secure-store';
import type { User } from '../types';

export class StorageService {
  private static readonly SEED_KEY = 'aegis_seed_phrase';
  private static readonly USER_KEY = 'aegis_user';
  private static readonly PRIVATE_KEY_KEY = 'aegis_private_key';

  /**
   * Save user's BIP-39 seed phrase securely
   * This should ONLY be shown once during signup
   */
  static async saveSeed(seed: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.SEED_KEY, seed);
      console.log('✓ Seed phrase saved securely');
    } catch (error) {
      console.error('Save seed failed:', error);
      throw error;
    }
  }

  /**
   * Retrieve saved seed phrase
   * Should be protected with authentication prompt
   */
  static async getSeed(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.SEED_KEY);
    } catch (error) {
      console.error('Get seed failed:', error);
      return null;
    }
  }

  /**
   * Save user identity (alias + public key)
   */
  static async saveUser(user: User): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));
      console.log(`✓ User saved: ${user.alias}`);
    } catch (error) {
      console.error('Save user failed:', error);
      throw error;
    }
  }

  /**
   * Load user identity from storage
   */
  static async getUser(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user failed:', error);
      return null;
    }
  }

  /**
   * Save private key separately (can be encrypted)
   */
  static async savePrivateKey(privateKey: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.PRIVATE_KEY_KEY, privateKey);
      console.log('✓ Private key saved securely');
    } catch (error) {
      console.error('Save private key failed:', error);
      throw error;
    }
  }

  /**
   * Retrieve private key
   */
  static async getPrivateKey(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.PRIVATE_KEY_KEY);
    } catch (error) {
      console.error('Get private key failed:', error);
      return null;
    }
  }

  /**
   * Check if user is already logged in
   */
  static async isLoggedIn(): Promise<boolean> {
    try {
      const user = await this.getUser();
      const privateKey = await this.getPrivateKey();
      return !!(user && privateKey);
    } catch {
      return false;
    }
  }

  /**
   * Clear all stored data (logout)
   */
  static async clear(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.USER_KEY);
      await SecureStore.deleteItemAsync(this.PRIVATE_KEY_KEY);
      // Note: Seed is NOT deleted automatically (recovery backup)
      console.log('✓ User data cleared');
    } catch (error) {
      console.error('Clear storage failed:', error);
      throw error;
    }
  }

  /**
   * DANGER: Delete seed phrase (only after user confirms)
   */
  static async deleteSeed(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.SEED_KEY);
      console.log('⚠️  Seed phrase deleted permanently');
    } catch (error) {
      console.error('Delete seed failed:', error);
    }
  }
}
