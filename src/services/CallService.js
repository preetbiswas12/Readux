"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var gundbService_1 = require("./gundbService");
// @ts-ignore - Importing service singleton instance
var WebRTCService_1 = __importDefault(require("./WebRTCService"));
var KeyExchangeService_1 = __importDefault(require("./KeyExchangeService"));
// @ts-ignore - E2EEncryptionService is default exported as singleton
var E2EEncryptionService_1 = __importDefault(require("./E2EEncryptionService"));
var CallService = /** @class */ (function () {
    function CallService() {
        this.callSessions = new Map();
        this.callRequestHandlers = [];
        this.callStateHandlers = new Map();
        this.mediaEncryptionSessions = new Set(); // Track SRTP encryption sessions
    }
    /**
     * Initiate a call request (with E2EE media encryption)
     */
    CallService.prototype.initiateCall = function (peerAlias_1) {
        return __awaiter(this, arguments, void 0, function (peerAlias, callType, fromAlias) {
            var callId, mediaSessionId, _a, sessionId, ephemeralPublicKey, sharedSecret, error_1, callRequest, callSession;
            if (callType === void 0) { callType = 'video'; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        callId = "call_".concat(Date.now());
                        mediaSessionId = "media_".concat(callId);
                        // Create WebRTC peer connection
                        return [4 /*yield*/, WebRTCService_1.default.createPeerConnection(peerAlias, true)];
                    case 1:
                        // Create WebRTC peer connection
                        _b.sent();
                        return [4 /*yield*/, KeyExchangeService_1.default.initializeSession(peerAlias)];
                    case 2:
                        _a = _b.sent(), sessionId = _a.sessionId, ephemeralPublicKey = _a.ephemeralPublicKey;
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, this.deriveMediaSharedSecret(peerAlias)];
                    case 4:
                        sharedSecret = _b.sent();
                        return [4 /*yield*/, E2EEncryptionService_1.default.initializeMediaSession(mediaSessionId, new Uint8Array(Buffer.from(sharedSecret, 'hex')), 3600 // 1 hour session
                            )];
                    case 5:
                        _b.sent();
                        this.mediaEncryptionSessions.add(mediaSessionId);
                        console.log("\uD83D\uDD10 SRTP encryption initialized for call: ".concat(callId));
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _b.sent();
                        console.warn("\u26A0\uFE0F Failed to initialize SRTP: ".concat(error_1));
                        return [3 /*break*/, 7];
                    case 7:
                        callRequest = {
                            id: callId,
                            from: fromAlias || 'currentUser', // ✅ Use actual alias
                            to: peerAlias,
                            type: callType,
                            timestamp: Date.now(),
                        };
                        // Publish call request to GunDB
                        return [4 /*yield*/, gundbService_1.GunDBService.publishCallRequest(peerAlias, __assign(__assign({}, callRequest), { ephemeralPublicKey: ephemeralPublicKey, sessionId: sessionId, mediaSessionId: mediaSessionId }))];
                    case 8:
                        // Publish call request to GunDB
                        _b.sent();
                        callSession = {
                            id: callId,
                            peerAlias: peerAlias,
                            callType: callType,
                            state: 'calling',
                            startTime: Date.now(),
                            mediaSessionId: mediaSessionId,
                            isE2EEEnabled: this.mediaEncryptionSessions.has(mediaSessionId),
                        };
                        this.callSessions.set(peerAlias, callSession);
                        this.broadcastCallState(peerAlias, 'calling');
                        return [2 /*return*/, callSession];
                }
            });
        });
    };
    /**
     * Accept an incoming call (with E2EE media encryption)
     */
    CallService.prototype.acceptCall = function (peerAlias_1) {
        return __awaiter(this, arguments, void 0, function (peerAlias, callType) {
            var callSession, mediaSessionId, sharedSecret, error_2;
            if (callType === void 0) { callType = 'video'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        callSession = this.callSessions.get(peerAlias);
                        if (!callSession) {
                            throw new Error("No incoming call from ".concat(peerAlias));
                        }
                        // Create WebRTC peer connection
                        return [4 /*yield*/, WebRTCService_1.default.createPeerConnection(peerAlias, false)];
                    case 1:
                        // Create WebRTC peer connection
                        _a.sent();
                        return [4 /*yield*/, KeyExchangeService_1.default.initializeSession(peerAlias)];
                    case 2:
                        // Initialize key exchange
                        void (_a.sent());
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        mediaSessionId = callSession.mediaSessionId || "media_".concat(callSession.id);
                        return [4 /*yield*/, this.deriveMediaSharedSecret(peerAlias)];
                    case 4:
                        sharedSecret = _a.sent();
                        return [4 /*yield*/, E2EEncryptionService_1.default.initializeMediaSession(mediaSessionId, new Uint8Array(Buffer.from(sharedSecret, 'hex')), 3600)];
                    case 5:
                        _a.sent();
                        this.mediaEncryptionSessions.add(mediaSessionId);
                        callSession.mediaSessionId = mediaSessionId;
                        callSession.isE2EEEnabled = true;
                        console.log("\uD83D\uDD10 SRTP encryption initialized for accepted call: ".concat(callSession.id));
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        console.warn("\u26A0\uFE0F Failed to initialize SRTP: ".concat(error_2));
                        callSession.isE2EEEnabled = false;
                        return [3 /*break*/, 7];
                    case 7:
                        // Update session state
                        callSession.state = 'active';
                        callSession.startTime = Date.now();
                        this.broadcastCallState(peerAlias, 'active');
                        // Acknowledge acceptance via GunDB
                        return [4 /*yield*/, gundbService_1.GunDBService.respondToCallRequest(peerAlias, {
                                accepted: true,
                                timestamp: Date.now(),
                                mediaSessionId: callSession.mediaSessionId,
                            })];
                    case 8:
                        // Acknowledge acceptance via GunDB
                        _a.sent();
                        return [2 /*return*/, callSession];
                }
            });
        });
    };
    /**
     * Reject an incoming call
     */
    CallService.prototype.rejectCall = function (peerAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var callSession;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        callSession = this.callSessions.get(peerAlias);
                        if (callSession) {
                            callSession.state = 'rejected';
                            this.broadcastCallState(peerAlias, 'rejected');
                        }
                        // Notify peer of rejection via GunDB
                        return [4 /*yield*/, gundbService_1.GunDBService.respondToCallRequest(peerAlias, {
                                accepted: false,
                                timestamp: Date.now(),
                            })];
                    case 1:
                        // Notify peer of rejection via GunDB
                        _a.sent();
                        // Cleanup
                        return [4 /*yield*/, this.endCall(peerAlias)];
                    case 2:
                        // Cleanup
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * End an active call (with cleanup of E2EE media encryption)
     */
    CallService.prototype.endCall = function (peerAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var callSession;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        callSession = this.callSessions.get(peerAlias);
                        if (!callSession) {
                            return [2 /*return*/];
                        }
                        // End media encryption session
                        if (callSession.mediaSessionId && this.mediaEncryptionSessions.has(callSession.mediaSessionId)) {
                            E2EEncryptionService_1.default.endMediaSession(callSession.mediaSessionId);
                            this.mediaEncryptionSessions.delete(callSession.mediaSessionId);
                            console.log("\uD83D\uDD10 SRTP encryption session ended: ".concat(callSession.mediaSessionId));
                        }
                        callSession.state = 'ended';
                        callSession.endTime = Date.now();
                        this.broadcastCallState(peerAlias, 'ended');
                        // Close WebRTC connection
                        return [4 /*yield*/, WebRTCService_1.default.closePeerConnection(peerAlias)];
                    case 1:
                        // Close WebRTC connection
                        _a.sent();
                        // Terminate encryption session
                        KeyExchangeService_1.default.terminateSession(peerAlias);
                        // Cleanup
                        this.callSessions.delete(peerAlias);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle incoming call request
     */
    CallService.prototype.handleIncomingCallRequest = function (request) {
        var callSession = {
            id: request.id,
            peerAlias: request.from,
            callType: request.type,
            state: 'ringing',
            startTime: Date.now(),
        };
        this.callSessions.set(request.from, callSession);
        this.broadcastCallState(request.from, 'ringing');
        // Trigger registered handlers (UI notifications)
        this.callRequestHandlers.forEach(function (handler) { return handler(request); });
    };
    /**
     * Add/set local media stream for call
     */
    CallService.prototype.setLocalStream = function (peerAlias, stream) {
        return __awaiter(this, void 0, void 0, function () {
            var callSession, _i, _a, track;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        callSession = this.callSessions.get(peerAlias);
                        if (!callSession) {
                            throw new Error("No call session with ".concat(peerAlias));
                        }
                        callSession.localStream = stream;
                        _i = 0, _a = stream.getTracks();
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        track = _a[_i];
                        return [4 /*yield*/, WebRTCService_1.default.addTrack(peerAlias, track, stream)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle remote media stream (when peer sends video/audio)
     */
    CallService.prototype.setRemoteStream = function (peerAlias, stream) {
        var callSession = this.callSessions.get(peerAlias);
        if (!callSession) {
            throw new Error("No call session with ".concat(peerAlias));
        }
        callSession.remoteStream = stream;
    };
    /**
     * Get active call session
     */
    CallService.prototype.getCallSession = function (peerAlias) {
        return this.callSessions.get(peerAlias);
    };
    /**
     * Subscribe to incoming call requests
     */
    CallService.prototype.onCallRequest = function (handler) {
        this.callRequestHandlers.push(handler);
    };
    /**
     * Subscribe to call state changes
     */
    CallService.prototype.onCallStateChange = function (peerAlias, handler) {
        if (!this.callStateHandlers.has(peerAlias)) {
            this.callStateHandlers.set(peerAlias, []);
        }
        this.callStateHandlers.get(peerAlias).push(handler);
    };
    /**
     * Broadcast call state change
     */
    CallService.prototype.broadcastCallState = function (peerAlias, state) {
        var handlers = this.callStateHandlers.get(peerAlias) || [];
        handlers.forEach(function (handler) { return handler(state); });
    };
    /**
     * Get all active call sessions
     */
    CallService.prototype.getActiveCalls = function () {
        var calls = [];
        this.callSessions.forEach(function (session, peerAlias) {
            if (session.state !== 'ended' && session.state !== 'rejected') {
                calls.push({ peerAlias: peerAlias, session: session });
            }
        });
        return calls;
    };
    /**
     * Check if in call with peer
     */
    CallService.prototype.isInCall = function (peerAlias) {
        var session = this.callSessions.get(peerAlias);
        return !!session && (session.state === 'active' || session.state === 'calling');
    };
    /**
     * Get call duration in seconds
     */
    CallService.prototype.getCallDuration = function (peerAlias) {
        var session = this.callSessions.get(peerAlias);
        if (!session || !session.startTime)
            return 0;
        var endTime = session.endTime || Date.now();
        return Math.floor((endTime - session.startTime) / 1000);
    };
    /**
     * Encrypt a media frame (RTP packet) for transmission
     */
    CallService.prototype.encryptMediaFrame = function (peerAlias, frameData, timestamp) {
        return __awaiter(this, void 0, void 0, function () {
            var callSession, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        callSession = this.callSessions.get(peerAlias);
                        if (!callSession || !callSession.mediaSessionId || !callSession.isE2EEEnabled) {
                            // E2EE not available, return null (caller sends unencrypted)
                            return [2 /*return*/, null];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, E2EEncryptionService_1.default.encryptMediaFrame(callSession.mediaSessionId, frameData, timestamp)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_3 = _a.sent();
                        console.error("Failed to encrypt media frame for @".concat(peerAlias, ": ").concat(error_3));
                        return [2 /*return*/, null]; // Fallback to unencrypted
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Decrypt a received media frame
     */
    CallService.prototype.decryptMediaFrame = function (peerAlias, frame) {
        return __awaiter(this, void 0, void 0, function () {
            var callSession, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        callSession = this.callSessions.get(peerAlias);
                        if (!callSession || !callSession.isE2EEEnabled) {
                            return [2 /*return*/, null];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, E2EEncryptionService_1.default.decryptMediaFrame(frame.sessionId, frame)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_4 = _a.sent();
                        console.error("Failed to decrypt media frame from @".concat(peerAlias, ": ").concat(error_4));
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get media encryption status for a call
     */
    CallService.prototype.getMediaEncryptionStatus = function (peerAlias) {
        var callSession = this.callSessions.get(peerAlias);
        return {
            isEnabled: (callSession === null || callSession === void 0 ? void 0 : callSession.isE2EEEnabled) || false,
            sessionId: callSession === null || callSession === void 0 ? void 0 : callSession.mediaSessionId,
        };
    };
    /**
     * Derive shared secret for media encryption (SRTP)
     */
    CallService.prototype.deriveMediaSharedSecret = function (peerAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionData, rootKeyHex, buffer, data, cryptoKey, signature;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionData = KeyExchangeService_1.default.getSessionState(peerAlias);
                        if (!sessionData) {
                            throw new Error("No key exchange session with @".concat(peerAlias));
                        }
                        rootKeyHex = sessionData.rootKey;
                        buffer = Buffer.from(rootKeyHex, 'hex');
                        data = new TextEncoder().encode('media-encryption');
                        return [4 /*yield*/, crypto.subtle.importKey('raw', buffer, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])];
                    case 1:
                        cryptoKey = _a.sent();
                        return [4 /*yield*/, crypto.subtle.sign('HMAC', cryptoKey, data)];
                    case 2:
                        signature = _a.sent();
                        return [2 /*return*/, Buffer.from(signature).toString('hex').slice(0, 64)]; // 32 bytes
                }
            });
        });
    };
    return CallService;
}());
exports.default = new CallService();
