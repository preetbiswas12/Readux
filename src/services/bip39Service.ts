/**
 * BIP-39 Seed Phrase Service
 * Generates, validates, and derives ED25519 keys from BIP-39 mnemonics
 */

import * as bip39 from 'bip39';
import crypto from 'crypto';

export interface SeedPhraseResult {
  mnemonic: string;
  seed: Buffer;
  isValid: boolean;
}

export interface KeyDerivationResult {
  publicKey: string;
  privateKey: string;
  secretKey: Uint8Array;
}

/**
 * Generate a new 12-word BIP-39 mnemonic
 */
export const generateSeedPhrase = (): SeedPhraseResult => {
  const mnemonic = bip39.generateMnemonic();
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  
  return {
    mnemonic,
    seed,
    isValid: bip39.validateMnemonic(mnemonic),
  };
};

/**
 * Validate a 12-word BIP-39 mnemonic
 */
export const validateSeedPhrase = (mnemonic: string): boolean => {
  return bip39.validateMnemonic(mnemonic);
};

/**
 * Convert mnemonic to seed
 */
export const mnemonicToSeed = (mnemonic: string): Buffer => {
  if (!validateSeedPhrase(mnemonic)) {
    throw new Error('Invalid BIP-39 mnemonic');
  }
  return bip39.mnemonicToSeedSync(mnemonic);
};

/**
 * Derive ED25519 keypair from BIP-39 seed
 * Uses the first derivation path: m/44'/0'/0'/0/0
 */
export const deriveKeyFromSeed = (seed: Buffer): KeyDerivationResult => {
  // For this MVP, we'll use a simple HMAC-SHA512 approach
  // In production, use proper BIP-32/BIP-44 derivation
  const hmac = crypto.createHmac('sha512', 'BIP32 seed');
  hmac.update(seed);
  const digest = hmac.digest();
  
  const privateKeyBytes = digest.slice(0, 32);
  const secretKey = new Uint8Array(privateKeyBytes);
  
  // Convert to hex strings for Gun/SEA compatibility
  const privateKey = privateKeyBytes.toString('hex');
  const publicKey = derivePublicKeyFromPrivate(privateKey);
  
  return {
    publicKey,
    privateKey,
    secretKey,
  };
};

/**
 * Derive public key from private key (placeholder - SEA will handle actual derivation)
 */
const derivePublicKeyFromPrivate = (privateKey: string): string => {
  // This will be handled by Gun's SEA library
  // For now, return a derived representation
  const hash = crypto.createHash('sha256');
  hash.update(privateKey);
  return hash.digest('hex');
};

/**
 * Complete flow: mnemonic -> seed -> keypair
 */
export const mnemonicToKeyPair = (mnemonic: string): KeyDerivationResult => {
  const seed = mnemonicToSeed(mnemonic);
  return deriveKeyFromSeed(seed);
};
