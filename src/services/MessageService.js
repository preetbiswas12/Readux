"use strict";
/**
 * Project Aegis - Message Service
 * Handles message encryption, sending, receiving, and delivery tracking
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
exports.MessageService = exports.MessageType = void 0;
var uuid_1 = require("uuid");
var CryptoService_1 = require("./CryptoService");
var SQLiteService_1 = require("./SQLiteService");
var WebRTCService_1 = __importDefault(require("./WebRTCService"));
// @ts-ignore - E2EEncryptionService is default exported as singleton
var E2EEncryptionService_1 = __importDefault(require("./E2EEncryptionService"));
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["ACK"] = "ack";
    MessageType["READ"] = "read";
})(MessageType || (exports.MessageType = MessageType = {}));
var MessageService = /** @class */ (function () {
    function MessageService() {
    }
    /**
     * Send a text message to a peer (E2EE with Double Ratchet)
     * Queues locally if peer is offline
     */
    MessageService.sendMessage = function (fromAlias, toAlias, content, recipientPublicKey) {
        return __awaiter(this, void 0, void 0, function () {
            var messageId, encrypted, packet, sent, message, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        messageId = (0, uuid_1.v4)();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 10, , 11]);
                        if (!!this.encryptionSessions.has(toAlias)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.initializeEncryption(fromAlias, toAlias, recipientPublicKey)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, E2EEncryptionService_1.default.encryptMessage(toAlias, content)];
                    case 4:
                        encrypted = _a.sent();
                        packet = {
                            id: messageId,
                            from: fromAlias,
                            to: toAlias,
                            ciphertext: encrypted.ciphertext,
                            nonce: encrypted.nonce,
                            header: encrypted.header,
                            timestamp: encrypted.timestamp,
                            counter: encrypted.counter,
                            dhr: encrypted.dhr,
                            type: MessageType.TEXT,
                        };
                        return [4 /*yield*/, WebRTCService_1.default.sendMessage(toAlias, packet)];
                    case 5:
                        sent = _a.sent();
                        message = {
                            id: messageId,
                            from: fromAlias,
                            to: toAlias,
                            content: content,
                            timestamp: packet.timestamp,
                            type: 'text',
                            encrypted: true, // Marked as E2EE
                            delivered: sent,
                            read: false,
                        };
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.saveMessage(message)];
                    case 6:
                        _a.sent();
                        if (!!sent) return [3 /*break*/, 8];
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.addPendingMessage(fromAlias, toAlias, content, packet.ciphertext || '', recipientPublicKey)];
                    case 7:
                        _a.sent();
                        console.log("\uD83D\uDCCC E2EE Message queued (offline): ".concat(messageId));
                        return [3 /*break*/, 9];
                    case 8:
                        console.log("\u2713 E2EE Message sent: ".concat(messageId));
                        _a.label = 9;
                    case 9: return [2 /*return*/, messageId];
                    case 10:
                        error_1 = _a.sent();
                        console.error('Send E2EE message failed:', error_1);
                        throw error_1;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize E2EE Double Ratchet session with a peer
     */
    MessageService.initializeEncryption = function (fromAlias, toAlias, recipientPublicKey) {
        return __awaiter(this, void 0, void 0, function () {
            var ephemeralKeypair, sharedSecretHex, sharedSecret, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        ephemeralKeypair = CryptoService_1.CryptoService.generateEphemeralKeypair();
                        sharedSecretHex = CryptoService_1.CryptoService.performECDH(ephemeralKeypair.privateKey, recipientPublicKey);
                        sharedSecret = new Uint8Array(Buffer.from(sharedSecretHex, 'hex'));
                        // Initialize encryption session with shared secret
                        return [4 /*yield*/, E2EEncryptionService_1.default.initializeSession(toAlias, sharedSecret, true // We are initiator
                            )];
                    case 1:
                        // Initialize encryption session with shared secret
                        _a.sent();
                        this.encryptionSessions.add(toAlias);
                        console.log("\uD83D\uDD10 E2EE session initialized with @".concat(toAlias));
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Failed to initialize E2EE with @".concat(toAlias, ":"), error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle incoming message packet from peer (E2EE decryption)
     */
    MessageService.handleIncomingMessage = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            var decryptedContent, encryptedPacket, error_3, message, handler, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        decryptedContent = void 0;
                        if (!(packet.ciphertext && packet.header)) return [3 /*break*/, 5];
                        // Initialize encryption session if needed
                        if (!this.encryptionSessions.has(packet.from)) {
                            // This is first message from this peer - we receive as non-initiator
                            // Key exchange happens via out-of-band (e.g., first WebRTC connection init)
                            // For now, mark session as initialized with first message
                            this.encryptionSessions.add(packet.from);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        encryptedPacket = {
                            id: packet.id,
                            from: packet.from,
                            to: packet.to,
                            ciphertext: packet.ciphertext,
                            nonce: packet.nonce || '',
                            header: packet.header,
                            timestamp: packet.timestamp,
                            counter: packet.counter || 0,
                            dhr: packet.dhr,
                        };
                        return [4 /*yield*/, E2EEncryptionService_1.default.decryptMessage(packet.from, encryptedPacket)];
                    case 2:
                        decryptedContent = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error("E2EE decryption failed from @".concat(packet.from, ": ").concat(error_3));
                        throw error_3;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        // Fallback to old encryption (basic)
                        decryptedContent = CryptoService_1.CryptoService.decryptMessage(packet.encryptedContent || '', packet.content || '');
                        _a.label = 6;
                    case 6:
                        message = {
                            id: packet.id,
                            from: packet.from,
                            to: packet.to,
                            content: decryptedContent,
                            timestamp: packet.timestamp,
                            type: 'text',
                            encrypted: true,
                            delivered: true,
                            read: false,
                        };
                        // Save to local database
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.saveMessage(message)];
                    case 7:
                        // Save to local database
                        _a.sent();
                        // Send ACK packet
                        return [4 /*yield*/, this.sendACK(packet.to, packet.from, packet.id)];
                    case 8:
                        // Send ACK packet
                        _a.sent();
                        handler = this.messageHandlers.get(packet.from);
                        if (handler) {
                            handler(message);
                        }
                        console.log("\uD83D\uDCAC E2EE Message received: ".concat(packet.id, " from @").concat(packet.from));
                        return [3 /*break*/, 10];
                    case 9:
                        error_4 = _a.sent();
                        console.error('Handle incoming E2EE message failed:', error_4);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send ACK packet (double tick - delivered)
     */
    MessageService.sendACK = function (fromAlias, toAlias, messageId) {
        return __awaiter(this, void 0, void 0, function () {
            var ackPacket, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        ackPacket = {
                            id: "ack-".concat(messageId),
                            from: fromAlias,
                            to: toAlias,
                            timestamp: Date.now(),
                            type: MessageType.ACK,
                        };
                        return [4 /*yield*/, WebRTCService_1.default.sendMessage(toAlias, ackPacket)];
                    case 1:
                        _a.sent();
                        console.log("\u2713 ACK sent for message: ".concat(messageId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Send ACK failed:', error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle incoming ACK packet
     */
    MessageService.handleACK = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            var originalMessageId, handler, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        originalMessageId = packet.id.replace('ack-', '');
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.markMessageDelivered(originalMessageId)];
                    case 1:
                        _a.sent();
                        handler = this.ackHandlers.get(originalMessageId);
                        if (handler) {
                            handler();
                        }
                        console.log("\u2713 ACK received: ".concat(originalMessageId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Handle ACK failed:', error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send READ packet (blue tick - read)
     */
    MessageService.sendREAD = function (fromAlias, toAlias, messageId) {
        return __awaiter(this, void 0, void 0, function () {
            var readPacket, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        readPacket = {
                            id: "read-".concat(messageId),
                            from: fromAlias,
                            to: toAlias,
                            timestamp: Date.now(),
                            type: MessageType.READ,
                        };
                        return [4 /*yield*/, WebRTCService_1.default.sendMessage(toAlias, readPacket)];
                    case 1:
                        _a.sent();
                        console.log("\u2713 READ sent for message: ".concat(messageId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error('Send READ failed:', error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle incoming READ packet
     */
    MessageService.handleREAD = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            var originalMessageId, handler, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        originalMessageId = packet.id.replace('read-', '');
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.markMessageRead(originalMessageId)];
                    case 1:
                        _a.sent();
                        handler = this.readHandlers.get(originalMessageId);
                        if (handler) {
                            handler();
                        }
                        console.log("\u2713 READ received: ".concat(originalMessageId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        console.error('Handle READ failed:', error_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Flush pending messages when peer comes online
     */
    MessageService.flushPendingMessages = function (peerAlias) {
        return __awaiter(this, void 0, void 0, function () {
            var pending, peerMessages, _i, peerMessages_1, msg, error_9, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.getPendingMessages()];
                    case 1:
                        pending = _a.sent();
                        peerMessages = pending.filter(function (msg) { return msg.to === peerAlias; });
                        _i = 0, peerMessages_1 = peerMessages;
                        _a.label = 2;
                    case 2:
                        if (!(_i < peerMessages_1.length)) return [3 /*break*/, 8];
                        msg = peerMessages_1[_i];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, WebRTCService_1.default.sendMessage(peerAlias, {
                                id: msg.id,
                                from: 'self', // Will be set by sender
                                to: peerAlias,
                                content: msg.content,
                                encryptedContent: msg.encryptedContent,
                                timestamp: msg.createdAt,
                                type: MessageType.TEXT,
                            })];
                    case 4:
                        _a.sent();
                        // Remove from pending queue
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.removePendingMessage(msg.id)];
                    case 5:
                        // Remove from pending queue
                        _a.sent();
                        console.log("\u2713 Pending message sent: ".concat(msg.id));
                        return [3 /*break*/, 7];
                    case 6:
                        error_9 = _a.sent();
                        console.error("Failed to send pending message ".concat(msg.id, ":"), error_9);
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_10 = _a.sent();
                        console.error('Flush pending messages failed:', error_10);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * End encryption session with a peer
     */
    MessageService.endEncryptionSession = function (peerAlias) {
        if (this.encryptionSessions.has(peerAlias)) {
            E2EEncryptionService_1.default.endSession(peerAlias);
            this.encryptionSessions.delete(peerAlias);
            console.log("\uD83D\uDD10 E2EE session ended with @".concat(peerAlias));
        }
    };
    /**
     * Register a handler for incoming messages from a peer
     */
    MessageService.onMessage = function (peerAlias, handler) {
        var _this = this;
        this.messageHandlers.set(peerAlias, handler);
        // Return cleanup function
        return function () {
            _this.messageHandlers.delete(peerAlias);
        };
    };
    /**
     * Register a handler for message ACK
     */
    MessageService.onACK = function (messageId, handler) {
        var _this = this;
        this.ackHandlers.set(messageId, handler);
        return function () {
            _this.ackHandlers.delete(messageId);
        };
    };
    /**
     * Register a handler for message READ
     */
    MessageService.onREAD = function (messageId, handler) {
        var _this = this;
        this.readHandlers.set(messageId, handler);
        return function () {
            _this.readHandlers.delete(messageId);
        };
    };
    /**
     * Get chat history with a peer
     */
    MessageService.getChatHistory = function (userAlias_1, peerAlias_1) {
        return __awaiter(this, arguments, void 0, function (userAlias, peerAlias, limit) {
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                return [2 /*return*/, SQLiteService_1.SQLiteService.getMessageHistory(userAlias, peerAlias, limit)];
            });
        });
    };
    MessageService.messageHandlers = new Map();
    MessageService.ackHandlers = new Map();
    MessageService.readHandlers = new Map();
    MessageService.encryptionSessions = new Set(); // Tracks which peers have encryption initialized
    return MessageService;
}());
exports.MessageService = MessageService;
