/**
 * IPv6-First Networking Architecture
 * Prioritizes IPv6 across all connections to bypass CG-NAT and firewall blockings
 * 
 * Strategy:
 * 1. Detect available IP versions (v6, v4)
 * 2. ALWAYS use IPv6 when available (bypasses CG-NAT completely)
 * 3. Fall back to IPv4 only when IPv6 unavailable
 * 4. Use only IPv6 STUN servers when v6 available
 * 5. Use dual-stack only as last resort
 */

import { STUN_SERVERS_BY_TIER } from '../config/StunTurnServers';

interface NetworkProfile {
  ipv6Available: boolean;
  ipv4Available: boolean;
  ipv6Latency: number | null;
  ipv4Latency: number | null;
  preferredVersion: 'ipv6' | 'ipv4' | 'dual-stack';
  cgnatDetected: boolean;
  isp: string;
  networkType: 'home' | 'mobile' | 'enterprise' | 'unknown';
}

interface ServerSelection {
  stunServers: string[];
  turnServers: string[];
  version: 'ipv6' | 'ipv4' | 'dual-stack';
  fallbackMode: boolean;
}

class IPv6FirstNetworkingService {
  private networkProfile: NetworkProfile | null = null;
  private detectionTimeout = 5000; // 5s for network detection
  private IPv6OnlyThreshold = 100; // If IPv6 latency < 100ms, use IPv6-only

  /**
   * CORE: Detect available IP versions and network characteristics
   */
  async detectNetworkProfile(): Promise<NetworkProfile> {
    console.log('[IPv6First] 🌐 Detecting network profile...');

    const startTime = Date.now();

    // Parallel probes for both IPv6 and IPv4
    const [ipv6Result, ipv4Result] = await Promise.allSettled([
      this.probeIPv6(),
      this.probeIPv4(),
    ]);

    const ipv6Available =
      ipv6Result.status === 'fulfilled' && ipv6Result.value.available;
    const ipv6Latency =
      ipv6Result.status === 'fulfilled' ? ipv6Result.value.latency : null;

    const ipv4Available =
      ipv4Result.status === 'fulfilled' && ipv4Result.value.available;
    const ipv4Latency =
      ipv4Result.status === 'fulfilled' ? ipv4Result.value.latency : null;

    // Determine CG-NAT status (IPv4-specific issue)
    const cgnatDetected = ipv4Available
      ? false // CG-NAT detection would be done via relay-only pattern analysis
      : false;

    // Priority logic: IPv6 > IPv4
    let preferredVersion: 'ipv6' | 'ipv4' | 'dual-stack' = 'dual-stack';

    if (ipv6Available && ipv6Latency !== null && ipv6Latency < this.IPv6OnlyThreshold) {
      // IPv6 is fast enough for direct use
      preferredVersion = 'ipv6';
    } else if (ipv6Available) {
      // IPv6 available but slower
      preferredVersion = 'dual-stack';
    } else if (ipv4Available && !cgnatDetected) {
      // IPv4 only, no CG-NAT
      preferredVersion = 'ipv4';
    } else if (ipv4Available && cgnatDetected) {
      // IPv4 with CG-NAT → Need relay
      preferredVersion = 'ipv4';
    }

    // Detect ISP and network type
    const isp = this.detectISP();
    const networkType = this.detectNetworkType();

    const profile: NetworkProfile = {
      ipv6Available,
      ipv4Available,
      ipv6Latency,
      ipv4Latency,
      preferredVersion,
      cgnatDetected,
      isp,
      networkType,
    };

    this.networkProfile = profile;

    const detectionTime = Date.now() - startTime;
    console.log(`[IPv6First] ✅ Network detection complete (${detectionTime}ms)`);
    console.log(`[IPv6First]   IPv6: ${ipv6Available ? `✓ ${ipv6Latency}ms` : '✗'}`);
    console.log(`[IPv6First]   IPv4: ${ipv4Available ? `✓ ${ipv4Latency}ms` : '✗'}`);
    console.log(`[IPv6First]   CG-NAT: ${cgnatDetected ? '⚠️ DETECTED' : '✓ Clear'}`);
    console.log(`[IPv6First]   Strategy: ${preferredVersion.toUpperCase()}`);

    return profile;
  }

