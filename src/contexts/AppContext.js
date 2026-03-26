"use strict";
/**
 * Project Aegis - App Context
 * Manages global app state (user, online status, etc.)
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.useApp = exports.AppProvider = void 0;
var react_1 = __importStar(require("react"));
var StorageService_1 = require("../services/StorageService");
var SQLiteService_1 = require("../services/SQLiteService");
var gundbService_1 = require("../services/gundbService");
var CryptoService_1 = require("../services/CryptoService");
var WebRTCService_1 = __importDefault(require("../services/WebRTCService"));
var MessageService_1 = require("../services/MessageService");
// eslint-disable-next-line
var BackgroundService_1 = __importDefault(require("../services/BackgroundService"));
// eslint-disable-next-line
var TURNFallbackService_1 = __importDefault(require("../services/TURNFallbackService"));
// eslint-disable-next-line
var FileTransferService_1 = __importDefault(require("../services/FileTransferService"));
var CallService_1 = __importDefault(require("../services/CallService"));
// @ts-ignore - SyncService is default exported as singleton
var SyncService_1 = __importDefault(require("../services/SyncService"));
// @ts-ignore - GroupChatService is default exported as singleton
var GroupChatService_1 = __importDefault(require("../services/GroupChatService"));
// @ts-ignore - PerformanceOptimizationService is default exported as singleton
var PerformanceOptimizationService_1 = __importDefault(require("../services/PerformanceOptimizationService"));
// @ts-ignore - E2ETestingService is default exported as singleton
var E2ETestingService_1 = __importDefault(require("../services/E2ETestingService"));
// @ts-ignore - E2EEncryptionService is default exported as singleton
var E2EEncryptionService_1 = __importDefault(require("../services/E2EEncryptionService"));
var AppContext = (0, react_1.createContext)(undefined);
var AppProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)({
        isLoggedIn: false,
        isOnline: false,
        batteryMode: 'saver',
    }), appState = _b[0], setAppState = _b[1];
    var _c = (0, react_1.useState)(null), currentUser = _c[0], setCurrentUser = _c[1];
    var _d = (0, react_1.useState)(false), isInitialized = _d[0], setIsInitialized = _d[1];
    var _e = (0, react_1.useState)(true), isLoading = _e[0], setIsLoading = _e[1];
    var presenceUnsubscribers = (0, react_1.useState)(new Map())[0];
    // Call management state
    var _f = (0, react_1.useState)(null), incomingCallRequest = _f[0], setIncomingCallRequest = _f[1];
    var _g = (0, react_1.useState)(null), currentCallPeer = _g[0], setCurrentCallPeer = _g[1];
    // Initialize app on mount
    (0, react_1.useEffect)(function () {
        var initialize = function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, 8, 9]);
                        // Initialize services
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.initialize()];
                    case 1:
                        // Initialize services
                        _a.sent();
                        return [4 /*yield*/, gundbService_1.GunDBService.initialize()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, TURNFallbackService_1.default.initialize()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, StorageService_1.StorageService.getUser()];
                    case 4:
                        user = _a.sent();
                        if (!user) return [3 /*break*/, 6];
                        setCurrentUser(user);
                        setAppState(function (prev) { return (__assign(__assign({}, prev), { isLoggedIn: true })); });
                        // Enable background listening for recovered user
                        return [4 /*yield*/, BackgroundService_1.default.enableBackgroundListening(user.alias)];
                    case 5:
                        // Enable background listening for recovered user
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        setIsInitialized(true);
                        return [3 /*break*/, 9];
                    case 7:
                        error_1 = _a.sent();
                        console.error('App initialization failed:', error_1);
                        return [3 /*break*/, 9];
                    case 8:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        }); };
        initialize();
    }, []);
    var signup = function (alias) { return __awaiter(void 0, void 0, void 0, function () {
        var seed, _a, publicKey, privateKey, user, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 9, , 10]);
                    seed = CryptoService_1.CryptoService.generateBIP39Seed();
                    return [4 /*yield*/, CryptoService_1.CryptoService.deriveKeypairFromSeed(seed)];
                case 1:
                    _a = _b.sent(), publicKey = _a.publicKey, privateKey = _a.privateKey;
                    user = {
                        alias: alias,
                        publicKey: publicKey,
                        privateKey: privateKey,
                        seed: seed,
                        createdAt: Date.now(),
                    };
                    // Save user to secure storage
                    return [4 /*yield*/, StorageService_1.StorageService.saveSeed(seed)];
                case 2:
                    // Save user to secure storage
                    _b.sent();
                    return [4 /*yield*/, StorageService_1.StorageService.saveUser(user)];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, StorageService_1.StorageService.savePrivateKey(privateKey)];
                case 4:
                    _b.sent();
                    // Save to local database
                    return [4 /*yield*/, SQLiteService_1.SQLiteService.saveAppState('user_alias', alias)];
                case 5:
                    // Save to local database
                    _b.sent();
                    return [4 /*yield*/, SQLiteService_1.SQLiteService.saveAppState('user_public_key', publicKey)];
                case 6:
                    _b.sent();
                    // Register user in GunDB DHT
                    return [4 /*yield*/, gundbService_1.GunDBService.registerUser(user)];
                case 7:
                    // Register user in GunDB DHT
                    _b.sent();
                    // Update app state
                    setCurrentUser(user);
                    setAppState(function (prev) { return (__assign(__assign({}, prev), { isLoggedIn: true })); });
                    // Enable background listening for incoming messages and calls
                    return [4 /*yield*/, BackgroundService_1.default.enableBackgroundListening(user.alias)];
                case 8:
                    // Enable background listening for incoming messages and calls
                    _b.sent();
                    console.log("\u2713 Signup complete: @".concat(alias));
                    return [2 /*return*/, { user: user, seed: seed }];
                case 9:
                    error_2 = _b.sent();
                    console.error('Signup failed:', error_2);
                    throw error_2;
                case 10: return [2 /*return*/];
            }
        });
    }); };
    var login = function (seed) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, publicKey, privateKey, savedAlias, user, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    // Validate seed
                    if (!CryptoService_1.CryptoService.isValidBIP39Seed(seed)) {
                        throw new Error('Invalid recovery seed phrase');
                    }
                    return [4 /*yield*/, CryptoService_1.CryptoService.deriveKeypairFromSeed(seed)];
                case 1:
                    _a = _b.sent(), publicKey = _a.publicKey, privateKey = _a.privateKey;
                    return [4 /*yield*/, SQLiteService_1.SQLiteService.loadAppState('user_alias')];
                case 2:
                    savedAlias = _b.sent();
                    if (!savedAlias) {
                        throw new Error('No saved user found. Please sign up first.');
                    }
                    user = {
                        alias: savedAlias,
                        publicKey: publicKey,
                        privateKey: privateKey,
                        seed: seed,
                        createdAt: Date.now(),
                    };
                    // Save to secure storage
                    return [4 /*yield*/, StorageService_1.StorageService.saveUser(user)];
                case 3:
                    // Save to secure storage
                    _b.sent();
                    return [4 /*yield*/, StorageService_1.StorageService.savePrivateKey(privateKey)];
                case 4:
                    _b.sent();
                    // Update app state
                    setCurrentUser(user);
                    setAppState(function (prev) { return (__assign(__assign({}, prev), { isLoggedIn: true })); });
                    // Enable background listening for incoming messages and calls
                    return [4 /*yield*/, BackgroundService_1.default.enableBackgroundListening(user.alias)];
                case 5:
                    // Enable background listening for incoming messages and calls
                    _b.sent();
                    console.log("\u2713 Login complete: @".concat(user.alias));
                    return [2 /*return*/, user];
                case 6:
                    error_3 = _b.sent();
                    console.error('Login failed:', error_3);
                    throw error_3;
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var logout = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!currentUser) return [3 /*break*/, 3];
                    // Publish offline status
                    return [4 /*yield*/, gundbService_1.GunDBService.publishPresence(currentUser.alias, false)];
                case 1:
                    // Publish offline status
                    _a.sent();
                    // Cleanup all presence subscriptions
                    presenceUnsubscribers.forEach(function (unsub) { return unsub(); });
                    presenceUnsubscribers.clear();
                    // Disable background listening
                    return [4 /*yield*/, BackgroundService_1.default.disableBackgroundListening()];
                case 2:
                    // Disable background listening
                    _a.sent();
                    _a.label = 3;
                case 3: 
                // Clear secure storage
                return [4 /*yield*/, StorageService_1.StorageService.clear()];
                case 4:
                    // Clear secure storage
                    _a.sent();
                    // Reset state
                    setCurrentUser(null);
                    setAppState(function (prev) { return (__assign(__assign({}, prev), { isLoggedIn: false, isOnline: false })); });
                    console.log('✓ Logout complete');
                    return [3 /*break*/, 6];
                case 5:
                    error_4 = _a.sent();
                    console.error('Logout failed:', error_4);
                    throw error_4;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var setOnline = function (online) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!currentUser) return [3 /*break*/, 2];
                    return [4 /*yield*/, gundbService_1.GunDBService.publishPresence(currentUser.alias, online)];
                case 1:
                    _a.sent();
                    setAppState(function (prev) { return (__assign(__assign({}, prev), { isOnline: online })); });
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    var setBatteryMode = function (mode) {
        setAppState(function (prev) { return (__assign(__assign({}, prev), { batteryMode: mode })); });
    };
    /**
     * Establish WebRTC connection with a peer
     * Triggered when peer comes online (from GunDB presence)
     */
    var connectToPeer = function (peerAlias) { return __awaiter(void 0, void 0, void 0, function () {
        var useTURN, offer, callId, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    if (!currentUser)
                        return [2 /*return*/];
                    return [4 /*yield*/, TURNFallbackService_1.default.shouldUseTURN()];
                case 1:
                    useTURN = _a.sent();
                    if (useTURN) {
                        console.log("\uD83D\uDD04 Using TURN fallback for connection with @".concat(peerAlias));
                        TURNFallbackService_1.default.forceTURNMode(true);
                    }
                    // Create peer connection as initiator
                    return [4 /*yield*/, WebRTCService_1.default.createPeerConnection(peerAlias, true)];
                case 2:
                    // Create peer connection as initiator
                    _a.sent();
                    return [4 /*yield*/, WebRTCService_1.default.createOffer(peerAlias)];
                case 3:
                    offer = _a.sent();
                    callId = "call-".concat(Date.now());
                    return [4 /*yield*/, gundbService_1.GunDBService.publishSDPOffer(peerAlias, { type: offer.type || 'offer', sdp: offer.sdp }, callId)];
                case 4:
                    _a.sent();
                    console.log("\uD83E\uDD1D SDP Offer sent to @".concat(peerAlias));
                    // Flush pending messages to this peer
                    return [4 /*yield*/, MessageService_1.MessageService.flushPendingMessages(peerAlias)];
                case 5:
                    // Flush pending messages to this peer
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_5 = _a.sent();
                    console.error("Failed to connect to @".concat(peerAlias, ":"), error_5);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Initiate an audio/video call with a peer
     */
    var initiateCall = function (peerAlias, callType) { return __awaiter(void 0, void 0, void 0, function () {
        var session, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!currentUser)
                        throw new Error('Not logged in');
                    return [4 /*yield*/, CallService_1.default.initiateCall(peerAlias, callType, currentUser.alias)];
                case 1:
                    session = _a.sent();
                    setCurrentCallPeer(peerAlias);
                    console.log("\uD83D\uDCDE Call initiated with @".concat(peerAlias, " (").concat(callType, ")"));
                    return [2 /*return*/, session];
                case 2:
                    error_6 = _a.sent();
                    console.error("Failed to initiate call with @".concat(peerAlias, ":"), error_6);
                    throw error_6;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Accept an incoming call
     */
    var acceptCall = function (peerAlias, callType) { return __awaiter(void 0, void 0, void 0, function () {
        var session, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, CallService_1.default.acceptCall(peerAlias, callType)];
                case 1:
                    session = _a.sent();
                    setCurrentCallPeer(peerAlias);
                    setIncomingCallRequest(null);
                    console.log("\u2713 Call accepted with @".concat(peerAlias));
                    return [2 /*return*/, session];
                case 2:
                    error_7 = _a.sent();
                    console.error("Failed to accept call:", error_7);
                    throw error_7;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Reject an incoming call
     */
    var rejectCall = function (peerAlias) { return __awaiter(void 0, void 0, void 0, function () {
        var error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, CallService_1.default.rejectCall(peerAlias)];
                case 1:
                    _a.sent();
                    setIncomingCallRequest(null);
                    console.log("\u2717 Call rejected from @".concat(peerAlias));
                    return [3 /*break*/, 3];
                case 2:
                    error_8 = _a.sent();
                    console.error("Failed to reject call:", error_8);
                    throw error_8;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    /**
     * End an active call
     */
    var endCall = function (peerAlias) { return __awaiter(void 0, void 0, void 0, function () {
        var error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, CallService_1.default.endCall(peerAlias)];
                case 1:
                    _a.sent();
                    setCurrentCallPeer(null);
                    console.log("\u260E\uFE0F Call ended with @".concat(peerAlias));
                    return [3 /*break*/, 3];
                case 2:
                    error_9 = _a.sent();
                    console.error("Failed to end call:", error_9);
                    throw error_9;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Initiate a file transfer to a peer
     */
    var initiateFileTransfer = function (fileBuffer, fileName, mimeType, recipientAlias) { return __awaiter(void 0, void 0, void 0, function () {
        var metadata, sentMetadata, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    if (!currentUser)
                        throw new Error('Not logged in');
                    return [4 /*yield*/, FileTransferService_1.default.initiateTransfer(fileBuffer, fileName, mimeType, currentUser.alias, recipientAlias)];
                case 1:
                    metadata = _a.sent();
                    return [4 /*yield*/, WebRTCService_1.default.sendFileMetadata(recipientAlias, metadata)];
                case 2:
                    sentMetadata = _a.sent();
                    if (!sentMetadata) {
                        throw new Error('Failed to send file metadata to peer');
                    }
                    console.log("\uD83D\uDCC4 File transfer initiated with @".concat(recipientAlias, ": ").concat(fileName));
                    return [2 /*return*/, metadata.fileId];
                case 3:
                    error_10 = _a.sent();
                    console.error("Failed to initiate file transfer:", error_10);
                    throw error_10;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Initiate multi-device synchronization
     */
    var initiateSync = function (deviceName, peerAlias) { return __awaiter(void 0, void 0, void 0, function () {
        var syncRequest, sent, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    if (!currentUser)
                        throw new Error('Not logged in');
                    return [4 /*yield*/, SyncService_1.default.createSyncRequest(currentUser.alias, deviceName, 'full')];
                case 1:
                    syncRequest = _a.sent();
                    // Connect to peer if not already connected
                    return [4 /*yield*/, connectToPeer(peerAlias)];
                case 2:
                    // Connect to peer if not already connected
                    _a.sent();
                    return [4 /*yield*/, WebRTCService_1.default.sendSyncRequest(peerAlias, syncRequest)];
                case 3:
                    sent = _a.sent();
                    if (!sent) {
                        throw new Error('Failed to send sync request to peer');
                    }
                    console.log("\uD83D\uDCF1 Sync initiated with @".concat(peerAlias, ": ").concat(syncRequest.syncId));
                    return [2 /*return*/, syncRequest.syncId];
                case 4:
                    error_11 = _a.sent();
                    console.error('Initiate sync failed:', error_11);
                    throw error_11;
                case 5: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Get sync progress/state
     */
    var getSyncProgress = function (syncId) {
        return SyncService_1.default.getSyncState(syncId);
    };
    /**
     * Get all active syncs
     */
    var getAllSyncs = function () {
        return SyncService_1.default.getActiveSyncs();
    };
    /**
     * Create a new group chat
     */
    var createGroup = function (name, members, description) { return __awaiter(void 0, void 0, void 0, function () {
        var group, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!currentUser)
                        throw new Error('Not logged in');
                    return [4 /*yield*/, GroupChatService_1.default.createGroup(name, members, currentUser.alias, description)];
                case 1:
                    group = _a.sent();
                    console.log("\uD83D\uDC65 Group created: \"".concat(name, "\""));
                    return [2 /*return*/, group];
                case 2:
                    error_12 = _a.sent();
                    console.error('Create group failed:', error_12);
                    throw error_12;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Send message to a group (full-mesh P2P delivery to all members)
     */
    var sendGroupMessage = function (groupId, content) { return __awaiter(void 0, void 0, void 0, function () {
        var messageId, group, _i, _a, member, error_13, error_14;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 9, , 10]);
                    if (!currentUser)
                        throw new Error('Not logged in');
                    return [4 /*yield*/, GroupChatService_1.default.sendGroupMessage(groupId, currentUser.alias, content)];
                case 1:
                    messageId = _b.sent();
                    group = GroupChatService_1.default.getGroup(groupId);
                    if (!group) return [3 /*break*/, 8];
                    _i = 0, _a = group.members;
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    member = _a[_i];
                    if (!(member !== currentUser.alias)) return [3 /*break*/, 7];
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, connectToPeer(member)];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, WebRTCService_1.default.sendGroupMessage(member, {
                            id: messageId,
                            groupId: groupId,
                            from: currentUser.alias,
                            content: content,
                        })];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_13 = _b.sent();
                    console.warn("Failed to send group message to @".concat(member, ":"), error_13);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8:
                    console.log("\uD83D\uDCAC Group message sent: ".concat(messageId));
                    return [2 /*return*/, messageId];
                case 9:
                    error_14 = _b.sent();
                    console.error('Send group message failed:', error_14);
                    throw error_14;
                case 10: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Add member to group
     */
    var addGroupMember = function (groupId, memberAlias) { return __awaiter(void 0, void 0, void 0, function () {
        var error_15;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!currentUser)
                        throw new Error('Not logged in');
                    return [4 /*yield*/, GroupChatService_1.default.addMember(groupId, memberAlias, currentUser.alias)];
                case 1:
                    _a.sent();
                    console.log("\u2713 Added @".concat(memberAlias, " to group"));
                    return [3 /*break*/, 3];
                case 2:
                    error_15 = _a.sent();
                    console.error('Add group member failed:', error_15);
                    throw error_15;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Remove member from group
     */
    var removeGroupMember = function (groupId, memberAlias) { return __awaiter(void 0, void 0, void 0, function () {
        var error_16;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!currentUser)
                        throw new Error('Not logged in');
                    return [4 /*yield*/, GroupChatService_1.default.removeMember(groupId, memberAlias, currentUser.alias)];
                case 1:
                    _a.sent();
                    console.log("\u2713 Removed @".concat(memberAlias, " from group"));
                    return [3 /*break*/, 3];
                case 2:
                    error_16 = _a.sent();
                    console.error('Remove group member failed:', error_16);
                    throw error_16;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Get messages from a group
     */
    var getGroupMessages = function (groupId_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([groupId_1], args_1, true), void 0, function (groupId, limit) {
            var error_17;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, GroupChatService_1.default.getGroupMessages(groupId, limit)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_17 = _a.sent();
                        console.error('Get group messages failed:', error_17);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all groups user is a member of
     */
    var getUserGroups = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_18;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!currentUser)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, GroupChatService_1.default.getUserGroups(currentUser.alias)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_18 = _a.sent();
                    console.error('Get user groups failed:', error_18);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Get group state (members, presence, etc.)
     */
    var getGroupState = function (groupId) {
        return GroupChatService_1.default.getGroupState(groupId);
    };
    /**
     * Get connection metrics for a peer
     */
    var getConnectionMetrics = function (peerAlias) {
        return PerformanceOptimizationService_1.default.getConnectionMetrics(peerAlias);
    };
    /**
     * Get quality recommendations for a peer
     */
    var getQualityRecommendations = function (peerAlias) {
        return PerformanceOptimizationService_1.default.getQualityRecommendations(peerAlias);
    };
    /**
     * Get performance statistics
     */
    var getPerformanceStats = function () {
        return PerformanceOptimizationService_1.default.getPerformanceStats();
    };
    /**
     * Get bandwidth history for a peer
     */
    var getBandwidthHistory = function (peerAlias) {
        return PerformanceOptimizationService_1.default.getBandwidthHistory(peerAlias, 50);
    };
    /**
     * Get optimal codecs for a peer based on bandwidth
     */
    var getOptimalCodecs = function (peerAlias, bandwidth) {
        return WebRTCService_1.default.selectOptimalCodecs(peerAlias, bandwidth);
    };
    /**
     * Run quick E2E test suite (3 fast tests)
     */
    var runQuickTest = function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, error_19;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, E2ETestingService_1.default.runQuickTest()];
                case 1:
                    report = _a.sent();
                    console.log("\uD83E\uDDEA Quick test complete: ".concat(report.passed, "/").concat(report.totalTests, " passed"));
                    return [2 /*return*/, report];
                case 2:
                    error_19 = _a.sent();
                    console.error('Quick test failed:', error_19);
                    throw error_19;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Run full E2E test suite (10 comprehensive tests)
     */
    var runFullTestSuite = function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, error_20;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, E2ETestingService_1.default.runFullTestSuite()];
                case 1:
                    report = _a.sent();
                    console.log("\uD83E\uDDEA Full test suite complete: ".concat(report.passed, "/").concat(report.totalTests, " passed (").concat(report.successRate.toFixed(1), "%)"));
                    return [2 /*return*/, report];
                case 2:
                    error_20 = _a.sent();
                    console.error('Full test suite failed:', error_20);
                    throw error_20;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Get current test report
     */
    var getCurrentTestReport = function () {
        return E2ETestingService_1.default.getCurrentReport();
    };
    /**
     * Clear test results
     */
    var clearTestResults = function () {
        E2ETestingService_1.default.clearResults();
    };
    /**
     * Get encryption status for a peer (message and media)
     */
    var getEncryptionStatus = function (peerAlias) {
        try {
            var session = E2EEncryptionService_1.default.getSessionState(peerAlias);
            if (session) {
                return { isActive: true, type: 'message' };
            }
            return { isActive: false, type: 'none' };
        }
        catch (error) {
            console.warn("Failed to get encryption status for @".concat(peerAlias, ":"), error);
            return { isActive: false, type: 'none' };
        }
    };
    /**
     * Get media encryption (SRTP) status for a call
     */
    var getMediaEncryptionStatus = function (callSessionId) {
        try {
            return CallService_1.default.getMediaEncryptionStatus(callSessionId);
        }
        catch (error) {
            console.warn("Failed to get media encryption status for ".concat(callSessionId, ":"), error);
            return { isEnabled: false };
        }
    };
    /**
     * Explicitly initiate E2EE session with a peer
     */
    var initiateEncryption = function (peerAlias) { return __awaiter(void 0, void 0, void 0, function () {
        var peerInfo, error_21;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    if (!currentUser)
                        throw new Error('Not logged in');
                    return [4 /*yield*/, gundbService_1.GunDBService.searchUser(peerAlias)];
                case 1:
                    peerInfo = _a.sent();
                    if (!peerInfo || !peerInfo.publicKey) {
                        throw new Error("Could not find peer @".concat(peerAlias));
                    }
                    // Initialize E2EE Double Ratchet session
                    return [4 /*yield*/, E2EEncryptionService_1.default.initializeSession(peerAlias, new Uint8Array(Buffer.from(peerInfo.publicKey, 'hex')), true // We are initiator
                        )];
                case 2:
                    // Initialize E2EE Double Ratchet session
                    _a.sent();
                    console.log("\uD83D\uDD10 E2EE session initialized with @".concat(peerAlias));
                    return [3 /*break*/, 4];
                case 3:
                    error_21 = _a.sent();
                    console.error("Failed to initiate encryption with @".concat(peerAlias, ":"), error_21);
                    throw error_21;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Get full session state for a peer (for debugging)
     */
    var getSessionState = function (peerAlias) {
        try {
            return E2EEncryptionService_1.default.getSessionState(peerAlias);
        }
        catch (error) {
            console.warn("Failed to get session state for @".concat(peerAlias, ":"), error);
            return null;
        }
    };
    /**
     * Check if message encryption is enabled for a peer
     */
    var isMessageEncryptionEnabled = function (peerAlias) {
        try {
            var session = E2EEncryptionService_1.default.getSessionState(peerAlias);
            return session !== null;
        }
        catch (_a) {
            return false;
        }
    };
    /**
     * Check if media encryption is enabled for a call
     */
    var isMediaEncryptionEnabled = function (callSessionId) {
        try {
            var status_1 = CallService_1.default.getMediaEncryptionStatus(callSessionId);
            return status_1.isEnabled;
        }
        catch (_a) {
            return false;
        }
    };
    (0, react_1.useEffect)(function () {
        if (!currentUser)
            return;
        // Subscribe to incoming call requests
        CallService_1.default.onCallRequest(function (request) {
            console.log("\uD83D\uDCF1 Incoming call from @".concat(request.from));
            setIncomingCallRequest(request);
        });
        // Subscribe to test completion events (for real-time test progress)
        E2ETestingService_1.default.onTestComplete(function (result) {
            console.log("\uD83E\uDDEA Test ".concat(result.status, ": ").concat(result.name, " (").concat(result.duration, "ms)"));
        });
    }, [currentUser]);
    var value = {
        appState: appState,
        currentUser: currentUser,
        isInitialized: isInitialized,
        isLoading: isLoading,
        incomingCallRequest: incomingCallRequest,
        currentCallPeer: currentCallPeer,
        signup: signup,
        login: login,
        logout: logout,
        setOnline: setOnline,
        setBatteryMode: setBatteryMode,
        connectToPeer: connectToPeer,
        initiateCall: initiateCall,
        acceptCall: acceptCall,
        rejectCall: rejectCall,
        endCall: endCall,
        initiateFileTransfer: initiateFileTransfer,
        initiateSync: initiateSync,
        getSyncProgress: getSyncProgress,
        getAllSyncs: getAllSyncs,
        createGroup: createGroup,
        sendGroupMessage: sendGroupMessage,
        addGroupMember: addGroupMember,
        removeGroupMember: removeGroupMember,
        getGroupMessages: getGroupMessages,
        getUserGroups: getUserGroups,
        getGroupState: getGroupState,
        getConnectionMetrics: getConnectionMetrics,
        getQualityRecommendations: getQualityRecommendations,
        getPerformanceStats: getPerformanceStats,
        getBandwidthHistory: getBandwidthHistory,
        getOptimalCodecs: getOptimalCodecs,
        runQuickTest: runQuickTest,
        runFullTestSuite: runFullTestSuite,
        getCurrentTestReport: getCurrentTestReport,
        clearTestResults: clearTestResults,
        getEncryptionStatus: getEncryptionStatus,
        getMediaEncryptionStatus: getMediaEncryptionStatus,
        initiateEncryption: initiateEncryption,
        getSessionState: getSessionState,
        isMessageEncryptionEnabled: isMessageEncryptionEnabled,
        isMediaEncryptionEnabled: isMediaEncryptionEnabled,
    };
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
exports.AppProvider = AppProvider;
var useApp = function () {
    var context = (0, react_1.useContext)(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};
exports.useApp = useApp;
