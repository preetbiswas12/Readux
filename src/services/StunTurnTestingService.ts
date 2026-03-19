/**
 * STUN/TURN Server Testing & Monitoring Utility
 * Test which servers work best in your network environment
 * 
 * Usage:
 * 1. Go to: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice
 * 2. Copy a STUN URL from the lists below
 * 3. Paste into "STUN server" field
 * 4. Click "Gather candidates"
 * 5. Check results
 */

import { ALL_STUN_SERVERS, STUN_SERVERS_BY_TIER } from '../config/StunTurnServers';

interface ServerTestResult {
  server: string;
  provider: string;
  tier: 'primary' | 'secondary' | 'fallback';
  latency: number | null;
  success: boolean;
  candidateType: 'host' | 'srflx' | 'relay' | 'none';
  publicIp?: string;
  error?: string;
}

export class StunTurnTestingService {
  private results: ServerTestResult[] = [];
  private isTestingComplete = false;

  /**
   * Test a single STUN server
   * Simulates WebRTC candidate gathering
   */
  async testStunServer(stunUrl: string, provider: string, tier: 'primary' | 'secondary' | 'fallback'): Promise<ServerTestResult> {
    const startTime = Date.now();

    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: [stunUrl] }],
        bundlePolicy: 'max-bundle',
      });

      return await new Promise<ServerTestResult>((resolve) => {
        let foundCandidate = false;
        let publicIp: string | undefined;
        let candidateType: 'host' | 'srflx' | 'relay' | 'none' = 'none';
        let bestLatency = Infinity;

        const timeout = setTimeout(() => {
          peerConnection.close();
          resolve({
            server: stunUrl,
            provider,
            tier,
            latency: foundCandidate ? Date.now() - startTime : null,
            success: foundCandidate,
            candidateType,
            error: !foundCandidate ? 'Timeout - no candidates gathered' : undefined,
          });
        }, 8000); // 8 second timeout to allow ICE gathering

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            const latency = Date.now() - startTime;

            // Parse candidate
            if (candidate.includes('host')) {
              candidateType = 'host';
            } else if (candidate.includes('srflx')) {
              candidateType = 'srflx';
              foundCandidate = true;
              // Extract public IP
              const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
              if (match) {
                publicIp = match[0];
              }
              if (latency < bestLatency) {
                bestLatency = latency;
              }
            } else if (candidate.includes('relay')) {
              candidateType = 'relay';
              foundCandidate = true;
            }

            console.log(`[${provider}] ${candidateType}: ${candidate.substring(0, 100)}`);
          } else if (!foundCandidate && event === null) {
            // End of candidates without finding anything
          }
        };

        peerConnection.onicegatheringstatechange = () => {
          if (peerConnection.iceGatheringState === 'complete') {
            const latency = Date.now() - startTime;
            clearTimeout(timeout);
            peerConnection.close();

            resolve({
              server: stunUrl,
              provider,
              tier,
              latency: foundCandidate ? latency : null,
              success: foundCandidate,
              candidateType,
              publicIp,
            });
          }
        };

        // Trigger ICE gathering
        peerConnection.createDataChannel('test');
        peerConnection.createOffer().then((offer) => {
          peerConnection.setLocalDescription(offer);
        });
      });
    } catch (error) {
      return {
        server: stunUrl,
        provider,
        tier,
        latency: null,
        success: false,
        candidateType: 'none',
        error: String(error),
      };
    }
  }

  /**
   * Test all primary STUN servers (fast)
   */
  async testPrimaryStunServers(): Promise<ServerTestResult[]> {
    console.log('🏃 Testing Primary STUN servers...');
    const results: ServerTestResult[] = [];

    for (const server of STUN_SERVERS_BY_TIER.primary) {
      const result = await this.testStunServer(server.url, server.provider, 'primary');
      results.push(result);
      console.log(`  ${result.success ? '✅' : '❌'} ${server.provider}: ${result.candidateType} (${result.latency}ms)`);
    }

    return results;
  }

  /**
   * Test all STUN servers (comprehensive, takes time)
   */
  async testAllStunServers(progressCallback?: (current: number, total: number) => void): Promise<ServerTestResult[]> {
    console.log(`🔍 Testing all ${ALL_STUN_SERVERS.length} STUN servers (this takes 5+ minutes)...`);
    const results: ServerTestResult[] = [];
    const total = ALL_STUN_SERVERS.length;

    for (let i = 0; i < ALL_STUN_SERVERS.length; i++) {
      const server = ALL_STUN_SERVERS[i];
      const result = await this.testStunServer(server.url, server.provider, server.tier);
      results.push(result);

      if (progressCallback) {
        progressCallback(i + 1, total);
      }

      if (result.success) {
        console.log(`  ✅ [${server.tier}] ${server.provider}: ${result.candidateType} (${result.latency}ms)`);
      }
    }

    this.results = results;
    this.isTestingComplete = true;
    return results;
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalTested: number;
    successRate: number;
    byTier: { tier: string; success: number; total: number; successRate: number }[];
    byProvider: { provider: string; success: number; total: number; successRate: number }[];
    fastestServers: ServerTestResult[];
    slowestServers: ServerTestResult[];
  } {
    const totalTests = this.results.length;
    const successful = this.results.filter((r) => r.success);

    // By tier
    const byTier = new Map<string, { success: number; total: number }>();
    for (const result of this.results) {
      const key = result.tier;
      if (!byTier.has(key)) {
        byTier.set(key, { success: 0, total: 0 });
      }
      const stats = byTier.get(key)!;
      stats.total++;
      if (result.success) stats.success++;
    }

    // By provider
    const byProvider = new Map<string, { success: number; total: number }>();
    for (const result of this.results) {
      const key = result.provider;
      if (!byProvider.has(key)) {
        byProvider.set(key, { success: 0, total: 0 });
      }
      const stats = byProvider.get(key)!;
      stats.total++;
      if (result.success) stats.success++;
    }

    const tierStats = Array.from(byTier.entries()).map(([tier, stats]) => ({
      tier,
      ...stats,
      successRate: stats.success / stats.total,
    }));

    const providerStats = Array.from(byProvider.entries()).map(([provider, stats]) => ({
      provider,
      ...stats,
      successRate: stats.success / stats.total,
    }));

    // Sort by latency
    const successfulWithLatency = successful.filter((r) => r.latency !== null);
    const fastest = [...successfulWithLatency].sort((a, b) => (a.latency || 999999) - (b.latency || 999999)).slice(0, 5);
    const slowest = [...successfulWithLatency].sort((a, b) => (b.latency || 0) - (a.latency || 0)).slice(0, 5);

    return {
      totalTested: totalTests,
      successRate: totalTests > 0 ? successful.length / totalTests : 0,
      byTier: tierStats,
      byProvider: providerStats.sort((a, b) => b.successRate - a.successRate),
      fastestServers: fastest,
      slowestServers: slowest,
    };
  }

  /**
   * Get formatted report
   */
  generateReport(): string {
    if (this.results.length === 0) {
      return 'No tests run yet';
    }

    const summary = this.getSummary();

    let report = `
STUN/TURN Server Testing Report
═══════════════════════════════════════════

Overall Results:
  • Total Servers Tested: ${summary.totalTested}
  • Success Rate: ${(summary.successRate * 100).toFixed(1)}%
  • Working Servers: ${this.results.filter((r) => r.success).length}

Success Rate by Tier:
${summary.byTier.map((t) => `  • ${t.tier}: ${(t.successRate * 100).toFixed(1)}% (${t.success}/${t.total})`).join('\n')}

Success Rate by Provider:
${summary.byProvider
  .slice(0, 10)
  .map((p) => `  • ${p.provider}: ${(p.successRate * 100).toFixed(1)}% (${p.success}/${p.total})`)
  .join('\n')}

Fastest Servers (lowest latency):
${summary.fastestServers
  .map((s) => `  • ${s.provider} (${s.tier}): ${s.latency}ms - ${s.candidateType} - ${s.server}`)
  .join('\n')}

Slowest Servers (highest latency):
${summary.slowestServers
  .map((s) => `  • ${s.provider} (${s.tier}): ${s.latency}ms - ${s.candidateType} - ${s.server}`)
  .join('\n')}

Recommendations:
${this.getRecommendations()}
    `;

    return report;
  }

  /**
   * Get optimization recommendations
   */
  getRecommendations(): string {
    const summary = this.getSummary();

    const recommendations: string[] = [];

    if (summary.successRate > 0.95) {
      recommendations.push('✅ Excellent connectivity: Primary tier servers work great');
    } else if (summary.successRate > 0.7) {
      recommendations.push('⚠️ Good connectivity: Consider using secondary tier servers as fallback');
    } else {
      recommendations.push(
        '🔴 Poor connectivity: TURN relay recommended, use fallback tier servers'
      );
    }

    const primaryStats = summary.byTier.find((t) => t.tier === 'primary');
    if (primaryStats && primaryStats.successRate < 0.5) {
      recommendations.push('💡 Primary servers unreliable: Force usage of secondary/fallback in your region');
    }

    const fastestServer = summary.fastestServers[0];
    if (fastestServer) {
      recommendations.push(`⚡ Best server for you: ${fastestServer.provider} (${fastestServer.latency}ms)`);
    }

    // Provider recommendations
    const bestProvider = summary.byProvider[0];
    if (bestProvider && bestProvider.successRate > 0.8) {
      recommendations.push(`🌍 Most reliable provider in your region: ${bestProvider.provider}`);
    }

    return recommendations.map((r) => `  • ${r}`).join('\n');
  }

  /**
   * Export results as JSON for analysis
   */
  exportAsJSON(): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: this.getSummary(),
        detailed: this.results,
      },
      null,
      2
    );
  }
}

export default new StunTurnTestingService();
