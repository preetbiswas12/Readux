import { MediaStream } from 'react-native-webrtc';
import { GunDBService } from './gundbService';
// @ts-ignore - Importing service singleton instance
import WebRTCService from './WebRTCService';
import KeyExchangeService from './KeyExchangeService';
// @ts-ignore - E2EEncryptionService is default exported as singleton
import E2EEncryptionService, { type EncryptedMediaFrame } from './E2EEncryptionService';

export type CallState = 'idle' | 'ringing' | 'calling' | 'active' | 'ended' | 'rejected';
export type CallType = 'audio' | 'video';

export interface CallRequest {
  id: string;
  from: string;
  to: string;
  type: CallType;
  timestamp: number;
  offer?: RTCSessionDescriptionInit;
}

export interface CallSession {
  id: string;
  peerAlias: string;
  callType: CallType;
  state: CallState;
  startTime?: number;
  endTime?: number;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  mediaSessionId?: string; // SRTP encryption session ID
  isE2EEEnabled?: boolean; // Media encryption status
}

class CallService {
  private callSessions: Map<string, CallSession> = new Map();
  private callRequestHandlers: ((request: CallRequest) => void)[] = [];
  private callStateHandlers: Map<string, ((state: CallState) => void)[]> = new Map();
  private mediaEncryptionSessions: Set<string> = new Set(); // Track SRTP encryption sessions

  /**
   * Initiate a call request (with E2EE media encryption)
   */
  async initiateCall(
    peerAlias: string,
    callType: CallType = 'video',
    fromAlias?: string
  ): Promise<CallSession> {
    const callId = `call_${Date.now()}`;
    const mediaSessionId = `media_${callId}`; // Unique media encryption session

    // Create WebRTC peer connection
    await WebRTCService.createPeerConnection(peerAlias, true);

    // Initialize key exchange for encrypted call
    const {sessionId, ephemeralPublicKey} = await KeyExchangeService.initializeSession(peerAlias);

    // Initialize SRTP media encryption with derived shared secret
    try {
      const sharedSecret = await this.deriveMediaSharedSecret(peerAlias);
      await E2EEncryptionService.initializeMediaSession(
        mediaSessionId,
        new Uint8Array(Buffer.from(sharedSecret, 'hex')),
        3600 // 1 hour session
      );
      this.mediaEncryptionSessions.add(mediaSessionId);
      console.log(`🔐 SRTP encryption initialized for call: ${callId}`);
    } catch (error) {
      console.warn(`⚠️ Failed to initialize SRTP: ${error}`);
      // Continue without encryption as fallback
    }

    // Create call request with actual caller identity
    const callRequest: CallRequest = {
      id: callId,
      from: fromAlias || 'currentUser', // ✅ Use actual alias
      to: peerAlias,
      type: callType,
      timestamp: Date.now(),
    };

    // Publish call request to GunDB
    await GunDBService.publishCallRequest(peerAlias, {
      ...callRequest,
      ephemeralPublicKey,
      sessionId,
      mediaSessionId, // Share encryption session ID
    });

    // Create local session
    const callSession: CallSession = {
      id: callId,
      peerAlias,
      callType,
      state: 'calling',
      startTime: Date.now(),
      mediaSessionId,
      isE2EEEnabled: this.mediaEncryptionSessions.has(mediaSessionId),
    };

    this.callSessions.set(peerAlias, callSession);
    this.broadcastCallState(peerAlias, 'calling');

    return callSession;
  }

