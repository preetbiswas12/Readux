"use strict";
/**
 * CG-NAT Mitigation Service
 * Strategies for handling Carrier-Grade NAT from mobile providers
 *
 * Problem: CG-NAT blocks:
 * - UPnP (port mapping)
 * - Direct P2P (STUN candidates fail)
 * - Symmetric NAT (all outbound → different port)
 *
 * Solution: Forced TURN relay, IPv6 fallback, connection pooling
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
exports.CGNATMitigation = exports.ConnectivityStrategy = void 0;
var ICEFramework_1 = require("./ICEFramework");
var ConnectivityStrategy;
(function (ConnectivityStrategy) {
    ConnectivityStrategy["DIRECT_P2P"] = "direct_p2p";
    ConnectivityStrategy["IPV6_ONLY"] = "ipv6_only";
    ConnectivityStrategy["TURN_RELAY"] = "turn_relay";
    ConnectivityStrategy["HYBRID"] = "hybrid";
})(ConnectivityStrategy || (exports.ConnectivityStrategy = ConnectivityStrategy = {}));
var CGNATMitigationImpl = /** @class */ (function () {
    function CGNATMitigationImpl() {
        this.currentStrategy = ConnectivityStrategy.DIRECT_P2P;
        this.connectionAttempts = new Map();
        this.maxRetries = 3;
        this.backoffMs = 1000; // Start with 1 second
    }
    /**
     * Assess network and recommend strategy
     * OPTIMIZED FOR JIO ISP: IPv6-first priority
     */
    CGNATMitigationImpl.prototype.assessNetworkAndRecommend = function () {
        var profile = ICEFramework_1.ICEFramework.getNetworkProfile();
        console.log("\uD83D\uDD0D [CG-NAT] Assessing network for JIO ISP...\n      IPv4: ".concat(profile.ipv4Available, "\n      IPv6: ").concat(profile.ipv6Available, " \u2B50 PRIORITY\n      CG-NAT (IPv4): ").concat(profile.behindCGNAT));
        // NEW PRIORITY for JIO ISP: IPv6-first
        // 1. IPv6 available? Use it (bypasses CG-NAT entirely)
        if (profile.ipv6Available) {
            console.log('⭐ [CG-NAT] IPv6 available - using IPv6-first strategy (JIO ISP optimized)');
            this.currentStrategy = ConnectivityStrategy.IPV6_ONLY;
            return ConnectivityStrategy.IPV6_ONLY;
        }
        // 2. IPv4 only - check for CG-NAT
        if (!profile.ipv6Available && profile.ipv4Available) {
            if (profile.behindCGNAT) {
                console.log('⚠️  [CG-NAT] IPv6 unavailable + CG-NAT detected - forcing TURN relay');
                this.currentStrategy = ConnectivityStrategy.TURN_RELAY;
                return ConnectivityStrategy.TURN_RELAY;
            }
            else {
                console.log('✅ [CG-NAT] IPv6 unavailable but no CG-NAT - direct P2P works');
                this.currentStrategy = ConnectivityStrategy.DIRECT_P2P;
                return ConnectivityStrategy.DIRECT_P2P;
            }
        }
        // 3. Fallback
        console.log('⚠️  [CG-NAT] No connectivity options - attempting hybrid');
        this.currentStrategy = ConnectivityStrategy.HYBRID;
        return ConnectivityStrategy.HYBRID;
    };
    /**
     * Build ICE servers based on detected strategy
     * OPTIMIZED FOR JIO ISP: IPv6-first server selection
     */
    CGNATMitigationImpl.prototype.buildOptimalICEServers = function (baseTurnServers, baseStunServers) {
        if (baseTurnServers === void 0) { baseTurnServers = []; }
        if (baseStunServers === void 0) { baseStunServers = []; }
        var strategy = this.currentStrategy;
        var stunServers = [];
        var turnServers = [];
        // Separate IPv6 and IPv4 servers
        var ipv6StunServers = baseStunServers.filter(function (s) {
            return s.includes('[::') || s.includes('ipv6') || s.includes('::');
        });
        var ipv4StunServers = baseStunServers.filter(function (s) {
            return !s.includes('[::') && !s.includes('ipv6') && !s.includes('::');
        });
        switch (strategy) {
            case ConnectivityStrategy.TURN_RELAY:
                // Force TURN relay - no STUN
                turnServers = baseTurnServers;
                console.log("\uD83D\uDD04 [CG-NAT] TURN Relay mode (IPv4 fallback): ".concat(turnServers.length, " relay servers"));
                break;
            case ConnectivityStrategy.IPV6_ONLY:
                // PRIORITY: IPv6 STUN servers first for JIO ISP
                stunServers = ipv6StunServers.length > 0
                    ? ipv6StunServers
                    : baseStunServers; // Fallback to all if no IPv6 specific
                turnServers = baseTurnServers.slice(0, 1); // IPv6-capable TURN as backup only
                console.log("\u2B50 [CG-NAT] IPv6-FIRST mode (JIO ISP optimized): ".concat(stunServers.length, " IPv6 STUN + ").concat(turnServers.length, " TURN backup"));
                break;
            case ConnectivityStrategy.HYBRID:
                // Parallel: IPv6 first, then IPv4
                stunServers = __spreadArray(__spreadArray([], ipv6StunServers, true), ipv4StunServers, true);
                turnServers = baseTurnServers.slice(0, 2);
                console.log("\uD83D\uDD00 [CG-NAT] Hybrid mode (IPv6\u2192IPv4): ".concat(ipv6StunServers.length, " IPv6 + ").concat(ipv4StunServers.length, " IPv4 STUN servers"));
                break;
            case ConnectivityStrategy.DIRECT_P2P:
            default:
                // Normal: prefer IPv6 over IPv4
                stunServers = __spreadArray(__spreadArray([], ipv6StunServers, true), ipv4StunServers, true);
                turnServers = baseTurnServers.slice(0, 1);
                console.log("\u2705 [CG-NAT] Direct P2P (IPv6-first): ".concat(ipv6StunServers.length, " IPv6 + ").concat(ipv4StunServers.length, " IPv4 STUN"));
        }
        return { stunServers: stunServers, turnServers: turnServers, strategy: strategy };
    };
    /**
     * Detect if connection failed due to CG-NAT
     * Symptoms:
     * - Only relay candidates available
     * - STUN requests fail
     * - Symmetric NAT pattern
     */
    CGNATMitigationImpl.prototype.detectCGNATFailure = function (peerId_1) {
        return __awaiter(this, arguments, void 0, function (peerId, connectionTimeoutMs) {
            var connection, relayOnly, noPublicIP;
            if (connectionTimeoutMs === void 0) { connectionTimeoutMs = 15000; }
            return __generator(this, function (_a) {
                try {
                    connection = ICEFramework_1.ICEFramework.getConnection(peerId);
                    if (!connection)
                        return [2 /*return*/, false];
                    relayOnly = connection.localCandidates.every(function (c) { return c.type === 'relay'; });
                    noPublicIP = !connection.localCandidates.some(function (c) { return c.type === 'srflx'; });
                    if (relayOnly && noPublicIP) {
                        console.warn('🚨 [CG-NAT] CG-NAT failure pattern detected - relay only');
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
                }
                catch (error) {
                    console.warn('[CG-NAT] CG-NAT detection failed:', error);
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Retry connection with exponential backoff
     */
    CGNATMitigationImpl.prototype.retryWithBackoff = function (peerId, retryFn) {
        return __awaiter(this, void 0, void 0, function () {
            var attempts, delay_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        attempts = this.connectionAttempts.get(peerId) || 0;
                        if (attempts >= this.maxRetries) {
                            throw new Error("\u274C [CG-NAT] Max retries (".concat(this.maxRetries, ") exceeded for @").concat(peerId));
                        }
                        if (!(attempts > 0)) return [3 /*break*/, 2];
                        delay_1 = this.backoffMs * Math.pow(2, attempts - 1);
                        console.log("\u23F3 [CG-NAT] Retry ".concat(attempts, "/").concat(this.maxRetries, " in ").concat(delay_1, "ms..."));
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay_1); })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, retryFn()];
                    case 3:
                        _a.sent();
                        // Success - reset counter
                        this.connectionAttempts.set(peerId, 0);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        this.connectionAttempts.set(peerId, attempts + 1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get connection quality assessment
     */
    CGNATMitigationImpl.prototype.assessConnectionQuality = function (peerId) {
        var connection = ICEFramework_1.ICEFramework.getConnection(peerId);
        if (!connection) {
            return {
                quality: 'failed',
                score: 0,
                reason: 'No connection',
                recommendation: 'Initialize connection first',
            };
        }
        var score = 0;
        var reason = '';
        var recommendation = '';
        // Analyze candidate types
        var candidateTypes = {
            host: connection.localCandidates.filter(function (c) { return c.type === 'host'; }).length,
            srflx: connection.localCandidates.filter(function (c) { return c.type === 'srflx'; }).length,
            relay: connection.localCandidates.filter(function (c) { return c.type === 'relay'; }).length,
        };
        // Score calculation
        if (candidateTypes.host > 0) {
            score += 30; // Host candidates available
            reason += 'Local network available. ';
        }
        if (candidateTypes.srflx > 0) {
            score += 40; // Direct public IP available
            reason += 'Direct P2P possible. ';
        }
        else if (candidateTypes.relay > 0) {
            score += 20; // Only relay available
            reason += 'Behind NAT, using relay. ';
        }
        // Latency scoring
        if (connection.rtt < 50)
            score += 20;
        else if (connection.rtt < 100)
            score += 15;
        else if (connection.rtt < 200)
            score += 10;
        else
            score += 5;
        // Connection state
        if (connection.state === 'connected') {
            score += 10;
        }
        else if (connection.state === 'failed') {
            score = Math.max(0, score - 30);
            reason += 'Connection failed. ';
        }
        // Determine quality level
        var quality;
        if (score >= 85)
            quality = 'excellent';
        else if (score >= 70)
            quality = 'good';
        else if (score >= 50)
            quality = 'fair';
        else if (score > 0)
            quality = 'poor';
        else
            quality = 'failed';
        // Generate recommendations
        if (quality === 'failed' || quality === 'poor') {
            recommendation = 'Try forcing TURN relay or switching networks';
        }
        else if (candidateTypes.relay > 0 && candidateTypes.srflx === 0) {
            recommendation = 'Behind NAT - relay working, monitor bandwidth';
        }
        else if (candidateTypes.host > 0 && candidateTypes.srflx === 0) {
            recommendation = 'Local network only - cannot reach peers outside LAN';
        }
        else {
            recommendation = 'Connection quality is optimal';
        }
        return { quality: quality, score: score, reason: reason.trim(), recommendation: recommendation };
    };
    /**
     * Emergency fallback for failed connections
     * Tries: Direct → IPv6 → Relay → TURN-only
     */
    CGNATMitigationImpl.prototype.emergencyFallback = function (peerId, availableTurnServers) {
        return __awaiter(this, void 0, void 0, function () {
            var profile;
            return __generator(this, function (_a) {
                console.log("\uD83C\uDD98 [CG-NAT] Emergency fallback for @".concat(peerId));
                profile = ICEFramework_1.ICEFramework.getNetworkProfile();
                // Try 1: Check if IPv6 works
                if (profile.ipv6Available && !profile.behindCGNAT) {
                    console.log("\uD83D\uDCE1 [CG-NAT] Attempting IPv6-only fallback");
                    this.currentStrategy = ConnectivityStrategy.IPV6_ONLY;
                    return [2 /*return*/, ConnectivityStrategy.IPV6_ONLY];
                }
                // Try 2: Force TURN relay
                if (availableTurnServers.length > 0) {
                    console.log("\uD83D\uDD04 [CG-NAT] Attempting TURN relay fallback");
                    this.currentStrategy = ConnectivityStrategy.TURN_RELAY;
                    return [2 /*return*/, ConnectivityStrategy.TURN_RELAY];
                }
                // Try 3: Last resort - any available
                console.log("\u26A0\uFE0F  [CG-NAT] All fallbacks exhausted - may need user intervention");
                this.currentStrategy = ConnectivityStrategy.DIRECT_P2P;
                return [2 /*return*/, ConnectivityStrategy.DIRECT_P2P];
            });
        });
    };
    /**
     * Generate CG-NAT diagnostic report
     */
    CGNATMitigationImpl.prototype.generateDiagnosticReport = function () {
        var _this = this;
        var profile = ICEFramework_1.ICEFramework.getNetworkProfile();
        var allConnections = ICEFramework_1.ICEFramework.getAllConnections();
        var report = "\nCG-NAT Mitigation Diagnostic Report\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\nCurrent Strategy: ".concat(this.currentStrategy, "\n\nNetwork Profile:\n  \u2022 IPv4: ").concat(profile.ipv4Available, " (Public IP: ").concat(profile.publicIP || 'Unknown', ")\n  \u2022 IPv6: ").concat(profile.ipv6Available, " (Public IP: ").concat(profile.publicIPv6 || 'Unknown', ")\n  \u2022 CG-NAT Detected: ").concat(profile.behindCGNAT, "\n  \u2022 Symmetric NAT: ").concat(profile.behindSymmetricNAT, "\n\nConnection Status:\n").concat(allConnections.map(function (conn) {
            var quality = _this.assessConnectionQuality(conn.peerId);
            return "\n  @".concat(conn.peerId, ":\n    State: ").concat(conn.state, " | Quality: ").concat(quality.quality, " (").concat(quality.score, "/100)\n    Local Candidates: Host=").concat(conn.localCandidates.filter(function (c) { return c.type === 'host'; }).length, " | SRFLX=").concat(conn.localCandidates.filter(function (c) { return c.type === 'srflx'; }).length, " | Relay=").concat(conn.localCandidates.filter(function (c) { return c.type === 'relay'; }).length, "\n    Reason: ").concat(quality.reason, "\n    Suggestion: ").concat(quality.recommendation, "\n  ");
        }).join(''), "\n\nCG-NAT Status:\n  \u2022 Active Strategy: ").concat(this.currentStrategy, "\n  \u2022 Retry Policy: ").concat(this.maxRetries, " retries with exponential backoff\n  \u2022 Backup TURN Available: ").concat(allConnections.length > 0 ? 'Yes' : 'No', "\n    ");
        return report;
    };
    /**
     * Get current strategy
     */
    CGNATMitigationImpl.prototype.getStrategy = function () {
        return this.currentStrategy;
    };
    /**
     * Manually set strategy (override auto-detection)
     */
    CGNATMitigationImpl.prototype.setStrategy = function (strategy) {
        console.log("\uD83D\uDD27 [CG-NAT] Manually setting strategy to: ".concat(strategy));
        this.currentStrategy = strategy;
    };
    return CGNATMitigationImpl;
}());
exports.CGNATMitigation = new CGNATMitigationImpl();
exports.default = exports.CGNATMitigation;
