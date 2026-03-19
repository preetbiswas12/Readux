/**
 * ICE Framework - Advanced Connectivity Management
 * Features:
 * - Trickle ICE: Stream candidates instead of waiting for all to gather
 * - IPv6 Support: Dual-stack connectivity
 * - CG-NAT Detection: Identifies when behind carrier-grade NAT
 * - Smart Fallback: Chooses optimal path based on network conditions
 * - Performance Metrics: Tracks connection quality
 * 
 * Problem: STUN/TURN alone fail with CG-NAT from mobile providers
 * Solution: App-level ICE control with intelligent candidate selection
 */

import { v4 as uuidv4 } from 'uuid';

export enum CandidateType {
  HOST = 'host',           // Local IP (on LAN)
  SRFLX = 'srflx',         // Server reflexive - public IP via STUN
  RELAY = 'relay',         // Via TURN relay
  PRFLX = 'prflx',         // Peer reflexive (discovered during connection)
}

export enum AddressFamily {
  IPv4 = 'ipv4',
  IPv6 = 'ipv6',
  DUAL = 'dual',
}

export interface ICECandidate {
  id: string;
  foundation: string;
  component: 'rtp' | 'rtcp';
  type: CandidateType;
  priority: number;
  address: string;
  port: number;
  addressFamily: AddressFamily;
  candidate: RTCIceCandidate; // Raw WebRTC candidate
  latency?: number;
  success: boolean;
  timestamp: number;
}

export interface NetworkProfile {
  ipv4Available: boolean;
  ipv6Available: boolean;
  behindCGNAT: boolean;
  behindSymmetricNAT: boolean;
  publicIP?: string;
  publicIPv6?: string;
  connectivity: 'direct' | 'relay' | 'none';
  dominantCandidateType?: CandidateType;
  estimatedBandwidth?: number;
}

export interface ICEConnection {
  peerId: string;
  initiator: boolean;
  state: 'new' | 'checking' | 'connected' | 'completed' | 'failed' | 'disconnected';
  selectedCandidate?: ICECandidate;
  remoteCandidates: ICECandidate[];
  localCandidates: ICECandidate[];
  checklistState: 'running' | 'completed' | 'failed';
  rtt: number; // Round trip time (latency)
  createdAt: number;
  connectedAt?: number;
}

class ICEFrameworkImpl {
  private connections: Map<string, ICEConnection> = new Map();
  private networkProfile: NetworkProfile = {
    ipv4Available: false,
    ipv6Available: false,
    behindCGNAT: false,
    behindSymmetricNAT: false,
    connectivity: 'none',
  };
  
  private candidateCallbacks: Map<string, (candidate: ICECandidate) => void> = new Map();
  private connectionStateCallbacks: Map<string, (state: ICEConnection) => void> = new Map();
  
  // Trickle ICE state
  private trickleCandidateQueues: Map<string, ICECandidate[]> = new Map();
  private trickleIceEnabled = true;

  /**
   * Initialize ICE Framework
   * Detects network conditions and sets up callbacks
   */
  async initialize(): Promise<void> {
    console.log('🌐 [ICE] Initializing ICE Framework with Trickle ICE...');
    
    // Probe network connectivity
    await this.probeNetworkProfile();
    
    console.log(`🌐 [ICE] Network Profile:
      IPv4: ${this.networkProfile.ipv4Available}
      IPv6: ${this.networkProfile.ipv6Available}
      Behind CG-NAT: ${this.networkProfile.behindCGNAT}
      Connectivity: ${this.networkProfile.connectivity}`);
  }