  /**
   * Accept an incoming call (with E2EE media encryption)
   */
  async acceptCall(peerAlias: string, callType: CallType = 'video'): Promise<CallSession> {
    const callSession = this.callSessions.get(peerAlias);
    if (!callSession) {
      throw new Error(`No incoming call from ${peerAlias}`);
    }

    // Create WebRTC peer connection
    await WebRTCService.createPeerConnection(peerAlias, false);

    // Initialize key exchange
    void await KeyExchangeService.initializeSession(peerAlias);

    // Initialize SRTP media encryption
    try {
      const mediaSessionId = callSession.mediaSessionId || `media_${callSession.id}`;
      const sharedSecret = await this.deriveMediaSharedSecret(peerAlias);
      await E2EEncryptionService.initializeMediaSession(
        mediaSessionId,
        new Uint8Array(Buffer.from(sharedSecret, 'hex')),
        3600
      );
      this.mediaEncryptionSessions.add(mediaSessionId);
      callSession.mediaSessionId = mediaSessionId;
      callSession.isE2EEEnabled = true;
      console.log(`🔐 SRTP encryption initialized for accepted call: ${callSession.id}`);
    } catch (error) {
      console.warn(`⚠️ Failed to initialize SRTP: ${error}`);
      callSession.isE2EEEnabled = false;
    }

    // Update session state
    callSession.state = 'active';
    callSession.startTime = Date.now();
    this.broadcastCallState(peerAlias, 'active');

    // Acknowledge acceptance via GunDB
    await GunDBService.respondToCallRequest(peerAlias, {
      accepted: true,
      timestamp: Date.now(),
      mediaSessionId: callSession.mediaSessionId,
    });

    return callSession;
  }

  /**
   * Reject an incoming call
   */
  async rejectCall(peerAlias: string): Promise<void> {
    const callSession = this.callSessions.get(peerAlias);
    if (callSession) {
      callSession.state = 'rejected';
      this.broadcastCallState(peerAlias, 'rejected');
    }

    // Notify peer of rejection via GunDB
    await GunDBService.respondToCallRequest(peerAlias, {
      accepted: false,
      timestamp: Date.now(),
    });

    // Cleanup
    await this.endCall(peerAlias);
  }

  /**
   * End an active call (with cleanup of E2EE media encryption)
   */
  async endCall(peerAlias: string): Promise<void> {
    const callSession = this.callSessions.get(peerAlias);
    if (!callSession) {
      return;
    }

    // End media encryption session
    if (callSession.mediaSessionId && this.mediaEncryptionSessions.has(callSession.mediaSessionId)) {
      E2EEncryptionService.endMediaSession(callSession.mediaSessionId);
      this.mediaEncryptionSessions.delete(callSession.mediaSessionId);
      console.log(`🔐 SRTP encryption session ended: ${callSession.mediaSessionId}`);
    }

    callSession.state = 'ended';
    callSession.endTime = Date.now();
    this.broadcastCallState(peerAlias, 'ended');

    // Close WebRTC connection
    await WebRTCService.closePeerConnection(peerAlias);

    // Terminate encryption session
    KeyExchangeService.terminateSession(peerAlias);

    // Cleanup
    this.callSessions.delete(peerAlias);
  }

  /**
   * Handle incoming call request
   */
  handleIncomingCallRequest(request: CallRequest): void {
    const callSession: CallSession = {
      id: request.id,
      peerAlias: request.from,
      callType: request.type,
      state: 'ringing',
      startTime: Date.now(),
    };

    this.callSessions.set(request.from, callSession);
    this.broadcastCallState(request.from, 'ringing');

    // Trigger registered handlers (UI notifications)
    this.callRequestHandlers.forEach(handler => handler(request));
  }

  /**
   * Add/set local media stream for call
   */
  async setLocalStream(peerAlias: string, stream: MediaStream): Promise<void> {
    const callSession = this.callSessions.get(peerAlias);
    if (!callSession) {
      throw new Error(`No call session with ${peerAlias}`);
    }

    callSession.localStream = stream;

    // Add stream tracks to WebRTC peer connection
    for (const track of stream.getTracks()) {
      await WebRTCService.addTrack(peerAlias, track, stream);
    }
  }

  /**
   * Handle remote media stream (when peer sends video/audio)
   */
  setRemoteStream(peerAlias: string, stream: MediaStream): void {
    const callSession = this.callSessions.get(peerAlias);
    if (!callSession) {
      throw new Error(`No call session with ${peerAlias}`);
    }

    callSession.remoteStream = stream;
  }

  /**
   * Get active call session
   */
  getCallSession(peerAlias: string): CallSession | undefined {
    return this.callSessions.get(peerAlias);
  }

  /**
   * Subscribe to incoming call requests
   */
  onCallRequest(handler: (request: CallRequest) => void): void {
    this.callRequestHandlers.push(handler);
  }

