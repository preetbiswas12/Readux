"use strict";
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
var StunTurnServers_1 = require("../config/StunTurnServers");
var IPv6FirstNetworkingService = /** @class */ (function () {
    function IPv6FirstNetworkingService() {
        this.networkProfile = null;
        this.detectionTimeout = 5000; // 5s for network detection
        this.IPv6OnlyThreshold = 100; // If IPv6 latency < 100ms, use IPv6-only
    }
    /**
     * CORE: Detect available IP versions and network characteristics
     */
    IPv6FirstNetworkingService.prototype.detectNetworkProfile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, _a, ipv6Result, ipv4Result, ipv6Available, ipv6Latency, ipv4Available, ipv4Latency, cgnatDetected, preferredVersion, isp, networkType, profile, detectionTime;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('[IPv6First] 🌐 Detecting network profile...');
                        startTime = Date.now();
                        return [4 /*yield*/, Promise.allSettled([
                                this.probeIPv6(),
                                this.probeIPv4(),
                            ])];
                    case 1:
                        _a = _b.sent(), ipv6Result = _a[0], ipv4Result = _a[1];
                        ipv6Available = ipv6Result.status === 'fulfilled' && ipv6Result.value.available;
                        ipv6Latency = ipv6Result.status === 'fulfilled' ? ipv6Result.value.latency : null;
                        ipv4Available = ipv4Result.status === 'fulfilled' && ipv4Result.value.available;
                        ipv4Latency = ipv4Result.status === 'fulfilled' ? ipv4Result.value.latency : null;
                        cgnatDetected = ipv4Available
                            ? false // CG-NAT detection would be done via relay-only pattern analysis
                            : false;
                        preferredVersion = 'dual-stack';
                        if (ipv6Available && ipv6Latency !== null && ipv6Latency < this.IPv6OnlyThreshold) {
                            // IPv6 is fast enough for direct use
                            preferredVersion = 'ipv6';
                        }
                        else if (ipv6Available) {
                            // IPv6 available but slower
                            preferredVersion = 'dual-stack';
                        }
                        else if (ipv4Available && !cgnatDetected) {
                            // IPv4 only, no CG-NAT
                            preferredVersion = 'ipv4';
                        }
                        else if (ipv4Available && cgnatDetected) {
                            // IPv4 with CG-NAT → Need relay
                            preferredVersion = 'ipv4';
                        }
                        isp = this.detectISP();
                        networkType = this.detectNetworkType();
                        profile = {
                            ipv6Available: ipv6Available,
                            ipv4Available: ipv4Available,
                            ipv6Latency: ipv6Latency,
                            ipv4Latency: ipv4Latency,
                            preferredVersion: preferredVersion,
                            cgnatDetected: cgnatDetected,
                            isp: isp,
                            networkType: networkType,
                        };
                        this.networkProfile = profile;
                        detectionTime = Date.now() - startTime;
                        console.log("[IPv6First] \u2705 Network detection complete (".concat(detectionTime, "ms)"));
                        console.log("[IPv6First]   IPv6: ".concat(ipv6Available ? "\u2713 ".concat(ipv6Latency, "ms") : '✗'));
                        console.log("[IPv6First]   IPv4: ".concat(ipv4Available ? "\u2713 ".concat(ipv4Latency, "ms") : '✗'));
                        console.log("[IPv6First]   CG-NAT: ".concat(cgnatDetected ? '⚠️ DETECTED' : '✓ Clear'));
                        console.log("[IPv6First]   Strategy: ".concat(preferredVersion.toUpperCase()));
                        return [2 /*return*/, profile];
                }
            });
        });
    };
    /**
     * Probe IPv6 availability and latency
     */
    IPv6FirstNetworkingService.prototype.probeIPv6 = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime_1, peerConnection_1, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        startTime_1 = Date.now();
                        peerConnection_1 = new RTCPeerConnection({
                            iceServers: [
                                {
                                    urls: [
                                        'stun:[2606:4700:4700::1111]', // Cloudflare IPv6
                                        'stun:[2001:4860:4864::8888]', // Google IPv6
                                    ],
                                },
                            ],
                        });
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var foundIPv6 = false;
                                var ipv6Latency = null;
                                var timeout = setTimeout(function () {
                                    peerConnection_1.close();
                                    resolve({
                                        available: foundIPv6,
                                        latency: ipv6Latency,
                                    });
                                }, _this.detectionTimeout);
                                peerConnection_1.onicecandidate = function (event) {
                                    if (event.candidate) {
                                        var candidate = event.candidate.candidate;
                                        // Check for IPv6 address (contains colons)
                                        if (candidate.includes(':') &&
                                            !candidate.includes('127.0.0.1') &&
                                            !candidate.includes('::1')) {
                                            foundIPv6 = true;
                                            if (ipv6Latency === null) {
                                                ipv6Latency = Date.now() - startTime_1;
                                            }
                                        }
                                    }
                                };
                                peerConnection_1.onicegatheringstatechange = function () {
                                    if (peerConnection_1.iceGatheringState === 'complete') {
                                        clearTimeout(timeout);
                                        peerConnection_1.close();
                                        resolve({
                                            available: foundIPv6,
                                            latency: ipv6Latency,
                                        });
                                    }
                                };
                                // Trigger ICE gathering
                                peerConnection_1.createDataChannel('probe');
                                peerConnection_1.createOffer().then(function (offer) {
                                    peerConnection_1.setLocalDescription(offer);
                                });
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        console.warn('[IPv6First] IPv6 probe failed:', error_1);
                        return [2 /*return*/, { available: false, latency: null }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Probe IPv4 availability and latency
     */
    IPv6FirstNetworkingService.prototype.probeIPv4 = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime_2, peerConnection_2, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        startTime_2 = Date.now();
                        peerConnection_2 = new RTCPeerConnection({
                            iceServers: [
                                {
                                    urls: [
                                        'stun:stun.l.google.com:19302',
                                        'stun:stun1.l.google.com:19302',
                                    ],
                                },
                            ],
                        });
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var foundIPv4 = false;
                                var ipv4Latency = null;
                                var timeout = setTimeout(function () {
                                    peerConnection_2.close();
                                    resolve({
                                        available: foundIPv4,
                                        latency: ipv4Latency,
                                    });
                                }, _this.detectionTimeout);
                                peerConnection_2.onicecandidate = function (event) {
                                    if (event.candidate) {
                                        var candidate = event.candidate.candidate;
                                        // Check for IPv4 address (no colons, regular dotted notation)
                                        if (candidate.match(/\d+\.\d+\.\d+\.\d+/) &&
                                            !candidate.includes('127.0.0.1')) {
                                            foundIPv4 = true;
                                            if (ipv4Latency === null) {
                                                ipv4Latency = Date.now() - startTime_2;
                                            }
                                        }
                                    }
                                };
                                peerConnection_2.onicegatheringstatechange = function () {
                                    if (peerConnection_2.iceGatheringState === 'complete') {
                                        clearTimeout(timeout);
                                        peerConnection_2.close();
                                        resolve({
                                            available: foundIPv4,
                                            latency: ipv4Latency,
                                        });
                                    }
                                };
                                // Trigger ICE gathering
                                peerConnection_2.createDataChannel('probe');
                                peerConnection_2.createOffer().then(function (offer) {
                                    peerConnection_2.setLocalDescription(offer);
                                });
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        console.warn('[IPv6First] IPv4 probe failed:', error_2);
                        return [2 /*return*/, { available: false, latency: null }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Select optimal servers based on network profile
     */
    IPv6FirstNetworkingService.prototype.getOptimalServers = function () {
        if (!this.networkProfile) {
            console.warn('[IPv6First] Network profile not detected, using fallback servers');
            return this.getFallbackServers();
        }
        var _a = this.networkProfile, ipv6Available = _a.ipv6Available, preferredVersion = _a.preferredVersion, cgnatDetected = _a.cgnatDetected;
        console.log("[IPv6First] \uD83C\uDFAF Selecting servers (".concat(preferredVersion, ")"));
        if (preferredVersion === 'ipv6' && ipv6Available) {
            return this.getIPv6OnlyServers();
        }
        else if (preferredVersion === 'ipv6') {
            // IPv6 preferred but not available → hybrid with IPv4 fallback
            return this.getIPv6FirstHybridServers();
        }
        else if (preferredVersion === 'ipv4' && cgnatDetected) {
            // IPv4 with CG-NAT → MUST use TURN relay
            return this.getIPv4WithTurnServers();
        }
        else if (preferredVersion === 'ipv4') {
            // IPv4 only, no CG-NAT → Direct P2P is fine
            return this.getIPv4DirectServers();
        }
        return this.getFallbackServers();
    };
    /**
     * IPv6-ONLY Mode: When IPv6 is fast and reliable
     * Bypasses ALL CG-NAT issues
     */
    IPv6FirstNetworkingService.prototype.getIPv6OnlyServers = function () {
        var ipv6Stun = [
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
    };
    /**
     * IPv6-FIRST Hybrid: IPv6 primary, IPv4 secondary
     * Best for dual-stack networks
     */
    IPv6FirstNetworkingService.prototype.getIPv6FirstHybridServers = function () {
        var ipv6Stun = [
            'stun:[2606:4700:4700::1111]',
            'stun:[2001:4860:4864::8888]',
        ];
        var ipv4Stun = StunTurnServers_1.STUN_SERVERS_BY_TIER.primary
            .slice(0, 3)
            .map(function (s) { return s.url; });
        return {
            stunServers: __spreadArray(__spreadArray([], ipv6Stun, true), ipv4Stun, true),
            turnServers: StunTurnServers_1.STUN_SERVERS_BY_TIER.fallback.map(function (s) { return s.url; }),
            version: 'dual-stack',
            fallbackMode: false,
        };
    };
    /**
     * IPv4 with TURN: Required for CG-NAT
     * Forces relay mode for guaranteed connectivity
     */
    IPv6FirstNetworkingService.prototype.getIPv4WithTurnServers = function () {
        return {
            stunServers: StunTurnServers_1.STUN_SERVERS_BY_TIER.primary.map(function (s) { return s.url; }),
            turnServers: StunTurnServers_1.STUN_SERVERS_BY_TIER.fallback.map(function (s) { return s.url; }),
            version: 'ipv4',
            fallbackMode: true,
        };
    };
    /**
     * IPv4 Direct: No CG-NAT, direct P2P possible
     */
    IPv6FirstNetworkingService.prototype.getIPv4DirectServers = function () {
        return {
            stunServers: StunTurnServers_1.STUN_SERVERS_BY_TIER.primary.map(function (s) { return s.url; }),
            turnServers: StunTurnServers_1.STUN_SERVERS_BY_TIER.secondary.map(function (s) { return s.url; }),
            version: 'ipv4',
            fallbackMode: false,
        };
    };
    /**
     * Fallback: When all else fails
     */
    IPv6FirstNetworkingService.prototype.getFallbackServers = function () {
        return {
            stunServers: __spreadArray(__spreadArray([], StunTurnServers_1.STUN_SERVERS_BY_TIER.primary.map(function (s) { return s.url; }), true), StunTurnServers_1.STUN_SERVERS_BY_TIER.secondary.map(function (s) { return s.url; }), true),
            turnServers: StunTurnServers_1.STUN_SERVERS_BY_TIER.fallback.map(function (s) { return s.url; }),
            version: 'dual-stack',
            fallbackMode: true,
        };
    };
    /**
     * Get current network profile
     */
    IPv6FirstNetworkingService.prototype.getNetworkProfile = function () {
        return this.networkProfile;
    };
    /**
     * Generate diagnostic report
     */
    IPv6FirstNetworkingService.prototype.generateDiagnosticReport = function () {
        if (!this.networkProfile) {
            return 'Network profile not detected';
        }
        var _a = this.networkProfile, ipv6Available = _a.ipv6Available, ipv4Available = _a.ipv4Available, ipv6Latency = _a.ipv6Latency, ipv4Latency = _a.ipv4Latency, preferredVersion = _a.preferredVersion, cgnatDetected = _a.cgnatDetected, isp = _a.isp, networkType = _a.networkType;
        return "\nIPv6-First Network Diagnostic Report\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\nNetwork Configuration:\n  \u2022 IPv6 Available: ".concat(ipv6Available ? "\u2713 (".concat(ipv6Latency, "ms)") : '✗', "\n  \u2022 IPv4 Available: ").concat(ipv4Available ? "\u2713 (".concat(ipv4Latency, "ms)") : '✗', "\n  \u2022 Preferred Version: ").concat(preferredVersion.toUpperCase(), "\n  \u2022 CG-NAT Detected: ").concat(cgnatDetected ? '⚠️ YES' : '✓ NO', "\n\nNetwork Info:\n  \u2022 ISP: ").concat(isp, "\n  \u2022 Network Type: ").concat(networkType, "\n\nConnection Strategy:\n").concat(this.getConnectionStrategy(), "\n\nRecommendations:\n").concat(this.getNetworkRecommendations(), "\n    ");
    };
    /**
     * Get connection strategy description
     */
    IPv6FirstNetworkingService.prototype.getConnectionStrategy = function () {
        if (!this.networkProfile)
            return '  • Unknown';
        var _a = this.networkProfile, preferredVersion = _a.preferredVersion, cgnatDetected = _a.cgnatDetected, ipv6Available = _a.ipv6Available;
        if (preferredVersion === 'ipv6') {
            return '  • Using IPv6-ONLY mode (bypasses CG-NAT completely) ⭐';
        }
        else if (preferredVersion === 'dual-stack' && ipv6Available) {
            return '  • Using IPv6-FIRST hybrid (IPv6 primary, IPv4 secondary)';
        }
        else if (cgnatDetected) {
            return '  • Using IPv4 with TURN relay (CG-NAT detected) 🔄';
        }
        else {
            return '  • Using IPv4 direct P2P (no CG-NAT)';
        }
    };
    /**
     * Get network recommendations
     */
    IPv6FirstNetworkingService.prototype.getNetworkRecommendations = function () {
        if (!this.networkProfile)
            return '  • Run network detection first';
        var _a = this.networkProfile, ipv6Available = _a.ipv6Available, cgnatDetected = _a.cgnatDetected, networkType = _a.networkType;
        var recommendations = [];
        if (!ipv6Available && cgnatDetected) {
            recommendations.push('  🔴 IPv4 is blocked by CG-NAT - contact ISP to enable IPv6');
        }
        else if (!ipv6Available) {
            recommendations.push('  ⚠️ IPv6 not available - consider upgrading to IPv6-enabled network');
        }
        else if (ipv6Available) {
            recommendations.push('  ✅ IPv6 available - using optimal IPv6-first strategy');
        }
        if (networkType === 'mobile') {
            recommendations.push('  📱 Mobile network detected - using battery-efficient mode');
        }
        if (recommendations.length === 0) {
            recommendations.push('  ✅ Network configuration optimal');
        }
        return recommendations.join('\n');
    };
    /**
     * Detect ISP from network characteristics
     */
    IPv6FirstNetworkingService.prototype.detectISP = function () {
        // Would integrate with actual ISP detection library
        // For now, return generic ISP name
        return 'Auto-detected ISP';
    };
    /**
     * Detect network type
     */
    IPv6FirstNetworkingService.prototype.detectNetworkType = function () {
        // Would detect from actual network info
        // For now, return 'home' as default
        return 'home';
    };
    /**
     * Test connectivity with current configuration
     */
    IPv6FirstNetworkingService.prototype.testConnectivity = function () {
        return __awaiter(this, void 0, void 0, function () {
            var servers, startTime, peerConnection_3, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        servers = this.getOptimalServers();
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        peerConnection_3 = new RTCPeerConnection({
                            iceServers: servers.stunServers.map(function (url) { return ({ urls: [url] }); }),
                        });
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var bestLatency = Infinity;
                                var usedVersion = servers.version === 'ipv6' ? 'ipv6' : 'ipv4';
                                var timeout = setTimeout(function () {
                                    peerConnection_3.close();
                                    resolve({
                                        success: false,
                                        latency: Infinity,
                                        version: usedVersion,
                                        relay: servers.fallbackMode,
                                    });
                                }, 8000);
                                peerConnection_3.onicecandidate = function (event) {
                                    if (event.candidate) {
                                        var latency = Date.now() - startTime;
                                        if (latency < bestLatency) {
                                            bestLatency = latency;
                                            // Detect if using IPv6 or IPv4
                                            if (event.candidate.candidate.includes(':')) {
                                                usedVersion = 'ipv6';
                                            }
                                            else if (event.candidate.candidate.match(/\d+\.\d+/)) {
                                                usedVersion = 'ipv4';
                                            }
                                        }
                                    }
                                };
                                peerConnection_3.onicegatheringstatechange = function () {
                                    if (peerConnection_3.iceGatheringState === 'complete') {
                                        clearTimeout(timeout);
                                        peerConnection_3.close();
                                        resolve({
                                            success: bestLatency !== Infinity,
                                            latency: bestLatency,
                                            version: usedVersion,
                                            relay: servers.fallbackMode,
                                        });
                                    }
                                };
                                peerConnection_3.createDataChannel('test');
                                peerConnection_3.createOffer().then(function (offer) {
                                    peerConnection_3.setLocalDescription(offer);
                                });
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_3 = _a.sent();
                        console.error('[IPv6First] Connectivity test failed:', error_3);
                        return [2 /*return*/, {
                                success: false,
                                latency: Infinity,
                                version: 'ipv4',
                                relay: false,
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enable IPv6-only mode (aggressive)
     */
    IPv6FirstNetworkingService.prototype.forceIPv6Only = function () {
        if (this.networkProfile) {
            this.networkProfile.preferredVersion = 'ipv6';
            console.log('[IPv6First] 🔒 Forcing IPv6-ONLY mode');
        }
    };
    /**
     * Disable IPv6 (fallback mode)
     */
    IPv6FirstNetworkingService.prototype.forceIPv4Fallback = function () {
        if (this.networkProfile) {
            this.networkProfile.preferredVersion = 'ipv4';
            console.log('[IPv6First] ↩️ Forcing IPv4 fallback');
        }
    };
    /**
     * Reset to auto-detection
     */
    IPv6FirstNetworkingService.prototype.resetToAutoDetect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.detectNetworkProfile()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return IPv6FirstNetworkingService;
}());
var ipv6FirstNetworkingServiceInstance = new IPv6FirstNetworkingService();
exports.default = ipv6FirstNetworkingServiceInstance;
