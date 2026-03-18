/**
 * Project Aegis - TURN Fallback Service
 * Implements fallback TURN servers for strict NAT environments
 * Uses community-run free TURN servers to maintain $0 infrastructure cost
 */

interface TURNServer {
  urls: string[];
  username?: string;
  credential?: string;
  credentialType?: string; // 'password' | 'oauth'
}

interface ConnectionAttempt {
  timestamp: number;
  usedTURN: boolean;
  success: boolean;
  latency: number;
}

interface ConnectionStats {
  totalAttempts: number;
  successfulAttempts: number;
  turnAttempts: number;
  turnSuccessful: number;
  successRate: number;
  turnSuccessRate: number;
  averageLatency: number;
}

/**
 * TURN Fallback Service
 * Manages fallback TURN servers for peers behind restrictive NAT
 */
export class TURNFallbackService {
  // Community-run free TURN servers (Open Relay Project style)
  // These are public relays that don't require credentials
  private readonly freeTURNServers: TURNServer[] = [
    {
      urls: ['turn:openrelay.metered.ca:80'],
    },
    {
      urls: ['turn:openrelay.metered.ca:443'],
    },
    {
      urls: ['turn:numb.viagenie.ca'],
      username: 'webrtc@live.com',
      credential: 'muazkh',
    },
    {
      urls: ['stun:stun.l.google.com:19302'],
    },
    {
      urls: ['stun:stun1.l.google.com:19302'],
    },
  ];

  // Connection history for stats
  private connectionHistory: ConnectionAttempt[] = [];
  private maxHistorySize = 100;

  // State tracking
  private isEnabled = false;
  private forceTURN = false; // Force TURN even if direct P2P is available
  private connectionTestTimeout = 5000; // 5 seconds

  /**
   * Initialize the TURN fallback service
   */
  async initialize(): Promise<void> {
    this.isEnabled = true;
    console.log('🔄 TURN Fallback Service initialized');
  }

  /**
   * Get RTCConfiguration with TURN servers for WebRTC
   * Returns array of ICE servers (STUN only for direct P2P, with TURN fallback)
   */
  getICEServers(): RTCIceServer[] {
    const servers: RTCIceServer[] = [];

    // Always include STUN first (preferred for direct P2P)
    servers.push({
      urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
    });

    // Add TURN servers as fallback if enabled
    if (this.isEnabled) {
      for (const turnServer of this.freeTURNServers) {
        servers.push({
          urls: turnServer.urls,
          username: turnServer.username,
          credential: turnServer.credential,
        });
      }
    }

    return servers;
  }

