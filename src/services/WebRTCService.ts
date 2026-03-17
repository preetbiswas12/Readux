/**
 * Project Aegis - WebRTC Service
 * Handles P2P data channel establishment and message tunneling
 */

import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';

interface PeerConnection {
  peer: RTCPeerConnection;
  dataChannel?: any; // RTCDataChannel typing
  isConnected: boolean;
}

interface WebRTCConfig {
  iceServers: string[];
}

class WebRTCService {
  private static peers: Map<string, PeerConnection> = new Map();
  private static onTrackHandlers: Map<string, (stream: any) => void> = new Map();
  private static config: WebRTCConfig = {
    iceServers: [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      // TURN fallback (Open Relay Project - community-run)
      'turn:openrelay.metered.ca:80',
      'turn:openrelay.metered.ca:443',
    ],
  };

  /**
   * Create a new peer connection with a remote peer
   */
  static async createPeerConnection(
    remotePeerAlias: string,
    isInitiator: boolean
  ): Promise<RTCPeerConnection> {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: this.config.iceServers.map(server => ({
          urls: [server],
        })),
      });

      // If initiator, create data channel
      if (isInitiator) {
        const dataChannel = peerConnection.createDataChannel('chat', {
          ordered: true,
        });
        this.setupDataChannelHandlers(dataChannel, remotePeerAlias);
      }

      // Listen for incoming data channels
      (peerConnection as any).ondatachannel = (event: any) => {
        const dataChannel = event.channel;
        this.setupDataChannelHandlers(dataChannel, remotePeerAlias);
      };

      // Handle incoming media tracks (for audio/video calls)
      (peerConnection as any).ontrack = (event: any) => {
        console.log(`📹 Remote track received from @${remotePeerAlias}: ${event.track.kind}`);
        if (event.streams.length > 0) {
          const handler = this.onTrackHandlers.get(remotePeerAlias);
          if (handler) {
            handler(event.streams[0]);
          }
        }
      };

      // Handle ICE candidates
      (peerConnection as any).onicecandidate = (event: any) => {
        if (event.candidate) {
          console.log(`📡 ICE candidate for ${remotePeerAlias}:`, event.candidate);
          // TODO: Send to remote peer via GunDB relay
        }
      };

      // Handle connection state changes
      (peerConnection as any).onconnectionstatechange = () => {
        console.log(
          `🔌 Connection state with ${remotePeerAlias}: ${peerConnection.connectionState}`
        );

        const peer = this.peers.get(remotePeerAlias);
        if (peer) {
          peer.isConnected = peerConnection.connectionState === 'connected';
        }
      };

      // Store peer connection
      this.peers.set(remotePeerAlias, {
        peer: peerConnection,
        isConnected: false,
      });

      console.log(`✓ Peer connection created for @${remotePeerAlias}`);

      return peerConnection;
    } catch (error) {
      console.error(`Failed to create peer connection: ${error}`);
      throw error;
    }
  }

  /**
   * Setup data channel event handlers
   */
  private static setupDataChannelHandlers(
    dataChannel: any,
    remotePeerAlias: string
  ): void {
    dataChannel.onopen = () => {
      console.log(`✅ Data channel opened with @${remotePeerAlias}`);
      const peer = this.peers.get(remotePeerAlias);
      if (peer) {
        peer.dataChannel = dataChannel;
        peer.isConnected = true;
      }
    };

    dataChannel.onclose = () => {
      console.log(`❌ Data channel closed with @${remotePeerAlias}`);
      const peer = this.peers.get(remotePeerAlias);
      if (peer) {
        peer.isConnected = false;
      }
    };

    dataChannel.onmessage = (event: any) => {
      try {
        const message = JSON.parse(event.data);
        console.log(`💬 Received from @${remotePeerAlias}:`, message);
        // TODO: Pass to MessageService for handling
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    dataChannel.onerror = (error: any) => {
      console.error(`Data channel error with @${remotePeerAlias}:`, error);
    };
  }

  /**
   * Send a message to a peer via data channel
   */
  static async sendMessage(remotePeerAlias: string, message: any): Promise<boolean> {
    const peer = this.peers.get(remotePeerAlias);

    if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
      console.warn(`⚠️  No open data channel for @${remotePeerAlias}`);
      return false;
    }

    try {
      peer.dataChannel.send(JSON.stringify(message));
      console.log(`✓ Message sent to @${remotePeerAlias}`);
      return true;
    } catch (error) {
      console.error(`Failed to send message: ${error}`);
      return false;
    }
  }

  /**
   * Create SDP offer for WebRTC handshake
   */
  static async createOffer(remotePeerAlias: string): Promise<RTCSessionDescription> {
    const peer = this.peers.get(remotePeerAlias);
    if (!peer) {
      throw new Error(`No peer connection for ${remotePeerAlias}`);
    }

    try {
      const offer = await peer.peer.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      });

      await peer.peer.setLocalDescription(offer);
      console.log(`✓ SDP offer created for @${remotePeerAlias}`);

      return offer;
    } catch (error) {
      console.error(`Failed to create offer: ${error}`);
      throw error;
    }
  }

  /**
   * Set remote SDP answer
   */
  static async setRemoteAnswer(
    remotePeerAlias: string,
    answer: RTCSessionDescription
  ): Promise<void> {
    const peer = this.peers.get(remotePeerAlias);
    if (!peer) {
      throw new Error(`No peer connection for ${remotePeerAlias}`);
    }

    try {
      await peer.peer.setRemoteDescription(answer);
      console.log(`✓ Remote answer set for @${remotePeerAlias}`);
    } catch (error) {
      console.error(`Failed to set remote answer: ${error}`);
      throw error;
    }
  }

  /**
   * Create SDP answer for WebRTC handshake
   */
  static async createAnswer(remotePeerAlias: string): Promise<RTCSessionDescription> {
    const peer = this.peers.get(remotePeerAlias);
    if (!peer) {
      throw new Error(`No peer connection for ${remotePeerAlias}`);
    }

    try {
      const answer = await peer.peer.createAnswer();
      await peer.peer.setLocalDescription(answer);
      console.log(`✓ SDP answer created for @${remotePeerAlias}`);

      return answer;
    } catch (error) {
      console.error(`Failed to create answer: ${error}`);
      throw error;
    }
  }

  /**
   * Set remote SDP offer
   */
  static async setRemoteOffer(
    remotePeerAlias: string,
    offer: RTCSessionDescription
  ): Promise<void> {
    const peer = this.peers.get(remotePeerAlias);
    if (!peer) {
      // Create new peer connection if doesn't exist
      await this.createPeerConnection(remotePeerAlias, false);
    }

    try {
      await peer!.peer.setRemoteDescription(offer);
      console.log(`✓ Remote offer set for @${remotePeerAlias}`);
    } catch (error) {
      console.error(`Failed to set remote offer: ${error}`);
      throw error;
    }
  }

  /**
   * Add ICE candidate
   */
  static async addIceCandidate(
    remotePeerAlias: string,
    candidate: RTCIceCandidate
  ): Promise<void> {
    const peer = this.peers.get(remotePeerAlias);
    if (!peer) {
      throw new Error(`No peer connection for ${remotePeerAlias}`);
    }

    try {
      await peer.peer.addIceCandidate(candidate);
    } catch (error) {
      console.error(`Failed to add ICE candidate: ${error}`);
    }
  }

  /**
   * Check if connection is ready
   */
  static isConnected(remotePeerAlias: string): boolean {
    const peer = this.peers.get(remotePeerAlias);
    return !!(peer && peer.isConnected && peer.dataChannel);
  }

  /**
   * Close peer connection
   */
  static async closePeerConnection(remotePeerAlias: string): Promise<void> {
    const peer = this.peers.get(remotePeerAlias);
    if (peer) {
      peer.dataChannel?.close();
      peer.peer.close();
      this.peers.delete(remotePeerAlias);
      console.log(`✓ Peer connection closed for @${remotePeerAlias}`);
    }
  }

  /**
   * Get all active peer connections
   */
  static getActivePeers(): string[] {
    return Array.from(this.peers.keys()).filter(
      alias => this.peers.get(alias)?.isConnected
    );
  }

  /**
   * Add a media track to the peer connection (for audio/video calls)
   */
  static async addTrack(
    remotePeerAlias: string,
    track: any,
    stream: any
  ): Promise<void> {
    const peer = this.peers.get(remotePeerAlias);
    if (!peer) {
      throw new Error(`No peer connection for ${remotePeerAlias}`);
    }

    try {
      await peer.peer.addTrack(track, stream);
      console.log(
        `✓ ${track.kind} track added for @${remotePeerAlias}`
      );
    } catch (error) {
      console.error(`Failed to add track: ${error}`);
    }
  }

  /**
   * Register handler for remote media streams
   */
  static onRemoteStream(
    remotePeerAlias: string,
    handler: (stream: any) => void
  ): void {
    this.onTrackHandlers.set(remotePeerAlias, handler);

    // If peer connection already exists, set up ontrack
    const peer = this.peers.get(remotePeerAlias);
    if (peer) {
      (peer.peer as any).addEventListener('track', (event: any) => {
        console.log(`📹 Remote track received from @${remotePeerAlias}: ${event.track.kind}`);
        if (event.streams.length > 0) {
          handler(event.streams[0]);
        }
      });
    }
  }

  /**
   * Register handler for incoming media tracks
   */
  static onTrack(remotePeerAlias: string, handler: (stream: any) => void): void {
    this.onTrackHandlers.set(remotePeerAlias, handler);
  }

  /**
   * Add local media stream to peer connection
   */
  static async addLocalStream(remotePeerAlias: string, stream: any): Promise<void> {
    const peer = this.peers.get(remotePeerAlias);
    if (!peer) {
      throw new Error(`No peer connection for ${remotePeerAlias}`);
    }

    try {
      const tracks = stream.getTracks();
      for (const track of tracks) {
        await peer.peer.addTrack(track, stream);
      }
      console.log(`✓ Local stream added for @${remotePeerAlias}`);
    } catch (error) {
      console.error(`Failed to add local stream: ${error}`);
      throw error;
    }
  }

  /**
   * Get RTCPeerConnection for advanced operations
   */
  static getPeerConnection(remotePeerAlias: string): RTCPeerConnection | undefined {
    return this.peers.get(remotePeerAlias)?.peer;
  }

  /**
   * Enable/disable audio track
   */
  static setAudioEnabled(remotePeerAlias: string, enabled: boolean): void {
    const peer = this.peers.get(remotePeerAlias);
    if (peer) {
      const senders = peer.peer.getSenders();
      senders.forEach(sender => {
        if (sender.track && sender.track.kind === 'audio') {
          sender.track.enabled = enabled;
        }
      });
    }
  }

  /**
   * Enable/disable video track
   */
  static setVideoEnabled(remotePeerAlias: string, enabled: boolean): void {
    const peer = this.peers.get(remotePeerAlias);
    if (peer) {
      const senders = peer.peer.getSenders();
      senders.forEach(sender => {
        if (sender.track && sender.track.kind === 'video') {
          sender.track.enabled = enabled;
        }
      });
    }
  }
}

export default WebRTCService;
