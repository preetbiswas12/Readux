"use strict";
/**
 * Project Aegis - Background Service
 * Handles background listening for messages/calls when app is not in foreground
 * Works in conjunction with:
 * - BatteryModeService (manages check intervals)
 * - Native Foreground Service (Android)
 * - Background Fetch (iOS)
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundService = void 0;
var gundbService_1 = require("./gundbService");
var SQLiteService_1 = require("./SQLiteService");
var BatteryModeService_1 = __importDefault(require("./BatteryModeService"));
var WebRTCService_1 = __importDefault(require("./WebRTCService"));
var BackgroundService = /** @class */ (function () {
    function BackgroundService() {
        this.isBackgroundActive = false;
        this.lastCheckTime = 0;
        this.lastCallCheckTime = 0; // Track last call check to avoid duplicates
        this.checkHandlers = [];
    }
    /**
     * Initialize background service
     * Called once at app startup
     */
    BackgroundService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('[Background] Initializing background service...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, BatteryModeService_1.default.initialize()];
                    case 2:
                        _a.sent();
                        console.log('[Background] ✅ Initialized');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('[Background] Failed to initialize:', error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enable background listening
     * Starts polling or foreground service based on battery mode
     */
    BackgroundService.prototype.enableBackgroundListening = function (userAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var mode;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isBackgroundActive) {
                            console.log('[Background] Already listening in background');
                            return [2 /*return*/];
                        }
                        console.log('[Background] 🔊 Enabling background listening...');
                        this.isBackgroundActive = true;
                        mode = BatteryModeService_1.default.getMode();
                        if (!(mode === 'always')) return [3 /*break*/, 2];
                        // AlwaysOnline: Start native foreground service
                        console.log('[Background] 🟢 Starting foreground service (AlwaysOnline mode)');
                        return [4 /*yield*/, this.startForegroundService(userAlias)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        // Battery Saver: Start periodic polling
                        console.log('[Background] 🟡 Starting periodic polling (Battery Saver mode)');
                        BatteryModeService_1.default.startPolling(function () { return _this.checkForMessagesAndCalls(userAlias); });
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Query recent calls from GunDB DHT
     * Returns the count of new incoming call requests since last check
     */
    BackgroundService.prototype.queryRecentCalls = function (userAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var callCount = 0;
                        var mainTimeout;
                        // 3 second timeout as safety net
                        setTimeout(function () {
                            console.log('[Background] Call query timeout - resolving with count:', callCount);
                            resolve(callCount);
                        }, 3000);
                        try {
                            // Subscribe to incoming calls for this user
                            // Real-time subscription will capture any new calls
                            var unsubscribe_1 = gundbService_1.GunDBService.subscribeCallRequests(userAlias, function (callData) {
                                if (!callData)
                                    return;
                                // Check if call is newer than last check time
                                var callTimestamp = callData.timestamp || Date.now();
                                if (callTimestamp > _this.lastCallCheckTime) {
                                    callCount++;
                                    console.log("[Background] \uD83D\uDCDE New call from @".concat(callData.from, " (type: ").concat(callData.type || 'unknown', ")"));
                                }
                            });
                            // Clean up subscription after timeout
                            var cleanupTimeout = void 0;
                            cleanupTimeout = setTimeout(function () {
                                unsubscribe_1();
                                clearTimeout(mainTimeout);
                                resolve(callCount);
                            }, 2500); // Slightly before the main timeout
                            // Store main timeout for cleanup
                            mainTimeout = cleanupTimeout;
                            // Store cleanup for potential later reference
                            _this.lastCallCheckTime = Date.now();
                        }
                        catch (error) {
                            console.error('[Background] Failed to query calls:', error);
                            clearTimeout(mainTimeout);
                            resolve(0);
                        }
                    })];
            });
        });
    };
    /**
     * Disable background listening
     */
    BackgroundService.prototype.disableBackgroundListening = function () {
        return __awaiter(this, void 0, void 0, function () {
            var mode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('[Background] 🔇 Disabling background listening...');
                        this.isBackgroundActive = false;
                        mode = BatteryModeService_1.default.getMode();
                        if (!(mode === 'always')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.stopForegroundService()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        BatteryModeService_1.default.stopPolling();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check for messages and calls (called periodically in Battery Saver mode)
     */
    BackgroundService.prototype.checkForMessagesAndCalls = function (userAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, result, pending, msgsByPeer, _i, pending_1, msg, key, _a, msgsByPeer_1, _b, peerAlias, msgs, MessageService, _c, msgs_1, msg, sendError_1, error_2, error_3, _d, error_4, durationMs, error_5;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        startTime = Date.now();
                        result = {
                            messagesChecked: 0,
                            incomingCalls: 0,
                            errorsEncountered: 0,
                            lastCheckTime: startTime,
                        };
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 25, , 26]);
                        // Acquire wake lock to stay awake during check
                        return [4 /*yield*/, BatteryModeService_1.default.acquireWakeLock()];
                    case 2:
                        // Acquire wake lock to stay awake during check
                        _e.sent();
                        // Check for pending messages in offline queue
                        console.log('[Background] 🔍 Checking for offline messages...');
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 19, , 20]);
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.getPendingMessages()];
                    case 4:
                        pending = _e.sent();
                        result.messagesChecked = pending.length;
                        if (!(pending.length > 0)) return [3 /*break*/, 18];
                        console.log("[Background] Found ".concat(pending.length, " pending messages, flushing..."));
                        msgsByPeer = new Map();
                        for (_i = 0, pending_1 = pending; _i < pending_1.length; _i++) {
                            msg = pending_1[_i];
                            key = msg.to;
                            if (!msgsByPeer.has(key))
                                msgsByPeer.set(key, []);
                            msgsByPeer.get(key).push(msg);
                        }
                        result.messagesFlushed = 0;
                        _a = 0, msgsByPeer_1 = msgsByPeer;
                        _e.label = 5;
                    case 5:
                        if (!(_a < msgsByPeer_1.length)) return [3 /*break*/, 18];
                        _b = msgsByPeer_1[_a], peerAlias = _b[0], msgs = _b[1];
                        _e.label = 6;
                    case 6:
                        _e.trys.push([6, 16, , 17]);
                        // Establish peer connection first
                        console.log("[Background] Connecting to @".concat(peerAlias, " for message flush..."));
                        return [4 /*yield*/, WebRTCService_1.default.createPeerConnection(peerAlias, true)];
                    case 7:
                        _e.sent();
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./MessageService')); })];
                    case 8:
                        MessageService = (_e.sent()).MessageService;
                        _c = 0, msgs_1 = msgs;
                        _e.label = 9;
                    case 9:
                        if (!(_c < msgs_1.length)) return [3 /*break*/, 15];
                        msg = msgs_1[_c];
                        _e.label = 10;
                    case 10:
                        _e.trys.push([10, 13, , 14]);
                        return [4 /*yield*/, MessageService.sendMessage(msg.from, msg.to, msg.content, msg.recipientPublicKey)];
                    case 11:
                        _e.sent();
                        // Remove from pending queue after successful send
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.removePendingMessage(msg.id)];
                    case 12:
                        // Remove from pending queue after successful send
                        _e.sent();
                        result.messagesFlushed += 1;
                        console.log("[Background] \u2713 Flushed pending message: ".concat(msg.id));
                        return [3 /*break*/, 14];
                    case 13:
                        sendError_1 = _e.sent();
                        console.warn("[Background] Failed to flush message ".concat(msg.id, ":"), sendError_1);
                        return [3 /*break*/, 14];
                    case 14:
                        _c++;
                        return [3 /*break*/, 9];
                    case 15:
                        console.log("[Background] \u2713 Flushed ".concat(result.messagesFlushed, " message(s) to @").concat(peerAlias));
                        return [3 /*break*/, 17];
                    case 16:
                        error_2 = _e.sent();
                        console.warn("[Background] Failed to flush to @".concat(peerAlias, ":"), error_2);
                        return [3 /*break*/, 17];
                    case 17:
                        _a++;
                        return [3 /*break*/, 5];
                    case 18: return [3 /*break*/, 20];
                    case 19:
                        error_3 = _e.sent();
                        console.error('[Background] Failed to check pending messages:', error_3);
                        result.errorsEncountered++;
                        return [3 /*break*/, 20];
                    case 20:
                        // Check for incoming calls via GunDB presence
                        console.log('[Background] 📞 Checking for incoming calls...');
                        _e.label = 21;
                    case 21:
                        _e.trys.push([21, 23, , 24]);
                        // Query recent call requests from GunDB DHT
                        // Uses lastCallCheckTime to only count new calls since last check
                        _d = result;
                        return [4 /*yield*/, this.queryRecentCalls(userAlias)];
                    case 22:
                        // Query recent call requests from GunDB DHT
                        // Uses lastCallCheckTime to only count new calls since last check
                        _d.incomingCalls = _e.sent();
                        if (result.incomingCalls > 0) {
                            console.log("[Background] \u2713 Found ".concat(result.incomingCalls, " incoming call(s)"));
                        }
                        else {
                            console.log('[Background] No new incoming calls');
                        }
                        return [3 /*break*/, 24];
                    case 23:
                        error_4 = _e.sent();
                        console.error('[Background] Failed to check calls:', error_4);
                        result.errorsEncountered++;
                        return [3 /*break*/, 24];
                    case 24:
                        // Release wake lock after check
                        BatteryModeService_1.default.releaseWakeLock();
                        // Log results
                        this.lastCheckTime = Date.now();
                        durationMs = this.lastCheckTime - startTime;
                        console.log("[Background] \u2705 Check complete in ".concat(durationMs, "ms (").concat(result.messagesChecked, " messages, ").concat(result.incomingCalls, " calls)"));
                        // Notify listeners
                        this.checkHandlers.forEach(function (handler) { return handler(result); });
                        return [3 /*break*/, 26];
                    case 25:
                        error_5 = _e.sent();
                        console.error('[Background] Check failed:', error_5);
                        result.errorsEncountered++;
                        BatteryModeService_1.default.releaseWakeLock();
                        return [3 /*break*/, 26];
                    case 26: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Start native foreground service (Android only)
     * Requires AndroidManifest.xml setup and native service implementation
     */
    BackgroundService.prototype.startForegroundService = function (userAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                console.log('[Background] 📲 Starting native foreground service...');
                try {
                    // TODO: Call native Android module via Expo Modules
                    // const { ForegroundServiceModule } = NativeModules;
                    // await ForegroundServiceModule.startService({
                    //   title: 'Aegis Chat',
                    //   message: `Connected as @${userAlias}`,
                    //   userAlias,
                    // });
                    console.log('[Background] Foreground service started (stub implementation)');
                }
                catch (error) {
                    console.error('[Background] Failed to start foreground service:', error);
                    // Fallback to polling
                    BatteryModeService_1.default.startPolling(function () { return _this.checkForMessagesAndCalls(userAlias); });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Stop native foreground service (Android only)
     */
    BackgroundService.prototype.stopForegroundService = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('[Background] 📲 Stopping native foreground service...');
                try {
                    // TODO: Call native Android module via Expo Modules
                    // const { ForegroundServiceModule } = NativeModules;
                    // await ForegroundServiceModule.stopService();
                    console.log('[Background] Foreground service stopped (stub implementation)');
                }
                catch (error) {
                    console.error('[Background] Failed to stop foreground service:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Subscribe to background check results
     */
    BackgroundService.prototype.onBackgroundCheck = function (handler) {
        var _this = this;
        this.checkHandlers.push(handler);
        return function () {
            var index = _this.checkHandlers.indexOf(handler);
            if (index > -1) {
                _this.checkHandlers.splice(index, 1);
            }
        };
    };
    /**
     * Get last check time (timestamp)
     */
    BackgroundService.prototype.getLastCheckTime = function () {
        return this.lastCheckTime;
    };
    /**
     * Check if background listening is active
     */
    BackgroundService.prototype.isActive = function () {
        return this.isBackgroundActive;
    };
    /**
     * Get battery mode
     */
    BackgroundService.prototype.getBatteryMode = function () {
        return BatteryModeService_1.default.getMode();
    };
    /**
     * Set battery mode (saver or always)
     */
    BackgroundService.prototype.setBatteryMode = function (mode) {
        BatteryModeService_1.default.setMode(mode);
    };
    /**
     * Toggle battery mode
     */
    BackgroundService.prototype.toggleBatteryMode = function () {
        BatteryModeService_1.default.toggleMode();
    };
    /**
     * Manual check trigger (for testing or user-initiated)
     */
    BackgroundService.prototype.manualCheck = function (userAlias) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('[Background] Manual check triggered');
                        return [4 /*yield*/, this.checkForMessagesAndCalls(userAlias)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return BackgroundService;
}());
exports.BackgroundService = BackgroundService;
exports.default = new BackgroundService();
