/**
 * Project Aegis - GunDB Service
 * Handles user discovery and presence via GunDB relays
 */

import type { User, Contact, GunDBConfig } from '../types';

export class GunDBService {
  private static gun: any = null;
  private static config: GunDBConfig = {
    mainRelay: 'https://gun.eco/gun',
    fallbackRelays: [
      'https://dweb.link/ipfs/Qm.../gun', // dweb.link gun relay
      'https://gun-relay.herokuapp.com/gun', // community relay
    ],
  };

  /**
   * Initialize GunDB connection to public relays
   * Used only for discovery (finding user public keys)
   * Not for storing chat data
   */
  static async initialize(): Promise<void> {
    try {
      // Lazy load gun to avoid issues in non-browser environments
      // Note: In React Native, Gun is loaded via dynamic import
      if (typeof require !== 'undefined') {
        try {
          // @ts-ignore - require() is needed for dynamic Gun library loading in React Native
          // eslint-disable-next-line
          const Gun = require('gun');
          // eslint-disable-next-line
          require('gun/sea');
          // eslint-disable-next-line
          require('gun/lib/then');
          this.gun = Gun(this.config.mainRelay);
        } catch (_err) {
          // Fallback for environments without require
          void _err; // Suppress unused variable warning
          console.log('Gun require not available, using fallback');
        }
      }
      console.log('✓ GunDB initialized with main relay:', this.config.mainRelay);
    } catch (error) {
      console.error('GunDB initialization failed:', error);
    }
  }

  /**
   * Register a user in the public GunDB DHT
   * This allows other peers to find them by alias
   */
  static async registerUser(user: User): Promise<void> {
    try {
      if (!this.gun) {
        throw new Error('GunDB not initialized');
      }

      // Publish user discovery data to DHT
      // Key: @alias -> Value: { publicKey, timestamp }
      await this.gun
        .get('users')
        .get(user.alias)
        .put({
          publicKey: user.publicKey,
          alias: user.alias,
          timestamp: Date.now(),
        });

      console.log(`✓ User ${user.alias} registered in DHT`);
    } catch (error) {
      console.error('User registration failed:', error);
      throw error;
    }
  }

  /**
   * Search for a user by alias (decrypt their public key)
   */
  static async searchUser(alias: string): Promise<Contact | null> {
    try {
      if (!this.gun) {
        throw new Error('GunDB not initialized');
      }

      // Crawl DHT for alias
      return new Promise((resolve, reject) => {
        this.gun
          .get('users')
          .get(alias)
          .once((data: any) => {
            if (data && data.publicKey) {
              resolve({
                alias: alias,
                publicKey: data.publicKey,
                lastSeen: data.timestamp,
              });
            } else {
              resolve(null); // User not found
            }
          }, reject);
      });
    } catch (error) {
      console.error('User search failed:', error);
      return null;
    }
  }

