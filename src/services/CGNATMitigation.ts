/**
 * CG-NAT Mitigation Service
 * Strategies for handling Carrier-Grade NAT from mobile providers
 * 
 * Problem: CG-NAT blocks:
 * - UPnP (port mapping)
 * - Direct P2P (STUN candidates fail)
 * - Symmetric NAT (all outbound → different port)
 * 
 * Solution: Forced TURN relay, IPv6 fallback, connection pooling
 */

import { ICEFramework } from './ICEFramework';

export interface CGNATMitigationStrategy {
  name: string;
  priority: number; // Lower = higher priority
  description: string;
  recommended: boolean;
}

export enum ConnectivityStrategy {
  DIRECT_P2P = 'direct_p2p', // Host or SRFLX candidates
  IPV6_ONLY = 'ipv6_only', // IPv6 without IPv4
  TURN_RELAY = 'turn_relay', // Forced TURN (best for CG-NAT)
  HYBRID = 'hybrid', // Multiple parallel attempts
}

class CGNATMitigationImpl {
  private currentStrategy: ConnectivityStrategy = ConnectivityStrategy.DIRECT_P2P;
  private connectionAttempts: Map<string, number> = new Map();
  private maxRetries = 3;
  private backoffMs = 1000; // Start with 1 second

  /**
   * Assess network and recommend strategy
   * OPTIMIZED FOR JIO ISP: IPv6-first priority
   */
  assessNetworkAndRecommend(): ConnectivityStrategy {
    const profile = ICEFramework.getNetworkProfile();

    console.log(`🔍 [CG-NAT] Assessing network for JIO ISP...
      IPv4: ${profile.ipv4Available}
      IPv6: ${profile.ipv6Available} ⭐ PRIORITY
      CG-NAT (IPv4): ${profile.behindCGNAT}`);

    // NEW PRIORITY for JIO ISP: IPv6-first
    // 1. IPv6 available? Use it (bypasses CG-NAT entirely)
    if (profile.ipv6Available) {
      console.log('⭐ [CG-NAT] IPv6 available - using IPv6-first strategy (JIO ISP optimized)');
      this.currentStrategy = ConnectivityStrategy.IPV6_ONLY;
      return ConnectivityStrategy.IPV6_ONLY;
    }

    // 2. IPv4 only - check for CG-NAT
    if (!profile.ipv6Available && profile.ipv4Available) {
      if (profile.behindCGNAT) {
        console.log('⚠️  [CG-NAT] IPv6 unavailable + CG-NAT detected - forcing TURN relay');
        this.currentStrategy = ConnectivityStrategy.TURN_RELAY;
        return ConnectivityStrategy.TURN_RELAY;
      } else {
        console.log('✅ [CG-NAT] IPv6 unavailable but no CG-NAT - direct P2P works');
        this.currentStrategy = ConnectivityStrategy.DIRECT_P2P;
        return ConnectivityStrategy.DIRECT_P2P;
      }
    }

    // 3. Fallback
    console.log('⚠️  [CG-NAT] No connectivity options - attempting hybrid');
    this.currentStrategy = ConnectivityStrategy.HYBRID;
    return ConnectivityStrategy.HYBRID;
  }

  /**
   * Build ICE servers based on detected strategy
   * OPTIMIZED FOR JIO ISP: IPv6-first server selection
   */
  buildOptimalICEServers(
    baseTurnServers: any[] = [],
    baseStunServers: string[] = []
  ): {
    stunServers: string[];
    turnServers: any[];
    strategy: ConnectivityStrategy;
  } {
    const strategy = this.currentStrategy;

    let stunServers: string[] = [];
    let turnServers: any[] = [];

    // Separate IPv6 and IPv4 servers
    const ipv6StunServers = baseStunServers.filter(s => 
      s.includes('[::') || s.includes('ipv6') || s.includes('::')
    );
    const ipv4StunServers = baseStunServers.filter(s => 
      !s.includes('[::') && !s.includes('ipv6') && !s.includes('::')
    );

    switch (strategy) {
      case ConnectivityStrategy.TURN_RELAY:
        // Force TURN relay - no STUN
        turnServers = baseTurnServers;
        console.log(`🔄 [CG-NAT] TURN Relay mode (IPv4 fallback): ${turnServers.length} relay servers`);
        break;

      case ConnectivityStrategy.IPV6_ONLY:
        // PRIORITY: IPv6 STUN servers first for JIO ISP
        stunServers = ipv6StunServers.length > 0 
          ? ipv6StunServers 
          : baseStunServers; // Fallback to all if no IPv6 specific
        turnServers = baseTurnServers.slice(0, 1); // IPv6-capable TURN as backup only
        console.log(`⭐ [CG-NAT] IPv6-FIRST mode (JIO ISP optimized): ${stunServers.length} IPv6 STUN + ${turnServers.length} TURN backup`);
        break;

      case ConnectivityStrategy.HYBRID:
        // Parallel: IPv6 first, then IPv4
        stunServers = [...ipv6StunServers, ...ipv4StunServers];
        turnServers = baseTurnServers.slice(0, 2);
        console.log(`🔀 [CG-NAT] Hybrid mode (IPv6→IPv4): ${ipv6StunServers.length} IPv6 + ${ipv4StunServers.length} IPv4 STUN servers`);
        break;

      case ConnectivityStrategy.DIRECT_P2P:
      default:
        // Normal: prefer IPv6 over IPv4
        stunServers = [...ipv6StunServers, ...ipv4StunServers];
        turnServers = baseTurnServers.slice(0, 1);
        console.log(`✅ [CG-NAT] Direct P2P (IPv6-first): ${ipv6StunServers.length} IPv6 + ${ipv4StunServers.length} IPv4 STUN`);
    }

    return { stunServers, turnServers, strategy };
  }

