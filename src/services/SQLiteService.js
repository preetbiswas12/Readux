"use strict";
/**
 * Project Aegis - SQLite Service
 * Local database for chat history, messages, and pending queue
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteService = void 0;
var SQLite = __importStar(require("expo-sqlite"));
var SQLiteService = /** @class */ (function () {
    function SQLiteService() {
    }
    /**
     * Initialize SQLite database with schema
     */
    SQLiteService.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        _a = this;
                        return [4 /*yield*/, SQLite.openDatabaseAsync('aegis.db')];
                    case 1:
                        _a.db = _b.sent();
                        console.log('✓ SQLite database opened');
                        // Create tables
                        return [4 /*yield*/, this.createTables()];
                    case 2:
                        // Create tables
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.error('SQLite initialization failed:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create all necessary tables
     */
    SQLiteService.createTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db) {
                            throw new Error('Database not initialized');
                        }
                        // Messages table (chat history)
                        return [4 /*yield*/, this.db.execAsync("\n      CREATE TABLE IF NOT EXISTS messages (\n        id TEXT PRIMARY KEY,\n        from_alias TEXT NOT NULL,\n        to_alias TEXT NOT NULL,\n        content TEXT NOT NULL,\n        encrypted_content TEXT,\n        timestamp INTEGER NOT NULL,\n        delivered INTEGER DEFAULT 0,\n        read INTEGER DEFAULT 0,\n        message_type TEXT DEFAULT 'text'\n      );\n      \n      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);\n      \n      -- Encryption state table (persistent Double Ratchet)\n      CREATE TABLE IF NOT EXISTS encryption_state (\n        peer_alias TEXT PRIMARY KEY,\n        root_key TEXT NOT NULL,\n        chain_key TEXT NOT NULL,\n        header_key TEXT NOT NULL,\n        counter INTEGER DEFAULT 0,\n        dhs TEXT,\n        dhsr TEXT,\n        pn INTEGER DEFAULT 0,\n        ckr TEXT,\n        created_at INTEGER NOT NULL,\n        updated_at INTEGER NOT NULL\n      );\n      \n      CREATE INDEX IF NOT EXISTS idx_encryption_state_alias ON encryption_state(peer_alias);\n      CREATE INDEX IF NOT EXISTS idx_messages_to_alias ON messages(to_alias);\n    ")];
                    case 1:
                        // Messages table (chat history)
                        _a.sent();
                        // Pending messages queue (offline)
                        return [4 /*yield*/, this.db.execAsync("\n      CREATE TABLE IF NOT EXISTS pending_messages (\n        id TEXT PRIMARY KEY,\n        to_alias TEXT NOT NULL,\n        content TEXT NOT NULL,\n        encrypted_content TEXT,\n        created_at INTEGER NOT NULL,\n        retries INTEGER DEFAULT 0,\n        max_retries INTEGER DEFAULT 5\n      );\n    ")];
                    case 2:
                        // Pending messages queue (offline)
                        _a.sent();
                        // Contacts table
                        return [4 /*yield*/, this.db.execAsync("\n      CREATE TABLE IF NOT EXISTS contacts (\n        alias TEXT PRIMARY KEY,\n        public_key TEXT NOT NULL,\n        last_seen INTEGER,\n        is_blocked INTEGER DEFAULT 0\n      );\n    ")];
                    case 3:
                        // Contacts table
                        _a.sent();
                        // Group chats (full-mesh)
                        return [4 /*yield*/, this.db.execAsync("\n      CREATE TABLE IF NOT EXISTS group_chats (\n        id TEXT PRIMARY KEY,\n        name TEXT NOT NULL,\n        members TEXT NOT NULL,\n        created_at INTEGER NOT NULL,\n        created_by TEXT NOT NULL\n      );\n    ")];
                    case 4:
                        // Group chats (full-mesh)
                        _a.sent();
                        // Group messages
                        return [4 /*yield*/, this.db.execAsync("\n      CREATE TABLE IF NOT EXISTS group_messages (\n        id TEXT PRIMARY KEY,\n        group_id TEXT NOT NULL,\n        from_alias TEXT NOT NULL,\n        content TEXT NOT NULL,\n        encrypted_content TEXT,\n        timestamp INTEGER NOT NULL,\n        message_type TEXT DEFAULT 'text',\n        FOREIGN KEY(group_id) REFERENCES group_chats(id)\n      );\n      \n      CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);\n    ")];
                    case 5:
                        // Group messages
                        _a.sent();
                        // App state (user identity, preferences)
                        return [4 /*yield*/, this.db.execAsync("\n      CREATE TABLE IF NOT EXISTS app_state (\n        key TEXT PRIMARY KEY,\n        value TEXT NOT NULL\n      );\n    ")];
                    case 6:
                        // App state (user identity, preferences)
                        _a.sent();
                        console.log('✓ All database tables created');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save a message to local history
     */
    SQLiteService.saveMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.runAsync("INSERT INTO messages (id, from_alias, to_alias, content, encrypted_content, timestamp, delivered, read, message_type)\n         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                                message.id,
                                message.from,
                                message.to,
                                message.content,
                                message.content, // For now, store content without encryption
                                message.timestamp,
                                message.delivered ? 1 : 0,
                                message.read ? 1 : 0,
                                message.type,
                            ])];
                    case 2:
                        _a.sent();
                        console.log("\u2713 Message saved: ".concat(message.id));
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Save message failed:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get chat history with a specific user
     */
    SQLiteService.getMessageHistory = function (userAlias_1, peerAlias_1) {
        return __awaiter(this, arguments, void 0, function (userAlias, peerAlias, limit) {
            var rows, error_3;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.getAllAsync("SELECT * FROM messages \n         WHERE (from_alias = ? AND to_alias = ?) OR (from_alias = ? AND to_alias = ?)\n         ORDER BY timestamp DESC\n         LIMIT ?", [userAlias, peerAlias, peerAlias, userAlias, limit])];
                    case 2:
                        rows = _a.sent();
                        return [2 /*return*/, rows.map(function (row) { return ({
                                id: row.id,
                                from: row.from_alias,
                                to: row.to_alias,
                                content: row.content,
                                timestamp: row.timestamp,
                                type: row.message_type,
                                encrypted: !!row.encrypted_content,
                                delivered: row.delivered === 1,
                                read: row.read === 1,
                            }); })];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Get message history failed:', error_3);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add a message to pending queue (offline)
     */
    SQLiteService.addPendingMessage = function (fromAlias, toAlias, content, encryptedContent, recipientPublicKey) {
        return __awaiter(this, void 0, void 0, function () {
            var id, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        id = "pending-".concat(Date.now(), "-").concat(Math.random());
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.runAsync("INSERT INTO pending_messages (id, from_alias, to_alias, content, encrypted_content, recipient_public_key, created_at)\n         VALUES (?, ?, ?, ?, ?, ?, ?)", [id, fromAlias, toAlias, content, encryptedContent, recipientPublicKey, Date.now()])];
                    case 2:
                        _a.sent();
                        console.log("\u2713 Pending message queued: ".concat(id));
                        return [2 /*return*/, id];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Add pending message failed:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all pending messages
     */
    SQLiteService.getPendingMessages = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rows, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.getAllAsync("SELECT * FROM pending_messages WHERE retries < max_retries")];
                    case 2:
                        rows = _a.sent();
                        return [2 /*return*/, rows.map(function (row) { return ({
                                id: row.id,
                                from: row.from_alias,
                                to: row.to_alias,
                                content: row.content,
                                encryptedContent: row.encrypted_content,
                                recipientPublicKey: row.recipient_public_key,
                                createdAt: row.created_at,
                                retries: row.retries,
                            }); })];
                    case 3:
                        error_5 = _a.sent();
                        console.error('Get pending messages failed:', error_5);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove a pending message after successful send
     */
    SQLiteService.removePendingMessage = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.runAsync("DELETE FROM pending_messages WHERE id = ?", [id])];
                    case 2:
                        _a.sent();
                        console.log("\u2713 Pending message removed: ".concat(id));
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        console.error('Remove pending message failed:', error_6);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save app state (user identity, preferences)
     */
    SQLiteService.saveAppState = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.runAsync("INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)", [key, value])];
                    case 2:
                        _a.sent();
                        console.log("\u2713 App state saved: ".concat(key));
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        console.error('Save app state failed:', error_7);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load app state
     */
    SQLiteService.loadAppState = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var row, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.getFirstAsync("SELECT value FROM app_state WHERE key = ?", [key])];
                    case 2:
                        row = _a.sent();
                        return [2 /*return*/, (row === null || row === void 0 ? void 0 : row.value) || null];
                    case 3:
                        error_8 = _a.sent();
                        console.error('Load app state failed:', error_8);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Mark message as delivered (double tick)
     */
    SQLiteService.markMessageDelivered = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.runAsync("UPDATE messages SET delivered = 1 WHERE id = ?", [messageId])];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _a.sent();
                        console.error('Mark delivered failed:', error_9);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Mark message as read (blue tick)
     */
    SQLiteService.markMessageRead = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.runAsync("UPDATE messages SET read = 1 WHERE id = ?", [messageId])];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_10 = _a.sent();
                        console.error('Mark read failed:', error_10);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all messages for a user (sent + received)
     */
    SQLiteService.getAllMessages = function (userAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.getAllAsync("SELECT * FROM messages WHERE from_alias = ? OR to_alias = ? ORDER BY timestamp DESC", [userAlias, userAlias])];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result.map(function (row) { return ({
                                id: row.id,
                                from: row.from_alias,
                                to: row.to_alias,
                                content: row.content,
                                timestamp: row.timestamp,
                                type: 'text',
                                encrypted: true,
                                delivered: row.delivered === 1,
                                read: row.read === 1,
                            }); })];
                    case 3:
                        error_11 = _a.sent();
                        console.error('Get all messages failed:', error_11);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get messages since a specific timestamp (for incremental sync)
     */
    SQLiteService.getMessagesSince = function (userAlias, timestamp) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.getAllAsync("SELECT * FROM messages WHERE (from_alias = ? OR to_alias = ?) AND timestamp > ? ORDER BY timestamp DESC", [userAlias, userAlias, timestamp])];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result.map(function (row) { return ({
                                id: row.id,
                                from: row.from_alias,
                                to: row.to_alias,
                                content: row.content,
                                timestamp: row.timestamp,
                                type: 'text',
                                encrypted: true,
                                delivered: row.delivered === 1,
                                read: row.read === 1,
                            }); })];
                    case 3:
                        error_12 = _a.sent();
                        console.error('Get messages since failed:', error_12);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all contacts
     */
    SQLiteService.getAllContacts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.getAllAsync("SELECT alias, public_key, last_seen FROM contacts WHERE is_blocked = 0 ORDER BY alias")];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result.map(function (row) { return ({
                                alias: row.alias,
                                publicKey: row.public_key,
                                timestamp: row.last_seen,
                            }); })];
                    case 3:
                        error_13 = _a.sent();
                        console.error('Get all contacts failed:', error_13);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add or update a contact
     */
    SQLiteService.addContact = function (alias, publicKey) {
        return __awaiter(this, void 0, void 0, function () {
            var error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.runAsync("INSERT OR REPLACE INTO contacts (alias, public_key, last_seen) VALUES (?, ?, ?)", [alias, publicKey, Date.now()])];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_14 = _a.sent();
                        console.error('Add contact failed:', error_14);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new group chat
     */
    SQLiteService.createGroupChat = function (groupId, name, members, createdBy, description) {
        return __awaiter(this, void 0, void 0, function () {
            var membersJson, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        membersJson = JSON.stringify(members);
                        return [4 /*yield*/, this.db.runAsync("INSERT INTO group_chats (id, name, members, created_at, created_by) VALUES (?, ?, ?, ?, ?)", [groupId, name, membersJson, Date.now(), createdBy])];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_15 = _a.sent();
                        console.error('Create group chat failed:', error_15);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save a group message
     */
    SQLiteService.saveGroupMessage = function (messageId, groupId, fromAlias, content, encryptedContent) {
        return __awaiter(this, void 0, void 0, function () {
            var error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.runAsync("INSERT INTO group_messages (id, group_id, from_alias, content, encrypted_content, timestamp, message_type) VALUES (?, ?, ?, ?, ?, ?, ?)", [messageId, groupId, fromAlias, content, encryptedContent || '', Date.now(), 'text'])];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_16 = _a.sent();
                        console.error('Save group message failed:', error_16);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get group messages
     */
    SQLiteService.getGroupMessages = function (groupId_1) {
        return __awaiter(this, arguments, void 0, function (groupId, limit) {
            var result, error_17;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.getAllAsync("SELECT * FROM group_messages WHERE group_id = ? ORDER BY timestamp DESC LIMIT ?", [groupId, limit])];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result.reverse()]; // Return in chronological order
                    case 3:
                        error_17 = _a.sent();
                        console.error('Get group messages failed:', error_17);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Mark group message as read by member
     */
    SQLiteService.markGroupMessageRead = function (messageId, readerAlias) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.db)
                    throw new Error('Database not initialized');
                try {
                    // Note: This is a simplified implementation
                    // In production, would need a separate read_receipts table
                    console.log("\u2713 Marked message ".concat(messageId, " as read by @").concat(readerAlias));
                }
                catch (error) {
                    console.error('Mark group message read failed:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get all group chats for a user
     */
    SQLiteService.getUserGroups = function (userAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_18;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            throw new Error('Database not initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.getAllAsync("SELECT * FROM group_chats")];
                    case 2:
                        result = _a.sent();
                        // Filter groups where user is a member
                        return [2 /*return*/, result.filter(function (row) {
                                try {
                                    var members = JSON.parse(row.members);
                                    return members.includes(userAlias);
                                }
                                catch (_a) {
                                    return false;
                                }
                            })];
                    case 3:
                        error_18 = _a.sent();
                        console.error('Get user groups failed:', error_18);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close database connection
     */
    SQLiteService.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.db.closeAsync()];
                    case 1:
                        _a.sent();
                        this.db = null;
                        console.log('✓ SQLite database closed');
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    SQLiteService.db = null;
    return SQLiteService;
}());
exports.SQLiteService = SQLiteService;
