"use strict";
/**
 * Project Aegis - End-to-End Testing Service
 * Runs comprehensive tests for WebRTC, media, codecs, and NAT traversal
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCategory = exports.TestStatus = void 0;
var TestStatus;
(function (TestStatus) {
    TestStatus["PENDING"] = "pending";
    TestStatus["RUNNING"] = "running";
    TestStatus["PASSED"] = "passed";
    TestStatus["FAILED"] = "failed";
    TestStatus["SKIPPED"] = "skipped";
})(TestStatus || (exports.TestStatus = TestStatus = {}));
var TestCategory;
(function (TestCategory) {
    TestCategory["CONNECTIVITY"] = "connectivity";
    TestCategory["MEDIA"] = "media";
    TestCategory["CODECS"] = "codecs";
    TestCategory["CALLS"] = "calls";
    TestCategory["NAT"] = "nat";
})(TestCategory || (exports.TestCategory = TestCategory = {}));
var E2ETestingService = /** @class */ (function () {
    function E2ETestingService() {
        this.testResults = new Map();
        this.currentReport = null;
        this.testHandlers = new Map();
    }
    /**
     * Start a new testing session
     */
    E2ETestingService.prototype.startTestSession = function () {
        var sessionId = "session-".concat(Date.now());
        this.currentReport = {
            sessionId: sessionId,
            startTime: Date.now(),
            totalTests: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            results: [],
            averageDuration: 0,
            successRate: 0,
        };
        console.log("\uD83E\uDDEA Test session started: ".concat(sessionId));
        return sessionId;
    };
    /**
     * Run a single test with timing and error handling
     */
    E2ETestingService.prototype.runTest = function (category, name, testFn) {
        return __awaiter(this, void 0, void 0, function () {
            var testId, startTime, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        testId = "".concat(category, "-").concat(Date.now());
                        startTime = Date.now();
                        result = {
                            id: testId,
                            category: category,
                            name: name,
                            status: TestStatus.RUNNING,
                            duration: 0,
                            startTime: startTime,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, testFn()];
                    case 2:
                        _a.sent();
                        result.status = TestStatus.PASSED;
                        result.details = "".concat(name, " completed successfully");
                        console.log("\u2705 ".concat(name));
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        result.status = TestStatus.FAILED;
                        result.error = String(error_1);
                        console.error("\u274C ".concat(name, ": ").concat(error_1));
                        return [3 /*break*/, 5];
                    case 4:
                        result.endTime = Date.now();
                        result.duration = result.endTime - startTime;
                        if (this.currentReport) {
                            this.currentReport.totalTests++;
                            if (result.status === TestStatus.PASSED) {
                                this.currentReport.passed++;
                            }
                            else if (result.status === TestStatus.FAILED) {
                                this.currentReport.failed++;
                            }
                            else if (result.status === TestStatus.SKIPPED) {
                                this.currentReport.skipped++;
                            }
                            this.currentReport.results.push(result);
                        }
                        this.testResults.set(testId, result);
                        this.notifyTestComplete(result);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Test 1: WebRTC Connectivity
     * Verifies basic peer connection establishment
     */
    E2ETestingService.prototype.testWebRTCConnectivity = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.runTest(TestCategory.CONNECTIVITY, 'WebRTC Peer Connection', function () { return __awaiter(_this, void 0, void 0, function () {
                        var peerConnection;
                        return __generator(this, function (_a) {
                            peerConnection = new RTCPeerConnection({
                                iceServers: [
                                    { urls: 'stun:stun.l.google.com:19302' },
                                    { urls: 'stun:stun1.l.google.com:19302' },
                                ],
                            });
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var timeout = setTimeout(function () {
                                        peerConnection.close();
                                        reject(new Error('Peer connection timeout'));
                                    }, 5000);
                                    peerConnection.onconnectionstatechange = function () {
                                        if (peerConnection.connectionState === 'connected') {
                                            clearTimeout(timeout);
                                            peerConnection.close();
                                            resolve();
                                        }
                                    };
                                    peerConnection.onicecandidateerror = function (event) {
                                        clearTimeout(timeout);
                                        reject(new Error("ICE candidate error: ".concat(event.errorCode, " - ").concat(event.errorText)));
                                    };
                                    // Create data channel to trigger ICE gathering
                                    peerConnection.createDataChannel('test');
                                })];
                        });
                    }); })];
            });
        });
    };
    /**
     * Test 2: STUN Server Reachability
     * Verifies reachability to Google STUN servers
     */
    E2ETestingService.prototype.testSTUNReachability = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.runTest(TestCategory.NAT, 'STUN Server Reachability', function () { return __awaiter(_this, void 0, void 0, function () {
                        var stunServers, results, allReached;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    stunServers = [
                                        'stun:stun.l.google.com:19302',
                                        'stun:stun1.l.google.com:19302',
                                    ];
                                    return [4 /*yield*/, Promise.allSettled(stunServers.map(function (stun) { return __awaiter(_this, void 0, void 0, function () {
                                            var pc;
                                            return __generator(this, function (_a) {
                                                pc = new RTCPeerConnection({ iceServers: [{ urls: stun }] });
                                                return [2 /*return*/, new Promise(function (resolve, reject) {
                                                        var timeout = setTimeout(function () {
                                                            pc.close();
                                                            reject(new Error("STUN ".concat(stun, " timeout")));
                                                        }, 3000);
                                                        pc.onicecandidate = function (event) {
                                                            if (event.candidate) {
                                                                clearTimeout(timeout);
                                                                pc.close();
                                                                resolve();
                                                            }
                                                        };
                                                        pc.createDataChannel('stun-test');
                                                    })];
                                            });
                                        }); }))];
                                case 1:
                                    results = _a.sent();
                                    allReached = results.every(function (r) { return r.status === 'fulfilled'; });
                                    if (!allReached) {
                                        throw new Error('Some STUN servers unreachable');
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Test 3: Media Capabilities
     * Checks audio/video codec support and permission status
     */
    E2ETestingService.prototype.testMediaCapabilities = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.runTest(TestCategory.MEDIA, 'Media Capabilities Check', function () { return __awaiter(_this, void 0, void 0, function () {
                        var audioCapabilities, videoCapabilities;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            audioCapabilities = (((_a = RTCRtpSender.getCapabilities('audio')) === null || _a === void 0 ? void 0 : _a.codecs) || []).map(function (c) { return c.mimeType; });
                            videoCapabilities = (((_b = RTCRtpSender.getCapabilities('video')) === null || _b === void 0 ? void 0 : _b.codecs) || []).map(function (c) { return c.mimeType; });
                            if (audioCapabilities.length === 0 || videoCapabilities.length === 0) {
                                throw new Error('Missing audio or video codec support');
                            }
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    /**
     * Test 4: Audio Codec Negotiation
     * Verifies audio codec selection works
     */
    E2ETestingService.prototype.testAudioCodecNegotiation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.runTest(TestCategory.CODECS, 'Audio Codec Negotiation', function () { return __awaiter(_this, void 0, void 0, function () {
                        var audioCapabilities, audioCodecs, hasOpus;
                        return __generator(this, function (_a) {
                            audioCapabilities = RTCRtpSender.getCapabilities('audio');
                            audioCodecs = (audioCapabilities === null || audioCapabilities === void 0 ? void 0 : audioCapabilities.codecs) || [];
                            if (audioCodecs.length === 0) {
                                throw new Error('No audio codecs available');
                            }
                            hasOpus = audioCodecs.some(function (c) {
                                return c.mimeType.toLowerCase().includes('opus');
                            });
                            if (!hasOpus) {
                                console.warn('⚠️  Opus codec not found, but fallback codecs available');
                            }
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    /**
     * Test 5: Video Codec Negotiation
     * Verifies video codec selection works
     */
    E2ETestingService.prototype.testVideoCodecNegotiation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.runTest(TestCategory.CODECS, 'Video Codec Negotiation', function () { return __awaiter(_this, void 0, void 0, function () {
                        var videoCapabilities, videoCodecs, supportedCodecs, hasCommonCodec;
                        return __generator(this, function (_a) {
                            videoCapabilities = RTCRtpSender.getCapabilities('video');
                            videoCodecs = (videoCapabilities === null || videoCapabilities === void 0 ? void 0 : videoCapabilities.codecs) || [];
                            if (videoCodecs.length === 0) {
                                throw new Error('No video codecs available');
                            }
                            supportedCodecs = ['vp9', 'h264', 'vp8'];
                            hasCommonCodec = videoCodecs.some(function (c) {
                                return supportedCodecs.some(function (sc) { return c.mimeType.toLowerCase().includes(sc); });
                            });
                            if (!hasCommonCodec) {
                                throw new Error('No common video codecs (VP9/H264/VP8) found');
                            }
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    /**
     * Test 6: ICE Candidate Gathering
     * Verifies ICE candidate collection works
     */
    E2ETestingService.prototype.testICECandidateGathering = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.runTest(TestCategory.NAT, 'ICE Candidate Gathering', function () { return __awaiter(_this, void 0, void 0, function () {
                        var pc;
                        return __generator(this, function (_a) {
                            pc = new RTCPeerConnection({
                                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
                            });
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var timeout = setTimeout(function () {
                                        pc.close();
                                        reject(new Error('ICE gathering timeout'));
                                    }, 5000);
                                    var candidateCount = 0;
                                    pc.onicecandidate = function (event) {
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
                                })];
                        });
                    }); })];
            });
        });
    };
    /**
     * Test 7: Data Channel Communication
     * Verifies data channel can send/receive
     */
    E2ETestingService.prototype.testDataChannelCommunication = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.runTest(TestCategory.CONNECTIVITY, 'Data Channel Communication', function () { return __awaiter(_this, void 0, void 0, function () {
                        var pc, dc;
                        return __generator(this, function (_a) {
                            pc = new RTCPeerConnection();
                            dc = pc.createDataChannel('test-channel');
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var timeout = setTimeout(function () {
                                        pc.close();
                                        reject(new Error('Data channel test timeout'));
                                    }, 3000);
                                    dc.onopen = function () {
                                        dc.send('test-message');
                                        clearTimeout(timeout);
                                        pc.close();
                                        resolve();
                                    };
                                    dc.onerror = function (error) {
                                        clearTimeout(timeout);
                                        reject(new Error("Data channel error: ".concat(error)));
                                    };
                                })];
                        });
                    }); })];
            });
        });
    };
    /**
     * Test 8: Connection Metrics
     * Verifies we can retrieve connection statistics
     */
    E2ETestingService.prototype.testConnectionMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.runTest(TestCategory.CONNECTIVITY, 'Connection Metrics Retrieval', function () { return __awaiter(_this, void 0, void 0, function () {
                        var pc, dc;
                        var _this = this;
                        return __generator(this, function (_a) {
                            pc = new RTCPeerConnection();
                            dc = pc.createDataChannel('metrics-test');
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var timeout = setTimeout(function () {
                                        pc.close();
                                        reject(new Error('Metrics retrieval timeout'));
                                    }, 3000);
                                    dc.onopen = function () { return __awaiter(_this, void 0, void 0, function () {
                                        var stats, foundInbound_1, statsCount_1, error_2;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    _a.trys.push([0, 2, , 3]);
                                                    return [4 /*yield*/, pc.getStats()];
                                                case 1:
                                                    stats = _a.sent();
                                                    if (!stats) {
                                                        throw new Error('No stats available');
                                                    }
                                                    foundInbound_1 = false;
                                                    statsCount_1 = 0;
                                                    stats.forEach(function () {
                                                        statsCount_1++;
                                                    });
                                                    if (statsCount_1 === 0) {
                                                        throw new Error('Stats report is empty');
                                                    }
                                                    stats.forEach(function (report) {
                                                        if (report.type === 'inbound-rtp') {
                                                            foundInbound_1 = true;
                                                        }
                                                    });
                                                    if (!foundInbound_1) {
                                                        throw new Error('Missing inbound-rtp stats');
                                                    }
                                                    clearTimeout(timeout);
                                                    pc.close();
                                                    resolve();
                                                    return [3 /*break*/, 3];
                                                case 2:
                                                    error_2 = _a.sent();
                                                    clearTimeout(timeout);
                                                    reject(error_2);
                                                    return [3 /*break*/, 3];
                                                case 3: return [2 /*return*/];
                                            }
                                        });
                                    }); };
                                    dc.onerror = function (error) {
                                        clearTimeout(timeout);
                                        reject(new Error("Data channel error: ".concat(error)));
                                    };
                                })];
                        });
                    }); })];
            });
        });
    };
    /**
     * Test 9: Multiple Connections
     * Verifies multiple simultaneous peer connections work
     */
    E2ETestingService.prototype.testMultipleConnections = function () {
        return __awaiter(this, arguments, void 0, function (count) {
            var _this = this;
            if (count === void 0) { count = 3; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.runTest(TestCategory.CONNECTIVITY, "Multiple Connections (".concat(count, " peers)"), function () { return __awaiter(_this, void 0, void 0, function () {
                        var connections, allConnected;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, Promise.allSettled(Array.from({ length: count }).map(function () { return __awaiter(_this, void 0, void 0, function () {
                                        var pc, dc;
                                        return __generator(this, function (_a) {
                                            pc = new RTCPeerConnection({
                                                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
                                            });
                                            dc = pc.createDataChannel('multi-test');
                                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                                    var timeout = setTimeout(function () {
                                                        pc.close();
                                                        reject(new Error('Connection timeout'));
                                                    }, 3000);
                                                    dc.onopen = function () {
                                                        clearTimeout(timeout);
                                                        pc.close();
                                                        resolve();
                                                    };
                                                    dc.onerror = function (error) {
                                                        clearTimeout(timeout);
                                                        reject(new Error("Connection error: ".concat(error)));
                                                    };
                                                })];
                                        });
                                    }); }))];
                                case 1:
                                    connections = _a.sent();
                                    allConnected = connections.every(function (r) { return r.status === 'fulfilled'; });
                                    if (!allConnected) {
                                        throw new Error("Only ".concat(connections.filter(function (r) { return r.status === 'fulfilled'; }).length, "/").concat(count, " connections succeeded"));
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Test 10: NAT Type Detection
     * Attempts to determine NAT type
     */
    E2ETestingService.prototype.testNATTypeDetection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.runTest(TestCategory.NAT, 'NAT Type Detection', function () { return __awaiter(_this, void 0, void 0, function () {
                        var pc;
                        return __generator(this, function (_a) {
                            pc = new RTCPeerConnection({
                                iceServers: [
                                    { urls: 'stun:stun.l.google.com:19302' },
                                    { urls: 'stun:stun1.l.google.com:19302' },
                                ],
                            });
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var timeout = setTimeout(function () {
                                        pc.close();
                                        reject(new Error('NAT detection timeout'));
                                    }, 5000);
                                    var candidateTypes = new Set();
                                    pc.onicecandidate = function (event) {
                                        if (event.candidate) {
                                            var candidate = event.candidate.candidate;
                                            if (candidate.includes('srflx')) {
                                                candidateTypes.add('srflx');
                                            }
                                            else if (candidate.includes('prflx')) {
                                                candidateTypes.add('prflx');
                                            }
                                            else if (candidate.includes('host')) {
                                                candidateTypes.add('host');
                                            }
                                            else if (candidate.includes('relay')) {
                                                candidateTypes.add('relay');
                                            }
                                        }
                                    };
                                    pc.onicecandidate = function () {
                                        // Empty handler to continue gathering
                                    };
                                    setTimeout(function () {
                                        if (candidateTypes.size > 0) {
                                            clearTimeout(timeout);
                                            pc.close();
                                            resolve();
                                        }
                                    }, 2000);
                                    pc.createDataChannel('nat-test');
                                })];
                        });
                    }); })];
            });
        });
    };
    /**
     * Run full test suite
     */
    E2ETestingService.prototype.runFullTestSuite = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.startTestSession();
                        console.log('🧪 Starting full E2E test suite...\n');
                        // Connectivity tests
                        return [4 /*yield*/, this.testWebRTCConnectivity()];
                    case 1:
                        // Connectivity tests
                        _a.sent();
                        return [4 /*yield*/, this.testDataChannelCommunication()];
                    case 2:
                        _a.sent();
                        // NAT & Network tests
                        return [4 /*yield*/, this.testSTUNReachability()];
                    case 3:
                        // NAT & Network tests
                        _a.sent();
                        return [4 /*yield*/, this.testICECandidateGathering()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.testNATTypeDetection()];
                    case 5:
                        _a.sent();
                        // Media & Codec tests
                        return [4 /*yield*/, this.testMediaCapabilities()];
                    case 6:
                        // Media & Codec tests
                        _a.sent();
                        return [4 /*yield*/, this.testAudioCodecNegotiation()];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.testVideoCodecNegotiation()];
                    case 8:
                        _a.sent();
                        // Advanced tests
                        return [4 /*yield*/, this.testConnectionMetrics()];
                    case 9:
                        // Advanced tests
                        _a.sent();
                        return [4 /*yield*/, this.testMultipleConnections(3)];
                    case 10:
                        _a.sent();
                        return [2 /*return*/, this.finishTestSession()];
                }
            });
        });
    };
    /**
     * Run quick connectivity only
     */
    E2ETestingService.prototype.runQuickTest = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.startTestSession();
                        console.log('🧪 Starting quick test suite...\n');
                        return [4 /*yield*/, this.testWebRTCConnectivity()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.testSTUNReachability()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.testMediaCapabilities()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.finishTestSession()];
                }
            });
        });
    };
    /**
     * Finish test session and calculate stats
     */
    E2ETestingService.prototype.finishTestSession = function () {
        if (!this.currentReport) {
            throw new Error('No active test session');
        }
        this.currentReport.endTime = Date.now();
        this.currentReport.successRate =
            this.currentReport.totalTests > 0
                ? (this.currentReport.passed / this.currentReport.totalTests) * 100
                : 0;
        var totalDuration = this.currentReport.results.reduce(function (sum, r) { return sum + r.duration; }, 0);
        this.currentReport.averageDuration =
            this.currentReport.results.length > 0
                ? totalDuration / this.currentReport.results.length
                : 0;
        console.log('\n📊 Test Results Summary:');
        console.log("Total Tests: ".concat(this.currentReport.totalTests));
        console.log("\u2705 Passed: ".concat(this.currentReport.passed));
        console.log("\u274C Failed: ".concat(this.currentReport.failed));
        console.log("\u23ED\uFE0F  Skipped: ".concat(this.currentReport.skipped));
        console.log("\uD83D\uDCC8 Success Rate: ".concat(this.currentReport.successRate.toFixed(1), "%"));
        console.log("\u23F1\uFE0F  Average Duration: ".concat(this.currentReport.averageDuration.toFixed(0), "ms\n"));
        return this.currentReport;
    };
    /**
     * Get current test report
     */
    E2ETestingService.prototype.getCurrentReport = function () {
        return this.currentReport;
    };
    /**
     * Get test result by ID
     */
    E2ETestingService.prototype.getTestResult = function (testId) {
        return this.testResults.get(testId);
    };
    /**
     * Get all test results
     */
    E2ETestingService.prototype.getAllTestResults = function () {
        return Array.from(this.testResults.values());
    };
    /**
     * Register handler for test completion
     */
    E2ETestingService.prototype.onTestComplete = function (handler) {
        var _this = this;
        var id = "handler-".concat(Date.now());
        this.testHandlers.set(id, handler);
        return function () {
            _this.testHandlers.delete(id);
        };
    };
    /**
     * Notify all handlers of test completion
     */
    E2ETestingService.prototype.notifyTestComplete = function (result) {
        this.testHandlers.forEach(function (handler) {
            try {
                handler(result);
            }
            catch (error) {
                console.error('Test handler error:', error);
            }
        });
    };
    /**
     * Export test report as JSON
     */
    E2ETestingService.prototype.exportReportAsJSON = function (report) {
        return JSON.stringify(report, null, 2);
    };
    /**
     * Export test report as text
     */
    E2ETestingService.prototype.exportReportAsText = function (report) {
        var text = "Project Aegis - E2E Test Report\n";
        text += "Session: ".concat(report.sessionId, "\n");
        text += "Date: ".concat(new Date(report.startTime).toISOString(), "\n");
        text += "Duration: ".concat(report.endTime ? (report.endTime - report.startTime) / 1000 : 'N/A', "s\n\n");
        text += "Summary:\n";
        text += "- Total: ".concat(report.totalTests, "\n");
        text += "- Passed: ".concat(report.passed, "\n");
        text += "- Failed: ".concat(report.failed, "\n");
        text += "- Skipped: ".concat(report.skipped, "\n");
        text += "- Success Rate: ".concat(report.successRate.toFixed(1), "%\n");
        text += "- Average Duration: ".concat(report.averageDuration.toFixed(0), "ms\n\n");
        text += "Test Results:\n";
        report.results.forEach(function (result) {
            var statusEmoji = result.status === TestStatus.PASSED ? '✅' : '❌';
            text += "".concat(statusEmoji, " ").concat(result.name, " (").concat(result.category, "): ").concat(result.status, " in ").concat(result.duration, "ms\n");
            if (result.error) {
                text += "   Error: ".concat(result.error, "\n");
            }
            if (result.details) {
                text += "   Details: ".concat(result.details, "\n");
            }
        });
        return text;
    };
    /**
     * Clear all test results
     */
    E2ETestingService.prototype.clearResults = function () {
        this.testResults.clear();
        this.currentReport = null;
    };
    return E2ETestingService;
}());
exports.default = new E2ETestingService();
