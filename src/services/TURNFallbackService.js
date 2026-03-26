"use strict";
/**
 * Project Aegis - TURN Fallback Service
 * Implements fallback TURN servers for strict NAT environments
 * Uses community-run free TURN servers to maintain $0 infrastructure cost
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
exports.TURNFallbackService = void 0;
/**
 * TURN Fallback Service
 * Manages fallback TURN servers for peers behind restrictive NAT
 */
var TURNFallbackService = /** @class */ (function () {
    function TURNFallbackService() {
        // Community-run free TURN servers (Open Relay Project style)
        // These are public relays that don't require credentials
        this.freeTURNServers = [
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
        this.connectionHistory = [];
        this.maxHistorySize = 100;
        // State tracking
        this.isEnabled = false;
        this.forceTURN = false; // Force TURN even if direct P2P is available
        this.connectionTestTimeout = 5000; // 5 seconds
    }
    /**
     * Initialize the TURN fallback service
     */
    TURNFallbackService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.isEnabled = true;
                console.log('🔄 TURN Fallback Service initialized');
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get RTCConfiguration with TURN servers for WebRTC
     * Returns array of ICE servers (STUN only for direct P2P, with TURN fallback)
     */
    TURNFallbackService.prototype.getICEServers = function () {
        var servers = [];
        // Always include STUN first (preferred for direct P2P)
        servers.push({
            urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
        });
        // Add TURN servers as fallback if enabled
        if (this.isEnabled) {
            for (var _i = 0, _a = this.freeTURNServers; _i < _a.length; _i++) {
                var turnServer = _a[_i];
                servers.push({
                    urls: turnServer.urls,
                    username: turnServer.username,
                    credential: turnServer.credential,
                });
            }
        }
        return servers;
    };
    /**
     * Test direct P2P connectivity via STUN
     * Returns true if direct connection is possible
     */
    TURNFallbackService.prototype.testDirectConnectivity = function () {
        return __awaiter(this, void 0, void 0, function () {
            var peerConnection_1, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        peerConnection_1 = new RTCPeerConnection({
                            iceServers: [
                                {
                                    urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
                                },
                            ],
                        });
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var timeout = setTimeout(function () {
                                    peerConnection_1.close();
                                    resolve(false); // Timeout = no direct connectivity
                                }, _this.connectionTestTimeout);
                                peerConnection_1.onicecandidate = function (event) {
                                    if (event.candidate) {
                                        var candidate = event.candidate.candidate;
                                        // If we get a host or srflx candidate, direct connectivity is possible
                                        if (candidate.includes('host') || candidate.includes('srflx')) {
                                            clearTimeout(timeout);
                                            peerConnection_1.close();
                                            resolve(true);
                                        }
                                    }
                                    else {
                                        // End of candidates
                                        clearTimeout(timeout);
                                        peerConnection_1.close();
                                        resolve(true); // If we got any candidates, assume connectivity
                                    }
                                };
                                peerConnection_1.onicegatheringstatechange = function () {
                                    if (peerConnection_1.iceGatheringState === 'complete') {
                                        clearTimeout(timeout);
                                        peerConnection_1.close();
                                        resolve(true);
                                    }
                                };
                                peerConnection_1.createDataChannel('test');
                                peerConnection_1.createOffer().then(function (offer) {
                                    peerConnection_1.setLocalDescription(offer);
                                });
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Direct connectivity test failed:', error_1);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test TURN server connectivity
     * Returns true if at least one TURN server is reachable
     */
    TURNFallbackService.prototype.testTURNConnectivity = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, _i, _a, turnServer, state_1, error_2;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        _loop_1 = function (turnServer) {
                            var peerConnection_2, connected, error_3;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _c.trys.push([0, 2, , 3]);
                                        peerConnection_2 = new RTCPeerConnection({
                                            iceServers: [
                                                {
                                                    urls: turnServer.urls,
                                                    username: turnServer.username,
                                                    credential: turnServer.credential,
                                                },
                                            ],
                                        });
                                        return [4 /*yield*/, new Promise(function (resolve) {
                                                var timeout = setTimeout(function () {
                                                    peerConnection_2.close();
                                                    resolve(false);
                                                }, _this.connectionTestTimeout);
                                                peerConnection_2.onicecandidate = function (event) {
                                                    if (event.candidate) {
                                                        var candidate = event.candidate.candidate;
                                                        // If we get a relay candidate, TURN is working
                                                        if (candidate.includes('relay')) {
                                                            clearTimeout(timeout);
                                                            peerConnection_2.close();
                                                            resolve(true);
                                                        }
                                                    }
                                                };
                                                peerConnection_2.createDataChannel('test');
                                                peerConnection_2.createOffer().then(function (offer) {
                                                    peerConnection_2.setLocalDescription(offer);
                                                });
                                            })];
                                    case 1:
                                        connected = _c.sent();
                                        if (connected) {
                                            console.log("\u2705 TURN server working: ".concat(turnServer.urls[0]));
                                            return [2 /*return*/, { value: true }];
                                        }
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_3 = _c.sent();
                                        console.warn("TURN test failed for ".concat(turnServer.urls[0], ":"), error_3);
                                        return [2 /*return*/, "continue"];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, _a = this.freeTURNServers;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        turnServer = _a[_i];
                        return [5 /*yield**/, _loop_1(turnServer)];
                    case 2:
                        state_1 = _b.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, false];
                    case 5:
                        error_2 = _b.sent();
                        console.error('TURN connectivity test failed:', error_2);
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Determine if TURN fallback should be used
     * Returns true if direct P2P appears unavailable or unreliable
     */
    TURNFallbackService.prototype.shouldUseTURN = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stats, directOk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // If forceTURN is set, always use TURN
                        if (this.forceTURN) {
                            return [2 /*return*/, true];
                        }
                        stats = this.getConnectionStats();
                        if (stats.totalAttempts > 10) {
                            // If success rate is below 50%, use TURN
                            if (stats.successRate < 0.5) {
                                console.log("\uD83D\uDCCA Low success rate (".concat((stats.successRate * 100).toFixed(1), "%) - switching to TURN"));
                                return [2 /*return*/, true];
                            }
                            // If direct P2P has low success rate but TURN is better, use TURN
                            if (stats.successRate < 0.8 && stats.turnSuccessRate > 0.8) {
                                console.log("\uD83D\uDCCA TURN more reliable - switching (Direct: ".concat((stats.successRate * 100).toFixed(1), "%, TURN: ").concat((stats.turnSuccessRate * 100).toFixed(1), "%)"));
                                return [2 /*return*/, true];
                            }
                        }
                        return [4 /*yield*/, this.testDirectConnectivity()];
                    case 1:
                        directOk = _a.sent();
                        if (!directOk) {
                            console.log('🔴 Direct connectivity test failed - falling back to TURN');
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Record a connection attempt in history
     */
    TURNFallbackService.prototype.recordConnectionAttempt = function (usedTURN, success, latency) {
        this.connectionHistory.push({
            timestamp: Date.now(),
            usedTURN: usedTURN,
            success: success,
            latency: latency,
        });
        // Keep history size bounded
        if (this.connectionHistory.length > this.maxHistorySize) {
            this.connectionHistory = this.connectionHistory.slice(-this.maxHistorySize);
        }
    };
    /**
     * Get connection statistics
     */
    TURNFallbackService.prototype.getConnectionStats = function () {
        var total = this.connectionHistory.length;
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
        var successful = this.connectionHistory.filter(function (a) { return a.success; }).length;
        var turnAttempts = this.connectionHistory.filter(function (a) { return a.usedTURN; }).length;
        var turnSuccessful = this.connectionHistory.filter(function (a) { return a.usedTURN && a.success; }).length;
        var totalLatency = this.connectionHistory.reduce(function (sum, a) { return sum + a.latency; }, 0);
        return {
            totalAttempts: total,
            successfulAttempts: successful,
            turnAttempts: turnAttempts,
            turnSuccessful: turnSuccessful,
            successRate: successful / total,
            turnSuccessRate: turnAttempts > 0 ? turnSuccessful / turnAttempts : 1.0,
            averageLatency: totalLatency / total,
        };
    };
    /**
     * Force TURN usage (for testing or extreme NAT situations)
     */
    TURNFallbackService.prototype.forceTURNMode = function (force) {
        this.forceTURN = force;
        if (force) {
            console.log('🔴 TURN mode forced - all connections will use TURN relay');
        }
        else {
            console.log('🟢 TURN mode automatic - will use direct P2P when possible');
        }
    };
    /**
     * Check if TURN mode is forced
     */
    TURNFallbackService.prototype.isTURNForced = function () {
        return this.forceTURN;
    };
    /**
     * Get recommendations based on connection stats
     */
    TURNFallbackService.prototype.getRecommendations = function () {
        var recommendations = [];
        var stats = this.getConnectionStats();
        if (stats.totalAttempts === 0) {
            recommendations.push('✅ No connection issues detected yet');
            return recommendations;
        }
        if (stats.successRate < 0.5) {
            recommendations.push('⚠️ Connection reliability is poor - try enabling AlwaysOnline mode');
            recommendations.push('💡 Consider forcing TURN relay for better connectivity');
        }
        else if (stats.successRate < 0.8) {
            recommendations.push('⚠️ Connection could be improved - check network conditions');
        }
        else {
            recommendations.push('✅ Connection quality is good');
        }
        if (stats.averageLatency > 5000) {
            recommendations.push('🐌 High latency detected - video/audio quality may be degraded');
        }
        else if (stats.averageLatency > 2000) {
            recommendations.push('⚠️ Moderate latency - consider moving closer to router');
        }
        if (stats.turnSuccessRate > 0.9 && stats.successRate < 0.8) {
            recommendations.push('💡 TURN relay is more reliable - consider enabling it');
        }
        return recommendations;
    };
    /**
     * Clear connection history
     */
    TURNFallbackService.prototype.clearHistory = function () {
        this.connectionHistory = [];
        console.log('📊 Connection history cleared');
    };
    /**
     * Disable TURN fallback
     */
    TURNFallbackService.prototype.disable = function () {
        this.isEnabled = false;
        console.log('❌ TURN Fallback Service disabled');
    };
    /**
     * Enable TURN fallback
     */
    TURNFallbackService.prototype.enable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.isEnabled = true;
                console.log('✅ TURN Fallback Service enabled');
                return [2 /*return*/];
            });
        });
    };
    return TURNFallbackService;
}());
exports.TURNFallbackService = TURNFallbackService;
exports.default = new TURNFallbackService();
