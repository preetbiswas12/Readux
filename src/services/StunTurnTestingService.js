"use strict";
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.StunTurnTestingService = void 0;
var StunTurnServers_1 = require("../config/StunTurnServers");
var StunTurnTestingService = /** @class */ (function () {
    function StunTurnTestingService() {
        this.results = [];
        this.isTestingComplete = false;
    }
    /**
     * Test a single STUN server
     * Simulates WebRTC candidate gathering
     */
    StunTurnTestingService.prototype.testStunServer = function (stunUrl, provider, tier) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, peerConnection_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        peerConnection_1 = new RTCPeerConnection({
                            iceServers: [{ urls: [stunUrl] }],
                            bundlePolicy: 'max-bundle',
                        });
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var foundCandidate = false;
                                var publicIp;
                                var candidateType = 'none';
                                var bestLatency = Infinity;
                                var timeout = setTimeout(function () {
                                    peerConnection_1.close();
                                    resolve({
                                        server: stunUrl,
                                        provider: provider,
                                        tier: tier,
                                        latency: foundCandidate ? Date.now() - startTime : null,
                                        success: foundCandidate,
                                        candidateType: candidateType,
                                        error: !foundCandidate ? 'Timeout - no candidates gathered' : undefined,
                                    });
                                }, 8000); // 8 second timeout to allow ICE gathering
                                peerConnection_1.onicecandidate = function (event) {
                                    if (event.candidate) {
                                        var candidate = event.candidate.candidate;
                                        var latency = Date.now() - startTime;
                                        // Parse candidate
                                        if (candidate.includes('host')) {
                                            candidateType = 'host';
                                        }
                                        else if (candidate.includes('srflx')) {
                                            candidateType = 'srflx';
                                            foundCandidate = true;
                                            // Extract public IP
                                            var match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
                                            if (match) {
                                                publicIp = match[0];
                                            }
                                            if (latency < bestLatency) {
                                                bestLatency = latency;
                                            }
                                        }
                                        else if (candidate.includes('relay')) {
                                            candidateType = 'relay';
                                            foundCandidate = true;
                                        }
                                        console.log("[".concat(provider, "] ").concat(candidateType, ": ").concat(candidate.substring(0, 100)));
                                    }
                                    else if (!foundCandidate && event === null) {
                                        // End of candidates without finding anything
                                    }
                                };
                                peerConnection_1.onicegatheringstatechange = function () {
                                    if (peerConnection_1.iceGatheringState === 'complete') {
                                        var latency = Date.now() - startTime;
                                        clearTimeout(timeout);
                                        peerConnection_1.close();
                                        resolve({
                                            server: stunUrl,
                                            provider: provider,
                                            tier: tier,
                                            latency: foundCandidate ? latency : null,
                                            success: foundCandidate,
                                            candidateType: candidateType,
                                            publicIp: publicIp,
                                        });
                                    }
                                };
                                // Trigger ICE gathering
                                peerConnection_1.createDataChannel('test');
                                peerConnection_1.createOffer().then(function (offer) {
                                    peerConnection_1.setLocalDescription(offer);
                                });
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, {
                                server: stunUrl,
                                provider: provider,
                                tier: tier,
                                latency: null,
                                success: false,
                                candidateType: 'none',
                                error: String(error_1),
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test all primary STUN servers (fast)
     */
    StunTurnTestingService.prototype.testPrimaryStunServers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, _a, server, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('🏃 Testing Primary STUN servers...');
                        results = [];
                        _i = 0, _a = StunTurnServers_1.STUN_SERVERS_BY_TIER.primary;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        server = _a[_i];
                        return [4 /*yield*/, this.testStunServer(server.url, server.provider, 'primary')];
                    case 2:
                        result = _b.sent();
                        results.push(result);
                        console.log("  ".concat(result.success ? '✅' : '❌', " ").concat(server.provider, ": ").concat(result.candidateType, " (").concat(result.latency, "ms)"));
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Test all STUN servers (comprehensive, takes time)
     */
    StunTurnTestingService.prototype.testAllStunServers = function (progressCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var results, total, i, server, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDD0D Testing all ".concat(StunTurnServers_1.ALL_STUN_SERVERS.length, " STUN servers (this takes 5+ minutes)..."));
                        results = [];
                        total = StunTurnServers_1.ALL_STUN_SERVERS.length;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < StunTurnServers_1.ALL_STUN_SERVERS.length)) return [3 /*break*/, 4];
                        server = StunTurnServers_1.ALL_STUN_SERVERS[i];
                        return [4 /*yield*/, this.testStunServer(server.url, server.provider, server.tier)];
                    case 2:
                        result = _a.sent();
                        results.push(result);
                        if (progressCallback) {
                            progressCallback(i + 1, total);
                        }
                        if (result.success) {
                            console.log("  \u2705 [".concat(server.tier, "] ").concat(server.provider, ": ").concat(result.candidateType, " (").concat(result.latency, "ms)"));
                        }
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.results = results;
                        this.isTestingComplete = true;
                        return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Get summary statistics
     */
    StunTurnTestingService.prototype.getSummary = function () {
        var totalTests = this.results.length;
        var successful = this.results.filter(function (r) { return r.success; });
        // By tier
        var byTier = new Map();
        for (var _i = 0, _a = this.results; _i < _a.length; _i++) {
            var result = _a[_i];
            var key = result.tier;
            if (!byTier.has(key)) {
                byTier.set(key, { success: 0, total: 0 });
            }
            var stats = byTier.get(key);
            stats.total++;
            if (result.success)
                stats.success++;
        }
        // By provider
        var byProvider = new Map();
        for (var _b = 0, _c = this.results; _b < _c.length; _b++) {
            var result = _c[_b];
            var key = result.provider;
            if (!byProvider.has(key)) {
                byProvider.set(key, { success: 0, total: 0 });
            }
            var stats = byProvider.get(key);
            stats.total++;
            if (result.success)
                stats.success++;
        }
        var tierStats = Array.from(byTier.entries()).map(function (_a) {
            var tier = _a[0], stats = _a[1];
            return (__assign(__assign({ tier: tier }, stats), { successRate: stats.success / stats.total }));
        });
        var providerStats = Array.from(byProvider.entries()).map(function (_a) {
            var provider = _a[0], stats = _a[1];
            return (__assign(__assign({ provider: provider }, stats), { successRate: stats.success / stats.total }));
        });
        // Sort by latency
        var successfulWithLatency = successful.filter(function (r) { return r.latency !== null; });
        var fastest = __spreadArray([], successfulWithLatency, true).sort(function (a, b) { return (a.latency || 999999) - (b.latency || 999999); }).slice(0, 5);
        var slowest = __spreadArray([], successfulWithLatency, true).sort(function (a, b) { return (b.latency || 0) - (a.latency || 0); }).slice(0, 5);
        return {
            totalTested: totalTests,
            successRate: totalTests > 0 ? successful.length / totalTests : 0,
            byTier: tierStats,
            byProvider: providerStats.sort(function (a, b) { return b.successRate - a.successRate; }),
            fastestServers: fastest,
            slowestServers: slowest,
        };
    };
    /**
     * Get formatted report
     */
    StunTurnTestingService.prototype.generateReport = function () {
        if (this.results.length === 0) {
            return 'No tests run yet';
        }
        var summary = this.getSummary();
        var report = "\nSTUN/TURN Server Testing Report\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\nOverall Results:\n  \u2022 Total Servers Tested: ".concat(summary.totalTested, "\n  \u2022 Success Rate: ").concat((summary.successRate * 100).toFixed(1), "%\n  \u2022 Working Servers: ").concat(this.results.filter(function (r) { return r.success; }).length, "\n\nSuccess Rate by Tier:\n").concat(summary.byTier.map(function (t) { return "  \u2022 ".concat(t.tier, ": ").concat((t.successRate * 100).toFixed(1), "% (").concat(t.success, "/").concat(t.total, ")"); }).join('\n'), "\n\nSuccess Rate by Provider:\n").concat(summary.byProvider
            .slice(0, 10)
            .map(function (p) { return "  \u2022 ".concat(p.provider, ": ").concat((p.successRate * 100).toFixed(1), "% (").concat(p.success, "/").concat(p.total, ")"); })
            .join('\n'), "\n\nFastest Servers (lowest latency):\n").concat(summary.fastestServers
            .map(function (s) { return "  \u2022 ".concat(s.provider, " (").concat(s.tier, "): ").concat(s.latency, "ms - ").concat(s.candidateType, " - ").concat(s.server); })
            .join('\n'), "\n\nSlowest Servers (highest latency):\n").concat(summary.slowestServers
            .map(function (s) { return "  \u2022 ".concat(s.provider, " (").concat(s.tier, "): ").concat(s.latency, "ms - ").concat(s.candidateType, " - ").concat(s.server); })
            .join('\n'), "\n\nRecommendations:\n").concat(this.getRecommendations(), "\n    ");
        return report;
    };
    /**
     * Get optimization recommendations
     */
    StunTurnTestingService.prototype.getRecommendations = function () {
        var summary = this.getSummary();
        var recommendations = [];
        if (summary.successRate > 0.95) {
            recommendations.push('✅ Excellent connectivity: Primary tier servers work great');
        }
        else if (summary.successRate > 0.7) {
            recommendations.push('⚠️ Good connectivity: Consider using secondary tier servers as fallback');
        }
        else {
            recommendations.push('🔴 Poor connectivity: TURN relay recommended, use fallback tier servers');
        }
        var primaryStats = summary.byTier.find(function (t) { return t.tier === 'primary'; });
        if (primaryStats && primaryStats.successRate < 0.5) {
            recommendations.push('💡 Primary servers unreliable: Force usage of secondary/fallback in your region');
        }
        var fastestServer = summary.fastestServers[0];
        if (fastestServer) {
            recommendations.push("\u26A1 Best server for you: ".concat(fastestServer.provider, " (").concat(fastestServer.latency, "ms)"));
        }
        // Provider recommendations
        var bestProvider = summary.byProvider[0];
        if (bestProvider && bestProvider.successRate > 0.8) {
            recommendations.push("\uD83C\uDF0D Most reliable provider in your region: ".concat(bestProvider.provider));
        }
        return recommendations.map(function (r) { return "  \u2022 ".concat(r); }).join('\n');
    };
    /**
     * Export results as JSON for analysis
     */
    StunTurnTestingService.prototype.exportAsJSON = function () {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: this.getSummary(),
            detailed: this.results,
        }, null, 2);
    };
    return StunTurnTestingService;
}());
exports.StunTurnTestingService = StunTurnTestingService;
exports.default = new StunTurnTestingService();
