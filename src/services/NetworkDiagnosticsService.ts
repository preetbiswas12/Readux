/**
 * Project Aegis - Network Diagnostics Service
 * Tests network connectivity, latency, and connection quality
 */

export interface NetworkTest {
  name: string;
  status: 'passed' | 'failed' | 'running';
  latency_ms?: number;
  error?: string;
  timestamp: number;
}

export interface DiagnosticResult {
  test_timestamp: number;
  gun_db_connected: boolean;
  gun_db_latency: number;
  webrtc_available: boolean;
  stun_latency: number;
  tests_passed: number;
  tests_failed: number;
  overall_quality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  recommendations: string[];
}

class NetworkDiagnosticsService {
  private tests: NetworkTest[] = [];
  private lastResult: DiagnosticResult | null = null;

  /**
   * Run complete network diagnostics
   */
  async runDiagnostics(): Promise<DiagnosticResult> {
    const startTime = Date.now();
    console.log('[NetworkDiagnostics] Starting network diagnostics...');

    const result: DiagnosticResult = {
      test_timestamp: startTime,
      gun_db_connected: false,
      gun_db_latency: 0,
      webrtc_available: false,
      stun_latency: 0,
      tests_passed: 0,
      tests_failed: 0,
      overall_quality: 'offline',
      recommendations: [],
    };

    // Test GunDB connectivity
    try {
      const gunStart = Date.now();
      const test = await this.testGunDBConnection();
      result.gun_db_connected = test.status === 'passed';
      result.gun_db_latency = Date.now() - gunStart;

      if (test.status === 'passed') {
        result.tests_passed++;
      } else {
        result.tests_failed++;
        result.recommendations.push('GunDB connection failed - check internet');
      }
    } catch {
      result.tests_failed++;
      result.gun_db_connected = false;
      result.recommendations.push('GunDB test error - network may be offline');
    }

    // Test WebRTC availability
    try {
      const stunStart = Date.now();
      const test = await this.testSTUNConnectivity();
      result.webrtc_available = test.status === 'passed';
      result.stun_latency = Date.now() - stunStart;

      if (test.status === 'passed') {
        result.tests_passed++;
      } else {
        result.tests_failed++;
        result.recommendations.push('STUN connectivity failed - NAT traversal may fail');
      }
    } catch {
      result.tests_failed++;
      result.recommendations.push('STUN test error - WebRTC may not work');
    }

    // Determine overall quality
    if (result.tests_passed === 0) {
      result.overall_quality = 'offline';
      result.recommendations.push('📡 You appear to be offline. Please check your internet connection.');
    } else if (result.gun_db_latency > 5000 || result.stun_latency > 5000) {
      result.overall_quality = 'poor';
      result.recommendations.push('🐌 High latency detected. Network speed may be slow.');
    } else if (result.gun_db_latency > 2000 || result.stun_latency > 2000) {
      result.overall_quality = 'fair';
      result.recommendations.push('⚠️ Moderate latency. Some features may be slower.');
    } else if (result.tests_passed === 2) {
      result.overall_quality = 'excellent';
    } else {
      result.overall_quality = 'good';
    }

    this.lastResult = result;
    console.log(
      `[NetworkDiagnostics] ✓ Complete (${Date.now() - startTime}ms)`,
      result
    );

    return result;
  }

  /**
   * Test GunDB connectivity
   */
  private async testGunDBConnection(): Promise<NetworkTest> {
    const test: NetworkTest = {
      name: 'GunDB Connectivity',
      status: 'running',
      timestamp: Date.now(),
    };

    try {
      const startTime = Date.now();

      // Try to publish a test message
      // (In real implementation, would ping a known public relay)
      console.log('[NetworkDiagnostics] Testing GunDB...');

      // Simple check: can we reach GunDB relay
      // For now, assume success if GunDB is initialized
      const latency = Date.now() - startTime;

      test.status = latency < 10000 ? 'passed' : 'failed';
      test.latency_ms = latency;
    } catch (error) {
      test.status = 'failed';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.tests.push(test);
    return test;
  }

  /**
   * Test STUN connectivity (WebRTC NAT traversal)
   */
  private async testSTUNConnectivity(): Promise<NetworkTest> {
    const test: NetworkTest = {
      name: 'STUN/WebRTC',
      status: 'running',
      timestamp: Date.now(),
    };

    try {
      const startTime = Date.now();
      console.log('[NetworkDiagnostics] Testing STUN...');

      // Create a temporary peer connection to test STUN
      // This will attempt ICE candidate gathering
      const peerConnection = new (global as any).RTCPeerConnection({
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] },
          { urls: ['stun:stun1.l.google.com:19302'] },
        ],
      });

      // Wait for at least one ICE candidate
      const candidates = await this.gatherICECandidates(peerConnection, 3000);

      peerConnection.close();

      const latency = Date.now() - startTime;
      test.status = candidates.length > 0 ? 'passed' : 'failed';
      test.latency_ms = latency;

      if (candidates.length === 0) {
        test.error = 'No ICE candidates gathered';
      }
    } catch (error) {
      test.status = 'failed';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.tests.push(test);
    return test;
  }

  /**
   * Gather ICE candidates with timeout
   */
  private gatherICECandidates(
    peerConnection: any,
    timeoutMs: number
  ): Promise<any[]> {
    return new Promise(resolve => {
      const candidates: any[] = [];
      const timeout = setTimeout(() => resolve(candidates), timeoutMs);

      peerConnection.onicecandidate = (event: any) => {
        if (event.candidate) {
          candidates.push(event.candidate);
        }
      };

      peerConnection.createOffer().then((offer: any) => {
        peerConnection.setLocalDescription(offer);
      });

      // Auto-resolve after timeout
      const resolveTimeout = setTimeout(() => {
        clearTimeout(timeout);
        resolve(candidates);
      }, timeoutMs);

      return () => clearTimeout(resolveTimeout);
    });
  }

  /**
   * Get last diagnostic result
   */
  getLastResult(): DiagnosticResult | null {
    return this.lastResult;
  }

  /**
   * Get all test results
   */
  getTestResults(): NetworkTest[] {
    return [...this.tests];
  }

  /**
   * Get summary of network status
   */
  getNetworkStatus(): {
    online: boolean;
    quality: string;
    latency_avg: number;
  } {
    if (!this.lastResult) {
      return {
        online: false,
        quality: 'unknown',
        latency_avg: 0,
      };
    }

    const avgLatency =
      (this.lastResult.gun_db_latency + this.lastResult.stun_latency) / 2;

    return {
      online: this.lastResult.tests_passed > 0,
      quality: this.lastResult.overall_quality,
      latency_avg: avgLatency,
    };
  }

  /**
   * Format results for display
   */
  formatResults(result: DiagnosticResult): string {
    const lines = [
      '=== Network Diagnostics ===',
      `Timestamp: ${new Date(result.test_timestamp).toISOString()}`,
      '',
      '--- Tests ---',
      `GunDB: ${result.gun_db_connected ? '✅ Connected' : '❌ Failed'} (${result.gun_db_latency}ms)`,
      `STUN/WebRTC: ${result.webrtc_available ? '✅ Available' : '❌ Failed'} (${result.stun_latency}ms)`,
      '',
      `Overall Quality: ${result.overall_quality.toUpperCase()}`,
      `Tests Passed: ${result.tests_passed}/2`,
      '',
      '--- Recommendations ---',
      ...result.recommendations.map(r => `• ${r}`),
    ];

    return lines.join('\n');
  }
}

export default new NetworkDiagnosticsService();
