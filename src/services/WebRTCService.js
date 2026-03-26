"use strict";
/**
 * Project Aegis - WebRTC Service
 * Handles P2P data channel establishment and message tunneling
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_webrtc_1 = require("react-native-webrtc");
// eslint-disable-next-line
var TURNFallbackService_1 = __importDefault(require("./TURNFallbackService"));
var PerformanceOptimizationService_1 = __importDefault(require("./PerformanceOptimizationService"));
var gundbService_1 = require("./gundbService");
var WebRTCService = /** @class */ (function () {
    function WebRTCService() {
    }
    /**
     * Get ICE servers from TURN service
     */
    WebRTCService.getICEServersConfig = function () {
        return TURNFallbackService_1.default.getICEServers();
    };
    /**
     * Create a new peer connection with a remote peer
     */
    WebRTCService.createPeerConnection = function (remotePeerAlias, isInitiator) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, usedTURN, peerConnection_1, dataChannel;
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    startTime = Date.now();
                    usedTURN = TURNFallbackService_1.default.isTURNForced();
                    this.connectionAttempts.set(remotePeerAlias, { startTime: startTime, usedTURN: usedTURN });
                    peerConnection_1 = new react_native_webrtc_1.RTCPeerConnection({
                        iceServers: this.getICEServersConfig(),
                    });
                    // If initiator, create data channel
                    if (isInitiator) {
                        dataChannel = peerConnection_1.createDataChannel('chat', {
                            ordered: true,
                        });
                        this.setupDataChannelHandlers(dataChannel, remotePeerAlias);
                    }
                    // Listen for incoming data channels
                    peerConnection_1.ondatachannel = function (event) {
                        var dataChannel = event.channel;
                        _this.setupDataChannelHandlers(dataChannel, remotePeerAlias);
                    };
                    // Handle incoming media tracks (for audio/video calls)
                    peerConnection_1.ontrack = function (event) {
                        console.log("\uD83D\uDCF9 Remote track received from @".concat(remotePeerAlias, ": ").concat(event.track.kind));
                        if (event.streams.length > 0) {
                            var handler = _this.onTrackHandlers.get(remotePeerAlias);
                            if (handler) {
                                handler(event.streams[0]);
                            }
                        }
                    };
                    // Handle ICE candidates
                    peerConnection_1.onicecandidate = function (event) {
                        if (event.candidate) {
                            console.log("\uD83E\uDDCA ICE candidate for ".concat(remotePeerAlias, ":"), event.candidate);
                            // Queue the candidate for batch publishing
                            if (!_this.iceCandidatesQueue.has(remotePeerAlias)) {
                                _this.iceCandidatesQueue.set(remotePeerAlias, []);
                            }
                            _this.iceCandidatesQueue.get(remotePeerAlias).push({
                                candidate: event.candidate.candidate,
                                sdpMLineIndex: event.candidate.sdpMLineIndex,
                                sdpMid: event.candidate.sdpMid,
                            });
                            // Batch publish candidates every 500ms or after 10 candidates
                            var candidates = _this.iceCandidatesQueue.get(remotePeerAlias);
                            if (candidates.length >= 10) {
                                _this.publishBatchedCandidates(remotePeerAlias);
                            }
                            else if (!_this.candidatePublishTimers.has(remotePeerAlias)) {
                                var timer = setTimeout(function () {
                                    _this.publishBatchedCandidates(remotePeerAlias);
                                }, 500);
                                _this.candidatePublishTimers.set(remotePeerAlias, timer);
                            }
                        }
                    };
                    // Handle connection state changes
                    peerConnection_1.onconnectionstatechange = function () {
                        console.log("\uD83D\uDD0C Connection state with ".concat(remotePeerAlias, ": ").concat(peerConnection_1.connectionState));
                        var peer = _this.peers.get(remotePeerAlias);
                        if (peer) {
                            peer.isConnected = peerConnection_1.connectionState === 'connected';
                        }
                        // Record connection stats when connected or failed
                        if (peerConnection_1.connectionState === 'connected') {
                            _this.recordConnectionSuccess(remotePeerAlias);
                        }
                        else if (peerConnection_1.connectionState === 'failed') {
                            _this.recordConnectionFailure(remotePeerAlias);
                        }
                    };
                    // Store peer connection
                    this.peers.set(remotePeerAlias, {
                        peer: peerConnection_1,
                        isConnected: false,
                    });
                    console.log("\u2713 Peer connection created for @".concat(remotePeerAlias));
                    return [2 /*return*/, peerConnection_1];
                }
                catch (error) {
                    console.error("Failed to create peer connection: ".concat(error));
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Setup data channel event handlers
     */
    WebRTCService.setupDataChannelHandlers = function (dataChannel, remotePeerAlias) {
        var _this = this;
        dataChannel.onopen = function () {
            console.log("\u2705 Data channel opened with @".concat(remotePeerAlias));
            var peer = _this.peers.get(remotePeerAlias);
            if (peer) {
                peer.dataChannel = dataChannel;
                peer.isConnected = true;
            }
        };
        dataChannel.onclose = function () {
            console.log("\u274C Data channel closed with @".concat(remotePeerAlias));
            var peer = _this.peers.get(remotePeerAlias);
            if (peer) {
                peer.isConnected = false;
            }
        };
        dataChannel.onmessage = function (event) {
            try {
                var message = JSON.parse(event.data);
                console.log("\uD83D\uDCAC Received from @".concat(remotePeerAlias, ":"), message);
                // TODO: Pass to MessageService for handling
            }
            catch (error) {
                console.error('Failed to parse message:', error);
            }
        };
        dataChannel.onerror = function (error) {
            console.error("Data channel error with @".concat(remotePeerAlias, ":"), error);
        };
    };
    /**
     * Send a message to a peer via data channel
     */
    WebRTCService.sendMessage = function (remotePeerAlias, message) {
        return __awaiter(this, void 0, void 0, function () {
            var peer;
            return __generator(this, function (_a) {
                peer = this.peers.get(remotePeerAlias);
                if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
                    console.warn("\u26A0\uFE0F  No open data channel for @".concat(remotePeerAlias));
                    return [2 /*return*/, false];
                }
                try {
                    peer.dataChannel.send(JSON.stringify(message));
                    console.log("\u2713 Message sent to @".concat(remotePeerAlias));
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error("Failed to send message: ".concat(error));
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Create SDP offer for WebRTC handshake
     */
    WebRTCService.createOffer = function (remotePeerAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var peer, offer, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        peer = this.peers.get(remotePeerAlias);
                        if (!peer) {
                            throw new Error("No peer connection for ".concat(remotePeerAlias));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, peer.peer.createOffer({
                                offerToReceiveAudio: false,
                                offerToReceiveVideo: false,
                            })];
                    case 2:
                        offer = _a.sent();
                        return [4 /*yield*/, peer.peer.setLocalDescription(offer)];
                    case 3:
                        _a.sent();
                        console.log("\u2713 SDP offer created for @".concat(remotePeerAlias));
                        return [2 /*return*/, offer];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Failed to create offer: ".concat(error_1));
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Set remote SDP answer
     */
    WebRTCService.setRemoteAnswer = function (remotePeerAlias, answer) {
        return __awaiter(this, void 0, void 0, function () {
            var peer, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        peer = this.peers.get(remotePeerAlias);
                        if (!peer) {
                            throw new Error("No peer connection for ".concat(remotePeerAlias));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, peer.peer.setRemoteDescription(answer)];
                    case 2:
                        _a.sent();
                        console.log("\u2713 Remote answer set for @".concat(remotePeerAlias));
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error("Failed to set remote answer: ".concat(error_2));
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create SDP answer for WebRTC handshake
     */
    WebRTCService.createAnswer = function (remotePeerAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var peer, answer, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        peer = this.peers.get(remotePeerAlias);
                        if (!peer) {
                            throw new Error("No peer connection for ".concat(remotePeerAlias));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, peer.peer.createAnswer()];
                    case 2:
                        answer = _a.sent();
                        return [4 /*yield*/, peer.peer.setLocalDescription(answer)];
                    case 3:
                        _a.sent();
                        console.log("\u2713 SDP answer created for @".concat(remotePeerAlias));
                        return [2 /*return*/, answer];
                    case 4:
                        error_3 = _a.sent();
                        console.error("Failed to create answer: ".concat(error_3));
                        throw error_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Set remote SDP offer
     */
    WebRTCService.setRemoteOffer = function (remotePeerAlias, offer) {
        return __awaiter(this, void 0, void 0, function () {
            var peer, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        peer = this.peers.get(remotePeerAlias);
                        if (!!peer) return [3 /*break*/, 2];
                        // Create new peer connection if doesn't exist
                        return [4 /*yield*/, this.createPeerConnection(remotePeerAlias, false)];
                    case 1:
                        // Create new peer connection if doesn't exist
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, peer.peer.setRemoteDescription(offer)];
                    case 3:
                        _a.sent();
                        console.log("\u2713 Remote offer set for @".concat(remotePeerAlias));
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        console.error("Failed to set remote offer: ".concat(error_4));
                        throw error_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add ICE candidate
     */
    WebRTCService.addIceCandidate = function (remotePeerAlias, candidate) {
        return __awaiter(this, void 0, void 0, function () {
            var peer, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        peer = this.peers.get(remotePeerAlias);
                        if (!peer) {
                            throw new Error("No peer connection for ".concat(remotePeerAlias));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, peer.peer.addIceCandidate(candidate)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error("Failed to add ICE candidate: ".concat(error_5));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if connection is ready
     */
    WebRTCService.isConnected = function (remotePeerAlias) {
        var peer = this.peers.get(remotePeerAlias);
        return !!(peer && peer.isConnected && peer.dataChannel);
    };
    /**
     * Close peer connection
     */
    WebRTCService.closePeerConnection = function (remotePeerAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var peer;
            var _a;
            return __generator(this, function (_b) {
                peer = this.peers.get(remotePeerAlias);
                if (peer) {
                    (_a = peer.dataChannel) === null || _a === void 0 ? void 0 : _a.close();
                    peer.peer.close();
                    this.peers.delete(remotePeerAlias);
                    console.log("\u2713 Peer connection closed for @".concat(remotePeerAlias));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get all active peer connections
     */
    WebRTCService.getActivePeers = function () {
        var _this = this;
        return Array.from(this.peers.keys()).filter(function (alias) { var _a; return (_a = _this.peers.get(alias)) === null || _a === void 0 ? void 0 : _a.isConnected; });
    };
    /**
     * Add a media track to the peer connection (for audio/video calls)
     */
    WebRTCService.addTrack = function (remotePeerAlias, track, stream) {
        return __awaiter(this, void 0, void 0, function () {
            var peer, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        peer = this.peers.get(remotePeerAlias);
                        if (!peer) {
                            throw new Error("No peer connection for ".concat(remotePeerAlias));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, peer.peer.addTrack(track, stream)];
                    case 2:
                        _a.sent();
                        console.log("\u2713 ".concat(track.kind, " track added for @").concat(remotePeerAlias));
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        console.error("Failed to add track: ".concat(error_6));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Register handler for remote media streams
     */
    WebRTCService.onRemoteStream = function (remotePeerAlias, handler) {
        this.onTrackHandlers.set(remotePeerAlias, handler);
        // If peer connection already exists, set up ontrack
        var peer = this.peers.get(remotePeerAlias);
        if (peer) {
            peer.peer.addEventListener('track', function (event) {
                console.log("\uD83D\uDCF9 Remote track received from @".concat(remotePeerAlias, ": ").concat(event.track.kind));
                if (event.streams.length > 0) {
                    handler(event.streams[0]);
                }
            });
        }
    };
    /**
     * Register handler for incoming media tracks
     */
    WebRTCService.onTrack = function (remotePeerAlias, handler) {
        this.onTrackHandlers.set(remotePeerAlias, handler);
    };
    /**
     * Add local media stream to peer connection
     */
    WebRTCService.addLocalStream = function (remotePeerAlias, stream) {
        return __awaiter(this, void 0, void 0, function () {
            var peer, tracks, _i, tracks_1, track, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        peer = this.peers.get(remotePeerAlias);
                        if (!peer) {
                            throw new Error("No peer connection for ".concat(remotePeerAlias));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        tracks = stream.getTracks();
                        _i = 0, tracks_1 = tracks;
                        _a.label = 2;
                    case 2:
                        if (!(_i < tracks_1.length)) return [3 /*break*/, 5];
                        track = tracks_1[_i];
                        return [4 /*yield*/, peer.peer.addTrack(track, stream)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        console.log("\u2713 Local stream added for @".concat(remotePeerAlias));
                        return [3 /*break*/, 7];
                    case 6:
                        error_7 = _a.sent();
                        console.error("Failed to add local stream: ".concat(error_7));
                        throw error_7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get RTCPeerConnection for advanced operations
     */
    WebRTCService.getPeerConnection = function (remotePeerAlias) {
        var _a;
        return (_a = this.peers.get(remotePeerAlias)) === null || _a === void 0 ? void 0 : _a.peer;
    };
    /**
     * Enable/disable audio track
     */
    WebRTCService.setAudioEnabled = function (remotePeerAlias, enabled) {
        var peer = this.peers.get(remotePeerAlias);
        if (peer) {
            var senders = peer.peer.getSenders();
            senders.forEach(function (sender) {
                if (sender.track && sender.track.kind === 'audio') {
                    sender.track.enabled = enabled;
                }
            });
        }
    };
    /**
     * Enable/disable video track
     */
    WebRTCService.setVideoEnabled = function (remotePeerAlias, enabled) {
        var peer = this.peers.get(remotePeerAlias);
        if (peer) {
            var senders = peer.peer.getSenders();
            senders.forEach(function (sender) {
                if (sender.track && sender.track.kind === 'video') {
                    sender.track.enabled = enabled;
                }
            });
        }
    };
    /**
     * Record successful connection (for TURN stats)
     */
    WebRTCService.recordConnectionSuccess = function (remotePeerAlias) {
        var attempt = this.connectionAttempts.get(remotePeerAlias);
        if (attempt) {
            var latency = Date.now() - attempt.startTime;
            TURNFallbackService_1.default.recordConnectionAttempt(attempt.usedTURN, true, latency);
            console.log("\u2705 Connection successful in ".concat(latency, "ms ").concat(attempt.usedTURN ? '(TURN relay)' : '(direct P2P)'));
            this.connectionAttempts.delete(remotePeerAlias);
        }
    };
    /**
     * Record failed connection (for TURN stats)
     */
    WebRTCService.recordConnectionFailure = function (remotePeerAlias) {
        var attempt = this.connectionAttempts.get(remotePeerAlias);
        if (attempt) {
            var latency = Date.now() - attempt.startTime;
            TURNFallbackService_1.default.recordConnectionAttempt(attempt.usedTURN, false, latency);
            console.log("\u274C Connection failed after ".concat(latency, "ms ").concat(attempt.usedTURN ? '(TURN relay)' : '(direct P2P)'));
            this.connectionAttempts.delete(remotePeerAlias);
        }
    };
    /**
     * Check if should use TURN fallback for next connection
     */
    WebRTCService.shouldUseTURN = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TURNFallbackService_1.default.shouldUseTURN()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Force TURN mode (useful for debugging or extreme NAT situations)
     */
    WebRTCService.forceTURN = function (force) {
        TURNFallbackService_1.default.forceTURNMode(force);
    };
    /**
     * Get TURN fallback statistics
     */
    WebRTCService.getTURNStats = function () {
        return TURNFallbackService_1.default.getConnectionStats();
    };
    /**
     * Get diagnostic recommendations for connection issues
     */
    WebRTCService.getTURNRecommendations = function () {
        return TURNFallbackService_1.default.getRecommendations();
    };
    /**
     * Send a file chunk over data channel
     * Splits large messages into manageable packets
     */
    WebRTCService.sendFileChunk = function (remotePeerAlias, fileChunkPacket) {
        return __awaiter(this, void 0, void 0, function () {
            var peer, packet;
            return __generator(this, function (_a) {
                peer = this.peers.get(remotePeerAlias);
                if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
                    console.warn("\u26A0\uFE0F No open data channel for @".concat(remotePeerAlias));
                    return [2 /*return*/, false];
                }
                try {
                    packet = {
                        type: 'file_chunk',
                        payload: fileChunkPacket,
                    };
                    peer.dataChannel.send(JSON.stringify(packet));
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error("Failed to send file chunk: ".concat(error));
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Send file metadata (before transfer starts)
     */
    WebRTCService.sendFileMetadata = function (remotePeerAlias, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var peer, packet;
            return __generator(this, function (_a) {
                peer = this.peers.get(remotePeerAlias);
                if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
                    console.warn("\u26A0\uFE0F No open data channel for @".concat(remotePeerAlias));
                    return [2 /*return*/, false];
                }
                try {
                    packet = {
                        type: 'file_metadata',
                        payload: metadata,
                    };
                    peer.dataChannel.send(JSON.stringify(packet));
                    console.log("\uD83D\uDCE4 File metadata sent to @".concat(remotePeerAlias));
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error("Failed to send file metadata: ".concat(error));
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Send file transfer complete confirmation
     */
    WebRTCService.sendFileComplete = function (remotePeerAlias, fileId) {
        return __awaiter(this, void 0, void 0, function () {
            var peer, packet;
            return __generator(this, function (_a) {
                peer = this.peers.get(remotePeerAlias);
                if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
                    console.warn("\u26A0\uFE0F No open data channel for @".concat(remotePeerAlias));
                    return [2 /*return*/, false];
                }
                try {
                    packet = {
                        type: 'file_complete',
                        payload: { fileId: fileId },
                    };
                    peer.dataChannel.send(JSON.stringify(packet));
                    console.log("\u2705 File complete sent to @".concat(remotePeerAlias));
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error("Failed to send file complete: ".concat(error));
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Register handler for file metadata
     */
    WebRTCService.onFileMetadata = function (handler) {
        // This would be called from setupDataChannelHandlers
        // Storing for reference when implementing full packet routing
        console.log('✓ File metadata handler registered');
    };
    /**
     * Register handler for file chunks
     */
    WebRTCService.onFileChunk = function (handler) {
        console.log('✓ File chunk handler registered');
    };
    /**
     * Send sync request to peer (for multi-device sync)
     */
    WebRTCService.sendSyncRequest = function (remotePeerAlias, syncRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var peer, packet;
            return __generator(this, function (_a) {
                peer = this.peers.get(remotePeerAlias);
                if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
                    console.warn("\u26A0\uFE0F No open data channel for @".concat(remotePeerAlias, " (sync request)"));
                    return [2 /*return*/, false];
                }
                try {
                    packet = {
                        type: 'sync_request',
                        payload: syncRequest,
                    };
                    peer.dataChannel.send(JSON.stringify(packet));
                    console.log("\uD83D\uDCF1 Sync request sent to @".concat(remotePeerAlias));
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error("Failed to send sync request: ".concat(error));
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Send sync payload to peer (exported message history)
     */
    WebRTCService.sendSyncPayload = function (remotePeerAlias, syncPayload) {
        return __awaiter(this, void 0, void 0, function () {
            var peer, packet, json, chunkSize, totalChunks, i, start, end, chunk, chunkPacket, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        peer = this.peers.get(remotePeerAlias);
                        if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
                            console.warn("\u26A0\uFE0F No open data channel for @".concat(remotePeerAlias, " (sync payload)"));
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        packet = {
                            type: 'sync_payload',
                            payload: syncPayload,
                        };
                        json = JSON.stringify(packet);
                        chunkSize = 15000;
                        if (!(json.length > chunkSize)) return [3 /*break*/, 6];
                        totalChunks = Math.ceil(json.length / chunkSize);
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < totalChunks)) return [3 /*break*/, 5];
                        start = i * chunkSize;
                        end = Math.min(start + chunkSize, json.length);
                        chunk = json.substring(start, end);
                        chunkPacket = {
                            type: 'sync_payload_chunk',
                            syncId: syncPayload.syncId,
                            chunkIndex: i,
                            totalChunks: totalChunks,
                            data: chunk,
                        };
                        peer.dataChannel.send(JSON.stringify(chunkPacket));
                        // Small delay between chunks to avoid buffer overflow
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 10); })];
                    case 3:
                        // Small delay between chunks to avoid buffer overflow
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        peer.dataChannel.send(json);
                        _a.label = 7;
                    case 7:
                        console.log("\uD83D\uDCE6 Sync payload sent to @".concat(remotePeerAlias, " (").concat((json.length / 1024).toFixed(2), "KB)"));
                        return [2 /*return*/, true];
                    case 8:
                        error_8 = _a.sent();
                        console.error("Failed to send sync payload: ".concat(error_8));
                        return [2 /*return*/, false];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Register handler for incoming sync requests
     */
    WebRTCService.onSyncRequest = function (handler) {
        console.log('✓ Sync request handler registered');
    };
    /**
     * Register handler for incoming sync payloads
     */
    WebRTCService.onSyncPayload = function (handler) {
        console.log('✓ Sync payload handler registered');
    };
    /**
     * Send group message to a member (for full-mesh P2P delivery)
     */
    WebRTCService.sendGroupMessage = function (remotePeerAlias, groupMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var peer, packet;
            return __generator(this, function (_a) {
                peer = this.peers.get(remotePeerAlias);
                if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
                    console.warn("\u26A0\uFE0F No open data channel for @".concat(remotePeerAlias, " (group message)"));
                    return [2 /*return*/, false];
                }
                try {
                    packet = {
                        type: 'group_message',
                        payload: groupMessage,
                    };
                    peer.dataChannel.send(JSON.stringify(packet));
                    console.log("\uD83D\uDCAC Group message sent to @".concat(remotePeerAlias));
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error("Failed to send group message: ".concat(error));
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Send group message read receipt to a member
     */
    WebRTCService.sendGroupMessageRead = function (remotePeerAlias, groupId, messageId) {
        return __awaiter(this, void 0, void 0, function () {
            var peer, packet;
            return __generator(this, function (_a) {
                peer = this.peers.get(remotePeerAlias);
                if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
                    console.warn("\u26A0\uFE0F No open data channel for @".concat(remotePeerAlias, " (group read)"));
                    return [2 /*return*/, false];
                }
                try {
                    packet = {
                        type: 'group_message_read',
                        payload: { groupId: groupId, messageId: messageId },
                    };
                    peer.dataChannel.send(JSON.stringify(packet));
                    console.log("\u2713 Group message read sent for ".concat(messageId));
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error("Failed to send group message read: ".concat(error));
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Register handler for incoming group messages
     */
    WebRTCService.onGroupMessage = function (handler) {
        console.log('✓ Group message handler registered');
    };
    /**
     * Register handler for group message read receipts
     */
    WebRTCService.onGroupMessageRead = function (handler) {
        console.log('✓ Group message read handler registered');
    };
    /**
     * Select optimal codecs based on bandwidth
     */
    WebRTCService.selectOptimalCodecs = function (remotePeerAlias, bandwidthBps) {
        var audioCodec = PerformanceOptimizationService_1.default.selectOptimalCodec('audio', bandwidthBps);
        var videoCodec = PerformanceOptimizationService_1.default.selectOptimalCodec('video', bandwidthBps);
        var result = {
            audio: (audioCodec === null || audioCodec === void 0 ? void 0 : audioCodec.name) || 'Opus',
            video: (videoCodec === null || videoCodec === void 0 ? void 0 : videoCodec.name) || 'H264',
        };
        console.log("\uD83C\uDFAC Selected codecs for @".concat(remotePeerAlias, ": audio=").concat(result.audio, ", video=").concat(result.video));
        return result;
    };
    /**
     * Get recommended quality settings based on bandwidth
     */
    WebRTCService.getRecommendedQuality = function (bandwidthBps) {
        return PerformanceOptimizationService_1.default.getRecommendedQualitySettings(bandwidthBps);
    };
    /**
     * Monitor bandwidth and adjust quality dynamically
     */
    WebRTCService.monitorBandwidth = function (remotePeerAlias, peer) {
        return __awaiter(this, void 0, void 0, function () {
            var stats, uploadBps_1, downloadBps_1, avgBandwidth, quality, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, peer.getStats()];
                    case 1:
                        stats = _a.sent();
                        uploadBps_1 = 0;
                        downloadBps_1 = 0;
                        stats.forEach(function (report) {
                            if (report.type === 'inbound-rtp') {
                                // Download: bytes received
                                downloadBps_1 += (report.bytesReceived || 0) * 8; // Convert to bits
                            }
                            else if (report.type === 'outbound-rtp') {
                                // Upload: bytes sent
                                uploadBps_1 += (report.bytesSent || 0) * 8;
                            }
                        });
                        // Record bandwidth measurement
                        PerformanceOptimizationService_1.default.recordBandwidth(remotePeerAlias, uploadBps_1, downloadBps_1);
                        avgBandwidth = PerformanceOptimizationService_1.default.getAverageBandwidth(remotePeerAlias, 10000);
                        if (avgBandwidth) {
                            quality = PerformanceOptimizationService_1.default.getRecommendedQualitySettings(avgBandwidth);
                            console.log("\uD83D\uDCCA Recommended quality: ".concat(quality.resolution, " @ ").concat(quality.framerate, "fps, ").concat(quality.bitrate, "kbps"));
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        console.warn('Bandwidth monitoring failed:', error_9);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update connection quality metrics
     */
    WebRTCService.updateQualityMetrics = function (remotePeerAlias, latency, packetLoss, jitter) {
        PerformanceOptimizationService_1.default.updateConnectionMetrics(remotePeerAlias, {
            latency: latency,
            packetLoss: packetLoss,
            jitter: jitter,
            rttMean: latency,
        });
        console.log("\uD83D\uDCC8 Updated quality metrics for @".concat(remotePeerAlias, ": latency=").concat(latency, "ms, loss=").concat(packetLoss, "%, jitter=").concat(jitter, "ms"));
    };
    /**
     * Get quality recommendations for peer
     */
    WebRTCService.getQualityRecommendations = function (remotePeerAlias) {
        return PerformanceOptimizationService_1.default.getQualityRecommendations(remotePeerAlias);
    };
    /**
     * Get performance stats across all connections
     */
    WebRTCService.getPerformanceStats = function () {
        return PerformanceOptimizationService_1.default.getPerformanceStats();
    };
    /**
     * Get bandwidth history for a peer
     */
    WebRTCService.getBandwidthHistory = function (remotePeerAlias, limit) {
        return PerformanceOptimizationService_1.default.getBandwidthHistory(remotePeerAlias, limit);
    };
    /**
     * Publish batched ICE candidates to GunDB
     * Called either when 10 candidates are queued or after 500ms timeout
     */
    WebRTCService.publishBatchedCandidates = function (remotePeerAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var timer, candidates, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        timer = this.candidatePublishTimers.get(remotePeerAlias);
                        if (timer) {
                            clearTimeout(timer);
                            this.candidatePublishTimers.delete(remotePeerAlias);
                        }
                        candidates = this.iceCandidatesQueue.get(remotePeerAlias);
                        if (!candidates || candidates.length === 0) {
                            return [2 /*return*/];
                        }
                        // Publish to GunDB
                        return [4 /*yield*/, gundbService_1.GunDBService.publishICECandidates(remotePeerAlias, candidates)];
                    case 1:
                        // Publish to GunDB
                        _a.sent();
                        console.log("\u2713 Published ".concat(candidates.length, " ICE candidates for @").concat(remotePeerAlias));
                        // Clear the queue
                        this.iceCandidatesQueue.delete(remotePeerAlias);
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        console.error("Failed to publish ICE candidates for @".concat(remotePeerAlias, ":"), error_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WebRTCService.peers = new Map();
    WebRTCService.onTrackHandlers = new Map();
    WebRTCService.connectionAttempts = new Map();
    WebRTCService.iceCandidatesQueue = new Map(); // Queue ICE candidates for batching
    WebRTCService.candidatePublishTimers = new Map(); // Timers for batch publishing
    // Legacy config - now uses TURNFallbackService for dynamic ICE server selection
    WebRTCService.config = {
        iceServers: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
        ],
    };
    return WebRTCService;
}());
exports.default = WebRTCService;
