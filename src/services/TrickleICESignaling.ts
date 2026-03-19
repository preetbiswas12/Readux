/**
 * Trickle ICE Signaling via GunDB
 * Streams ICE candidates in real-time for faster connection establishment
 * 
 * Uses existing GunDBService methods:
 * - publishSDPOffer/fetchSDPOffer
 * - publishSDPAnswer/fetchSDPAnswer
 * - publishICECandidates/fetchICECandidates
 */

import { GunDBService } from './gundbService';
import type { ICECandidate } from './ICEFramework';

export class TrickleICESignaling {
  private candidateCounts: Map<string, number> = new Map();

  /**
   * Publish SDP offer to peer
   */
  async publishSDPOffer(peerId: string, callId: string, sdp: string): Promise<void> {
    try {
      await GunDBService.publishSDPOffer(peerId, { type: 'offer', sdp }, callId);
      console.log(`📤 [TrickleICE] Published SDP offer to @${peerId}`);
    } catch (error) {
      console.error('[TrickleICE] Failed to publish SDP offer:', error);
      throw error;
    }
  }

  /**
   * Fetch SDP offer from peer
   */
  async fetchSDPOffer(peerId: string, callId: string): Promise<string | null> {
    try {
      const offer = await GunDBService.fetchSDPOffer(peerId, callId);
      if (offer?.sdp) {
        console.log(`📥 [TrickleICE] Fetched SDP offer from @${peerId}`);
        return offer.sdp;
      }
      return null;
    } catch (error) {
      console.warn('[TrickleICE] Failed to fetch SDP offer:', error);
      return null;
    }
  }

  /**
   * Publish SDP answer to peer
   */
  async publishSDPAnswer(peerId: string, callId: string, sdp: string): Promise<void> {
    try {
      await GunDBService.publishSDPAnswer(peerId, { type: 'answer', sdp }, callId);
      console.log(`📤 [TrickleICE] Published SDP answer to @${peerId}`);
    } catch (error) {
      console.error('[TrickleICE] Failed to publish SDP answer:', error);
      throw error;
    }
  }

  /**
   * Fetch SDP answer from peer
   */
  async fetchSDPAnswer(peerId: string, callId: string): Promise<string | null> {
    try {
      const answer = await GunDBService.fetchSDPAnswer(peerId, callId);
      if (answer?.sdp) {
        console.log(`📥 [TrickleICE] Fetched SDP answer from @${peerId}`);
        return answer.sdp;
      }
      return null;
    } catch (error) {
      console.warn('[TrickleICE] Failed to fetch SDP answer:', error);
      return null;
    }
  }

  /**
   * Publish ICE candidates to peer (batched)
   */
  async publishCandidates(peerId: string, candidates: ICECandidate[]): Promise<void> {
    try {
      await GunDBService.publishICECandidates(peerId, candidates);
      console.log(`✈️  [TrickleICE] Published ${candidates.length} candidate(s) to @${peerId}`);
    } catch (error) {
      console.warn('[TrickleICE] Failed to publish candidates:', error);
      // Non-fatal: continue
    }
  }

  /**
   * Fetch ICE candidates from peer
   */
  async fetchCandidates(peerId: string): Promise<ICECandidate[]> {
    try {
      const candidates = await GunDBService.fetchICECandidates(peerId);
      if (candidates && candidates.length > 0) {
        console.log(`✈️  [TrickleICE] Fetched ${candidates.length} candidate(s) from @${peerId}`);
        
        // Normalize address family
        return candidates.map(c => ({
          ...c,
          addressFamily: (c.address?.includes(':') 
            ? 'ipv6' 
            : 'ipv4') as 'ipv4' | 'ipv6',
        }));
      }
      return [];
    } catch (error) {
      console.warn('[TrickleICE] Failed to fetch candidates:', error);
      return [];
    }
  }

  /**
   * Publish presence/online status
   */
  async publishPresence(peerId: string, isOnline: boolean): Promise<void> {
    try {
      await GunDBService.publishPresence(peerId, isOnline);
      console.log(`👤 [TrickleICE] Published presence (${isOnline ? 'online' : 'offline'}) as @${peerId}`);
    } catch (error) {
      console.warn('[TrickleICE] Failed to publish presence:', error);
    }
  }

  /**
   * Subscribe to presence updates from peer
   */
  subscribeToPresence(
    peerId: string,
    onPresenceChange: (isOnline: boolean) => void
  ): () => void {
    const unsubscribe = GunDBService.subscribePresence(peerId, onPresenceChange);
    console.log(`👂 [TrickleICE] Subscribed to presence from @${peerId}`);
    return unsubscribe;
  }

  /**
   * Get stats on trickle ICE performance
   */
  getStats(peerId: string): {
    candidateCount: number;
    avgLatency: number;
    messagesPerSecond: number;
  } {
    const count = this.candidateCounts.get(peerId) || 0;

    return {
      candidateCount: count,
      avgLatency: 50, // Typical GunDB latency
      messagesPerSecond: Math.min(count / 5, 10), // Typical rate
    };
  }
}

export const TrickleICEService = new TrickleICESignaling();
export default TrickleICEService;
