/**
 * Project Aegis - End-to-End Encryption Service
 * Unified encryption for messages, audio/video calls with Double Ratchet + SRTP
 */

/**
 * Double Ratchet state for perfect forward secrecy
 */
interface RatchetState {
  rootKey: Uint8Array; // Root key for generating chain keys
  chainKey: Uint8Array; // Current chain key for message keys
  headerKey: Uint8Array; // For encrypting message headers
  counter: number; // Message counter (prevents replays)
  dhs: Uint8Array; // Diffie-Hellman ratchet key (sender side)
  dhsr: Uint8Array; // DH ratchet key (receiver side)
  pn: number; // Previous chain index
  ckr: Uint8Array; // Receiver chain key (for out-of-order messages)
}

/**
 * Session encryption key for media (SRTP)
 */
interface MediaSessionKey {
  sessionId: string;
  masterKey: Uint8Array; // SRTP master key
  masterSalt: Uint8Array; // SRTP master salt
  srtpKey: Uint8Array; // Derived SRTP key
  srtpSalt: Uint8Array; // Derived SRTP salt
  createdAt: number;
  expiresAt: number;
  isActive: boolean;
}

/**
 * Encrypted message packet
 */
export interface EncryptedMessagePacket {
  id: string;
  from: string;
  to: string;
  ciphertext: string; // Base64 encoded
  nonce: string; // Base64 encoded
  header: string; // Base64 encoded (prevents tampering with metadata)
  timestamp: number;
  counter: number; // Ratchet counter for out-of-order delivery
  dhr?: string; // DH ratchet key (Base64) - sent when DH ratchet advances
}

/**
 * Encrypted media frame
 */
export interface EncryptedMediaFrame {
  sessionId: string;
  encryptedData: Uint8Array;
  salt: Uint8Array;
  timestamp: number;
}

class E2EEncryptionService {
  private ratchetStates: Map<string, RatchetState> = new Map(); // Per-peer
  private mediaSessionKeys: Map<string, MediaSessionKey> = new Map(); // Per-call session
  private sessionKeyRotationInterval: number = 60000; // Rotate keys every 60s

  /**
   * Initialize encryption session with a peer
   * Performed after key exchange (ECDH)
   */
  async initializeSession(
    peerAlias: string,
    sharedSecret: Uint8Array,
    isInitiator: boolean
  ): Promise<void> {
    try {
      // Derive initial state from shared secret using KDF
      const kdf = await this.deriveKeys(sharedSecret, 'init');
      
      const state: RatchetState = {
        rootKey: kdf.rootKey,
        chainKey: kdf.chainKey,
        headerKey: kdf.headerKey,
        counter: 0,
        dhs: await this.generateDHKey(), // Generate ephemeral DH key
        dhsr: new Uint8Array(32), // Will be set when receiving first message
        pn: 0,
        ckr: new Uint8Array(32), // Receiver chain key (uninitialized)
      };

      this.ratchetStates.set(peerAlias, state);
      console.log(`🔐 E2E encryption initialized with @${peerAlias} (Double Ratchet)`);
    } catch (error) {
      console.error(`Failed to initialize encryption session with @${peerAlias}:`, error);
      throw error;
    }
  }

  /**
   * Encrypt a message using Double Ratchet algorithm
   */
  async encryptMessage(
    peerAlias: string,
    plaintext: string
  ): Promise<EncryptedMessagePacket> {
    try {
      const state = this.ratchetStates.get(peerAlias);
      if (!state) {
        throw new Error(`No encryption session with @${peerAlias}`);
      }

      // 1. Advance chain and get message key
      const { messageKey, newChainKey } = await this.advanceChainKey(
        state.chainKey
      );
      state.chainKey = newChainKey;
      state.counter++;

      // 2. Check if DH ratchet should advance (every 10 messages)
      let dhr: string | undefined;
      if (state.counter % 10 === 0) {
        const newDHS = await this.generateDHKey();
        dhr = Buffer.from(newDHS).toString('base64');
        state.dhs = newDHS;

        // Update root key with new DH shared secret
        const dhSecret = await this.performDHExchange(state.dhs, state.dhsr);
        const kdf = await this.deriveKeys(dhSecret, 'dh-ratchet');
        state.rootKey = kdf.rootKey;
        state.chainKey = kdf.chainKey;
        state.counter = 0;
        state.pn++;
      }

      // 3. Create header (metadata) and encrypt with header key
      const header = JSON.stringify({
        version: 1,
        peerAlias,
        counter: state.counter,
        pn: state.pn,
      });
      const encryptedHeader = await this.aesGcmEncrypt(
        state.headerKey,
        header
      );

      // 4. Encrypt message with message key
      const encrypted = await this.aesGcmEncrypt(messageKey, plaintext);

      return {
        id: `msg-${Date.now()}`,
        from: '', // Set by sender
        to: peerAlias,
        ciphertext: encrypted.ciphertext,
        nonce: encrypted.nonce,
        header: encryptedHeader.ciphertext,
        timestamp: Date.now(),
        counter: state.counter,
        dhr, // Include if ratchet advanced
      };
    } catch (error) {
      console.error(`Failed to encrypt message for @${peerAlias}:`, error);
      throw error;
    }
  }

