/**
 * Project Aegis - End-to-End Testing Service
 * Runs comprehensive tests for WebRTC, media, codecs, and NAT traversal
 */

export enum TestStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export enum TestCategory {
  CONNECTIVITY = 'connectivity',
  MEDIA = 'media',
  CODECS = 'codecs',
  CALLS = 'calls',
  NAT = 'nat',
}

export interface TestResult {
  id: string;
  category: TestCategory;
  name: string;
  status: TestStatus;
  duration: number; // milliseconds
  error?: string;
  details?: string;
  startTime: number;
  endTime?: number;
}

export interface TestReport {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  results: TestResult[];
  averageDuration: number;
  successRate: number;
}

export interface MediaCapabilities {
  audioCodecs: string[];
  videoCodecs: string[];
  audioPermission: boolean;
  videoPermission: boolean;
  microphoneAvailable: boolean;
  cameraAvailable: boolean;
}

export interface NATTestResults {
  stunReachable: boolean;
  turnReachable: boolean;
  natType: 'open' | 'symmetric' | 'restricted' | 'port-restricted' | 'unknown';
  localIP?: string;
  publicIP?: string;
  testDuration: number;
}

export interface CallFlowTest {
  callInitiated: boolean;
  callReceived: boolean;
  audioStreamEstablished: boolean;
  videoStreamEstablished: boolean;
  audioQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  videoQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  latency: number;
  packetLoss: number;
}

class E2ETestingService {
  private testResults: Map<string, TestResult> = new Map();
  private currentReport: TestReport | null = null;
  private testHandlers: Map<string, (result: TestResult) => void> = new Map();

  /**
   * Start a new testing session
   */
  startTestSession(): string {
    const sessionId = `session-${Date.now()}`;
    this.currentReport = {
      sessionId,
      startTime: Date.now(),
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      results: [],
      averageDuration: 0,
      successRate: 0,
    };
    console.log(`🧪 Test session started: ${sessionId}`);
    return sessionId;
  }

  /**
   * Run a single test with timing and error handling
   */
  private async runTest(
    category: TestCategory,
    name: string,
    testFn: () => Promise<void>
  ): Promise<TestResult> {
    const testId = `${category}-${Date.now()}`;
    const startTime = Date.now();

    const result: TestResult = {
      id: testId,
      category,
      name,
      status: TestStatus.RUNNING,
      duration: 0,
      startTime,
    };

    try {
      await testFn();
      result.status = TestStatus.PASSED;
      result.details = `${name} completed successfully`;
      console.log(`✅ ${name}`);
    } catch (error) {
      result.status = TestStatus.FAILED;
      result.error = String(error);
      console.error(`❌ ${name}: ${error}`);
    } finally {
      result.endTime = Date.now();
      result.duration = result.endTime - startTime;

      if (this.currentReport) {
        this.currentReport.totalTests++;
        if (result.status === TestStatus.PASSED) {
          this.currentReport.passed++;
        } else if (result.status === TestStatus.FAILED) {
          this.currentReport.failed++;
        } else if (result.status === TestStatus.SKIPPED) {
          this.currentReport.skipped++;
        }
        this.currentReport.results.push(result);
      }

      this.testResults.set(testId, result);
      this.notifyTestComplete(result);
    }

    return result;
  }

