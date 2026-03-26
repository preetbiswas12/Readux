"use strict";
/**
 * SQLite Local Database Service
 * Manages chat history, pending messages, user profiles, and encryption keys
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
exports.closeDatabase = exports.getContacts = exports.saveContact = exports.removePendingMessage = exports.getPendingMessages = exports.addPendingMessage = exports.getChatHistory = exports.saveMessage = exports.getUserIdentity = exports.saveUserIdentity = exports.initializeDatabase = void 0;
var SQLite = __importStar(require("expo-sqlite"));
var db = null;
/**
 * Initialize SQLite database
 */
var initializeDatabase = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, SQLite.openDatabaseAsync("aegis_".concat(userId, ".db"))];
            case 1:
                db = _a.sent();
                // Create tables if they don't exist
                return [4 /*yield*/, createTables()];
            case 2:
                // Create tables if they don't exist
                _a.sent();
                console.log('[SQLite] Database initialized for user:', userId);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error('[SQLite] Initialization failed:', error_1);
                throw error_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.initializeDatabase = initializeDatabase;
/**
 * Create database tables
 */
var createTables = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!db)
                    throw new Error('Database not initialized');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                // Messages table
                return [4 /*yield*/, db.execAsync("\n      CREATE TABLE IF NOT EXISTS messages (\n        id TEXT PRIMARY KEY,\n        senderId TEXT NOT NULL,\n        senderAlias TEXT NOT NULL,\n        recipientId TEXT NOT NULL,\n        content TEXT NOT NULL,\n        encryptedContent TEXT,\n        timestamp INTEGER,\n        status TEXT DEFAULT 'pending',\n        createdAt INTEGER NOT NULL\n      );\n    ")];
            case 2:
                // Messages table
                _a.sent();
                // Pending messages queue
                return [4 /*yield*/, db.execAsync("\n      CREATE TABLE IF NOT EXISTS pendingMessages (\n        id TEXT PRIMARY KEY,\n        recipientId TEXT NOT NULL,\n        content TEXT NOT NULL,\n        encryptedContent TEXT,\n        createdAt INTEGER NOT NULL,\n        retryCount INTEGER DEFAULT 0\n      );\n    ")];
            case 3:
                // Pending messages queue
                _a.sent();
                // Users/Contacts table
                return [4 /*yield*/, db.execAsync("\n      CREATE TABLE IF NOT EXISTS users (\n        id TEXT PRIMARY KEY,\n        alias TEXT UNIQUE NOT NULL,\n        publicKey TEXT NOT NULL,\n        isContact INTEGER DEFAULT 0,\n        lastInteraction INTEGER\n      );\n    ")];
            case 4:
                // Users/Contacts table
                _a.sent();
                // User identity table (singleton)
                return [4 /*yield*/, db.execAsync("\n      CREATE TABLE IF NOT EXISTS userIdentity (\n        id TEXT PRIMARY KEY,\n        alias TEXT NOT NULL,\n        publicKey TEXT NOT NULL,\n        privateKey TEXT NOT NULL,\n        seedPhrase TEXT NOT NULL,\n        createdAt INTEGER NOT NULL\n      );\n    ")];
            case 5:
                // User identity table (singleton)
                _a.sent();
                console.log('[SQLite] Tables created successfully');
                return [3 /*break*/, 7];
            case 6:
                error_2 = _a.sent();
                console.error('[SQLite] Table creation failed:', error_2);
                throw error_2;
            case 7: return [2 /*return*/];
        }
    });
}); };
/**
 * Save user identity locally (encrypted seed phrase)
 */
var saveUserIdentity = function (id, alias, publicKey, privateKey, seedPhrase) { return __awaiter(void 0, void 0, void 0, function () {
    var error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!db)
                    throw new Error('Database not initialized');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db.runAsync("INSERT OR REPLACE INTO userIdentity (id, alias, publicKey, privateKey, seedPhrase, createdAt)\n       VALUES (?, ?, ?, ?, ?, ?)", [id, alias, publicKey, privateKey, seedPhrase, Date.now()])];
            case 2:
                _a.sent();
                console.log('[SQLite] User identity saved');
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.error('[SQLite] Save identity failed:', error_3);
                throw error_3;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.saveUserIdentity = saveUserIdentity;
/**
 * Get stored user identity
 */
var getUserIdentity = function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!db)
                    throw new Error('Database not initialized');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db.getFirstAsync('SELECT * FROM userIdentity LIMIT 1')];
            case 2:
                result = _a.sent();
                return [2 /*return*/, result || null];
            case 3:
                error_4 = _a.sent();
                console.error('[SQLite] Get identity failed:', error_4);
                throw error_4;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getUserIdentity = getUserIdentity;
/**
 * Insert a message into chat history
 */
