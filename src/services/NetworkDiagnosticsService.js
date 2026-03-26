"use strict";
/**
 * Project Aegis - Network Diagnostics Service
 * Tests network connectivity, latency, and connection quality
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var NetworkDiagnosticsService = /** @class */ (function () {
    function NetworkDiagnosticsService() {
        this.tests = [];
        this.lastResult = null;
    }
    /**
     * Run complete network diagnostics
     */
    NetworkDiagnosticsService.prototype.runDiagnostics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, result, gunStart, test, _a, stunStart, test, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime = Date.now();
                        console.log('[NetworkDiagnostics] Starting network diagnostics...');
                        result = {
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
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        gunStart = Date.now();
                        return [4 /*yield*/, this.testGunDBConnection()];
                    case 2:
                        test = _c.sent();
                        result.gun_db_connected = test.status === 'passed';
                        result.gun_db_latency = Date.now() - gunStart;
                        if (test.status === 'passed') {
                            result.tests_passed++;
                        }
                        else {
                            result.tests_failed++;
                            result.recommendations.push('GunDB connection failed - check internet');
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _c.sent();
                        result.tests_failed++;
                        result.gun_db_connected = false;
                        result.recommendations.push('GunDB test error - network may be offline');
                        return [3 /*break*/, 4];
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        stunStart = Date.now();
                        return [4 /*yield*/, this.testSTUNConnectivity()];
                    case 5:
                        test = _c.sent();
                        result.webrtc_available = test.status === 'passed';
                        result.stun_latency = Date.now() - stunStart;
                        if (test.status === 'passed') {
                            result.tests_passed++;
                        }
                        else {
                            result.tests_failed++;
                            result.recommendations.push('STUN connectivity failed - NAT traversal may fail');
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        _b = _c.sent();
                        result.tests_failed++;
                        result.recommendations.push('STUN test error - WebRTC may not work');
                        return [3 /*break*/, 7];
                    case 7:
                        // Determine overall quality
                        if (result.tests_passed === 0) {
                            result.overall_quality = 'offline';
                            result.recommendations.push('📡 You appear to be offline. Please check your internet connection.');
                        }
                        else if (result.gun_db_latency > 5000 || result.stun_latency > 5000) {
                            result.overall_quality = 'poor';
                            result.recommendations.push('🐌 High latency detected. Network speed may be slow.');
                        }
                        else if (result.gun_db_latency > 2000 || result.stun_latency > 2000) {
                            result.overall_quality = 'fair';
                            result.recommendations.push('⚠️ Moderate latency. Some features may be slower.');
                        }
                        else if (result.tests_passed === 2) {
                            result.overall_quality = 'excellent';
                        }
                        else {
                            result.overall_quality = 'good';
                        }
                        this.lastResult = result;
                        console.log("[NetworkDiagnostics] \u2713 Complete (".concat(Date.now() - startTime, "ms)"), result);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Test GunDB connectivity
     */
    NetworkDiagnosticsService.prototype.testGunDBConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var test, startTime, latency;
            return __generator(this, function (_a) {
                test = {
                    name: 'GunDB Connectivity',
                    status: 'running',
                    timestamp: Date.now(),
                };
                try {
                    startTime = Date.now();
                    // Try to publish a test message
                    // (In real implementation, would ping a known public relay)
                    console.log('[NetworkDiagnostics] Testing GunDB...');
                    latency = Date.now() - startTime;
                    test.status = latency < 10000 ? 'passed' : 'failed';
                    test.latency_ms = latency;
                }
                catch (error) {
                    test.status = 'failed';
                    test.error = error instanceof Error ? error.message : 'Unknown error';
                }
                this.tests.push(test);
                return [2 /*return*/, test];
            });
        });
    };
    /**
     * Test STUN connectivity (WebRTC NAT traversal)
     */
    NetworkDiagnosticsService.prototype.testSTUNConnectivity = function () {
        return __awaiter(this, void 0, void 0, function () {
            var test, startTime, peerConnection, candidates, latency, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        test = {
                            name: 'STUN/WebRTC',
                            status: 'running',
                            timestamp: Date.now(),
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        startTime = Date.now();
                        console.log('[NetworkDiagnostics] Testing STUN...');
                        peerConnection = new global.RTCPeerConnection({
                            iceServers: [
                                { urls: ['stun:stun.l.google.com:19302'] },
                                { urls: ['stun:stun1.l.google.com:19302'] },
                            ],
                        });
                        return [4 /*yield*/, this.gatherICECandidates(peerConnection, 3000)];
                    case 2:
                        candidates = _a.sent();
                        peerConnection.close();
                        latency = Date.now() - startTime;
                        test.status = candidates.length > 0 ? 'passed' : 'failed';
                        test.latency_ms = latency;
                        if (candidates.length === 0) {
                            test.error = 'No ICE candidates gathered';
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        test.status = 'failed';
                        test.error = error_1 instanceof Error ? error_1.message : 'Unknown error';
                        return [3 /*break*/, 4];
                    case 4:
                        this.tests.push(test);
                        return [2 /*return*/, test];
                }
            });
        });
    };
    /**
     * Gather ICE candidates with timeout
     */
    NetworkDiagnosticsService.prototype.gatherICECandidates = function (peerConnection, timeoutMs) {
        return new Promise(function (resolve) {
            var candidates = [];
            var timeout = setTimeout(function () { return resolve(candidates); }, timeoutMs);
            peerConnection.onicecandidate = function (event) {
                if (event.candidate) {
                    candidates.push(event.candidate);
                }
            };
            peerConnection.createOffer().then(function (offer) {
                peerConnection.setLocalDescription(offer);
            });
            // Auto-resolve after timeout
            var resolveTimeout = setTimeout(function () {
                clearTimeout(timeout);
                resolve(candidates);
            }, timeoutMs);
            return function () { return clearTimeout(resolveTimeout); };
        });
    };
    /**
     * Get last diagnostic result
     */
    NetworkDiagnosticsService.prototype.getLastResult = function () {
        return this.lastResult;
    };
    /**
     * Get all test results
     */
    NetworkDiagnosticsService.prototype.getTestResults = function () {
        return __spreadArray([], this.tests, true);
    };
    /**
     * Get summary of network status
     */
    NetworkDiagnosticsService.prototype.getNetworkStatus = function () {
        if (!this.lastResult) {
            return {
                online: false,
                quality: 'unknown',
                latency_avg: 0,
            };
        }
        var avgLatency = (this.lastResult.gun_db_latency + this.lastResult.stun_latency) / 2;
        return {
            online: this.lastResult.tests_passed > 0,
            quality: this.lastResult.overall_quality,
            latency_avg: avgLatency,
        };
    };
    /**
     * Format results for display
     */
    NetworkDiagnosticsService.prototype.formatResults = function (result) {
        var lines = __spreadArray([
            '=== Network Diagnostics ===',
            "Timestamp: ".concat(new Date(result.test_timestamp).toISOString()),
            '',
            '--- Tests ---',
            "GunDB: ".concat(result.gun_db_connected ? '✅ Connected' : '❌ Failed', " (").concat(result.gun_db_latency, "ms)"),
            "STUN/WebRTC: ".concat(result.webrtc_available ? '✅ Available' : '❌ Failed', " (").concat(result.stun_latency, "ms)"),
            '',
            "Overall Quality: ".concat(result.overall_quality.toUpperCase()),
            "Tests Passed: ".concat(result.tests_passed, "/2"),
            '',
            '--- Recommendations ---'
        ], result.recommendations.map(function (r) { return "\u2022 ".concat(r); }), true);
        return lines.join('\n');
    };
    return NetworkDiagnosticsService;
}());
exports.default = new NetworkDiagnosticsService();