  /**
   * Test direct P2P connectivity via STUN
   * Returns true if direct connection is possible
   */
  async testDirectConnectivity(): Promise<boolean> {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
          },
        ],
      });

      return await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          peerConnection.close();
          resolve(false); // Timeout = no direct connectivity
        }, this.connectionTestTimeout);

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            // If we get a host or srflx candidate, direct connectivity is possible
            if (candidate.includes('host') || candidate.includes('srflx')) {
              clearTimeout(timeout);
              peerConnection.close();
              resolve(true);
            }
          } else {
            // End of candidates
            clearTimeout(timeout);
            peerConnection.close();
            resolve(true); // If we got any candidates, assume connectivity
          }
        };

        peerConnection.onicegatheringstatechange = () => {
          if (peerConnection.iceGatheringState === 'complete') {
            clearTimeout(timeout);
            peerConnection.close();
            resolve(true);
          }
        };

        peerConnection.createDataChannel('test');
        peerConnection.createOffer().then((offer) => {
          peerConnection.setLocalDescription(offer);
        });
      });
    } catch (error) {
      console.error('Direct connectivity test failed:', error);
      return false;
    }
  }

  /**
   * Test TURN server connectivity
   * Returns true if at least one TURN server is reachable
   */
  async testTURNConnectivity(): Promise<boolean> {
    try {
      for (const turnServer of this.freeTURNServers) {
        try {
          const peerConnection = new RTCPeerConnection({
            iceServers: [
              {
                urls: turnServer.urls,
                username: turnServer.username,
                credential: turnServer.credential,
              },
            ],
          });

          const connected = await new Promise<boolean>((resolve) => {
            const timeout = setTimeout(() => {
              peerConnection.close();
              resolve(false);
            }, this.connectionTestTimeout);

            peerConnection.onicecandidate = (event) => {
              if (event.candidate) {
                const candidate = event.candidate.candidate;
                // If we get a relay candidate, TURN is working
                if (candidate.includes('relay')) {
                  clearTimeout(timeout);
                  peerConnection.close();
                  resolve(true);
                }
              }
            };

            peerConnection.createDataChannel('test');
            peerConnection.createOffer().then((offer) => {
              peerConnection.setLocalDescription(offer);
            });
          });

          if (connected) {
            console.log(`✅ TURN server working: ${turnServer.urls[0]}`);
            return true;
          }
        } catch (error) {
          console.warn(`TURN test failed for ${turnServer.urls[0]}:`, error);
          continue;
        }
      }

      return false;
    } catch (error) {
      console.error('TURN connectivity test failed:', error);
      return false;
    }
  }

  /**
   * Determine if TURN fallback should be used
   * Returns true if direct P2P appears unavailable or unreliable
   */
  async shouldUseTURN(): Promise<boolean> {
    // If forceTURN is set, always use TURN
    if (this.forceTURN) {
      return true;
    }

    // Check recent stats
    const stats = this.getConnectionStats();
    if (stats.totalAttempts > 10) {
      // If success rate is below 50%, use TURN
      if (stats.successRate < 0.5) {
        console.log(`📊 Low success rate (${(stats.successRate * 100).toFixed(1)}%) - switching to TURN`);
        return true;
      }

      // If direct P2P has low success rate but TURN is better, use TURN
      if (stats.successRate < 0.8 && stats.turnSuccessRate > 0.8) {
        console.log(
          `📊 TURN more reliable - switching (Direct: ${(stats.successRate * 100).toFixed(1)}%, TURN: ${(stats.turnSuccessRate * 100).toFixed(1)}%)`
        );
        return true;
      }
    }

    // Test current connectivity
    const directOk = await this.testDirectConnectivity();
    if (!directOk) {
      console.log('🔴 Direct connectivity test failed - falling back to TURN');
      return true;
    }

    return false;
  }

  /**
   * Record a connection attempt in history
   */
  recordConnectionAttempt(usedTURN: boolean, success: boolean, latency: number): void {
    this.connectionHistory.push({
      timestamp: Date.now(),
      usedTURN,
      success,
      latency,
    });

    // Keep history size bounded
    if (this.connectionHistory.length > this.maxHistorySize) {
      this.connectionHistory = this.connectionHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): ConnectionStats {
    const total = this.connectionHistory.length;
    if (total === 0) {
      return {
        totalAttempts: 0,
        successfulAttempts: 0,
        turnAttempts: 0,
        turnSuccessful: 0,
        successRate: 1.0, // Assume success initially
        turnSuccessRate: 1.0,
        averageLatency: 0,
      };
    }

    const successful = this.connectionHistory.filter((a) => a.success).length;
    const turnAttempts = this.connectionHistory.filter((a) => a.usedTURN).length;
    const turnSuccessful = this.connectionHistory.filter(
      (a) => a.usedTURN && a.success
    ).length;
    const totalLatency = this.connectionHistory.reduce((sum, a) => sum + a.latency, 0);

    return {
      totalAttempts: total,
      successfulAttempts: successful,
      turnAttempts,
      turnSuccessful,
      successRate: successful / total,
      turnSuccessRate: turnAttempts > 0 ? turnSuccessful / turnAttempts : 1.0,
      averageLatency: totalLatency / total,
    };
  }

  /**
   * Force TURN usage (for testing or extreme NAT situations)
   */
  forceTURNMode(force: boolean): void {
    this.forceTURN = force;
    if (force) {
      console.log('🔴 TURN mode forced - all connections will use TURN relay');
    } else {
      console.log('🟢 TURN mode automatic - will use direct P2P when possible');
    }
  }

  /**
   * Check if TURN mode is forced
   */
  isTURNForced(): boolean {
    return this.forceTURN;
  }

  /**
   * Get recommendations based on connection stats
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getConnectionStats();

    if (stats.totalAttempts === 0) {
      recommendations.push('✅ No connection issues detected yet');
      return recommendations;
    }

    if (stats.successRate < 0.5) {
      recommendations.push(
        '⚠️ Connection reliability is poor - try enabling AlwaysOnline mode'
      );
      recommendations.push('💡 Consider forcing TURN relay for better connectivity');
    } else if (stats.successRate < 0.8) {
      recommendations.push('⚠️ Connection could be improved - check network conditions');
    } else {
      recommendations.push('✅ Connection quality is good');
    }

    if (stats.averageLatency > 5000) {
      recommendations.push('🐌 High latency detected - video/audio quality may be degraded');
    } else if (stats.averageLatency > 2000) {
      recommendations.push('⚠️ Moderate latency - consider moving closer to router');
    }

    if (stats.turnSuccessRate > 0.9 && stats.successRate < 0.8) {
      recommendations.push('💡 TURN relay is more reliable - consider enabling it');
    }

    return recommendations;
  }

  /**
   * Clear connection history
   */
  clearHistory(): void {
    this.connectionHistory = [];
    console.log('📊 Connection history cleared');
  }

  /**
   * Disable TURN fallback
   */
  disable(): void {
    this.isEnabled = false;
    console.log('❌ TURN Fallback Service disabled');
  }

  /**
   * Enable TURN fallback
   */
  async enable(): Promise<void> {
    this.isEnabled = true;
    console.log('✅ TURN Fallback Service enabled');
  }
}

export default new TURNFallbackService();
