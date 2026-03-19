/**
 * WebRTC + ICE Framework Integration Layer
 * Extends WebRTCService with:
 * - Trickle ICE for faster connections
 * - CG-NAT mitigation
 * - IPv6 support
 * - Advanced candidate selection
 * 
 * Usage:
 * const iceConnection = await AdvancedWebRTC.createICEConnection(peerAlias, isInitiator);
 */

import { ICEFramework, type ICECandidate, type ICEConnection } from './ICEFramework';
import { TrickleICEService } from './TrickleICESignaling';
import { CGNATMitigation } from './CGNATMitigation';
import TURNFallbackServiceInstance from './TURNFallbackService';

/**
 * Configuration for advanced ICE
 */
export interface AdvancedICEConfig {
  trickleICEEnabled: boolean;      // Stream candidates as discovered
  ipv6Enabled: boolean;            // Enable IPv6 support
  cgnatMitigationEnabled: boolean; // Enable CG-NAT auto-detection
  candidateBatchSize: number;      // Batch candidates before sending
  candidateBatchTimeoutMs: number; // Or send after timeout
  maxConnectionTimeSeconds: number; // Timeout for connection establishment
}

const DEFAULT_CONFIG: AdvancedICEConfig = {
  trickleICEEnabled: true,
  ipv6Enabled: true,
  cgnatMitigationEnabled: true,
  candidateBatchSize: 5,           // Send every 5 candidates
  candidateBatchTimeoutMs: 500,    // Or every 500ms
  maxConnectionTimeSeconds: 30,
};

class AdvancedWebRTCImpl {
  private config: AdvancedICEConfig = DEFAULT_CONFIG;
  private iceConnections: Map<string, ICEConnection> = new Map();
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private candidateBatches: Map<string, ICECandidate[]> = new Map();
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Initialize Framework
   * OPTIMIZED FOR JIO ISP: IPv6-first configuration
   */
  async initialize(config: Partial<AdvancedICEConfig> = {}): Promise<void> {
    this.config = { ...DEFAULT_CONFIG, ...config };

    console.log(`\n🚀 [AdvancedWebRTC] Initializing for JIO ISP (IPv6-Priority):
      Trickle ICE: ${this.config.trickleICEEnabled}
      IPv6 Priority: ${this.config.ipv6Enabled} ⭐ ENABLED
      CG-NAT Mitigation: ${this.config.cgnatMitigationEnabled}
      Strategy: IPv6-first (fallback IPv4)
    \n`);

    // Initialize ICE Framework
    await ICEFramework.initialize();
    ICEFramework.setTrickleICEEnabled(this.config.trickleICEEnabled);

    // Assess network and recommend strategy
    // With JIO ISP optimization: prefers IPv6
    const recommendedStrategy = CGNATMitigation.assessNetworkAndRecommend();
    console.log(`📊 [AdvancedWebRTC] Recommended strategy for JIO ISP: ${recommendedStrategy}\n`);
  }