var saveMessage = function (message) { return __awaiter(void 0, void 0, void 0, function () {
    var error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!db)
                    throw new Error('Database not initialized');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db.runAsync("INSERT INTO messages (id, senderId, senderAlias, recipientId, content, timestamp, status, createdAt)\n       VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
                        message.id,
                        message.senderId,
                        message.senderAlias,
                        message.recipientId,
                        message.content,
                        message.timestamp,
                        message.status,
                        message.createdAt,
                    ])];
            case 2:
                _a.sent();
                console.log('[SQLite] Message saved:', message.id);
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                console.error('[SQLite] Save message failed:', error_5);
                throw error_5;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.saveMessage = saveMessage;
/**
 * Get chat history with a specific user
 */
var getChatHistory = function (otherUserId_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([otherUserId_1], args_1, true), void 0, function (otherUserId, limit) {
        var messages, error_6;
        if (limit === void 0) { limit = 50; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!db)
                        throw new Error('Database not initialized');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, db.getAllAsync("SELECT * FROM messages \n       WHERE (senderId = ? AND recipientId = ?) OR (senderId = ? AND recipientId = ?)\n       ORDER BY createdAt DESC\n       LIMIT ?", [otherUserId, otherUserId, otherUserId, otherUserId, limit])];
                case 2:
                    messages = _a.sent();
                    return [2 /*return*/, messages.reverse()]; // Return in chronological order
                case 3:
                    error_6 = _a.sent();
                    console.error('[SQLite] Get chat history failed:', error_6);
                    throw error_6;
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.getChatHistory = getChatHistory;
/**
 * Add message to pending queue (offline)
 */
var addPendingMessage = function (recipientId, content, encryptedContent) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!db)
                    throw new Error('Database not initialized');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                id = Math.random().toString(36).substring(7);
                return [4 /*yield*/, db.runAsync("INSERT INTO pendingMessages (id, recipientId, content, encryptedContent, createdAt)\n       VALUES (?, ?, ?, ?, ?)", [id, recipientId, content, encryptedContent, Date.now()])];
            case 2:
                _a.sent();
                console.log('[SQLite] Message added to pending queue:', id);
                return [2 /*return*/, id];
            case 3:
                error_7 = _a.sent();
                console.error('[SQLite] Add pending failed:', error_7);
                throw error_7;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.addPendingMessage = addPendingMessage;
/**
 * Get all pending messages
 */
var getPendingMessages = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!db)
                    throw new Error('Database not initialized');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db.getAllAsync('SELECT * FROM pendingMessages ORDER BY createdAt ASC')];
            case 2: return [2 /*return*/, _a.sent()];
            case 3:
                error_8 = _a.sent();
                console.error('[SQLite] Get pending messages failed:', error_8);
                throw error_8;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getPendingMessages = getPendingMessages;
/**
 * Remove pending message (after successful send)
 */
var removePendingMessage = function (messageId) { return __awaiter(void 0, void 0, void 0, function () {
    var error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!db)
                    throw new Error('Database not initialized');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db.runAsync('DELETE FROM pendingMessages WHERE id = ?', [messageId])];
            case 2:
                _a.sent();
                console.log('[SQLite] Pending message cleared:', messageId);
                return [3 /*break*/, 4];
            case 3:
                error_9 = _a.sent();
                console.error('[SQLite] Remove pending failed:', error_9);
                throw error_9;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.removePendingMessage = removePendingMessage;
/**
 * Save or update contact
 */
var saveContact = function (id, alias, publicKey) { return __awaiter(void 0, void 0, void 0, function () {
    var error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!db)
                    throw new Error('Database not initialized');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db.runAsync("INSERT OR REPLACE INTO users (id, alias, publicKey, isContact, lastInteraction)\n       VALUES (?, ?, ?, 1, ?)", [id, alias, publicKey, Date.now()])];
            case 2:
                _a.sent();
                console.log('[SQLite] Contact saved:', alias);
                return [3 /*break*/, 4];
            case 3:
                error_10 = _a.sent();
                console.error('[SQLite] Save contact failed:', error_10);
                throw error_10;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.saveContact = saveContact;
/**
 * Get all contacts
 */
var getContacts = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!db)
                    throw new Error('Database not initialized');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db.getAllAsync('SELECT * FROM users WHERE isContact = 1 ORDER BY lastInteraction DESC')];
            case 2: return [2 /*return*/, _a.sent()];
            case 3:
                error_11 = _a.sent();
                console.error('[SQLite] Get contacts failed:', error_11);
                throw error_11;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getContacts = getContacts;
/**
 * Close database connection
 */
var closeDatabase = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!db) return [3 /*break*/, 2];
                return [4 /*yield*/, db.closeAsync()];
            case 1:
                _a.sent();
                db = null;
                console.log('[SQLite] Database closed');
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); };
exports.closeDatabase = closeDatabase;