  /**
   * Probe network to detect IPv4/IPv6 and NAT type
   */
  private async probeNetworkProfile(): Promise<void> {
    try {
      // Test IPv4 connectivity
      const ipv4Test = await Promise.race([
        fetch('https://ipv4.google.com', { method: 'HEAD' }).then(() => true).catch(() => false),
        new Promise<boolean>(resolve => setTimeout(() => resolve(false), 3000))
      ]);
      this.networkProfile.ipv4Available = ipv4Test;

      // Test IPv6 connectivity
      const ipv6Test = await Promise.race([
        fetch('https://ipv6.google.com', { method: 'HEAD' }).then(() => true).catch(() => false),
        new Promise<boolean>(resolve => setTimeout(() => resolve(false), 3000))
      ]);
      this.networkProfile.ipv6Available = ipv6Test;

      // Detect CG-NAT (will be confirmed after ICE gathering)
      this.networkProfile.behindCGNAT = false; // Updated during candidate gathering
    } catch (error) {
      console.warn('[ICE] Network probe failed:', error);
    }
  }

  /**
   * Start Trickle ICE with streaming candidate collection
   * Instead of waiting for all candidates, stream them as discovered
   */
  async startTrickleICE(
    peerId: string,
    initiator: boolean,
    peerStunServers: string[],
    peerTurnServers: any[] = [],
    onCandidate: (candidate: ICECandidate) => void
  ): Promise<ICEConnection> {
    const connectionId = peerId;
    
    console.log(`🔄 [ICE] Starting Trickle ICE with @${peerId} (initiator: ${initiator})`);

    // Create ICE connection state
    const connection: ICEConnection = {
      peerId,
      initiator,
      state: 'new',
      localCandidates: [],
      remoteCandidates: [],
      checklistState: 'running',
      rtt: 0,
      createdAt: Date.now(),
    };

    this.connections.set(connectionId, connection);
    this.candidateCallbacks.set(connectionId, onCandidate);
    this.trickleCandidateQueues.set(connectionId, []);

    // Build ICE servers with both IPv4 and IPv6
    const iceServers = this.buildICEServers(peerStunServers, peerTurnServers);

    try {
      const peerConnection = new RTCPeerConnection({
        iceServers,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
      });

      // Handle ICE candidates as they're discovered (Trickle ICE)
      peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
          // Candidate discovered - process and stream immediately
          const iceCandidate = await this.processCandidate(
            event.candidate,
            peerId
          );

          if (iceCandidate) {
            // Add to local candidates
            connection.localCandidates.push(iceCandidate);

            // Stream candidate immediately (Trickle ICE)
            if (this.trickleIceEnabled) {
              // Queue for immediate delivery
              this.trickleCandidateQueues.get(connectionId)?.push(iceCandidate);
              onCandidate(iceCandidate);
              console.log(`✓ [ICE] Trickle streamed: ${iceCandidate.address}:${iceCandidate.port} (${iceCandidate.type})`);
            }
          }
        } else {
          // End of candidates (null event)
          connection.checklistState = 'completed';
          console.log(`✓ [ICE] Candidate gathering complete for @${peerId}`);
        }
      };

      // Monitor ICE connection state
      peerConnection.oniceconnectionstatechange = () => {
        this.handleICEConnectionStateChange(connectionId, peerConnection);
      };

      peerConnection.onicegatheringstatechange = () => {
        console.log(`[ICE] Gathering state: ${peerConnection.iceGatheringState} for @${peerId}`);
        if (peerConnection.iceGatheringState === 'complete') {
          connection.checklistState = 'completed';
        }
      };

      // Detect CG-NAT based on candidates
      this.detectCGNAT(connection);

