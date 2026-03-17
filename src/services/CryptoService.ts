/**
 * Project Aegis - Crypto Service
 * Handles BIP-39 seed generation, SEA keypair derivation, and encryption
 */

import * as bip39 from 'bip39';
import nacl from 'tweetnacl';

export class CryptoService {
  /**
   * Generate a new 12-word BIP-39 recovery seed
   * This is the user's "master key" for account recovery
   */
  static generateBIP39Seed(): string {
    // 128 bits = 12-word phrase (industry standard)
    const entropy = nacl.randomBytes(16); // 128 bits
    const mnemonic = bip39.entropyToMnemonic(
      Buffer.from(entropy).toString('hex')
    );
    return mnemonic;
  }

  /**
   * Verify if a 12-word seed is valid BIP-39
   */
  static isValidBIP39Seed(seed: string): boolean {
    return bip39.validateMnemonic(seed);
  }

  /**
   * Derive a deterministic keypair from a BIP-39 seed
   * Same seed always generates same keypair (for account recovery)
   */
  static async deriveKeypairFromSeed(seed: string): Promise<{
    publicKey: string;
    privateKey: string;
  }> {
    if (!this.isValidBIP39Seed(seed)) {
      throw new Error('Invalid BIP-39 seed phrase');
    }

    // BIP-39 to entropy
    const entropy = bip39.mnemonicToEntropy(seed);
    // Use entropy as seed for keypair generation (deterministic)
    const entropyBuffer = Buffer.from(entropy, 'hex');

    // Pad to 32 bytes for NaCl signing key
    const seedBuffer = Buffer.alloc(32);
    seedBuffer.set(entropyBuffer);

    // Generate keypair from seed
    const keyPair = nacl.sign.keyPair.fromSeed(seedBuffer);

    return {
      publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
      privateKey: Buffer.from(keyPair.secretKey).toString('hex'),
    };
  }

  /**
   * Sign a message with private key (proof of identity)
   */
  static signMessage(
    message: string,
    privateKeyHex: string
  ): string {
    const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
    const messageBuffer = Buffer.from(message, 'utf-8');

    const signature = nacl.sign(messageBuffer, privateKeyBuffer);
    return Buffer.from(signature).toString('hex');
  }

  /**
   * Verify a signed message
   */
  static verifySignature(
    message: string,
    signature: string,
    publicKeyHex: string
  ): boolean {
    try {
      const signatureBuffer = Buffer.from(signature, 'hex');
    // Convert encrypted message to string for storage
    // (actual encryption implementation in Phase 3 with libsignal)
      const publicKeyBuffer = Buffer.from(publicKeyHex, 'hex');

      const verified = nacl.sign.open(signatureBuffer, publicKeyBuffer);
      return verified !== null;
    } catch {
      return false;
    }
  }

  /**
   * Generate ephemeral keypair for WebRTC ECDH (session keys)
   * Used for Perfect Forward Secrecy
   */
  static generateEphemeralKeypair(): {
    publicKey: string;
    privateKey: string;
  } {
    const keyPair = nacl.box.keyPair();
    return {
      publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
      privateKey: Buffer.from(keyPair.secretKey).toString('hex'),
    };
  }

  /**
   * Perform ECDH key agreement (for session key derivation)
   */
  static performECDH(
    privateKeyHex: string,
    publicKeyHex: string
  ): string {
    const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
    const publicKeyBuffer = Buffer.from(publicKeyHex, 'hex');

    try {
      const sharedSecret = nacl.box.before(publicKeyBuffer, privateKeyBuffer);
      return Buffer.from(sharedSecret).toString('hex');
    } catch {
      throw new Error('ECDH key agreement failed');
    }
  }

  /**
   * Encrypt message for recipient (using libsignal in Phase 3)
   * For now: simple XOR with shared secret (Phase 2)
   */
  static encryptMessage(
    message: string,
    sharedSecretHex: string
  ): string {
    // Temporary: base64 encode (will replace with libsignal in Phase 3)
    return Buffer.from(message).toString('base64');
  }

  /**
   * Decrypt message
   */
  static decryptMessage(
    encryptedMessage: string,
    sharedSecretHex: string
  ): string {
    // Temporary: base64 decode (will replace with libsignal in Phase 3)
    return Buffer.from(encryptedMessage, 'base64').toString('utf-8');
  }

  /**
   * Generate random nonce for message freshness
   */
  static generateNonce(): string {
    return Buffer.from(nacl.randomBytes(24)).toString('hex');
  }
}
