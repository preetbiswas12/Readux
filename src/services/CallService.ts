import { MediaStream } from 'react-native-webrtc';
import { GunDBService } from './gundbService';
// @ts-ignore - Importing service singleton instance
import WebRTCService from './WebRTCService';
import KeyExchangeService from './KeyExchangeService';

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
}

class CallService {
  private callSessions: Map<string, CallSession> = new Map();
  private callRequestHandlers: ((request: CallRequest) => void)[] = [];
  private callStateHandlers: Map<string, ((state: CallState) => void)[]> = new Map();

  /**
   * Initiate a call request
   */
  async initiateCall(
    peerAlias: string,
    callType: CallType = 'video'
  ): Promise<CallSession> {
    const callId = `call_${Date.now()}`;

    // Create WebRTC peer connection
    await WebRTCService.createPeerConnection(peerAlias, true);

    // Initialize key exchange for encrypted call
    const {sessionId, ephemeralPublicKey} = await KeyExchangeService.initializeSession(peerAlias);

    // Create call request
    const callRequest: CallRequest = {
      id: callId,
      from: 'currentUser', // TODO: Get from AppContext
      to: peerAlias,
      type: callType,
      timestamp: Date.now(),
    };

    // Publish call request to GunDB
    await GunDBService.publishCallRequest(peerAlias, {
      ...callRequest,
      ephemeralPublicKey,
      sessionId,
    });

    // Create local session
    const callSession: CallSession = {
      id: callId,
      peerAlias,
      callType,
      state: 'calling',
      startTime: Date.now(),
    };

    this.callSessions.set(peerAlias, callSession);
    this.broadcastCallState(peerAlias, 'calling');

    return callSession;
  }

  /**
   * Accept an incoming call
   */
  async acceptCall(peerAlias: string, callType: CallType = 'video'): Promise<CallSession> {
    const callSession = this.callSessions.get(peerAlias);
    if (!callSession) {
      throw new Error(`No incoming call from ${peerAlias}`);
    }

    // Create WebRTC peer connection
    await WebRTCService.createPeerConnection(peerAlias, false);

    // Initialize key exchange
    await KeyExchangeService.initializeSession(peerAlias);

    // Update session state
    callSession.state = 'active';
    callSession.startTime = Date.now();
    this.broadcastCallState(peerAlias, 'active');

    // Acknowledge acceptance via GunDB
    await GunDBService.respondToCallRequest(peerAlias, {
      accepted: true,
      timestamp: Date.now(),
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
   * End an active call
   */
  async endCall(peerAlias: string): Promise<void> {
    const callSession = this.callSessions.get(peerAlias);
    if (!callSession) {
      return;
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
}

export default new CallService();