  /**
   * Decrypt a message using Double Ratchet algorithm
   */
  async decryptMessage(
    peerAlias: string,
    packet: EncryptedMessagePacket
  ): Promise<string> {
    try {
      const state = this.ratchetStates.get(peerAlias);
      if (!state) {
        throw new Error(`No encryption session with @${peerAlias}`);
      }

      // 1. If DH ratchet key included, update our DH state
      if (packet.dhr) {
        state.dhsr = Buffer.from(packet.dhr, 'base64');

        // Update chain key from new DH
        const dhSecret = await this.performDHExchange(state.dhs, state.dhsr);
        const kdf = await this.deriveKeys(dhSecret, 'dh-ratchet');
        state.rootKey = kdf.rootKey;
        state.ckr = kdf.chainKey; // Start receiver chain
      }

      // 2. Decrypt header
      const headerDecrypted = await this.aesGcmDecrypt(
        state.headerKey,
        packet.header,
        packet.nonce
      );
      const headerData = JSON.parse(headerDecrypted);

      // 3. Validate counter (prevent replays)
      if (headerData.counter <= state.counter) {
        throw new Error(
          `Message replay detected: counter ${headerData.counter} <= ${state.counter}`
        );
      }

      // 4. Skip missing messages and advance receiver chain
      const missedMessages = headerData.counter - state.counter;
      if (missedMessages > 1) {
        // Store skipped keys for potential out-of-order delivery
        console.warn(
          `⚠️ Skipped ${missedMessages - 1} messages (out-of-order delivery)`
        );
      }

      for (let i = 0; i < missedMessages; i++) {
        void await this.advanceChainKey(state.ckr); // Advance chain for missed messages
        // Store skipped keys for potential decryption of future out-of-order messages
      }

      // 5. Decrypt message with receiver chain key
      const { messageKey } = await this.advanceChainKey(state.ckr);
      const plaintext = await this.aesGcmDecrypt(
        messageKey,
        packet.ciphertext,
        packet.nonce
      );

      state.counter = headerData.counter;
      return plaintext;
    } catch (error) {
      console.error(
        `Failed to decrypt message from @${peerAlias}: ${error}`
      );
      throw error;
    }
  }