  /**
   * Create advanced ICE connection with Trickle ICE
   * OPTIMIZED FOR JIO ISP: IPv6-first server selection
   */
  async createICEConnection(
    peerId: string,
    myAlias: string,
    isInitiator: boolean
  ): Promise<{
    iceConnection: ICEConnection;
    peerConnection: RTCPeerConnection;
  }> {
    console.log(`\n🔌 [AdvancedWebRTC] Creating ICE connection with @${peerId} (IPv6-first for JIO ISP)...`);

    try {
      // Step 1: Get optimal ICE servers based on network conditions
      let stunServers = TURNFallbackServiceInstance.getICEServers()
        .filter(s => s.urls).flatMap(s => s.urls as string[]);
      const turnServers = TURNFallbackServiceInstance.getICEServers()
        .filter(s => s.username);

      // Step 2: Separate IPv6 and IPv4 for intelligent ordering
      const ipv6Servers = stunServers.filter(s => 
        s.includes('[::') || s.includes('ipv6') || s.includes('::')
      );
      const ipv4Servers = stunServers.filter(s => 
        !s.includes('[::') && !s.includes('ipv6') && !s.includes('::')
      );

      // Step 3: Let CG-NAT mitigation refine server selection
      // IPv6 prioritized for JIO ISP
      const orderedServers = [...ipv6Servers, ...ipv4Servers];
      const { stunServers: optimalStun, turnServers: optimalTurn, strategy } =
        CGNATMitigation.buildOptimalICEServers(turnServers, orderedServers);

      console.log(`📡 [AdvancedWebRTC] Using strategy: ${strategy}
        IPv6 STUN servers: ${ipv6Servers.length}
        IPv4 STUN servers: ${ipv4Servers.length}
        TURN servers: ${optimalTurn.length}`);

      // Step 4: Create RTCPeerConnection with IPv6-first servers
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          ...optimalStun.map(url => ({ urls: [url] })),
          ...optimalTurn.map(turn => ({
            urls: [turn.url],
            username: turn.username,
            credential: turn.credential,
          })),
        ],
      });

      // Step 5: Start Trickle ICE with ICEFramework
      const onCandidate = async (candidate: ICECandidate) => {
        await this.handleCandidate(peerId, myAlias, candidate);
      };

      const iceConnection = await ICEFramework.startTrickleICE(
        peerId,
        isInitiator,
        optimalStun,
        optimalTurn,
        onCandidate
      );

      // Store references
      this.iceConnections.set(peerId, iceConnection);
      this.peerConnections.set(peerId, peerConnection);
      this.candidateBatches.set(peerId, []);

      // Step 5: Set up handlers
      await this.setupConnectionHandlers(peerId, myAlias, peerConnection, isInitiator);

      console.log(`✅ [AdvancedWebRTC] ICE connection created. Awaiting candidates...`);

      return { iceConnection, peerConnection };
    } catch (error) {
      console.error(`❌ [AdvancedWebRTC] Failed to create ICE connection:`, error);
      throw error;
    }
  }

  /**
   * Handle incoming candidate from Trickle ICE
   * Batch and send via GunDB
   */
  private async handleCandidate(
    peerId: string,
    myAlias: string,
    candidate: ICECandidate
  ): Promise<void> {
    // Add to batch
    const batch = this.candidateBatches.get(peerId) || [];
    batch.push(candidate);
    this.candidateBatches.set(peerId, batch);

    console.log(`✈️  [AdvancedWebRTC] Candidate queued for @${peerId}: ${candidate.address}:${candidate.port} (batch: ${batch.length}/${this.config.candidateBatchSize})`);

    // Check if should send batch
    if (batch.length >= this.config.candidateBatchSize) {
      await this.flushCandidateBatch(peerId, myAlias);
    } else {
      // Set timeout for flushing
      const existingTimer = this.batchTimers.get(peerId);
      if (existingTimer) clearTimeout(existingTimer);

      const timer = setTimeout(
        () => this.flushCandidateBatch(peerId, myAlias),
        this.config.candidateBatchTimeoutMs
      );
      this.batchTimers.set(peerId, timer);
    }
  }

  /**
   * Send batched candidates to peer via Trickle ICE
   */
  private async flushCandidateBatch(
    peerId: string,
    myAlias: string
  ): Promise<void> {
    const batch = this.candidateBatches.get(peerId) || [];
    if (batch.length === 0) return;

    console.log(`📤 [AdvancedWebRTC] Sending ${batch.length} candidates to @${peerId}`);

    try {
      await TrickleICEService.publishCandidates(peerId, batch);
      this.candidateBatches.set(peerId, []);
    } catch (error) {
      console.warn(`⚠️  [AdvancedWebRTC] Failed to flush candidates:`, error);
    }
  }

  /**
   * Set up connection handlers
   */
  private async setupConnectionHandlers(
    peerId: string,
    myAlias: string,
    peerConnection: RTCPeerConnection,
    isInitiator: boolean
  ): Promise<void> {
    // Data channel for chat
    if (isInitiator) {
      const dataChannel = peerConnection.createDataChannel('chat', { ordered: true });
      this.setupDataChannelHandlers(peerId, dataChannel);
    }

    (peerConnection as any).ondatachannel = (event: any) => {
      this.setupDataChannelHandlers(peerId, event.channel);
    };

    // ICE connection state
    (peerConnection as any).oniceconnectionstatechange = () => {
      const state = peerConnection.iceConnectionState;
      console.log(`🔗 [AdvancedWebRTC] ICE connection state: ${state} (@${peerId})`);

      if (state === 'connected' || state === 'completed') {
        // Assess connection quality
        const assessment = CGNATMitigation.assessConnectionQuality(peerId);
        console.log(`✅ [AdvancedWebRTC] Connection quality: ${assessment.quality} (${assessment.score}/100)`);
        console.log(`   Reason: ${assessment.reason}`);
      } else if (state === 'failed') {
        // Try emergency fallback
        console.warn(`⚠️  [AdvancedWebRTC] Connection failed - attempting fallback`);
        this.handleConnectionFailure(peerId).catch(e =>
          console.error('[AdvancedWebRTC] Fallback failed:', e)
        );
      }
    };

    // Gather remaining candidates
    (peerConnection as any).onicecandidate = (event: any) => {
      if (event.candidate) {
        console.log(`🧊 [AdvancedWebRTC] Raw ICE candidate:`, event.candidate);
      } else {
        console.log(`🏁 [AdvancedWebRTC] Candidate gathering complete`);
        // End of candidates signaled - no explicit API needed, candidates batch is empty
      }
    };
  }

  /**
   * Handle connection failure and try fallback
   */
  private async handleConnectionFailure(peerId: string): Promise<void> {
    try {
      const turnServers = TURNFallbackServiceInstance.getICEServers().filter(s => s.username);
      const strategy = await CGNATMitigation.emergencyFallback(peerId, turnServers);

      console.log(`🆘 [AdvancedWebRTC] Using fallback strategy: ${strategy}`);

      // Could retry connection with new strategy here
    } catch (error) {
      console.error('[AdvancedWebRTC] Emergency fallback failed:', error);
    }
  }

  /**
   * Set up data channel
   */
  private setupDataChannelHandlers(peerId: string, dataChannel: any): void {
    dataChannel.onopen = () => {
      console.log(`📨 [AdvancedWebRTC] Data channel opened with @${peerId}`);
    };

    dataChannel.onclose = () => {
      console.log(`📨 [AdvancedWebRTC] Data channel closed with @${peerId}`);
    };

    dataChannel.onerror = (event: any) => {
      console.error(`❌ [AdvancedWebRTC] Data channel error:`, event.error);
    };
  }

  /**
   * Get diagnostic report
   */
  generateFullReport(): string {
    return `
╔════════════════════════════════════════════════════════════╗
║           Advanced WebRTC / ICE Framework Report           ║
╚════════════════════════════════════════════════════════════╝

${ICEFramework.generateReport()}

${CGNATMitigation.generateDiagnosticReport()}

Advanced Config:
  • Trickle ICE: ${this.config.trickleICEEnabled}
  • IPv6 Support: ${this.config.ipv6Enabled}
  • CG-NAT Mitigation: ${this.config.cgnatMitigationEnabled}
  • Candidate Batching: Every ${this.config.candidateBatchSize} candidates or ${this.config.candidateBatchTimeoutMs}ms

Active Connections: ${this.iceConnections.size}
    `;
  }

  /**
   * Clean up connection
   */
  cleanupConnection(peerId: string): void {
    const timer = this.batchTimers.get(peerId);
    if (timer) clearTimeout(timer);

    this.iceConnections.delete(peerId);
    this.peerConnections.delete(peerId);
    this.candidateBatches.delete(peerId);
    this.batchTimers.delete(peerId);

    console.log(`🧹 [AdvancedWebRTC] Cleaned up connection with @${peerId}`);
  }
}

export const AdvancedWebRTC = new AdvancedWebRTCImpl();
export default AdvancedWebRTC;
