"use strict";
/**
 * Project Aegis - Sync Service
 * Handles multi-device message history synchronization
 * Peer-to-peer sync via local network
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
var uuid_1 = require("uuid");
var SQLiteService_1 = require("./SQLiteService");
/**
 * Sync Service (Singleton)
 * Manages multi-device synchronization via P2P connections
 */
var SyncService = /** @class */ (function () {
    function SyncService() {
        this.deviceId = (0, uuid_1.v4)();
        this.syncSessions = new Map();
        this.activeSyncs = new Map();
        this.syncHandlers = new Map();
        this.syncCompleteHandlers = new Map();
        console.log("\uD83D\uDD04 SyncService initialized (Device ID: ".concat(this.deviceId, ")"));
    }
    /**
     * Get device ID (unique identifier for this device)
     */
    SyncService.prototype.getDeviceId = function () {
        return this.deviceId;
    };
    /**
     * Calculate simple checksum of messages
     */
    SyncService.prototype.calculateChecksum = function (messages) {
        var checksum = 0;
        for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
            var msg = messages_1[_i];
            for (var i = 0; i < msg.id.length; i++) {
                checksum = (checksum + msg.id.charCodeAt(i)) % 0xFFFFFFFF;
            }
            checksum = (checksum + msg.timestamp) % 0xFFFFFFFF;
        }
        return checksum.toString(16);
    };
    /**
     * Create a sync request for new device setup
     */
    SyncService.prototype.createSyncRequest = function (userAlias_1, deviceName_1) {
        return __awaiter(this, arguments, void 0, function (userAlias, deviceName, type, lastSyncTime) {
            var syncRequest;
            if (type === void 0) { type = 'full'; }
            return __generator(this, function (_a) {
                syncRequest = {
                    syncId: (0, uuid_1.v4)(),
                    deviceId: this.deviceId,
                    deviceName: deviceName,
                    timestamp: Date.now(),
                    type: type,
                    lastSyncTime: lastSyncTime,
                    userAlias: userAlias,
                };
                console.log("\uD83D\uDCF1 Sync request created (".concat(type, "): ").concat(syncRequest.syncId));
                return [2 /*return*/, syncRequest];
            });
        });
    };
    /**
     * Export message history for syncing
     */
    SyncService.prototype.exportMessageHistory = function (userAlias_1) {
        return __awaiter(this, arguments, void 0, function (userAlias, type, lastSyncTime) {
            var syncId, startTime, messages, _a, _b, contacts, checksum, payload, error_1;
            if (type === void 0) { type = 'full'; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        syncId = (0, uuid_1.v4)();
                        startTime = Date.now();
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 9, , 10]);
                        if (!(type === 'full')) return [3 /*break*/, 3];
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.getAllMessages(userAlias)];
                    case 2:
                        _a = _c.sent();
                        return [3 /*break*/, 7];
                    case 3:
                        if (!lastSyncTime) return [3 /*break*/, 5];
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.getMessagesSince(userAlias, lastSyncTime)];
                    case 4:
                        _b = _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _b = [];
                        _c.label = 6;
                    case 6:
                        _a = _b;
                        _c.label = 7;
                    case 7:
                        messages = _a;
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.getAllContacts()];
                    case 8:
                        contacts = _c.sent();
                        checksum = this.calculateChecksum(messages);
                        payload = {
                            syncId: syncId,
                            type: type,
                            messages: messages,
                            contacts: contacts.map(function (c) { return ({
                                alias: c.alias,
                                publicKey: c.publicKey,
                                timestamp: c.timestamp || Date.now(),
                            }); }),
                            metadata: {
                                startTime: startTime,
                                endTime: Date.now(),
                                messageCount: messages.length,
                                checksum: checksum,
                            },
                        };
                        this.activeSyncs.set(syncId, payload);
                        console.log("\uD83D\uDCE6 Exported ".concat(messages.length, " messages for sync: ").concat(syncId));
                        return [2 /*return*/, payload];
                    case 9:
                        error_1 = _c.sent();
                        console.error('Export history failed:', error_1);
                        throw error_1;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Import message history from another device
     */
    SyncService.prototype.importMessageHistory = function (payload, userAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var syncId, startTime, syncState, existingMessages, existingIds, mergedCount, _i, _a, msg, _b, _c, contact, allMessages, localChecksum, response, handler, error_2, response;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        syncId = payload.syncId;
                        startTime = Date.now();
                        syncState = {
                            syncId: syncId,
                            status: 'syncing',
                            progress: 0,
                            messagesSynced: 0,
                            totalMessages: payload.messages.length,
                            startTime: startTime,
                        };
                        this.syncSessions.set(syncId, syncState);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 12, , 13]);
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.getAllMessages(userAlias)];
                    case 2:
                        existingMessages = _d.sent();
                        existingIds = new Set(existingMessages.map(function (m) { return m.id; }));
                        mergedCount = 0;
                        _i = 0, _a = payload.messages;
                        _d.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        msg = _a[_i];
                        if (!!existingIds.has(msg.id)) return [3 /*break*/, 5];
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.saveMessage(msg)];
                    case 4:
                        _d.sent();
                        mergedCount++;
                        _d.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        syncState.messagesSynced = mergedCount;
                        syncState.progress = (mergedCount / payload.messages.length) * 100;
                        _b = 0, _c = payload.contacts;
                        _d.label = 7;
                    case 7:
                        if (!(_b < _c.length)) return [3 /*break*/, 10];
                        contact = _c[_b];
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.addContact(contact.alias, contact.publicKey)];
                    case 8:
                        _d.sent();
                        _d.label = 9;
                    case 9:
                        _b++;
                        return [3 /*break*/, 7];
                    case 10: return [4 /*yield*/, SQLiteService_1.SQLiteService.getAllMessages(userAlias)];
                    case 11:
                        allMessages = _d.sent();
                        localChecksum = this.calculateChecksum(allMessages);
                        syncState.status = 'completed';
                        syncState.endTime = Date.now();
                        syncState.progress = 100;
                        response = {
                            syncId: syncId,
                            deviceId: this.deviceId,
                            success: true,
                            messageCount: payload.messages.length,
                            contactCount: payload.contacts.length,
                            lastMessage: payload.messages[payload.messages.length - 1],
                            timestamp: Date.now(),
                            checksum: localChecksum,
                        };
                        console.log("\u2705 Sync completed: ".concat(mergedCount, " messages merged, ").concat(payload.contacts.length, " contacts synced"));
                        handler = this.syncCompleteHandlers.get(syncId);
                        if (handler) {
                            handler(response);
                        }
                        return [2 /*return*/, response];
                    case 12:
                        error_2 = _d.sent();
                        syncState.status = 'failed';
                        syncState.error = error_2 instanceof Error ? error_2.message : 'Unknown error';
                        syncState.endTime = Date.now();
                        console.error('Import history failed:', error_2);
                        response = {
                            syncId: syncId,
                            deviceId: this.deviceId,
                            success: false,
                            messageCount: 0,
                            contactCount: 0,
                            timestamp: Date.now(),
                            checksum: '',
                        };
                        return [2 /*return*/, response];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle incoming sync request from peer
     */
    SyncService.prototype.handleSyncRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("\uD83D\uDCF1 Sync request received from device: ".concat(request.deviceName));
                        return [4 /*yield*/, this.exportMessageHistory(request.userAlias, request.type, request.lastSyncTime)];
                    case 1:
                        payload = _a.sent();
                        return [2 /*return*/, payload];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Handle sync request failed:', error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle incoming sync payload
     */
    SyncService.prototype.handleSyncPayload = function (payload, userAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var response, handler, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.importMessageHistory(payload, userAlias)];
                    case 1:
                        response = _a.sent();
                        handler = this.syncCompleteHandlers.get(payload.syncId);
                        if (handler) {
                            handler(response);
                        }
                        console.log("\u2713 Sync payload processed: ".concat(payload.syncId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Handle sync payload failed:', error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get sync state/progress
     */
    SyncService.prototype.getSyncState = function (syncId) {
        return this.syncSessions.get(syncId);
    };
    /**
     * Get all active syncs
     */
    SyncService.prototype.getActiveSyncs = function () {
        return Array.from(this.syncSessions.values());
    };
    /**
     * Cancel a sync operation
     */
    SyncService.prototype.cancelSync = function (syncId) {
        var state = this.syncSessions.get(syncId);
        if (state) {
            state.status = 'failed';
            state.error = 'Sync cancelled by user';
            state.endTime = Date.now();
            console.log("\u23F8\uFE0F Sync cancelled: ".concat(syncId));
        }
    };
    /**
     * Register handler for incoming sync payloads
     */
    SyncService.prototype.onSyncPayload = function (syncId, handler) {
        var _this = this;
        this.syncHandlers.set(syncId, handler);
        return function () {
            _this.syncHandlers.delete(syncId);
        };
    };
    /**
     * Register handler for sync completion
     */
    SyncService.prototype.onSyncComplete = function (syncId, handler) {
        var _this = this;
        this.syncCompleteHandlers.set(syncId, handler);
        return function () {
            _this.syncCompleteHandlers.delete(syncId);
        };
    };
    /**
     * Check if device is synced with peer
     */
    SyncService.prototype.isDeviceSynced = function (userAlias, otherDeviceId) {
        return __awaiter(this, void 0, void 0, function () {
            var allMessages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, SQLiteService_1.SQLiteService.getAllMessages(userAlias)];
                    case 1:
                        allMessages = _a.sent();
                        return [2 /*return*/, allMessages.length > 0];
                }
            });
        });
    };
    /**
     * Get last sync timestamp
     */
    SyncService.prototype.getLastSyncTime = function (userAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var messages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, SQLiteService_1.SQLiteService.getAllMessages(userAlias)];
                    case 1:
                        messages = _a.sent();
                        if (messages.length === 0)
                            return [2 /*return*/, 0];
                        // Return timestamp of most recent message
                        return [2 /*return*/, messages.reduce(function (max, msg) { return Math.max(max, msg.timestamp); }, 0)];
                }
            });
        });
    };
    /**
     * Clear sync history
     */
    SyncService.prototype.clearSyncSessions = function () {
        this.syncSessions.clear();
        this.activeSyncs.clear();
        console.log('🗑️ Sync sessions cleared');
    };
    /**
     * Get sync statistics
     */
    SyncService.prototype.getSyncStats = function () {
        var stats = {
            totalSyncs: this.syncSessions.size,
            completedSyncs: 0,
            failedSyncs: 0,
            activeSyncs: 0,
        };
        for (var _i = 0, _a = this.syncSessions.values(); _i < _a.length; _i++) {
            var state = _a[_i];
            if (state.status === 'completed')
                stats.completedSyncs++;
            else if (state.status === 'failed')
                stats.failedSyncs++;
            else if (state.status === 'syncing')
                stats.activeSyncs++;
        }
        return stats;
    };
    return SyncService;
}());
exports.default = new SyncService();