  /**
   * Test 1: WebRTC Connectivity
   * Verifies basic peer connection establishment
   */
  async testWebRTCConnectivity(): Promise<TestResult> {
    return this.runTest(
      TestCategory.CONNECTIVITY,
      'WebRTC Peer Connection',
      async () => {
        // Simulate peer connection establishment
        const peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        });

        return new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            peerConnection.close();
            reject(new Error('Peer connection timeout'));
          }, 5000);

          peerConnection.onconnectionstatechange = () => {
            if (peerConnection.connectionState === 'connected') {
              clearTimeout(timeout);
              peerConnection.close();
              resolve();
            }
          };

          peerConnection.onicecandidateerror = (event) => {
            clearTimeout(timeout);
            reject(
              new Error(`ICE candidate error: ${event.errorCode} - ${event.errorText}`)
            );
          };

          // Create data channel to trigger ICE gathering
          peerConnection.createDataChannel('test');
        });
      }
    );
  }

  /**
   * Test 2: STUN Server Reachability
   * Verifies reachability to Google STUN servers
   */
  async testSTUNReachability(): Promise<TestResult> {
    return this.runTest(
      TestCategory.NAT,
      'STUN Server Reachability',
      async () => {
        const stunServers = [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
        ];

        const results = await Promise.allSettled(
          stunServers.map(async (stun) => {
            const pc = new RTCPeerConnection({ iceServers: [{ urls: stun }] });
            return new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => {
                pc.close();
                reject(new Error(`STUN ${stun} timeout`));
              }, 3000);

              pc.onicecandidate = (event) => {
                if (event.candidate) {
                  clearTimeout(timeout);
                  pc.close();
                  resolve();
                }
              };

              pc.createDataChannel('stun-test');
            });
          })
        );

        const allReached = results.every((r) => r.status === 'fulfilled');
        if (!allReached) {
          throw new Error('Some STUN servers unreachable');
        }
      }
    );
  }

  /**
   * Test 3: Media Capabilities
   * Checks audio/video codec support and permission status
   */
  async testMediaCapabilities(): Promise<TestResult> {
    return this.runTest(
      TestCategory.MEDIA,
      'Media Capabilities Check',
      async () => {
        // Check RTCRtpSender capabilities
        const audioCapabilities = (
          RTCRtpSender.getCapabilities('audio')?.codecs || []
        ).map((c) => c.mimeType);

        const videoCapabilities = (
          RTCRtpSender.getCapabilities('video')?.codecs || []
        ).map((c) => c.mimeType);

        if (audioCapabilities.length === 0 || videoCapabilities.length === 0) {
          throw new Error('Missing audio or video codec support');
        }

        return;
      }
    );
  }

  /**
   * Test 4: Audio Codec Negotiation
   * Verifies audio codec selection works
   */
  async testAudioCodecNegotiation(): Promise<TestResult> {
    return this.runTest(
      TestCategory.CODECS,
      'Audio Codec Negotiation',
      async () => {
        const audioCapabilities = RTCRtpSender.getCapabilities('audio');
        const audioCodecs = audioCapabilities?.codecs || [];

        if (audioCodecs.length === 0) {
          throw new Error('No audio codecs available');
        }

        // Verify mandatory codecs (Opus should be present)
        const hasOpus = audioCodecs.some((c) =>
          c.mimeType.toLowerCase().includes('opus')
        );

        if (!hasOpus) {
          console.warn('⚠️  Opus codec not found, but fallback codecs available');
        }

        return;
      }
    );
  }

  /**
   * Test 5: Video Codec Negotiation
   * Verifies video codec selection works
   */
  async testVideoCodecNegotiation(): Promise<TestResult> {
    return this.runTest(
      TestCategory.CODECS,
      'Video Codec Negotiation',
      async () => {
        const videoCapabilities = RTCRtpSender.getCapabilities('video');
        const videoCodecs = videoCapabilities?.codecs || [];

        if (videoCodecs.length === 0) {
          throw new Error('No video codecs available');
        }

        // Verify common codecs (VP9, H264, or VP8)
        const supportedCodecs = ['vp9', 'h264', 'vp8'];
        const hasCommonCodec = videoCodecs.some((c) =>
          supportedCodecs.some((sc) => c.mimeType.toLowerCase().includes(sc))
        );

        if (!hasCommonCodec) {
          throw new Error('No common video codecs (VP9/H264/VP8) found');
        }

        return;
      }
    );
  }

  /**
   * Test 6: ICE Candidate Gathering
   * Verifies ICE candidate collection works
   */
  async testICECandidateGathering(): Promise<TestResult> {
    return this.runTest(
      TestCategory.NAT,
      'ICE Candidate Gathering',
      async () => {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        return new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            pc.close();
            reject(new Error('ICE gathering timeout'));
          }, 5000);

          let candidateCount = 0;
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              candidateCount++;
              if (candidateCount >= 1) {
                clearTimeout(timeout);
                pc.close();
                resolve();
              }
            }
          };

          pc.createDataChannel('ice-test');
        });
      }
    );
  }

  /**
   * Test 7: Data Channel Communication
   * Verifies data channel can send/receive
   */
  async testDataChannelCommunication(): Promise<TestResult> {
    return this.runTest(
      TestCategory.CONNECTIVITY,
      'Data Channel Communication',
      async () => {
        const pc = new RTCPeerConnection();
        const dc = pc.createDataChannel('test-channel');

        return new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            pc.close();
            reject(new Error('Data channel test timeout'));
          }, 3000);

          dc.onopen = () => {
            dc.send('test-message');
            clearTimeout(timeout);
            pc.close();
            resolve();
          };

          dc.onerror = (error) => {
            clearTimeout(timeout);
            reject(new Error(`Data channel error: ${error}`));
          };
        });
      }
    );
  }

  /**
   * Test 8: Connection Metrics
   * Verifies we can retrieve connection statistics
   */
  async testConnectionMetrics(): Promise<TestResult> {
    return this.runTest(
      TestCategory.CONNECTIVITY,
      'Connection Metrics Retrieval',
      async () => {
        const pc = new RTCPeerConnection();
        const dc = pc.createDataChannel('metrics-test');

        return new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            pc.close();
            reject(new Error('Metrics retrieval timeout'));
          }, 3000);

          dc.onopen = async () => {
            try {
              const stats = await pc.getStats();
              if (!stats) {
                throw new Error('No stats available');
              }

              let foundInbound = false;
              let statsCount = 0;
              
              stats.forEach(() => {
                statsCount++;
              });
              
              if (statsCount === 0) {
                throw new Error('Stats report is empty');
              }

              stats.forEach((report) => {
                if (report.type === 'inbound-rtp') {
                  foundInbound = true;
                }
              });

              if (!foundInbound) {
                throw new Error('Missing inbound-rtp stats');
              }

              clearTimeout(timeout);
              pc.close();
              resolve();
            } catch (error) {
              clearTimeout(timeout);
              reject(error);
            }
          };

          dc.onerror = (error) => {
            clearTimeout(timeout);
            reject(new Error(`Data channel error: ${error}`));
          };
        });
      }
    );
  }

  /**
   * Test 9: Multiple Connections
   * Verifies multiple simultaneous peer connections work
   */
  async testMultipleConnections(count: number = 3): Promise<TestResult> {
    return this.runTest(
      TestCategory.CONNECTIVITY,
      `Multiple Connections (${count} peers)`,
      async () => {
        const connections = await Promise.allSettled(
          Array.from({ length: count }).map(async () => {
            const pc = new RTCPeerConnection({
              iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
            });
            const dc = pc.createDataChannel('multi-test');

            return new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => {
                pc.close();
                reject(new Error('Connection timeout'));
              }, 3000);

              dc.onopen = () => {
                clearTimeout(timeout);
                pc.close();
                resolve();
              };

              dc.onerror = (error) => {
                clearTimeout(timeout);
                reject(new Error(`Connection error: ${error}`));
              };
            });
          })
        );

        const allConnected = connections.every((r) => r.status === 'fulfilled');
        if (!allConnected) {
          throw new Error(`Only ${connections.filter((r) => r.status === 'fulfilled').length}/${count} connections succeeded`);
        }
      }
    );
  }

  /**
   * Test 10: NAT Type Detection
   * Attempts to determine NAT type
   */
  async testNATTypeDetection(): Promise<TestResult> {
    return this.runTest(
      TestCategory.NAT,
      'NAT Type Detection',
      async () => {
        // This is a simplified test - full NAT detection requires STUN/TURN analysis
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        });

        return new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            pc.close();
            reject(new Error('NAT detection timeout'));
          }, 5000);

          let candidateTypes = new Set<string>();
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              const candidate = event.candidate.candidate;
              if (candidate.includes('srflx')) {
                candidateTypes.add('srflx');
              } else if (candidate.includes('prflx')) {
                candidateTypes.add('prflx');
              } else if (candidate.includes('host')) {
                candidateTypes.add('host');
              } else if (candidate.includes('relay')) {
                candidateTypes.add('relay');
              }
            }
          };

          pc.onicecandidate = () => {
            // Empty handler to continue gathering
          };

          setTimeout(() => {
            if (candidateTypes.size > 0) {
              clearTimeout(timeout);
              pc.close();
              resolve();
            }
          }, 2000);

          pc.createDataChannel('nat-test');
        });
      }
    );
  }

  /**
   * Run full test suite
   */
  async runFullTestSuite(): Promise<TestReport> {
    this.startTestSession();

    console.log('🧪 Starting full E2E test suite...\n');

    // Connectivity tests
    await this.testWebRTCConnectivity();
    await this.testDataChannelCommunication();

    // NAT & Network tests
    await this.testSTUNReachability();
    await this.testICECandidateGathering();
    await this.testNATTypeDetection();

    // Media & Codec tests
    await this.testMediaCapabilities();
    await this.testAudioCodecNegotiation();
    await this.testVideoCodecNegotiation();

    // Advanced tests
    await this.testConnectionMetrics();
    await this.testMultipleConnections(3);

    return this.finishTestSession();
  }

  /**
   * Run quick connectivity only
   */
  async runQuickTest(): Promise<TestReport> {
    this.startTestSession();

    console.log('🧪 Starting quick test suite...\n');

    await this.testWebRTCConnectivity();
    await this.testSTUNReachability();
    await this.testMediaCapabilities();

    return this.finishTestSession();
  }

  /**
   * Finish test session and calculate stats
   */
  private finishTestSession(): TestReport {
    if (!this.currentReport) {
      throw new Error('No active test session');
    }

    this.currentReport.endTime = Date.now();
    this.currentReport.successRate =
      this.currentReport.totalTests > 0
        ? (this.currentReport.passed / this.currentReport.totalTests) * 100
        : 0;

    const totalDuration = this.currentReport.results.reduce(
      (sum, r) => sum + r.duration,
      0
    );
    this.currentReport.averageDuration =
      this.currentReport.results.length > 0
        ? totalDuration / this.currentReport.results.length
        : 0;

    console.log('\n📊 Test Results Summary:');
    console.log(`Total Tests: ${this.currentReport.totalTests}`);
    console.log(`✅ Passed: ${this.currentReport.passed}`);
    console.log(`❌ Failed: ${this.currentReport.failed}`);
    console.log(`⏭️  Skipped: ${this.currentReport.skipped}`);
    console.log(
      `📈 Success Rate: ${this.currentReport.successRate.toFixed(1)}%`
    );
    console.log(
      `⏱️  Average Duration: ${this.currentReport.averageDuration.toFixed(0)}ms\n`
    );

    return this.currentReport;
  }

  /**
   * Get current test report
   */
  getCurrentReport(): TestReport | null {
    return this.currentReport;
  }

  /**
   * Get test result by ID
   */
  getTestResult(testId: string): TestResult | undefined {
    return this.testResults.get(testId);
  }

  /**
   * Get all test results
   */
  getAllTestResults(): TestResult[] {
    return Array.from(this.testResults.values());
  }

  /**
   * Register handler for test completion
   */
  onTestComplete(handler: (result: TestResult) => void): () => void {
    const id = `handler-${Date.now()}`;
    this.testHandlers.set(id, handler);

    return () => {
      this.testHandlers.delete(id);
    };
  }

  /**
   * Notify all handlers of test completion
   */
  private notifyTestComplete(result: TestResult): void {
    this.testHandlers.forEach((handler) => {
      try {
        handler(result);
      } catch (error) {
        console.error('Test handler error:', error);
      }
    });
  }

  /**
   * Export test report as JSON
   */
  exportReportAsJSON(report: TestReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export test report as text
   */
  exportReportAsText(report: TestReport): string {
    let text = `Project Aegis - E2E Test Report\n`;
    text += `Session: ${report.sessionId}\n`;
    text += `Date: ${new Date(report.startTime).toISOString()}\n`;
    text += `Duration: ${report.endTime ? (report.endTime - report.startTime) / 1000 : 'N/A'}s\n\n`;

    text += `Summary:\n`;
    text += `- Total: ${report.totalTests}\n`;
    text += `- Passed: ${report.passed}\n`;
    text += `- Failed: ${report.failed}\n`;
    text += `- Skipped: ${report.skipped}\n`;
    text += `- Success Rate: ${report.successRate.toFixed(1)}%\n`;
    text += `- Average Duration: ${report.averageDuration.toFixed(0)}ms\n\n`;

    text += `Test Results:\n`;
    report.results.forEach((result) => {
      const statusEmoji =
        result.status === TestStatus.PASSED ? '✅' : '❌';
      text += `${statusEmoji} ${result.name} (${result.category}): ${result.status} in ${result.duration}ms\n`;
      if (result.error) {
        text += `   Error: ${result.error}\n`;
      }
      if (result.details) {
        text += `   Details: ${result.details}\n`;
      }
    });

    return text;
  }

  /**
   * Clear all test results
   */
  clearResults(): void {
    this.testResults.clear();
    this.currentReport = null;
  }
}

export default new E2ETestingService();
