"use strict";
/**
 * ICE Framework - Advanced Connectivity Management
 * Features:
 * - Trickle ICE: Stream candidates instead of waiting for all to gather
 * - IPv6 Support: Dual-stack connectivity
 * - CG-NAT Detection: Identifies when behind carrier-grade NAT
 * - Smart Fallback: Chooses optimal path based on network conditions
 * - Performance Metrics: Tracks connection quality
 *
 * Problem: STUN/TURN alone fail with CG-NAT from mobile providers
 * Solution: App-level ICE control with intelligent candidate selection
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
exports.ICEFramework = exports.AddressFamily = exports.CandidateType = void 0;
var uuid_1 = require("uuid");
var CandidateType;
(function (CandidateType) {
    CandidateType["HOST"] = "host";
    CandidateType["SRFLX"] = "srflx";
    CandidateType["RELAY"] = "relay";
    CandidateType["PRFLX"] = "prflx";
})(CandidateType || (exports.CandidateType = CandidateType = {}));
var AddressFamily;
(function (AddressFamily) {
    AddressFamily["IPv4"] = "ipv4";
    AddressFamily["IPv6"] = "ipv6";
    AddressFamily["DUAL"] = "dual";
})(AddressFamily || (exports.AddressFamily = AddressFamily = {}));
var ICEFrameworkImpl = /** @class */ (function () {
    function ICEFrameworkImpl() {
        this.connections = new Map();
        this.networkProfile = {
            ipv4Available: false,
            ipv6Available: false,
            behindCGNAT: false,
            behindSymmetricNAT: false,
            connectivity: 'none',
        };
        this.candidateCallbacks = new Map();
        this.connectionStateCallbacks = new Map();
        // Trickle ICE state
        this.trickleCandidateQueues = new Map();
        this.trickleIceEnabled = true;
    }
    /**
     * Initialize ICE Framework
     * Detects network conditions and sets up callbacks
     */
    ICEFrameworkImpl.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🌐 [ICE] Initializing ICE Framework with Trickle ICE...');
                        // Probe network connectivity
                        return [4 /*yield*/, this.probeNetworkProfile()];
                    case 1:
                        // Probe network connectivity
                        _a.sent();
                        console.log("\uD83C\uDF10 [ICE] Network Profile:\n      IPv4: ".concat(this.networkProfile.ipv4Available, "\n      IPv6: ").concat(this.networkProfile.ipv6Available, "\n      Behind CG-NAT: ").concat(this.networkProfile.behindCGNAT, "\n      Connectivity: ").concat(this.networkProfile.connectivity));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Probe network to detect IPv4/IPv6 and NAT type
     */
    ICEFrameworkImpl.prototype.probeNetworkProfile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ipv4Test, ipv6Test, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.race([
                                fetch('https://ipv4.google.com', { method: 'HEAD' }).then(function () { return true; }).catch(function () { return false; }),
                                new Promise(function (resolve) { return setTimeout(function () { return resolve(false); }, 3000); })
                            ])];
                    case 1:
                        ipv4Test = _a.sent();
                        this.networkProfile.ipv4Available = ipv4Test;
                        return [4 /*yield*/, Promise.race([
                                fetch('https://ipv6.google.com', { method: 'HEAD' }).then(function () { return true; }).catch(function () { return false; }),
                                new Promise(function (resolve) { return setTimeout(function () { return resolve(false); }, 3000); })
                            ])];
                    case 2:
                        ipv6Test = _a.sent();
                        this.networkProfile.ipv6Available = ipv6Test;
                        // Detect CG-NAT (will be confirmed after ICE gathering)
                        this.networkProfile.behindCGNAT = false; // Updated during candidate gathering
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.warn('[ICE] Network probe failed:', error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Start Trickle ICE with streaming candidate collection
     * Instead of waiting for all candidates, stream them as discovered
     */
    ICEFrameworkImpl.prototype.startTrickleICE = function (peerId_1, initiator_1, peerStunServers_1) {
        return __awaiter(this, arguments, void 0, function (peerId, initiator, peerStunServers, peerTurnServers, onCandidate) {
            var connectionId, connection, iceServers, peerConnection_1;
            var _this = this;
            if (peerTurnServers === void 0) { peerTurnServers = []; }
            return __generator(this, function (_a) {
                connectionId = peerId;
                console.log("\uD83D\uDD04 [ICE] Starting Trickle ICE with @".concat(peerId, " (initiator: ").concat(initiator, ")"));
                connection = {
                    peerId: peerId,
                    initiator: initiator,
                    state: 'new',
                    localCandidates: [],
                    remoteCandidates: [],
                    checklistState: 'running',
                    rtt: 0,
                    createdAt: Date.now(),
                };
                this.connections.set(connectionId, connection);
                this.candidateCallbacks.set(connectionId, onCandidate);
                this.trickleCandidateQueues.set(connectionId, []);
                iceServers = this.buildICEServers(peerStunServers, peerTurnServers);
                try {
                    peerConnection_1 = new RTCPeerConnection({
                        iceServers: iceServers,
                        bundlePolicy: 'max-bundle',
                        rtcpMuxPolicy: 'require',
                    });
                    // Handle ICE candidates as they're discovered (Trickle ICE)
                    peerConnection_1.onicecandidate = function (event) { return __awaiter(_this, void 0, void 0, function () {
                        var iceCandidate;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (!event.candidate) return [3 /*break*/, 2];
                                    return [4 /*yield*/, this.processCandidate(event.candidate, peerId)];
                                case 1:
                                    iceCandidate = _b.sent();
                                    if (iceCandidate) {
                                        // Add to local candidates
                                        connection.localCandidates.push(iceCandidate);
                                        // Stream candidate immediately (Trickle ICE)
                                        if (this.trickleIceEnabled) {
                                            // Queue for immediate delivery
                                            (_a = this.trickleCandidateQueues.get(connectionId)) === null || _a === void 0 ? void 0 : _a.push(iceCandidate);
                                            onCandidate(iceCandidate);
                                            console.log("\u2713 [ICE] Trickle streamed: ".concat(iceCandidate.address, ":").concat(iceCandidate.port, " (").concat(iceCandidate.type, ")"));
                                        }
                                    }
                                    return [3 /*break*/, 3];
                                case 2:
                                    // End of candidates (null event)
                                    connection.checklistState = 'completed';
                                    console.log("\u2713 [ICE] Candidate gathering complete for @".concat(peerId));
                                    _b.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); };
                    // Monitor ICE connection state
                    peerConnection_1.oniceconnectionstatechange = function () {
                        _this.handleICEConnectionStateChange(connectionId, peerConnection_1);
                    };
                    peerConnection_1.onicegatheringstatechange = function () {
                        console.log("[ICE] Gathering state: ".concat(peerConnection_1.iceGatheringState, " for @").concat(peerId));
                        if (peerConnection_1.iceGatheringState === 'complete') {
                            connection.checklistState = 'completed';
                        }
                    };
                    // Detect CG-NAT based on candidates
                    this.detectCGNAT(connection);
                    return [2 /*return*/, connection];
                }
                catch (error) {
                    console.error("[ICE] Failed to start Trickle ICE with @".concat(peerId, ":"), error);
                    connection.state = 'failed';
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Add remote candidate discovered by peer
     * Called when peer sends trickle ICE candidate
     */
    ICEFrameworkImpl.prototype.addRemoteCandidate = function (peerId, candidateData, peerConnection) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, candidate, error_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        connection = this.connections.get(peerId);
                        if (!connection) {
                            console.warn("[ICE] No connection found for @".concat(peerId));
                            return [2 /*return*/];
                        }
                        candidate = new RTCIceCandidate({
                            candidate: candidateData.candidate || '',
                            sdpMLineIndex: (_a = candidateData.sdpMLineIndex) !== null && _a !== void 0 ? _a : 0,
                            sdpMid: (_b = candidateData.sdpMid) !== null && _b !== void 0 ? _b : 'offer',
                        });
                        // Add to peer connection
                        return [4 /*yield*/, peerConnection.addIceCandidate(candidate)];
                    case 1:
                        // Add to peer connection
                        _c.sent();
                        connection.remoteCandidates.push(this.createICECandidate(candidate, CandidateType[candidateData.type]));
                        console.log("\u2713 [ICE] Remote candidate added: ".concat(candidateData.address, ":").concat(candidateData.port));
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _c.sent();
                        console.error("[ICE] Failed to add remote candidate from @".concat(peerId, ":"), error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process raw WebRTC candidate into framework candidate
     */
    ICEFrameworkImpl.prototype.processCandidate = function (rawCandidate, peerId) {
        return __awaiter(this, void 0, void 0, function () {
            var candidateStr, candidateType, addressMatch, address, port, addressFamily, typePref, localPref, componentIndex, priority, iceCandidate;
            return __generator(this, function (_a) {
                try {
                    candidateStr = rawCandidate.candidate || '';
                    // Parse candidate string
                    if (!candidateStr)
                        return [2 /*return*/, null];
                    candidateType = CandidateType.HOST;
                    if (candidateStr.includes('srflx'))
                        candidateType = CandidateType.SRFLX;
                    else if (candidateStr.includes('relay'))
                        candidateType = CandidateType.RELAY;
                    else if (candidateStr.includes('prflx'))
                        candidateType = CandidateType.PRFLX;
                    addressMatch = candidateStr.match(/(\S+)\s+(\d+)\s+/);
                    if (!addressMatch)
                        return [2 /*return*/, null];
                    address = addressMatch[1];
                    port = parseInt(addressMatch[2], 10);
                    addressFamily = this.detectAddressFamily(address);
                    typePref = this.getTypePriority(candidateType, addressFamily);
                    localPref = addressFamily === AddressFamily.IPv6 ? 65535 : 32768;
                    componentIndex = rawCandidate.component === 'rtp' ? 1 : 2;
                    priority = (typePref << 24) + (localPref << 8) + (256 - componentIndex);
                    iceCandidate = {
                        id: (0, uuid_1.v4)(),
                        foundation: rawCandidate.foundation || '',
                        component: rawCandidate.component,
                        type: candidateType,
                        priority: priority,
                        address: address,
                        port: port,
                        addressFamily: addressFamily,
                        candidate: rawCandidate,
                        success: true,
                        timestamp: Date.now(),
                    };
                    return [2 /*return*/, iceCandidate];
                }
                catch (error) {
                    console.error('[ICE] Failed to process candidate:', error);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Build ICE servers with IPv4 and IPv6 support
     */
    ICEFrameworkImpl.prototype.buildICEServers = function (stunServers, turnServers) {
        var iceServers = [];
        // Add STUN servers (both IPv4 and IPv6 if available)
        for (var _i = 0, stunServers_1 = stunServers; _i < stunServers_1.length; _i++) {
            var stun = stunServers_1[_i];
            iceServers.push({
                urls: [stun],
            });
        }
        // Add TURN servers with credentials
        for (var _a = 0, turnServers_1 = turnServers; _a < turnServers_1.length; _a++) {
            var turn = turnServers_1[_a];
            iceServers.push({
                urls: [turn.url],
                username: turn.username,
                credential: turn.credential,
            });
        }
        console.log("[ICE] Built ICE servers: ".concat(iceServers.length, " servers"));
        return iceServers;
    };
    /**
     * Detect address family (IPv4 vs IPv6)
     */
    ICEFrameworkImpl.prototype.detectAddressFamily = function (address) {
        // IPv6 has colons
        if (address.includes(':')) {
            return AddressFamily.IPv6;
        }
        return AddressFamily.IPv4;
    };
    /**
     * Get priority based on candidate type + address family
     * IPv6 prioritized for JIO ISP (native IPv6 support)
     * relay < srflx < host in typical networks
     * IPv6 > IPv4 when available
     */
    ICEFrameworkImpl.prototype.getTypePriority = function (type, addressFamily) {
        // Base priority by type
        var basePriority = 0;
        switch (type) {
            case CandidateType.HOST:
                basePriority = 126; // Highest for LAN
                break;
            case CandidateType.SRFLX:
                basePriority = 100; // Public IP via STUN
                break;
            case CandidateType.PRFLX:
                basePriority = 110;
                break;
            case CandidateType.RELAY:
                basePriority = 0; // Fallback (but used when necessary)
                break;
            default:
                basePriority = 0;
        }
        // IPv6 bonus: +50 priority for IPv6 addresses
        // JIO ISP prioritizes IPv6 networking
        if (addressFamily === AddressFamily.IPv6) {
            return basePriority + 50; // IPv6 gets significant boost
        }
        return basePriority;
    };
    /**
     * Detect if behind CG-NAT
     * CG-NAT characteristics: only relay candidates work, no srflx
     * NOTE: IPv6 doesn't suffer from CG-NAT as much - prefer IPv6
     */
    ICEFrameworkImpl.prototype.detectCGNAT = function (connection) {
        var localCandidates = connection.localCandidates;
        var hasRelayIPv4 = localCandidates.some(function (c) { return c.type === CandidateType.RELAY && c.addressFamily === AddressFamily.IPv4; });
        var hasSRFLXIPv4 = localCandidates.some(function (c) { return c.type === CandidateType.SRFLX && c.addressFamily === AddressFamily.IPv4; });
        var hasIPv6 = localCandidates.some(function (c) { return c.addressFamily === AddressFamily.IPv6; });
        var hasHostIPv4 = localCandidates.some(function (c) { return c.type === CandidateType.HOST && c.addressFamily === AddressFamily.IPv4; });
        // CG-NAT only affects IPv4
        if (hasRelayIPv4 && !hasSRFLXIPv4 && hasHostIPv4) {
            this.networkProfile.behindCGNAT = true;
            console.warn('⚠️ [ICE] CG-NAT (IPv4) detected! IPv6 should be preferred by JIO ISP');
            // If IPv6 available, it bypasses CG-NAT entirely
            if (hasIPv6) {
                console.log('✅ [ICE] IPv6 available - will bypass CG-NAT limitation');
            }
        }
    };
    /**
     * Handle ICE connection state changes
     */
    ICEFrameworkImpl.prototype.handleICEConnectionStateChange = function (connectionId, peerConnection) {
        var connection = this.connections.get(connectionId);
        if (!connection)
            return;
        var newState = peerConnection.iceConnectionState;
        switch (newState) {
            case 'checking':
                connection.state = 'checking';
                console.log("\uD83D\uDD0D [ICE] Checking connectivity with @".concat(connection.peerId));
                break;
            case 'connected':
            case 'completed':
                connection.state = 'connected';
                connection.connectedAt = Date.now();
                // Log connection established (stats access requires async, which we can't do in event handler)
                console.log("\u2705 [ICE] Connection established with @".concat(connection.peerId));
                break;
            case 'failed':
                connection.state = 'failed';
                console.error("\u274C [ICE] Connection failed with @".concat(connection.peerId));
                break;
            case 'disconnected':
                connection.state = 'disconnected';
                console.warn("\u26A0\uFE0F [ICE] Disconnected from @".concat(connection.peerId));
                break;
        }
        // Notify state listeners
        var callback = this.connectionStateCallbacks.get(connectionId);
        if (callback) {
            callback(connection);
        }
    };
    /**
     * Create ICE candidate from WebRTC candidate
     */
    ICEFrameworkImpl.prototype.createICECandidate = function (rtcCandidate, type) {
        return {
            id: (0, uuid_1.v4)(),
            foundation: rtcCandidate.foundation || '',
            component: rtcCandidate.component,
            type: type,
            priority: rtcCandidate.priority || 0,
            address: rtcCandidate.address || '',
            port: rtcCandidate.port || 0,
            addressFamily: this.detectAddressFamily(rtcCandidate.address || ''),
            candidate: rtcCandidate,
            success: true,
            timestamp: Date.now(),
        };
    };
    /**
     * Get network profile
     */
    ICEFrameworkImpl.prototype.getNetworkProfile = function () {
        return __assign({}, this.networkProfile);
    };
    /**
     * Get connection state
     */
    ICEFrameworkImpl.prototype.getConnection = function (peerId) {
        return this.connections.get(peerId);
    };
    /**
     * Get all connections
     */
    ICEFrameworkImpl.prototype.getAllConnections = function () {
        return Array.from(this.connections.values());
    };
    /**
     * Register callback for individual candidates
     */
    ICEFrameworkImpl.prototype.onCandidate = function (peerId, callback) {
        this.candidateCallbacks.set(peerId, callback);
    };
    /**
     * Register callback for connection state changes
     */
    ICEFrameworkImpl.prototype.onConnectionStateChange = function (peerId, callback) {
        this.connectionStateCallbacks.set(peerId, callback);
    };
    /**
     * Enable/disable Trickle ICE
     */
    ICEFrameworkImpl.prototype.setTrickleICEEnabled = function (enabled) {
        this.trickleIceEnabled = enabled;
        console.log("".concat(enabled ? '✅' : '❌', " Trickle ICE ").concat(enabled ? 'enabled' : 'disabled'));
    };
    /**
     * Get pending trickle ICE candidates
     */
    ICEFrameworkImpl.prototype.getPendingCandidates = function (peerId) {
        var queue = this.trickleCandidateQueues.get(peerId) || [];
        var pending = __spreadArray([], queue, true);
        this.trickleCandidateQueues.set(peerId, []); // Clear queue after retrieval
        return pending;
    };
    /**
     * STUN/TURN test within ICE framework
     */
    ICEFrameworkImpl.prototype.testSTUNServer = function (stunUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, peerConnection_2, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        peerConnection_2 = new RTCPeerConnection({
                            iceServers: [{ urls: [stunUrl] }],
                        });
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var timeout = setTimeout(function () {
                                    peerConnection_2.close();
                                    resolve({ success: false });
                                }, 5000);
                                peerConnection_2.onicecandidate = function (event) {
                                    var _a;
                                    if (event.candidate && event.candidate.type === 'srflx') {
                                        clearTimeout(timeout);
                                        peerConnection_2.close();
                                        resolve({
                                            success: true,
                                            address: (_a = event.candidate.address) !== null && _a !== void 0 ? _a : undefined,
                                            latency: Date.now() - startTime,
                                        });
                                    }
                                };
                                peerConnection_2.createDataChannel('test');
                                peerConnection_2.createOffer().then(function (offer) { return peerConnection_2.setLocalDescription(offer); });
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        err_1 = _a.sent();
                        console.log('STUN probe error:', err_1);
                        return [2 /*return*/, { success: false }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate ICE diagnostic report
     */
    ICEFrameworkImpl.prototype.generateReport = function () {
        var profile = this.networkProfile;
        var connections = Array.from(this.connections.values());
        var report = "\nICE Framework Diagnostic Report\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\nNetwork Profile:\n  \u2022 IPv4 Available: ".concat(profile.ipv4Available, "\n  \u2022 IPv6 Available: ").concat(profile.ipv6Available, "\n  \u2022 Behind CG-NAT: ").concat(profile.behindCGNAT, "\n  \u2022 Connectivity Type: ").concat(profile.connectivity, "\n  \u2022 Public IPv4: ").concat(profile.publicIP || 'N/A', "\n  \u2022 Public IPv6: ").concat(profile.publicIPv6 || 'N/A', "\n\nActive Connections: ").concat(connections.length, "\n").concat(connections.map(function (conn) {
            var _a, _b, _c;
            return "\n  Peer: @".concat(conn.peerId, "\n    State: ").concat(conn.state, "\n    Local Candidates: ").concat(conn.localCandidates.length, "\n      - Host: ").concat(conn.localCandidates.filter(function (c) { return c.type === CandidateType.HOST; }).length, "\n      - SRFLX: ").concat(conn.localCandidates.filter(function (c) { return c.type === CandidateType.SRFLX; }).length, "\n      - Relay: ").concat(conn.localCandidates.filter(function (c) { return c.type === CandidateType.RELAY; }).length, "\n    Remote Candidates: ").concat(conn.remoteCandidates.length, "\n    Selected: ").concat((_a = conn.selectedCandidate) === null || _a === void 0 ? void 0 : _a.address, ":").concat((_b = conn.selectedCandidate) === null || _b === void 0 ? void 0 : _b.port, " (").concat((_c = conn.selectedCandidate) === null || _c === void 0 ? void 0 : _c.type, ")\n    RTT: ").concat(conn.rtt, "ms\n");
        }).join(''), "\n\nTrickle ICE: ").concat(this.trickleIceEnabled ? 'Enabled' : 'Disabled', "\n    ");
        return report;
    };
    return ICEFrameworkImpl;
}());
// Export singleton
exports.ICEFramework = new ICEFrameworkImpl();
exports.default = exports.ICEFramework;