  /**
   * Subscribe to call state changes
   */
  onCallStateChange(peerAlias: string, handler: (state: CallState) => void): void {
    if (!this.callStateHandlers.has(peerAlias)) {
      this.callStateHandlers.set(peerAlias, []);
    }
    this.callStateHandlers.get(peerAlias)!.push(handler);
  }

  /**
   * Broadcast call state change
   */
  private broadcastCallState(peerAlias: string, state: CallState): void {
    const handlers = this.callStateHandlers.get(peerAlias) || [];
    handlers.forEach(handler => handler(state));
  }

  /**
   * Get all active call sessions
   */
  getActiveCalls(): {peerAlias: string; session: CallSession}[] {
    const calls: {peerAlias: string; session: CallSession}[] = [];
    this.callSessions.forEach((session, peerAlias) => {
      if (session.state !== 'ended' && session.state !== 'rejected') {
        calls.push({peerAlias, session});
      }
    });
    return calls;
  }

  /**
   * Check if in call with peer
   */
  isInCall(peerAlias: string): boolean {
    const session = this.callSessions.get(peerAlias);
    return !!session && (session.state === 'active' || session.state === 'calling');
  }

  /**
   * Get call duration in seconds
   */
  getCallDuration(peerAlias: string): number {
    const session = this.callSessions.get(peerAlias);
    if (!session || !session.startTime) return 0;
    const endTime = session.endTime || Date.now();
    return Math.floor((endTime - session.startTime) / 1000);
  }

  /**
   * Encrypt a media frame (RTP packet) for transmission
   */
  async encryptMediaFrame(
    peerAlias: string,
    frameData: Uint8Array,
    timestamp: number
  ): Promise<EncryptedMediaFrame | null> {
    const callSession = this.callSessions.get(peerAlias);
    if (!callSession || !callSession.mediaSessionId || !callSession.isE2EEEnabled) {
      // E2EE not available, return null (caller sends unencrypted)
      return null;
    }

    try {
      return await E2EEncryptionService.encryptMediaFrame(
        callSession.mediaSessionId,
        frameData,
        timestamp
      );
    } catch (error) {
      console.error(`Failed to encrypt media frame for @${peerAlias}: ${error}`);
      return null; // Fallback to unencrypted
    }
  }

  /**
   * Decrypt a received media frame
   */
  async decryptMediaFrame(
    peerAlias: string,
    frame: EncryptedMediaFrame
  ): Promise<Uint8Array | null> {
    const callSession = this.callSessions.get(peerAlias);
    if (!callSession || !callSession.isE2EEEnabled) {
      return null;
    }

    try {
      return await E2EEncryptionService.decryptMediaFrame(
        frame.sessionId,
        frame
      );
    } catch (error) {
      console.error(`Failed to decrypt media frame from @${peerAlias}: ${error}`);
      return null;
    }
  }

  /**
   * Get media encryption status for a call
   */
  getMediaEncryptionStatus(peerAlias: string): {isEnabled: boolean; sessionId?: string} {
    const callSession = this.callSessions.get(peerAlias);
    return {
      isEnabled: callSession?.isE2EEEnabled || false,
      sessionId: callSession?.mediaSessionId,
    };
  }

  /**
   * Derive shared secret for media encryption (SRTP)
   */
  private async deriveMediaSharedSecret(peerAlias: string): Promise<string> {
    // Get the key exchange session for this peer
    const sessionData = KeyExchangeService.getSessionState(peerAlias);
    if (!sessionData) {
      throw new Error(`No key exchange session with @${peerAlias}`);
    }

    // For SRTP, we use HMAC of the Double Ratchet root key with "media" constant
    const rootKeyHex = sessionData.rootKey;
    const buffer = Buffer.from(rootKeyHex, 'hex');
    
    // Simple KDF: HMAC(rootKey, "media-encryption")
    // In production, use proper HKDF with salt
    const data = new TextEncoder().encode('media-encryption');
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      buffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
    return Buffer.from(signature).toString('hex').slice(0, 64);  // 32 bytes
  }
}

export default new CallService();