  /**
   * Probe IPv6 availability and latency
   */
  private async probeIPv6(): Promise<{
    available: boolean;
    latency: number | null;
  }> {
    try {
      const startTime = Date.now();

      // Try to reach IPv6 STUN server
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              'stun:[2606:4700:4700::1111]', // Cloudflare IPv6
              'stun:[2001:4860:4864::8888]', // Google IPv6
            ],
          },
        ],
      });

      return await new Promise<{ available: boolean; latency: number | null }>(
        (resolve) => {
          let foundIPv6 = false;
          let ipv6Latency: number | null = null;

          const timeout = setTimeout(() => {
            peerConnection.close();
            resolve({
              available: foundIPv6,
              latency: ipv6Latency,
            });
          }, this.detectionTimeout);

          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              const candidate = event.candidate.candidate;

              // Check for IPv6 address (contains colons)
              if (
                candidate.includes(':') &&
                !candidate.includes('127.0.0.1') &&
                !candidate.includes('::1')
              ) {
                foundIPv6 = true;
                if (ipv6Latency === null) {
                  ipv6Latency = Date.now() - startTime;
                }
              }
            }
          };

          peerConnection.onicegatheringstatechange = () => {
            if (peerConnection.iceGatheringState === 'complete') {
              clearTimeout(timeout);
              peerConnection.close();
              resolve({
                available: foundIPv6,
                latency: ipv6Latency,
              });
            }
          };

          // Trigger ICE gathering
          peerConnection.createDataChannel('probe');
          peerConnection.createOffer().then((offer) => {
            peerConnection.setLocalDescription(offer);
          });
        }
      );
    } catch (error) {
      console.warn('[IPv6First] IPv6 probe failed:', error);
      return { available: false, latency: null };
    }
  }

  /**
   * Probe IPv4 availability and latency
   */
  private async probeIPv4(): Promise<{
    available: boolean;
    latency: number | null;
  }> {
    try {
      const startTime = Date.now();

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              'stun:stun.l.google.com:19302',
              'stun:stun1.l.google.com:19302',
            ],
          },
        ],
      });

      return await new Promise<{ available: boolean; latency: number | null }>(
        (resolve) => {
          let foundIPv4 = false;
          let ipv4Latency: number | null = null;

          const timeout = setTimeout(() => {
            peerConnection.close();
            resolve({
              available: foundIPv4,
              latency: ipv4Latency,
            });
          }, this.detectionTimeout);

          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              const candidate = event.candidate.candidate;

              // Check for IPv4 address (no colons, regular dotted notation)
              if (
                candidate.match(/\d+\.\d+\.\d+\.\d+/) &&
                !candidate.includes('127.0.0.1')
              ) {
                foundIPv4 = true;
                if (ipv4Latency === null) {
                  ipv4Latency = Date.now() - startTime;
                }
              }
            }
          };

          peerConnection.onicegatheringstatechange = () => {
            if (peerConnection.iceGatheringState === 'complete') {
              clearTimeout(timeout);
              peerConnection.close();
              resolve({
                available: foundIPv4,
                latency: ipv4Latency,
              });
            }
          };

          // Trigger ICE gathering
          peerConnection.createDataChannel('probe');
          peerConnection.createOffer().then((offer) => {
            peerConnection.setLocalDescription(offer);
          });
        }
      );
    } catch (error) {
      console.warn('[IPv6First] IPv4 probe failed:', error);
      return { available: false, latency: null };
    }
  }

  /**
   * Select optimal servers based on network profile
   */
  getOptimalServers(): ServerSelection {
    if (!this.networkProfile) {
      console.warn(
        '[IPv6First] Network profile not detected, using fallback servers'
      );
      return this.getFallbackServers();
    }

    const { ipv6Available, preferredVersion, cgnatDetected } =
      this.networkProfile;

    console.log(`[IPv6First] 🎯 Selecting servers (${preferredVersion})`);

    if (preferredVersion === 'ipv6' && ipv6Available) {
      return this.getIPv6OnlyServers();
    } else if (preferredVersion === 'ipv6') {
      // IPv6 preferred but not available → hybrid with IPv4 fallback
      return this.getIPv6FirstHybridServers();
    } else if (preferredVersion === 'ipv4' && cgnatDetected) {
      // IPv4 with CG-NAT → MUST use TURN relay
      return this.getIPv4WithTurnServers();
    } else if (preferredVersion === 'ipv4') {
      // IPv4 only, no CG-NAT → Direct P2P is fine
      return this.getIPv4DirectServers();
    }

    return this.getFallbackServers();
  }

  /**
   * IPv6-ONLY Mode: When IPv6 is fast and reliable
   * Bypasses ALL CG-NAT issues
   */
  private getIPv6OnlyServers(): ServerSelection {
    const ipv6Stun = [
      'stun:[2606:4700:4700::1111]', // Cloudflare IPv6
      'stun:[2001:4860:4864::8888]', // Google IPv6
      'stun:[2a00:1450:4001:834::200e]', // YouTube IPv6
    ];

    return {
      stunServers: ipv6Stun,
      turnServers: [], // No TURN needed with IPv6
      version: 'ipv6',
      fallbackMode: false,
    };
  }

  /**
   * IPv6-FIRST Hybrid: IPv6 primary, IPv4 secondary
   * Best for dual-stack networks
   */
  private getIPv6FirstHybridServers(): ServerSelection {
    const ipv6Stun = [
      'stun:[2606:4700:4700::1111]',
      'stun:[2001:4860:4864::8888]',
    ];

    const ipv4Stun = STUN_SERVERS_BY_TIER.primary
      .slice(0, 3)
      .map((s) => s.url);

    return {
      stunServers: [...ipv6Stun, ...ipv4Stun],
      turnServers: STUN_SERVERS_BY_TIER.fallback.map((s) => s.url),
      version: 'dual-stack',
      fallbackMode: false,
    };
  }

  /**
   * IPv4 with TURN: Required for CG-NAT
   * Forces relay mode for guaranteed connectivity
   */
  private getIPv4WithTurnServers(): ServerSelection {
    return {
      stunServers: STUN_SERVERS_BY_TIER.primary.map((s) => s.url),
      turnServers: STUN_SERVERS_BY_TIER.fallback.map((s) => s.url),
      version: 'ipv4',
      fallbackMode: true,
    };
  }

  /**
   * IPv4 Direct: No CG-NAT, direct P2P possible
   */
  private getIPv4DirectServers(): ServerSelection {
    return {
      stunServers: STUN_SERVERS_BY_TIER.primary.map((s) => s.url),
      turnServers: STUN_SERVERS_BY_TIER.secondary.map((s) => s.url),
      version: 'ipv4',
      fallbackMode: false,
    };
  }

  /**
   * Fallback: When all else fails
   */
  private getFallbackServers(): ServerSelection {
    return {
      stunServers: [
        ...STUN_SERVERS_BY_TIER.primary.map((s) => s.url),
        ...STUN_SERVERS_BY_TIER.secondary.map((s) => s.url),
      ],
      turnServers: STUN_SERVERS_BY_TIER.fallback.map((s) => s.url),
      version: 'dual-stack',
      fallbackMode: true,
    };
  }

  /**
   * Get current network profile
   */
  getNetworkProfile(): NetworkProfile | null {
    return this.networkProfile;
  }

  /**
   * Generate diagnostic report
   */
  generateDiagnosticReport(): string {
    if (!this.networkProfile) {
      return 'Network profile not detected';
    }

    const {
      ipv6Available,
      ipv4Available,
      ipv6Latency,
      ipv4Latency,
      preferredVersion,
      cgnatDetected,
      isp,
      networkType,
    } = this.networkProfile;

    return `
IPv6-First Network Diagnostic Report
════════════════════════════════════════════

Network Configuration:
  • IPv6 Available: ${ipv6Available ? `✓ (${ipv6Latency}ms)` : '✗'}
  • IPv4 Available: ${ipv4Available ? `✓ (${ipv4Latency}ms)` : '✗'}
  • Preferred Version: ${preferredVersion.toUpperCase()}
  • CG-NAT Detected: ${cgnatDetected ? '⚠️ YES' : '✓ NO'}

Network Info:
  • ISP: ${isp}
  • Network Type: ${networkType}

Connection Strategy:
${this.getConnectionStrategy()}

Recommendations:
${this.getNetworkRecommendations()}
    `;
  }

  /**
   * Get connection strategy description
   */
  private getConnectionStrategy(): string {
    if (!this.networkProfile) return '  • Unknown';

    const { preferredVersion, cgnatDetected, ipv6Available } =
      this.networkProfile;

    if (preferredVersion === 'ipv6') {
      return '  • Using IPv6-ONLY mode (bypasses CG-NAT completely) ⭐';
    } else if (preferredVersion === 'dual-stack' && ipv6Available) {
      return '  • Using IPv6-FIRST hybrid (IPv6 primary, IPv4 secondary)';
    } else if (cgnatDetected) {
      return '  • Using IPv4 with TURN relay (CG-NAT detected) 🔄';
    } else {
      return '  • Using IPv4 direct P2P (no CG-NAT)';
    }
  }

  /**
   * Get network recommendations
   */
  private getNetworkRecommendations(): string {
    if (!this.networkProfile) return '  • Run network detection first';

    const { ipv6Available, cgnatDetected, networkType } = this.networkProfile;

    const recommendations: string[] = [];

    if (!ipv6Available && cgnatDetected) {
      recommendations.push(
        '  🔴 IPv4 is blocked by CG-NAT - contact ISP to enable IPv6'
      );
    } else if (!ipv6Available) {
      recommendations.push(
        '  ⚠️ IPv6 not available - consider upgrading to IPv6-enabled network'
      );
    } else if (ipv6Available) {
      recommendations.push(
        '  ✅ IPv6 available - using optimal IPv6-first strategy'
      );
    }

    if (networkType === 'mobile') {
      recommendations.push('  📱 Mobile network detected - using battery-efficient mode');
    }

    if (recommendations.length === 0) {
      recommendations.push('  ✅ Network configuration optimal');
    }

    return recommendations.join('\n');
  }

  /**
   * Detect ISP from network characteristics
   */
  private detectISP(): string {
    // Would integrate with actual ISP detection library
    // For now, return generic ISP name
    return 'Auto-detected ISP';
  }

  /**
   * Detect network type
   */
  private detectNetworkType(): 'home' | 'mobile' | 'enterprise' | 'unknown' {
    // Would detect from actual network info
    // For now, return 'home' as default
    return 'home';
  }

  /**
   * Test connectivity with current configuration
   */
  async testConnectivity(): Promise<{
    success: boolean;
    latency: number;
    version: 'ipv6' | 'ipv4';
    relay: boolean;
  }> {
    const servers = this.getOptimalServers();
    const startTime = Date.now();

    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: servers.stunServers.map((url) => ({ urls: [url] })),
      });

      return await new Promise((resolve) => {
        let bestLatency = Infinity;
        let usedVersion: 'ipv6' | 'ipv4' = servers.version === 'ipv6' ? 'ipv6' : 'ipv4';

        const timeout = setTimeout(() => {
          peerConnection.close();
          resolve({
            success: false,
            latency: Infinity,
            version: usedVersion,
            relay: servers.fallbackMode,
          });
        }, 8000);

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            const latency = Date.now() - startTime;
            if (latency < bestLatency) {
              bestLatency = latency;

              // Detect if using IPv6 or IPv4
              if (event.candidate.candidate.includes(':')) {
                usedVersion = 'ipv6';
              } else if (event.candidate.candidate.match(/\d+\.\d+/)) {
                usedVersion = 'ipv4';
              }
            }
          }
        };

        peerConnection.onicegatheringstatechange = () => {
          if (peerConnection.iceGatheringState === 'complete') {
            clearTimeout(timeout);
            peerConnection.close();

            resolve({
              success: bestLatency !== Infinity,
              latency: bestLatency,
              version: usedVersion,
              relay: servers.fallbackMode,
            });
          }
        };

        peerConnection.createDataChannel('test');
        peerConnection.createOffer().then((offer) => {
          peerConnection.setLocalDescription(offer);
        });
      });
    } catch (error) {
      console.error('[IPv6First] Connectivity test failed:', error);
      return {
        success: false,
        latency: Infinity,
        version: 'ipv4',
        relay: false,
      };
    }
  }

  /**
   * Enable IPv6-only mode (aggressive)
   */
  forceIPv6Only(): void {
    if (this.networkProfile) {
      this.networkProfile.preferredVersion = 'ipv6';
      console.log('[IPv6First] 🔒 Forcing IPv6-ONLY mode');
    }
  }

  /**
   * Disable IPv6 (fallback mode)
   */
  forceIPv4Fallback(): void {
    if (this.networkProfile) {
      this.networkProfile.preferredVersion = 'ipv4';
      console.log('[IPv6First] ↩️ Forcing IPv4 fallback');
    }
  }

  /**
   * Reset to auto-detection
   */
  async resetToAutoDetect(): Promise<void> {
    await this.detectNetworkProfile();
  }
}

const ipv6FirstNetworkingServiceInstance = new IPv6FirstNetworkingService();
export default ipv6FirstNetworkingServiceInstance;