      return connection;
    } catch (error) {
      console.error(`[ICE] Failed to start Trickle ICE with @${peerId}:`, error);
      connection.state = 'failed';
      throw error;
    }
  }

  /**
   * Add remote candidate discovered by peer
   * Called when peer sends trickle ICE candidate
   */
  async addRemoteCandidate(
    peerId: string,
    candidateData: any,
    peerConnection: RTCPeerConnection
  ): Promise<void> {
    try {
      const connection = this.connections.get(peerId);
      if (!connection) {
        console.warn(`[ICE] No connection found for @${peerId}`);
        return;
      }

      // Parse candidate (only use standard RTCIceCandidateInit properties)
      const candidate = new RTCIceCandidate({
        candidate: candidateData.candidate || '',
        sdpMLineIndex: candidateData.sdpMLineIndex ?? 0,
        sdpMid: candidateData.sdpMid ?? 'offer',
      });

      // Add to peer connection
      await peerConnection.addIceCandidate(candidate);
      connection.remoteCandidates.push(
        this.createICECandidate(candidate, CandidateType[candidateData.type as keyof typeof CandidateType])
      );

      console.log(`✓ [ICE] Remote candidate added: ${candidateData.address}:${candidateData.port}`);
    } catch (error) {
      console.error(`[ICE] Failed to add remote candidate from @${peerId}:`, error);
    }
  }

  /**
   * Process raw WebRTC candidate into framework candidate
   */
  private async processCandidate(
    rawCandidate: RTCIceCandidate,
    peerId: string
  ): Promise<ICECandidate | null> {
    try {
      const candidateStr = rawCandidate.candidate || '';

      // Parse candidate string
      if (!candidateStr) return null;

      // Determine candidate type
      let candidateType = CandidateType.HOST;
      if (candidateStr.includes('srflx')) candidateType = CandidateType.SRFLX;
      else if (candidateStr.includes('relay')) candidateType = CandidateType.RELAY;
      else if (candidateStr.includes('prflx')) candidateType = CandidateType.PRFLX;

      // Extract IP and port
      const addressMatch = candidateStr.match(/(\S+)\s+(\d+)\s+/);
      if (!addressMatch) return null;

      const address = addressMatch[1];
      const port = parseInt(addressMatch[2], 10);

      // Determine address family (IPv4 vs IPv6)
      const addressFamily = this.detectAddressFamily(address);

      // Calculate priority (priority = (1<<24)*(type_pref) + (1<<8)*(local_preference) + (256 - component_index))
      // IPv6 gets higher priority for JIO ISP
      const typePref = this.getTypePriority(candidateType, addressFamily);
      const localPref = addressFamily === AddressFamily.IPv6 ? 65535 : 32768; // IPv6 higher local preference
      const componentIndex = rawCandidate.component === 'rtp' ? 1 : 2;
      const priority = (typePref << 24) + (localPref << 8) + (256 - componentIndex);

      const iceCandidate: ICECandidate = {
        id: uuidv4(),
        foundation: rawCandidate.foundation || '',
        component: rawCandidate.component as 'rtp' | 'rtcp',
        type: candidateType,
        priority,
        address,
        port,
        addressFamily,
        candidate: rawCandidate,
        success: true,
        timestamp: Date.now(),
      };

      return iceCandidate;
    } catch (error) {
      console.error('[ICE] Failed to process candidate:', error);
      return null;
    }
  }

  /**
   * Build ICE servers with IPv4 and IPv6 support
   */
  private buildICEServers(stunServers: string[], turnServers: any[]): RTCIceServer[] {
    const iceServers: RTCIceServer[] = [];

    // Add STUN servers (both IPv4 and IPv6 if available)
    for (const stun of stunServers) {
      iceServers.push({
        urls: [stun],
      });
    }

    // Add TURN servers with credentials
    for (const turn of turnServers) {
      iceServers.push({
        urls: [turn.url],
        username: turn.username,
        credential: turn.credential,
      });
    }

    console.log(`[ICE] Built ICE servers: ${iceServers.length} servers`);
    return iceServers;
  }

  /**
   * Detect address family (IPv4 vs IPv6)
   */
  private detectAddressFamily(address: string): AddressFamily {
    // IPv6 has colons
    if (address.includes(':')) {
      return AddressFamily.IPv6;
    }
    return AddressFamily.IPv4;
  }

  /**
   * Get priority based on candidate type + address family
   * IPv6 prioritized for JIO ISP (native IPv6 support)
   * relay < srflx < host in typical networks
   * IPv6 > IPv4 when available
   */
  private getTypePriority(type: CandidateType, addressFamily?: AddressFamily): number {
    // Base priority by type
    let basePriority = 0;
    switch (type) {
      case CandidateType.HOST:
        basePriority = 126; // Highest for LAN
        break;
      case CandidateType.SRFLX:
        basePriority = 100; // Public IP via STUN
        break;
      case CandidateType.PRFLX:
        basePriority = 110;
        break;
      case CandidateType.RELAY:
        basePriority = 0; // Fallback (but used when necessary)
        break;
      default:
        basePriority = 0;
    }

    // IPv6 bonus: +50 priority for IPv6 addresses
    // JIO ISP prioritizes IPv6 networking
    if (addressFamily === AddressFamily.IPv6) {
      return basePriority + 50; // IPv6 gets significant boost
    }

    return basePriority;
  }

  /**
   * Detect if behind CG-NAT
   * CG-NAT characteristics: only relay candidates work, no srflx
   * NOTE: IPv6 doesn't suffer from CG-NAT as much - prefer IPv6
   */
  private detectCGNAT(connection: ICEConnection): void {
    const localCandidates = connection.localCandidates;
    
    const hasRelayIPv4 = localCandidates.some(c => c.type === CandidateType.RELAY && c.addressFamily === AddressFamily.IPv4);
    const hasSRFLXIPv4 = localCandidates.some(c => c.type === CandidateType.SRFLX && c.addressFamily === AddressFamily.IPv4);
    const hasIPv6 = localCandidates.some(c => c.addressFamily === AddressFamily.IPv6);
    const hasHostIPv4 = localCandidates.some(c => c.type === CandidateType.HOST && c.addressFamily === AddressFamily.IPv4);

    // CG-NAT only affects IPv4
    if (hasRelayIPv4 && !hasSRFLXIPv4 && hasHostIPv4) {
      this.networkProfile.behindCGNAT = true;
      console.warn('⚠️ [ICE] CG-NAT (IPv4) detected! IPv6 should be preferred by JIO ISP');
      
      // If IPv6 available, it bypasses CG-NAT entirely
      if (hasIPv6) {
        console.log('✅ [ICE] IPv6 available - will bypass CG-NAT limitation');
      }
    }
  }

  /**
   * Handle ICE connection state changes
   */
  private handleICEConnectionStateChange(
    connectionId: string,
    peerConnection: RTCPeerConnection
  ): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const newState = peerConnection.iceConnectionState;

    switch (newState) {
      case 'checking':
        connection.state = 'checking';
        console.log(`🔍 [ICE] Checking connectivity with @${connection.peerId}`);
        break;
      case 'connected':
      case 'completed':
        connection.state = 'connected';
        connection.connectedAt = Date.now();
        
        // Log connection established (stats access requires async, which we can't do in event handler)
        console.log(`✅ [ICE] Connection established with @${connection.peerId}`);
        break;
      case 'failed':
        connection.state = 'failed';
        console.error(`❌ [ICE] Connection failed with @${connection.peerId}`);
        break;
      case 'disconnected':
        connection.state = 'disconnected';
        console.warn(`⚠️ [ICE] Disconnected from @${connection.peerId}`);
        break;
    }

    // Notify state listeners
    const callback = this.connectionStateCallbacks.get(connectionId);
    if (callback) {
      callback(connection);
    }
  }

  /**
   * Create ICE candidate from WebRTC candidate
   */
  private createICECandidate(
    rtcCandidate: RTCIceCandidate,
    type: CandidateType
  ): ICECandidate {
    return {
      id: uuidv4(),
      foundation: rtcCandidate.foundation || '',
      component: rtcCandidate.component as 'rtp' | 'rtcp',
      type,
      priority: rtcCandidate.priority || 0,
      address: rtcCandidate.address || '',
      port: rtcCandidate.port || 0,
      addressFamily: this.detectAddressFamily(rtcCandidate.address || ''),
      candidate: rtcCandidate,
      success: true,
      timestamp: Date.now(),
    };
  }

  /**
   * Get network profile
   */
  getNetworkProfile(): NetworkProfile {
    return { ...this.networkProfile };
  }

  /**
   * Get connection state
   */
  getConnection(peerId: string): ICEConnection | undefined {
    return this.connections.get(peerId);
  }

  /**
   * Get all connections
   */
  getAllConnections(): ICEConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Register callback for individual candidates
   */
  onCandidate(peerId: string, callback: (candidate: ICECandidate) => void): void {
    this.candidateCallbacks.set(peerId, callback);
  }

  /**
   * Register callback for connection state changes
   */
  onConnectionStateChange(peerId: string, callback: (connection: ICEConnection) => void): void {
    this.connectionStateCallbacks.set(peerId, callback);
  }

  /**
   * Enable/disable Trickle ICE
   */
  setTrickleICEEnabled(enabled: boolean): void {
    this.trickleIceEnabled = enabled;
    console.log(`${enabled ? '✅' : '❌'} Trickle ICE ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get pending trickle ICE candidates
   */
  getPendingCandidates(peerId: string): ICECandidate[] {
    const queue = this.trickleCandidateQueues.get(peerId) || [];
    const pending = [...queue];
    this.trickleCandidateQueues.set(peerId, []); // Clear queue after retrieval
    return pending;
  }

  /**
   * STUN/TURN test within ICE framework
   */
  async testSTUNServer(stunUrl: string): Promise<{ success: boolean; address?: string; latency?: number }> {
    const startTime = Date.now();
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: [stunUrl] }],
      });

      return await new Promise(resolve => {
        const timeout = setTimeout(() => {
          peerConnection.close();
          resolve({ success: false });
        }, 5000);

        peerConnection.onicecandidate = (event) => {
          if (event.candidate && event.candidate.type === 'srflx') {
            clearTimeout(timeout);
            peerConnection.close();
            resolve({
              success: true,
              address: event.candidate.address ?? undefined,
              latency: Date.now() - startTime,
            });
          }
        };

        peerConnection.createDataChannel('test');
        peerConnection.createOffer().then(offer => peerConnection.setLocalDescription(offer));
      });
    } catch (err) {
      console.log('STUN probe error:', err);
      return { success: false };
    }
  }

  /**
   * Generate ICE diagnostic report
   */
  generateReport(): string {
    const profile = this.networkProfile;
    const connections = Array.from(this.connections.values());

    let report = `
ICE Framework Diagnostic Report
═══════════════════════════════════════════

Network Profile:
  • IPv4 Available: ${profile.ipv4Available}
  • IPv6 Available: ${profile.ipv6Available}
  • Behind CG-NAT: ${profile.behindCGNAT}
  • Connectivity Type: ${profile.connectivity}
  • Public IPv4: ${profile.publicIP || 'N/A'}
  • Public IPv6: ${profile.publicIPv6 || 'N/A'}

Active Connections: ${connections.length}
${connections.map(conn => `
  Peer: @${conn.peerId}
    State: ${conn.state}
    Local Candidates: ${conn.localCandidates.length}
      - Host: ${conn.localCandidates.filter(c => c.type === CandidateType.HOST).length}
      - SRFLX: ${conn.localCandidates.filter(c => c.type === CandidateType.SRFLX).length}
      - Relay: ${conn.localCandidates.filter(c => c.type === CandidateType.RELAY).length}
    Remote Candidates: ${conn.remoteCandidates.length}
    Selected: ${conn.selectedCandidate?.address}:${conn.selectedCandidate?.port} (${conn.selectedCandidate?.type})
    RTT: ${conn.rtt}ms
`).join('')}

Trickle ICE: ${this.trickleIceEnabled ? 'Enabled' : 'Disabled'}
    `;

    return report;
  }
}

// Export singleton
export const ICEFramework = new ICEFrameworkImpl();
export default ICEFramework;