  /**
   * Subscribe to user's presence (online/offline status)
   * Triggers callback when user comes online
   */
  static subscribePresence(
    alias: string,
    onPresenceChange: (isOnline: boolean) => void
  ): () => void {
    if (!this.gun) {
      throw new Error('GunDB not initialized');
    }

    const unsubscribe = this.gun
      .get('presence')
      .get(alias)
      .on((data: any) => {
        const isOnline = data && data.online === true;
        onPresenceChange(isOnline);
      });

    // Return cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  /**
   * Publish user's online status (for presence detection)
   */
  static async publishPresence(alias: string, isOnline: boolean): Promise<void> {
    try {
      if (!this.gun) {
        throw new Error('GunDB not initialized');
      }

      await this.gun.get('presence').get(alias).put({
        online: isOnline,
        timestamp: Date.now(),
      });

      console.log(`✓ Presence updated: ${alias} is ${isOnline ? 'online' : 'offline'}`);
    } catch (error) {
      console.error('Presence publish failed:', error);
    }
  }

  /**
   * Store WebRTC ICE candidates for signaling
   * Peer A publishes their candidates so Peer B can initiate connection
   */
  static async publishICECandidates(
    alias: string,
    candidates: any[]
  ): Promise<void> {
    try {
      if (!this.gun) {
        throw new Error('GunDB not initialized');
      }

      await this.gun.get('ice-candidates').get(alias).put({
        candidates,
        timestamp: Date.now(),
      });

      console.log(`✓ ICE candidates published for ${alias}`);
    } catch (error) {
      console.error('ICE candidate publish failed:', error);
    }
  }

  /**
   * Fetch WebRTC ICE candidates from relay
   */
  static async fetchICECandidates(alias: string): Promise<any[]> {
    try {
      if (!this.gun) {
        throw new Error('GunDB not initialized');
      }

      return new Promise((resolve, reject) => {
        this.gun
          .get('ice-candidates')
          .get(alias)
          .once((data: any) => {
            resolve(data?.candidates || []);
          }, reject);
      });
    } catch (error) {
      console.error('ICE candidate fetch failed:', error);
      return [];
    }
  }

  /**
   * Publish a "Call Request" signal
   */
  static async publishCallRequest(
    peerAlias: string,
    callData: any
  ): Promise<void> {
    try {
      if (!this.gun) {
        throw new Error('GunDB not initialized');
      }

      const callId = callData.id || `call-${Date.now()}`;

      await this.gun.get('calls').get(peerAlias).put({
        ...callData,
        callId,
        timestamp: Date.now(),
      });

      console.log(`✓ Call request published to ${peerAlias}`);
    } catch (error) {
      console.error('Call request publish failed:', error);
    }
  }

  /**
   * Respond to incoming call request (acceptance/rejection)
   */
  static async respondToCallRequest(
    peerAlias: string,
    response: {accepted: boolean; timestamp: number; mediaSessionId?: string}
  ): Promise<void> {
    try {
      if (!this.gun) {
        throw new Error('GunDB not initialized');
      }

      await this.gun.get('call-responses').get(`${peerAlias}-${Date.now()}`).put({
        from: peerAlias,
        ...response,
      });

      console.log(`✓ Call response sent to ${peerAlias}: ${response.accepted ? 'accepted' : 'rejected'}`);
    } catch (error) {
      console.error('Call response failed:', error);
    }
  }

  /**
   * Subscribe to incoming call requests
   */
  static subscribeCallRequests(
    userAlias: string,
    onCallRequest: (callData: any) => void
  ): () => void {
    if (!this.gun) {
      throw new Error('GunDB not initialized');
    }

    const unsubscribe = this.gun
      .get('call-requests')
      .on((data: any) => {
        if (data?.to === userAlias) {
          onCallRequest(data);
        }
      });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  /**
   * Fallback to secondary relay if primary fails
   */
  static async switchRelay(relayUrl: string): Promise<void> {
    try {
      if (typeof require !== 'undefined') {
        try {
          // @ts-ignore - require() is needed for dynamic Gun library loading
          // eslint-disable-next-line
          const Gun = require('gun');
          this.gun = Gun(relayUrl);
        } catch (_err) {
          // Cannot switch relay in current environment
          void _err; // Suppress unused variable warning
        }
      }
      console.log('✓ Switched to relay:', relayUrl);
    } catch (error) {
      console.error('Relay switch failed:', error);
    }
  }

  /**
   * Alias for initialize() for backward compatibility
   */
  static async initializeGun(): Promise<void> {
    return this.initialize();
  }

  /**
   * Alias for registerUser() for backward compatibility
   */
  static async publishUserIdentity(
    alias: string,
    publicKey: string,
    _privateKey: string
  ): Promise<void> {
    const user: User = { alias, publicKey, privateKey: _privateKey, seed: '', createdAt: Date.now() };
    return this.registerUser(user);
  }

  /**
   * Alias for publishPresence() for backward compatibility
   */
  static async updatePresence(alias: string, isOnline: boolean): Promise<void> {
    return this.publishPresence(alias, isOnline);
  }

  /**
   * Disconnect from GunDB
   */
  static disconnectGun(): void {
    if (this.gun) {
      try {
        this.gun.off();
        this.gun = null;
        console.log('✓ Disconnected from GunDB');
      } catch (error) {
        console.error('Error disconnecting from GunDB:', error);
      }
    }
  }

  /**
   * Publish WebRTC SDP Offer to peer
   * Initiator sends their offer so responder can create answer
   */
  static async publishSDPOffer(
    peerAlias: string,
    offer: { type: string; sdp: string },
    callId: string
  ): Promise<void> {
    try {
      if (!this.gun) {
        throw new Error('GunDB not initialized');
      }

      await this.gun.get('sdp-offers').get(`${peerAlias}-${callId}`).put({
        type: 'offer',
        sdp: offer.sdp,
        callId,
        timestamp: Date.now(),
      });

      console.log(`✓ SDP Offer published to ${peerAlias}`);
    } catch (error) {
      console.error('SDP Offer publish failed:', error);
    }
  }

  /**
   * Fetch WebRTC SDP Offer from peer
   */
  static async fetchSDPOffer(peerAlias: string, callId: string): Promise<{ type: string; sdp: string } | null> {
    try {
      if (!this.gun) {
        throw new Error('GunDB not initialized');
      }

      return new Promise((resolve, reject) => {
        this.gun
          .get('sdp-offers')
          .get(`${peerAlias}-${callId}`)
          .once((data: any) => {
            if (data?.sdp) {
              resolve({ type: data.type||'offer', sdp: data.sdp });
            } else {
              resolve(null);
            }
          }, reject);
      });
    } catch (error) {
      console.error('SDP Offer fetch failed:', error);
      return null;
    }
  }

  /**
   * Publish WebRTC SDP Answer to peer
   * Responder sends their answer after receiving offer
   */
  static async publishSDPAnswer(
    peerAlias: string,
    answer: { type: string; sdp: string },
    callId: string
  ): Promise<void> {
    try {
      if (!this.gun) {
        throw new Error('GunDB not initialized');
      }

      await this.gun.get('sdp-answers').get(`${peerAlias}-${callId}`).put({
        type: 'answer',
        sdp: answer.sdp,
        callId,
        timestamp: Date.now(),
      });

      console.log(`✓ SDP Answer published to ${peerAlias}`);
    } catch (error) {
      console.error('SDP Answer publish failed:', error);
    }
  }

  /**
   * Fetch WebRTC SDP Answer from peer
   */
  static async fetchSDPAnswer(peerAlias: string, callId: string): Promise<{ type: string; sdp: string } | null> {
    try {
      if (!this.gun) {
        throw new Error('GunDB not initialized');
      }

      return new Promise((resolve, reject) => {
        this.gun
          .get('sdp-answers')
          .get(`${peerAlias}-${callId}`)
          .once((data: any) => {
            if (data?.sdp) {
              resolve({ type: data.type || 'answer', sdp: data.sdp });
            } else {
              resolve(null);
            }
          }, reject);
      });
    } catch (error) {
      console.error('SDP Answer fetch failed:', error);
      return null;
    }
  }
}