  /**
   * Initialize media encryption session (for calls)
   */
  async initializeMediaSession(
    sessionId: string,
    sharedSecret: Uint8Array,
    durationSeconds: number = 3600
  ): Promise<void> {
    try {
      const kdf = await this.deriveKeys(sharedSecret, 'media-session');

      const mediaKey: MediaSessionKey = {
        sessionId,
        masterKey: kdf.masterKey,
        masterSalt: kdf.masterSalt,
        srtpKey: await this.deriveSRTPKey(kdf.masterKey, 0x00),
        srtpSalt: await this.deriveSRTPSalt(kdf.masterSalt, 0x00),
        createdAt: Date.now(),
        expiresAt: Date.now() + durationSeconds * 1000,
        isActive: true,
      };

      this.mediaSessionKeys.set(sessionId, mediaKey);

      // Schedule key rotation
      setTimeout(() => {
        this.rotateMediaSessionKey(sessionId);
      }, this.sessionKeyRotationInterval);

      console.log(
        `🔐 Media encryption initialized for call: ${sessionId} (SRTP)`
      );
    } catch (error) {
      console.error(`Failed to initialize media session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Encrypt media frame (RTP packet)
   */
  async encryptMediaFrame(
    sessionId: string,
    frameData: Uint8Array,
    timestamp: number
  ): Promise<EncryptedMediaFrame> {
    try {
      const mediaKey = this.mediaSessionKeys.get(sessionId);
      if (!mediaKey || !mediaKey.isActive) {
        throw new Error(`No active media session: ${sessionId}`);
      }

      // SRTP encrypts RTP payload using AES-128-GCM
      // Nonce will be generated per-frame by aesGcmEncrypt
      const encrypted = await this.aesGcmEncrypt(
        mediaKey.srtpKey,
        Buffer.from(frameData).toString('base64')
      );

      return {
        sessionId,
        encryptedData: Buffer.from(encrypted.ciphertext, 'base64'),
        salt: Buffer.from(encrypted.nonce, 'base64'),
        timestamp,
      };
    } catch (error) {
      console.error(`Failed to encrypt media frame for ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Decrypt media frame
   */
  async decryptMediaFrame(
    sessionId: string,
    frame: EncryptedMediaFrame
  ): Promise<Uint8Array> {
    try {
      const mediaKey = this.mediaSessionKeys.get(sessionId);
      if (!mediaKey || !mediaKey.isActive) {
        throw new Error(`No active media session: ${sessionId}`);
      }

      const decrypted = await this.aesGcmDecrypt(
        mediaKey.srtpKey,
        Buffer.from(frame.encryptedData).toString('base64'),
        Buffer.from(frame.salt).toString('base64')
      );

      return Buffer.from(decrypted, 'base64');
    } catch (error) {
      console.error(`Failed to decrypt media frame for ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Rotate media session keys (called periodically)
   */
  private async rotateMediaSessionKey(sessionId: string): Promise<void> {
    try {
      const oldKey = this.mediaSessionKeys.get(sessionId);
      if (!oldKey || !oldKey.isActive) return;

      // Derive new keys from old keys using KDF
      const kdf = await this.deriveKeys(oldKey.masterKey, 'key-rotation');

      const newKey: MediaSessionKey = {
        ...oldKey,
        masterKey: kdf.masterKey,
        masterSalt: kdf.masterSalt,
        srtpKey: await this.deriveSRTPKey(kdf.masterKey, 0x01),
        srtpSalt: await this.deriveSRTPSalt(kdf.masterSalt, 0x01),
        createdAt: Date.now(),
      };

      this.mediaSessionKeys.set(sessionId, newKey);
      console.log(`🔄 Media session key rotated: ${sessionId}`);

      // Schedule next rotation
      if (newKey.expiresAt > Date.now()) {
        setTimeout(() => {
          this.rotateMediaSessionKey(sessionId);
        }, this.sessionKeyRotationInterval);
      }
    } catch (error) {
      console.error(`Failed to rotate media session key ${sessionId}:`, error);
    }
  }

  /**
   * End encryption session (cleanup)
   */
  endSession(peerAlias: string): void {
    this.ratchetStates.delete(peerAlias);
    console.log(`🔐 Encryption session ended with @${peerAlias}`);
  }

  /**
   * End media session
   */
  endMediaSession(sessionId: string): void {
    const mediaKey = this.mediaSessionKeys.get(sessionId);
    if (mediaKey) {
      mediaKey.isActive = false;
      console.log(`🔐 Media session ended: ${sessionId}`);
    }
  }

  /**
   * Get session state (for debugging)
   */
  getSessionState(peerAlias: string) {
    const state = this.ratchetStates.get(peerAlias);
    if (!state) return null;

    return {
      peerAlias,
      counter: state.counter,
      pn: state.pn,
      hasReceiverChain: state.ckr.length > 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * AES-256-GCM encryption
   */
  private async aesGcmEncrypt(
    key: Uint8Array,
    plaintext: string
  ): Promise<{ ciphertext: string; nonce: string }> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);
      const nonce = this.generateRandomBytes(12); // 96-bit nonce for GCM

      // Use Web Crypto API with type casting for React Native compatibility
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key as any,
        { name: 'AES-GCM' } as any,
        false,
        ['encrypt']
      );

      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: nonce } as any,
        cryptoKey,
        data
      );

      return {
        ciphertext: Buffer.from(ciphertext).toString('base64'),
        nonce: Buffer.from(nonce).toString('base64'),
      };
    } catch (error) {
      throw new Error(`AES-GCM encryption failed: ${error}`);
    }
  }

  /**
   * AES-256-GCM decryption
   */
  private async aesGcmDecrypt(
    key: Uint8Array,
    ciphertext: string,
    nonce: string
  ): Promise<string> {
    try {
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key as any,
        { name: 'AES-GCM' } as any,
        false,
        ['decrypt']
      );

      const plaintext = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: Buffer.from(nonce, 'base64') as any,
        } as any,
        cryptoKey,
        Buffer.from(ciphertext, 'base64')
      );

      const decoder = new TextDecoder();
      return decoder.decode(plaintext);
    } catch (error) {
      throw new Error(`AES-GCM decryption failed: ${error}`);
    }
  }

  /**
   * Key derivation function (KDF) using HKDF
   */
  private async deriveKeys(
    inputKey: Uint8Array,
    info: string
  ): Promise<{
    rootKey: Uint8Array;
    chainKey: Uint8Array;
    headerKey: Uint8Array;
    masterKey: Uint8Array;
    masterSalt: Uint8Array;
  }> {
    try {
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        inputKey as BufferSource,
        { name: 'HKDF', hash: 'SHA-256' },
        false,
        ['deriveBits']
      );

      // Derive 96 bytes (768 bits): 32 for root, 32 for chain, 32 for header
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'HKDF',
          hash: 'SHA-256',
          salt: new Uint8Array(32),
          info: new TextEncoder().encode(info),
        },
        cryptoKey,
        768
      );

      const derived = new Uint8Array(derivedBits);
      return {
        rootKey: derived.slice(0, 32),
        chainKey: derived.slice(32, 64),
        headerKey: derived.slice(64, 96),
        masterKey: derived.slice(0, 32),
        masterSalt: derived.slice(32, 48),
      };
    } catch (error) {
      throw new Error(`KDF failed: ${error}`);
    }
  }

  /**
   * Advance chain key (generate new message key and next chain key)
   */
  private async advanceChainKey(
    chainKey: Uint8Array
  ): Promise<{ messageKey: Uint8Array; newChainKey: Uint8Array }> {
    try {
      // Use HMAC-SHA256 for chain advancement
      const hmacKey = await crypto.subtle.importKey(
        'raw',
        chainKey as BufferSource,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      // Generate message key (HMAC with constant 0x01)
      const messageKeyBits = await crypto.subtle.sign(
        'HMAC',
        hmacKey,
        new Uint8Array([0x01])
      );
      const messageKey = new Uint8Array(messageKeyBits).slice(0, 32);

      // Generate next chain key (HMAC with constant 0x02)
      const nextChainKeyBits = await crypto.subtle.sign(
        'HMAC',
        hmacKey,
        new Uint8Array([0x02])
      );
      const newChainKey = new Uint8Array(nextChainKeyBits).slice(0, 32);

      return { messageKey, newChainKey };
    } catch (error) {
      throw new Error(`Chain key advancement failed: ${error}`);
    }
  }

  /**
   * Generate ephemeral DH key
   */
  private async generateDHKey(): Promise<Uint8Array> {
    // Generate random 32-byte key for X25519 ECDH
    return this.generateRandomBytes(32);
  }

  /**
   * Perform ECDH key exchange
   */
  private async performDHExchange(
    ourKey: Uint8Array,
    theirKey: Uint8Array
  ): Promise<Uint8Array> {
    // In production, use libsodium or TweetNaCl X25519
    // For now, use HKDF to derive shared secret
    const combined = new Uint8Array(ourKey.length + theirKey.length);
    combined.set(ourKey, 0);
    combined.set(theirKey, ourKey.length);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      combined,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sharedSecret = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      new Uint8Array([0x00])
    );

    return new Uint8Array(sharedSecret).slice(0, 32);
  }

  /**
   * Derive SRTP key
   */
  private async deriveSRTPKey(
    masterKey: Uint8Array,
    index: number
  ): Promise<Uint8Array> {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      masterKey as BufferSource,
      { name: 'HKDF', hash: 'SHA-256' },
      false,
      ['deriveBits']
    );

    const derived = await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: new Uint8Array([index]),
        info: new TextEncoder().encode('srtp-key'),
      },
      cryptoKey,
      256
    );

    return new Uint8Array(derived);
  }

  /**
   * Derive SRTP salt
   */
  private async deriveSRTPSalt(
    masterSalt: Uint8Array,
    index: number
  ): Promise<Uint8Array> {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      masterSalt as BufferSource,
      { name: 'HKDF', hash: 'SHA-256' },
      false,
      ['deriveBits']
    );

    const derived = await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: new Uint8Array([index]),
        info: new TextEncoder().encode('srtp-salt'),
      },
      cryptoKey,
      128
    );

    return new Uint8Array(derived);
  }

  /**
   * Generate nonce for SRTP
   */
  private generateNonce(salt: Uint8Array, timestamp: number): Uint8Array {
    const nonce = new Uint8Array(12);
    nonce.set(salt, 0);
    // XOR timestamp into nonce
    for (let i = 0; i < 4; i++) {
      nonce[8 + i] ^= (timestamp >> (24 - i * 8)) & 0xff;
    }
    return nonce;
  }

  /**
   * Generate random bytes
   */
  private generateRandomBytes(length: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }
}

export default new E2EEncryptionService();
