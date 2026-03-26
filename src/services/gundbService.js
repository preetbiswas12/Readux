"use strict";
/**
 * Project Aegis - GunDB Service
 * Handles user discovery and presence via GunDB relays
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GunDBService = void 0;
var GunDBService = /** @class */ (function () {
    function GunDBService() {
    }
    /**
     * Initialize GunDB connection to public relays
     * Used only for discovery (finding user public keys)
     * Not for storing chat data
     */
    GunDBService.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var Gun;
            return __generator(this, function (_a) {
                try {
                    // Lazy load gun to avoid issues in non-browser environments
                    // Note: In React Native, Gun is loaded via dynamic import
                    if (typeof require !== 'undefined') {
                        try {
                            Gun = require('gun');
                            // eslint-disable-next-line
                            require('gun/sea');
                            // eslint-disable-next-line
                            require('gun/lib/then');
                            this.gun = Gun(this.config.mainRelay);
                        }
                        catch (_err) {
                            // Fallback for environments without require
                            void _err; // Suppress unused variable warning
                            console.log('Gun require not available, using fallback');
                        }
                    }
                    console.log('✓ GunDB initialized with main relay:', this.config.mainRelay);
                }
                catch (error) {
                    console.error('GunDB initialization failed:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Register a user in the public GunDB DHT
     * This allows other peers to find them by alias
     */
    GunDBService.registerUser = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.gun) {
                            throw new Error('GunDB not initialized');
                        }
                        // Publish user discovery data to DHT
                        // Key: @alias -> Value: { publicKey, timestamp }
                        return [4 /*yield*/, this.gun
                                .get('users')
                                .get(user.alias)
                                .put({
                                publicKey: user.publicKey,
                                alias: user.alias,
                                timestamp: Date.now(),
                            })];
                    case 1:
                        // Publish user discovery data to DHT
                        // Key: @alias -> Value: { publicKey, timestamp }
                        _a.sent();
                        console.log("\u2713 User ".concat(user.alias, " registered in DHT"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('User registration failed:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Search for a user by alias (decrypt their public key)
     */
    GunDBService.searchUser = function (alias) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    if (!this.gun) {
                        throw new Error('GunDB not initialized');
                    }
                    // Crawl DHT for alias
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            _this.gun
                                .get('users')
                                .get(alias)
                                .once(function (data) {
                                if (data && data.publicKey) {
                                    resolve({
                                        alias: alias,
                                        publicKey: data.publicKey,
                                        lastSeen: data.timestamp,
                                    });
                                }
                                else {
                                    resolve(null); // User not found
                                }
                            }, reject);
                        })];
                }
                catch (error) {
                    console.error('User search failed:', error);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Subscribe to user's presence (online/offline status)
     * Triggers callback when user comes online
     */
    GunDBService.subscribePresence = function (alias, onPresenceChange) {
        if (!this.gun) {
            throw new Error('GunDB not initialized');
        }
        var unsubscribe = this.gun
            .get('presence')
            .get(alias)
            .on(function (data) {
            var isOnline = data && data.online === true;
            onPresenceChange(isOnline);
        });
        // Return cleanup function
        return function () {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    };
    /**
     * Publish user's online status (for presence detection)
     */
    GunDBService.publishPresence = function (alias, isOnline) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.gun) {
                            throw new Error('GunDB not initialized');
                        }
                        return [4 /*yield*/, this.gun.get('presence').get(alias).put({
                                online: isOnline,
                                timestamp: Date.now(),
                            })];
                    case 1:
                        _a.sent();
                        console.log("\u2713 Presence updated: ".concat(alias, " is ").concat(isOnline ? 'online' : 'offline'));
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Presence publish failed:', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Store WebRTC ICE candidates for signaling
     * Peer A publishes their candidates so Peer B can initiate connection
     */
    GunDBService.publishICECandidates = function (alias, candidates) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.gun) {
                            throw new Error('GunDB not initialized');
                        }
                        return [4 /*yield*/, this.gun.get('ice-candidates').get(alias).put({
                                candidates: candidates,
                                timestamp: Date.now(),
                            })];
                    case 1:
                        _a.sent();
                        console.log("\u2713 ICE candidates published for ".concat(alias));
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('ICE candidate publish failed:', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch WebRTC ICE candidates from relay
     */
    GunDBService.fetchICECandidates = function (alias) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    if (!this.gun) {
                        throw new Error('GunDB not initialized');
                    }
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            _this.gun
                                .get('ice-candidates')
                                .get(alias)
                                .once(function (data) {
                                resolve((data === null || data === void 0 ? void 0 : data.candidates) || []);
                            }, reject);
                        })];
                }
                catch (error) {
                    console.error('ICE candidate fetch failed:', error);
                    return [2 /*return*/, []];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Publish a "Call Request" signal
     */
    GunDBService.publishCallRequest = function (peerAlias, callData) {
        return __awaiter(this, void 0, void 0, function () {
            var callId, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.gun) {
                            throw new Error('GunDB not initialized');
                        }
                        callId = callData.id || "call-".concat(Date.now());
                        return [4 /*yield*/, this.gun.get('calls').get(peerAlias).put(__assign(__assign({}, callData), { callId: callId, timestamp: Date.now() }))];
                    case 1:
                        _a.sent();
                        console.log("\u2713 Call request published to ".concat(peerAlias));
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Call request publish failed:', error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Respond to incoming call request (acceptance/rejection)
     */
    GunDBService.respondToCallRequest = function (peerAlias, response) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.gun) {
                            throw new Error('GunDB not initialized');
                        }
                        return [4 /*yield*/, this.gun.get('call-responses').get("".concat(peerAlias, "-").concat(Date.now())).put(__assign({ from: peerAlias }, response))];
                    case 1:
                        _a.sent();
                        console.log("\u2713 Call response sent to ".concat(peerAlias, ": ").concat(response.accepted ? 'accepted' : 'rejected'));
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Call response failed:', error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscribe to incoming call requests
     */
    GunDBService.subscribeCallRequests = function (userAlias, onCallRequest) {
        if (!this.gun) {
            throw new Error('GunDB not initialized');
        }
        var unsubscribe = this.gun
            .get('call-requests')
            .on(function (data) {
            if ((data === null || data === void 0 ? void 0 : data.to) === userAlias) {
                onCallRequest(data);
            }
        });
        return function () {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    };
    /**
     * Fallback to secondary relay if primary fails
     */
    GunDBService.switchRelay = function (relayUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var Gun;
            return __generator(this, function (_a) {
                try {
                    if (typeof require !== 'undefined') {
                        try {
                            Gun = require('gun');
                            this.gun = Gun(relayUrl);
                        }
                        catch (_err) {
                            // Cannot switch relay in current environment
                            void _err; // Suppress unused variable warning
                        }
                    }
                    console.log('✓ Switched to relay:', relayUrl);
                }
                catch (error) {
                    console.error('Relay switch failed:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Alias for initialize() for backward compatibility
     */
    GunDBService.initializeGun = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.initialize()];
            });
        });
    };
    /**
     * Alias for registerUser() for backward compatibility
     */
    GunDBService.publishUserIdentity = function (alias, publicKey, _privateKey) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                user = { alias: alias, publicKey: publicKey, privateKey: _privateKey, seed: '', createdAt: Date.now() };
                return [2 /*return*/, this.registerUser(user)];
            });
        });
    };
    /**
     * Alias for publishPresence() for backward compatibility
     */
    GunDBService.updatePresence = function (alias, isOnline) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.publishPresence(alias, isOnline)];
            });
        });
    };
    /**
     * Disconnect from GunDB
     */
    GunDBService.disconnectGun = function () {
        if (this.gun) {
            try {
                this.gun.off();
                this.gun = null;
                console.log('✓ Disconnected from GunDB');
            }
            catch (error) {
                console.error('Error disconnecting from GunDB:', error);
            }
        }
    };
    /**
     * Publish WebRTC SDP Offer to peer
     * Initiator sends their offer so responder can create answer
     */
    GunDBService.publishSDPOffer = function (peerAlias, offer, callId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.gun) {
                            throw new Error('GunDB not initialized');
                        }
                        return [4 /*yield*/, this.gun.get('sdp-offers').get("".concat(peerAlias, "-").concat(callId)).put({
                                type: 'offer',
                                sdp: offer.sdp,
                                callId: callId,
                                timestamp: Date.now(),
                            })];
                    case 1:
                        _a.sent();
                        console.log("\u2713 SDP Offer published to ".concat(peerAlias));
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('SDP Offer publish failed:', error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch WebRTC SDP Offer from peer
     */
    GunDBService.fetchSDPOffer = function (peerAlias, callId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    if (!this.gun) {
                        throw new Error('GunDB not initialized');
                    }
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            _this.gun
                                .get('sdp-offers')
                                .get("".concat(peerAlias, "-").concat(callId))
                                .once(function (data) {
                                if (data === null || data === void 0 ? void 0 : data.sdp) {
                                    resolve({ type: data.type || 'offer', sdp: data.sdp });
                                }
                                else {
                                    resolve(null);
                                }
                            }, reject);
                        })];
                }
                catch (error) {
                    console.error('SDP Offer fetch failed:', error);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Publish WebRTC SDP Answer to peer
     * Responder sends their answer after receiving offer
     */
    GunDBService.publishSDPAnswer = function (peerAlias, answer, callId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.gun) {
                            throw new Error('GunDB not initialized');
                        }
                        return [4 /*yield*/, this.gun.get('sdp-answers').get("".concat(peerAlias, "-").concat(callId)).put({
                                type: 'answer',
                                sdp: answer.sdp,
                                callId: callId,
                                timestamp: Date.now(),
                            })];
                    case 1:
                        _a.sent();
                        console.log("\u2713 SDP Answer published to ".concat(peerAlias));
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error('SDP Answer publish failed:', error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch WebRTC SDP Answer from peer
     */
    GunDBService.fetchSDPAnswer = function (peerAlias, callId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    if (!this.gun) {
                        throw new Error('GunDB not initialized');
                    }
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            _this.gun
                                .get('sdp-answers')
                                .get("".concat(peerAlias, "-").concat(callId))
                                .once(function (data) {
                                if (data === null || data === void 0 ? void 0 : data.sdp) {
                                    resolve({ type: data.type || 'answer', sdp: data.sdp });
                                }
                                else {
                                    resolve(null);
                                }
                            }, reject);
                        })];
                }
                catch (error) {
                    console.error('SDP Answer fetch failed:', error);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/];
            });
        });
    };
    GunDBService.gun = null;
    GunDBService.config = {
        mainRelay: 'https://gun.eco/gun',
        fallbackRelays: [
            'https://dweb.link/ipfs/Qm.../gun', // dweb.link gun relay
            'https://gun-relay.herokuapp.com/gun', // community relay
        ],
    };
    return GunDBService;
}());
exports.GunDBService = GunDBService;
