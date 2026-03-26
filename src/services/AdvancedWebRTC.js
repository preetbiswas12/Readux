"use strict";
/**
 * WebRTC + ICE Framework Integration Layer
 * Extends WebRTCService with:
 * - Trickle ICE for faster connections
 * - CG-NAT mitigation
 * - IPv6 support
 * - Advanced candidate selection
 *
 * Usage:
 * const iceConnection = await AdvancedWebRTC.createICEConnection(peerAlias, isInitiator);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedWebRTC = void 0;
var ICEFramework_1 = require("./ICEFramework");
var TrickleICESignaling_1 = require("./TrickleICESignaling");
var CGNATMitigation_1 = require("./CGNATMitigation");
var TURNFallbackService_1 = __importDefault(require("./TURNFallbackService"));
var DEFAULT_CONFIG = {
    trickleICEEnabled: true,
    ipv6Enabled: true,
    cgnatMitigationEnabled: true,
    candidateBatchSize: 5, // Send every 5 candidates
    candidateBatchTimeoutMs: 500, // Or every 500ms
    maxConnectionTimeSeconds: 30,
};
var AdvancedWebRTCImpl = /** @class */ (function () {
    function AdvancedWebRTCImpl() {
        this.config = DEFAULT_CONFIG;
        this.iceConnections = new Map();
        this.peerConnections = new Map();
        this.candidateBatches = new Map();
        this.batchTimers = new Map();
    }
    /**
     * Initialize Framework
     * OPTIMIZED FOR JIO ISP: IPv6-first configuration
     */
    AdvancedWebRTCImpl.prototype.initialize = function () {
        return __awaiter(this, arguments, void 0, function (config) {
            var recommendedStrategy;
            if (config === void 0) { config = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.config = __assign(__assign({}, DEFAULT_CONFIG), config);
                        console.log("\n\uD83D\uDE80 [AdvancedWebRTC] Initializing for JIO ISP (IPv6-Priority):\n      Trickle ICE: ".concat(this.config.trickleICEEnabled, "\n      IPv6 Priority: ").concat(this.config.ipv6Enabled, " \u2B50 ENABLED\n      CG-NAT Mitigation: ").concat(this.config.cgnatMitigationEnabled, "\n      Strategy: IPv6-first (fallback IPv4)\n    \n"));
                        // Initialize ICE Framework
                        return [4 /*yield*/, ICEFramework_1.ICEFramework.initialize()];
                    case 1:
                        // Initialize ICE Framework
                        _a.sent();
                        ICEFramework_1.ICEFramework.setTrickleICEEnabled(this.config.trickleICEEnabled);
                        recommendedStrategy = CGNATMitigation_1.CGNATMitigation.assessNetworkAndRecommend();
                        console.log("\uD83D\uDCCA [AdvancedWebRTC] Recommended strategy for JIO ISP: ".concat(recommendedStrategy, "\n"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create advanced ICE connection with Trickle ICE
     * OPTIMIZED FOR JIO ISP: IPv6-first server selection
     */
    AdvancedWebRTCImpl.prototype.createICEConnection = function (peerId, myAlias, isInitiator) {
        return __awaiter(this, void 0, void 0, function () {
            var stunServers, turnServers, ipv6Servers, ipv4Servers, orderedServers, _a, optimalStun, optimalTurn, strategy, peerConnection, onCandidate, iceConnection, error_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("\n\uD83D\uDD0C [AdvancedWebRTC] Creating ICE connection with @".concat(peerId, " (IPv6-first for JIO ISP)..."));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        stunServers = TURNFallbackService_1.default.getICEServers()
                            .filter(function (s) { return s.urls; }).flatMap(function (s) { return s.urls; });
                        turnServers = TURNFallbackService_1.default.getICEServers()
                            .filter(function (s) { return s.username; });
                        ipv6Servers = stunServers.filter(function (s) {
                            return s.includes('[::') || s.includes('ipv6') || s.includes('::');
                        });
                        ipv4Servers = stunServers.filter(function (s) {
                            return !s.includes('[::') && !s.includes('ipv6') && !s.includes('::');
                        });
                        orderedServers = __spreadArray(__spreadArray([], ipv6Servers, true), ipv4Servers, true);
                        _a = CGNATMitigation_1.CGNATMitigation.buildOptimalICEServers(turnServers, orderedServers), optimalStun = _a.stunServers, optimalTurn = _a.turnServers, strategy = _a.strategy;
                        console.log("\uD83D\uDCE1 [AdvancedWebRTC] Using strategy: ".concat(strategy, "\n        IPv6 STUN servers: ").concat(ipv6Servers.length, "\n        IPv4 STUN servers: ").concat(ipv4Servers.length, "\n        TURN servers: ").concat(optimalTurn.length));
                        peerConnection = new RTCPeerConnection({
                            iceServers: __spreadArray(__spreadArray([], optimalStun.map(function (url) { return ({ urls: [url] }); }), true), optimalTurn.map(function (turn) { return ({
                                urls: [turn.url],
                                username: turn.username,
                                credential: turn.credential,
                            }); }), true),
                        });
                        onCandidate = function (candidate) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.handleCandidate(peerId, myAlias, candidate)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        return [4 /*yield*/, ICEFramework_1.ICEFramework.startTrickleICE(peerId, isInitiator, optimalStun, optimalTurn, onCandidate)];
                    case 2:
                        iceConnection = _b.sent();
                        // Store references
                        this.iceConnections.set(peerId, iceConnection);
                        this.peerConnections.set(peerId, peerConnection);
                        this.candidateBatches.set(peerId, []);
                        // Step 5: Set up handlers
                        return [4 /*yield*/, this.setupConnectionHandlers(peerId, myAlias, peerConnection, isInitiator)];
                    case 3:
                        // Step 5: Set up handlers
                        _b.sent();
                        console.log("\u2705 [AdvancedWebRTC] ICE connection created. Awaiting candidates...");
                        return [2 /*return*/, { iceConnection: iceConnection, peerConnection: peerConnection }];
                    case 4:
                        error_1 = _b.sent();
                        console.error("\u274C [AdvancedWebRTC] Failed to create ICE connection:", error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle incoming candidate from Trickle ICE
     * Batch and send via GunDB
     */
    AdvancedWebRTCImpl.prototype.handleCandidate = function (peerId, myAlias, candidate) {
        return __awaiter(this, void 0, void 0, function () {
            var batch, existingTimer, timer;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        batch = this.candidateBatches.get(peerId) || [];
                        batch.push(candidate);
                        this.candidateBatches.set(peerId, batch);
                        console.log("\u2708\uFE0F  [AdvancedWebRTC] Candidate queued for @".concat(peerId, ": ").concat(candidate.address, ":").concat(candidate.port, " (batch: ").concat(batch.length, "/").concat(this.config.candidateBatchSize, ")"));
                        if (!(batch.length >= this.config.candidateBatchSize)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.flushCandidateBatch(peerId, myAlias)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        existingTimer = this.batchTimers.get(peerId);
                        if (existingTimer)
                            clearTimeout(existingTimer);
                        timer = setTimeout(function () { return _this.flushCandidateBatch(peerId, myAlias); }, this.config.candidateBatchTimeoutMs);
                        this.batchTimers.set(peerId, timer);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send batched candidates to peer via Trickle ICE
     */
    AdvancedWebRTCImpl.prototype.flushCandidateBatch = function (peerId, myAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var batch, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        batch = this.candidateBatches.get(peerId) || [];
                        if (batch.length === 0)
                            return [2 /*return*/];
                        console.log("\uD83D\uDCE4 [AdvancedWebRTC] Sending ".concat(batch.length, " candidates to @").concat(peerId));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, TrickleICESignaling_1.TrickleICEService.publishCandidates(peerId, batch)];
                    case 2:
                        _a.sent();
                        this.candidateBatches.set(peerId, []);
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.warn("\u26A0\uFE0F  [AdvancedWebRTC] Failed to flush candidates:", error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Set up connection handlers
     */
    AdvancedWebRTCImpl.prototype.setupConnectionHandlers = function (peerId, myAlias, peerConnection, isInitiator) {
        return __awaiter(this, void 0, void 0, function () {
            var dataChannel;
            var _this = this;
            return __generator(this, function (_a) {
                // Data channel for chat
                if (isInitiator) {
                    dataChannel = peerConnection.createDataChannel('chat', { ordered: true });
                    this.setupDataChannelHandlers(peerId, dataChannel);
                }
                peerConnection.ondatachannel = function (event) {
                    _this.setupDataChannelHandlers(peerId, event.channel);
                };
                // ICE connection state
                peerConnection.oniceconnectionstatechange = function () {
                    var state = peerConnection.iceConnectionState;
                    console.log("\uD83D\uDD17 [AdvancedWebRTC] ICE connection state: ".concat(state, " (@").concat(peerId, ")"));
                    if (state === 'connected' || state === 'completed') {
                        // Assess connection quality
                        var assessment = CGNATMitigation_1.CGNATMitigation.assessConnectionQuality(peerId);
                        console.log("\u2705 [AdvancedWebRTC] Connection quality: ".concat(assessment.quality, " (").concat(assessment.score, "/100)"));
                        console.log("   Reason: ".concat(assessment.reason));
                    }
                    else if (state === 'failed') {
                        // Try emergency fallback
                        console.warn("\u26A0\uFE0F  [AdvancedWebRTC] Connection failed - attempting fallback");
                        _this.handleConnectionFailure(peerId).catch(function (e) {
                            return console.error('[AdvancedWebRTC] Fallback failed:', e);
                        });
                    }
                };
                // Gather remaining candidates
                peerConnection.onicecandidate = function (event) {
                    if (event.candidate) {
                        console.log("\uD83E\uDDCA [AdvancedWebRTC] Raw ICE candidate:", event.candidate);
                    }
                    else {
                        console.log("\uD83C\uDFC1 [AdvancedWebRTC] Candidate gathering complete");
                        // End of candidates signaled - no explicit API needed, candidates batch is empty
                    }
                };
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle connection failure and try fallback
     */
    AdvancedWebRTCImpl.prototype.handleConnectionFailure = function (peerId) {
        return __awaiter(this, void 0, void 0, function () {
            var turnServers, strategy, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        turnServers = TURNFallbackService_1.default.getICEServers().filter(function (s) { return s.username; });
                        return [4 /*yield*/, CGNATMitigation_1.CGNATMitigation.emergencyFallback(peerId, turnServers)];
                    case 1:
                        strategy = _a.sent();
                        console.log("\uD83C\uDD98 [AdvancedWebRTC] Using fallback strategy: ".concat(strategy));
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('[AdvancedWebRTC] Emergency fallback failed:', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Set up data channel
     */
    AdvancedWebRTCImpl.prototype.setupDataChannelHandlers = function (peerId, dataChannel) {
        dataChannel.onopen = function () {
            console.log("\uD83D\uDCE8 [AdvancedWebRTC] Data channel opened with @".concat(peerId));
        };
        dataChannel.onclose = function () {
            console.log("\uD83D\uDCE8 [AdvancedWebRTC] Data channel closed with @".concat(peerId));
        };
        dataChannel.onerror = function (event) {
            console.error("\u274C [AdvancedWebRTC] Data channel error:", event.error);
        };
    };
    /**
     * Get diagnostic report
     */
    AdvancedWebRTCImpl.prototype.generateFullReport = function () {
        return "\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n\u2551           Advanced WebRTC / ICE Framework Report           \u2551\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n\n".concat(ICEFramework_1.ICEFramework.generateReport(), "\n\n").concat(CGNATMitigation_1.CGNATMitigation.generateDiagnosticReport(), "\n\nAdvanced Config:\n  \u2022 Trickle ICE: ").concat(this.config.trickleICEEnabled, "\n  \u2022 IPv6 Support: ").concat(this.config.ipv6Enabled, "\n  \u2022 CG-NAT Mitigation: ").concat(this.config.cgnatMitigationEnabled, "\n  \u2022 Candidate Batching: Every ").concat(this.config.candidateBatchSize, " candidates or ").concat(this.config.candidateBatchTimeoutMs, "ms\n\nActive Connections: ").concat(this.iceConnections.size, "\n    ");
    };
    /**
     * Clean up connection
     */
    AdvancedWebRTCImpl.prototype.cleanupConnection = function (peerId) {
        var timer = this.batchTimers.get(peerId);
        if (timer)
            clearTimeout(timer);
        this.iceConnections.delete(peerId);
        this.peerConnections.delete(peerId);
        this.candidateBatches.delete(peerId);
        this.batchTimers.delete(peerId);
        console.log("\uD83E\uDDF9 [AdvancedWebRTC] Cleaned up connection with @".concat(peerId));
    };
    return AdvancedWebRTCImpl;
}());
exports.AdvancedWebRTC = new AdvancedWebRTCImpl();
exports.default = exports.AdvancedWebRTC;
