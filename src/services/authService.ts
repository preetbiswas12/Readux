/**
 * Authentication Service
 * Orchestrates signup, login, and session management
 * Handles BIP-39 seed phrase, key derivation, and SEA authentication
 */

import * as bip39Service from './bip39Service';
import { GunDBService } from './gundbService';
import * as dbService from './databaseService';

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  alias: string | null;
  publicKey: string | null;
  privateKey: string | null;
}

export interface SignupResult {
  success: boolean;
  seedPhrase: string;
  userId: string;
  alias: string;
  publicKey: string;
  message?: string;
}

export interface LoginResult {
  success: boolean;
  userId: string;
  alias: string;
  publicKey: string;
  message?: string;
}

let authState: AuthState = {
  isAuthenticated: false,
  userId: null,
  alias: null,
  publicKey: null,
  privateKey: null,
};

/**
 * Signup: Generate seed phrase, derive keys, publish identity
 */
export const signup = async (desiredAlias: string): Promise<SignupResult> => {
  try {
    // Step 1: Generate BIP-39 seed phrase
    console.log('[Auth] Generating BIP-39 seed phrase...');
    const { mnemonic, seed, isValid } = bip39Service.generateSeedPhrase();
    
    if (!isValid) {
      throw new Error('Invalid seed phrase generated');
    }

    // Step 2: Derive keypair from seed
    console.log('[Auth] Deriving ED25519 keypair...');
    const { publicKey, privateKey } = bip39Service.deriveKeyFromSeed(seed);

    // Step 3: Generate user ID (using public key hash)
    const userId = publicKey.substring(0, 16);

    // Step 4: Initialize local database
    console.log('[Auth] Initializing local database...');
    await dbService.initializeDatabase(userId);

    // Step 5: Save identity locally (encrypted)
    console.log('[Auth] Saving identity...');
    await dbService.saveUserIdentity(
      userId,
      desiredAlias,
      publicKey,
      privateKey,
      mnemonic
    );

    // Step 6: Initialize GunDB
    console.log('[Auth] Connecting to GunDB...');
    await GunDBService.initializeGun();

    // Step 7: Publish identity to DHT
    console.log('[Auth] Publishing identity to DHT...');
    await GunDBService.publishUserIdentity(desiredAlias, publicKey, privateKey);

    // Step 8: Update local auth state
    authState = {
      isAuthenticated: true,
      userId,
      alias: desiredAlias,
      publicKey,
      privateKey,
    };

    console.log('[Auth] Signup successful for @' + desiredAlias);

    return {
      success: true,
      seedPhrase: mnemonic,
      userId,
      alias: desiredAlias,
      publicKey,
      message: 'Account created successfully. Save your recovery phrase!',
    };

  } catch (error) {
    console.error('[Auth] Signup failed:', error);
    return {
      success: false,
      seedPhrase: '',
      userId: '',
      alias: '',
      publicKey: '',
      message: `Signup error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Login: Recover from seed phrase, restore session
 */
export const login = async (
  seedPhrase: string,
  alias: string
): Promise<LoginResult> => {
  try {
    // Step 1: Validate seed phrase
    console.log('[Auth] Validating seed phrase...');
    if (!bip39Service.validateSeedPhrase(seedPhrase)) {
      throw new Error('Invalid seed phrase');
    }

    // Step 2: Derive keypair from seed
    console.log('[Auth] Deriving keypair from seed...');
    const { publicKey, privateKey } = bip39Service.mnemonicToKeyPair(seedPhrase);

    // Step 3: Generate user ID
    const userId = publicKey.substring(0, 16);

    // Step 4: Initialize database
    console.log('[Auth] Loading local database...');
    await dbService.initializeDatabase(userId);

    // Step 5: Check if identity matches stored identity
    const storedIdentity = await dbService.getUserIdentity();
    if (storedIdentity && storedIdentity.alias !== alias) {
      throw new Error('Seed phrase does not match stored account');
    }

    // Step 6: Initialize GunDB and verify online presence
    console.log('[Auth] Reconnecting to GunDB...');
    await GunDBService.initializeGun();

    // Step 7: Update presence to online
    console.log('[Auth] Setting online status...');
    await GunDBService.updatePresence(alias, true);

    // Step 8: Update auth state
    authState = {
      isAuthenticated: true,
      userId,
      alias,
      publicKey,
      privateKey,
    };

    console.log('[Auth] Login successful for @' + alias);

    return {
      success: true,
      userId,
      alias,
      publicKey,
      message: 'Welcome back!',
    };

  } catch (error) {
    console.error('[Auth] Login failed:', error);
    return {
      success: false,
      userId: '',
      alias: '',
      publicKey: '',
      message: `Login error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Logout: Disconnect GunDB, update presence, clear session
 */
export const logout = async (): Promise<void> => {
  try {
    if (authState.alias) {
      console.log('[Auth] Setting offline status...');
      await GunDBService.updatePresence(authState.alias, false);
    }

    console.log('[Auth] Disconnecting GunDB...');
    GunDBService.disconnectGun();

    console.log('[Auth] Closing database...');
    await dbService.closeDatabase();

    authState = {
      isAuthenticated: false,
      userId: null,
      alias: null,
      publicKey: null,
      privateKey: null,
    };

    console.log('[Auth] Logout successful');
  } catch (error) {
    console.error('[Auth] Logout error:', error);
  }
};

/**
 * Get current auth state
 */
export const getAuthState = (): AuthState => {
  return { ...authState };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return authState.isAuthenticated;
};

/**
 * Get current user ID
 */
export const getCurrentUserId = (): string | null => {
  return authState.userId;
};

/**
 * Get current user alias
 */
export const getCurrentAlias = (): string | null => {
  return authState.alias;
};

/**
 * Get current public key
 */
export const getPublicKey = (): string | null => {
  return authState.publicKey;
};

/**
 * Get current private key (for signing)
 */
export const getPrivateKey = (): string | null => {
  return authState.privateKey;
};