  /**
   * Detect if connection failed due to CG-NAT
   * Symptoms:
   * - Only relay candidates available
   * - STUN requests fail
   * - Symmetric NAT pattern
   */
  async detectCGNATFailure(
    peerId: string,
    connectionTimeoutMs: number = 15000
  ): Promise<boolean> {
    try {
      const connection = ICEFramework.getConnection(peerId);
      if (!connection) return false;

      // Check if only relay candidates worked
      const relayOnly = connection.localCandidates.every(c => c.type === 'relay');
      const noPublicIP = !connection.localCandidates.some(c => c.type === 'srflx');

      if (relayOnly && noPublicIP) {
        console.warn('🚨 [CG-NAT] CG-NAT failure pattern detected - relay only');
        return true;
      }

      return false;
    } catch (error) {
      console.warn('[CG-NAT] CG-NAT detection failed:', error);
      return false;
    }
  }

  /**
   * Retry connection with exponential backoff
   */
  async retryWithBackoff(
    peerId: string,
    retryFn: () => Promise<void>
  ): Promise<void> {
    const attempts = this.connectionAttempts.get(peerId) || 0;

    if (attempts >= this.maxRetries) {
      throw new Error(`❌ [CG-NAT] Max retries (${this.maxRetries}) exceeded for @${peerId}`);
    }

    if (attempts > 0) {
      const delay = this.backoffMs * Math.pow(2, attempts - 1); // Exponential: 1s, 2s, 4s
      console.log(`⏳ [CG-NAT] Retry ${attempts}/${this.maxRetries} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
      await retryFn();
      // Success - reset counter
      this.connectionAttempts.set(peerId, 0);
    } catch (error) {
      this.connectionAttempts.set(peerId, attempts + 1);
      throw error;
    }
  }

  /**
   * Get connection quality assessment
   */
  assessConnectionQuality(peerId: string): {
    quality: 'excellent' | 'good' | 'fair' | 'poor' | 'failed';
    score: number; // 0-100
    reason: string;
    recommendation: string;
  } {
    const connection = ICEFramework.getConnection(peerId);
    if (!connection) {
      return {
        quality: 'failed',
        score: 0,
        reason: 'No connection',
        recommendation: 'Initialize connection first',
      };
    }

    let score = 0;
    let reason = '';
    let recommendation = '';

    // Analyze candidate types
    const candidateTypes = {
      host: connection.localCandidates.filter(c => c.type === 'host').length,
      srflx: connection.localCandidates.filter(c => c.type === 'srflx').length,
      relay: connection.localCandidates.filter(c => c.type === 'relay').length,
    };

    // Score calculation
    if (candidateTypes.host > 0) {
      score += 30; // Host candidates available
      reason += 'Local network available. ';
    }

    if (candidateTypes.srflx > 0) {
      score += 40; // Direct public IP available
      reason += 'Direct P2P possible. ';
    } else if (candidateTypes.relay > 0) {
      score += 20; // Only relay available
      reason += 'Behind NAT, using relay. ';
    }

    // Latency scoring
    if (connection.rtt < 50) score += 20;
    else if (connection.rtt < 100) score += 15;
    else if (connection.rtt < 200) score += 10;
    else score += 5;

    // Connection state
    if (connection.state === 'connected') {
      score += 10;
    } else if (connection.state === 'failed') {
      score = Math.max(0, score - 30);
      reason += 'Connection failed. ';
    }

    // Determine quality level
    let quality: 'excellent' | 'good' | 'fair' | 'poor' | 'failed';
    if (score >= 85) quality = 'excellent';
    else if (score >= 70) quality = 'good';
    else if (score >= 50) quality = 'fair';
    else if (score > 0) quality = 'poor';
    else quality = 'failed';

    // Generate recommendations
    if (quality === 'failed' || quality === 'poor') {
      recommendation = 'Try forcing TURN relay or switching networks';
    } else if (candidateTypes.relay > 0 && candidateTypes.srflx === 0) {
      recommendation = 'Behind NAT - relay working, monitor bandwidth';
    } else if (candidateTypes.host > 0 && candidateTypes.srflx === 0) {
      recommendation = 'Local network only - cannot reach peers outside LAN';
    } else {
      recommendation = 'Connection quality is optimal';
    }

    return { quality, score, reason: reason.trim(), recommendation };
  }

  /**
   * Emergency fallback for failed connections
   * Tries: Direct → IPv6 → Relay → TURN-only
   */
  async emergencyFallback(
    peerId: string,
    availableTurnServers: any[]
  ): Promise<ConnectivityStrategy> {
    console.log(`🆘 [CG-NAT] Emergency fallback for @${peerId}`);

    const profile = ICEFramework.getNetworkProfile();

    // Try 1: Check if IPv6 works
    if (profile.ipv6Available && !profile.behindCGNAT) {
      console.log(`📡 [CG-NAT] Attempting IPv6-only fallback`);
      this.currentStrategy = ConnectivityStrategy.IPV6_ONLY;
      return ConnectivityStrategy.IPV6_ONLY;
    }

    // Try 2: Force TURN relay
    if (availableTurnServers.length > 0) {
      console.log(`🔄 [CG-NAT] Attempting TURN relay fallback`);
      this.currentStrategy = ConnectivityStrategy.TURN_RELAY;
      return ConnectivityStrategy.TURN_RELAY;
    }

    // Try 3: Last resort - any available
    console.log(`⚠️  [CG-NAT] All fallbacks exhausted - may need user intervention`);
    this.currentStrategy = ConnectivityStrategy.DIRECT_P2P;
    return ConnectivityStrategy.DIRECT_P2P;
  }

  /**
   * Generate CG-NAT diagnostic report
   */
  generateDiagnosticReport(): string {
    const profile = ICEFramework.getNetworkProfile();
    const allConnections = ICEFramework.getAllConnections();

    let report = `
CG-NAT Mitigation Diagnostic Report
═══════════════════════════════════════════

Current Strategy: ${this.currentStrategy}

Network Profile:
  • IPv4: ${profile.ipv4Available} (Public IP: ${profile.publicIP || 'Unknown'})
  • IPv6: ${profile.ipv6Available} (Public IP: ${profile.publicIPv6 || 'Unknown'})
  • CG-NAT Detected: ${profile.behindCGNAT}
  • Symmetric NAT: ${profile.behindSymmetricNAT}

Connection Status:
${allConnections.map(conn => {
  const quality = this.assessConnectionQuality(conn.peerId);
  return `
  @${conn.peerId}:
    State: ${conn.state} | Quality: ${quality.quality} (${quality.score}/100)
    Local Candidates: Host=${conn.localCandidates.filter(c => c.type === 'host').length} | SRFLX=${conn.localCandidates.filter(c => c.type === 'srflx').length} | Relay=${conn.localCandidates.filter(c => c.type === 'relay').length}
    Reason: ${quality.reason}
    Suggestion: ${quality.recommendation}
  `;
}).join('')}

CG-NAT Status:
  • Active Strategy: ${this.currentStrategy}
  • Retry Policy: ${this.maxRetries} retries with exponential backoff
  • Backup TURN Available: ${allConnections.length > 0 ? 'Yes' : 'No'}
    `;

    return report;
  }

  /**
   * Get current strategy
   */
  getStrategy(): ConnectivityStrategy {
    return this.currentStrategy;
  }

  /**
   * Manually set strategy (override auto-detection)
   */
  setStrategy(strategy: ConnectivityStrategy): void {
    console.log(`🔧 [CG-NAT] Manually setting strategy to: ${strategy}`);
    this.currentStrategy = strategy;
  }
}

export const CGNATMitigation = new CGNATMitigationImpl();
export default CGNATMitigation;
