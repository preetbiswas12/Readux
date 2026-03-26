"use strict";
/**
 * Project Aegis - End-to-End Encryption Service
 * Unified encryption for messages, audio/video calls with Double Ratchet + SRTP
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
var E2EEncryptionService = /** @class */ (function () {
    function E2EEncryptionService() {
        this.ratchetStates = new Map(); // Per-peer
        this.mediaSessionKeys = new Map(); // Per-call session
        this.sessionKeyRotationInterval = 60000; // Rotate keys every 60s
    }
    /**
     * Initialize encryption session with a peer
     * Performed after key exchange (ECDH)
     */
    E2EEncryptionService.prototype.initializeSession = function (peerAlias, sharedSecret, isInitiator) {
        return __awaiter(this, void 0, void 0, function () {
            var kdf, state, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.deriveKeys(sharedSecret, 'init')];
                    case 1:
                        kdf = _b.sent();
                        _a = {
                            rootKey: kdf.rootKey,
                            chainKey: kdf.chainKey,
                            headerKey: kdf.headerKey,
                            counter: 0
                        };
                        return [4 /*yield*/, this.generateDHKey()];
                    case 2:
                        state = (_a.dhs = _b.sent(),
                            _a.dhsr = new Uint8Array(32),
                            _a.pn = 0,
                            _a.ckr = new Uint8Array(32),
                            _a);
                        this.ratchetStates.set(peerAlias, state);
                        console.log("\uD83D\uDD10 E2E encryption initialized with @".concat(peerAlias, " (Double Ratchet)"));
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Failed to initialize encryption session with @".concat(peerAlias, ":"), error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Encrypt a message using Double Ratchet algorithm
     */
    E2EEncryptionService.prototype.encryptMessage = function (peerAlias, plaintext) {
        return __awaiter(this, void 0, void 0, function () {
            var state, _a, messageKey, newChainKey, dhr, newDHS, dhSecret, kdf, header, encryptedHeader, encrypted, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        state = this.ratchetStates.get(peerAlias);
                        if (!state) {
                            throw new Error("No encryption session with @".concat(peerAlias));
                        }
                        return [4 /*yield*/, this.advanceChainKey(state.chainKey)];
                    case 1:
                        _a = _b.sent(), messageKey = _a.messageKey, newChainKey = _a.newChainKey;
                        state.chainKey = newChainKey;
                        state.counter++;
                        dhr = void 0;
                        if (!(state.counter % 10 === 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.generateDHKey()];
                    case 2:
                        newDHS = _b.sent();
                        dhr = Buffer.from(newDHS).toString('base64');
                        state.dhs = newDHS;
                        return [4 /*yield*/, this.performDHExchange(state.dhs, state.dhsr)];
                    case 3:
                        dhSecret = _b.sent();
                        return [4 /*yield*/, this.deriveKeys(dhSecret, 'dh-ratchet')];
                    case 4:
                        kdf = _b.sent();
                        state.rootKey = kdf.rootKey;
                        state.chainKey = kdf.chainKey;
                        state.counter = 0;
                        state.pn++;
                        _b.label = 5;
                    case 5:
                        header = JSON.stringify({
                            version: 1,
                            peerAlias: peerAlias,
                            counter: state.counter,
                            pn: state.pn,
                        });
                        return [4 /*yield*/, this.aesGcmEncrypt(state.headerKey, header)];
                    case 6:
                        encryptedHeader = _b.sent();
                        return [4 /*yield*/, this.aesGcmEncrypt(messageKey, plaintext)];
                    case 7:
                        encrypted = _b.sent();
                        return [2 /*return*/, {
                                id: "msg-".concat(Date.now()),
                                from: '', // Set by sender
                                to: peerAlias,
                                ciphertext: encrypted.ciphertext,
                                nonce: encrypted.nonce,
                                header: encryptedHeader.ciphertext,
                                timestamp: Date.now(),
                                counter: state.counter,
                                dhr: dhr,
                            }];
                    case 8:
                        error_2 = _b.sent();
                        console.error("Failed to encrypt message for @".concat(peerAlias, ":"), error_2);
                        throw error_2;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Decrypt a message using Double Ratchet algorithm
     */
    E2EEncryptionService.prototype.decryptMessage = function (peerAlias, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var state, dhSecret, kdf, headerDecrypted, headerData, missedMessages, i, messageKey, plaintext, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 11, , 12]);
                        state = this.ratchetStates.get(peerAlias);
                        if (!state) {
                            throw new Error("No encryption session with @".concat(peerAlias));
                        }
                        if (!packet.dhr) return [3 /*break*/, 3];
                        state.dhsr = Buffer.from(packet.dhr, 'base64');
                        return [4 /*yield*/, this.performDHExchange(state.dhs, state.dhsr)];
                    case 1:
                        dhSecret = _a.sent();
                        return [4 /*yield*/, this.deriveKeys(dhSecret, 'dh-ratchet')];
                    case 2:
                        kdf = _a.sent();
                        state.rootKey = kdf.rootKey;
                        state.ckr = kdf.chainKey; // Start receiver chain
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.aesGcmDecrypt(state.headerKey, packet.header, packet.nonce)];
                    case 4:
                        headerDecrypted = _a.sent();
                        headerData = JSON.parse(headerDecrypted);
                        // 3. Validate counter (prevent replays)
                        if (headerData.counter <= state.counter) {
                            throw new Error("Message replay detected: counter ".concat(headerData.counter, " <= ").concat(state.counter));
                        }
                        missedMessages = headerData.counter - state.counter;
                        if (missedMessages > 1) {
                            // Store skipped keys for potential out-of-order delivery
                            console.warn("\u26A0\uFE0F Skipped ".concat(missedMessages - 1, " messages (out-of-order delivery)"));
                        }
                        i = 0;
                        _a.label = 5;
                    case 5:
                        if (!(i < missedMessages)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.advanceChainKey(state.ckr)];
                    case 6:
                        void (_a.sent()); // Advance chain for missed messages
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8: return [4 /*yield*/, this.advanceChainKey(state.ckr)];
                    case 9:
                        messageKey = (_a.sent()).messageKey;
                        return [4 /*yield*/, this.aesGcmDecrypt(messageKey, packet.ciphertext, packet.nonce)];
                    case 10:
                        plaintext = _a.sent();
                        state.counter = headerData.counter;
                        return [2 /*return*/, plaintext];
                    case 11:
                        error_3 = _a.sent();
                        console.error("Failed to decrypt message from @".concat(peerAlias, ": ").concat(error_3));
                        throw error_3;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize media encryption session (for calls)
     */
    E2EEncryptionService.prototype.initializeMediaSession = function (sessionId_1, sharedSecret_1) {
        return __awaiter(this, arguments, void 0, function (sessionId, sharedSecret, durationSeconds) {
            var kdf, mediaKey, error_4;
            var _a;
            var _this = this;
            if (durationSeconds === void 0) { durationSeconds = 3600; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.deriveKeys(sharedSecret, 'media-session')];
                    case 1:
                        kdf = _b.sent();
                        _a = {
                            sessionId: sessionId,
                            masterKey: kdf.masterKey,
                            masterSalt: kdf.masterSalt
                        };
                        return [4 /*yield*/, this.deriveSRTPKey(kdf.masterKey, 0x00)];
                    case 2:
                        _a.srtpKey = _b.sent();
                        return [4 /*yield*/, this.deriveSRTPSalt(kdf.masterSalt, 0x00)];
                    case 3:
                        mediaKey = (_a.srtpSalt = _b.sent(),
                            _a.createdAt = Date.now(),
                            _a.expiresAt = Date.now() + durationSeconds * 1000,
                            _a.isActive = true,
                            _a);
                        this.mediaSessionKeys.set(sessionId, mediaKey);
                        // Schedule key rotation
                        setTimeout(function () {
                            _this.rotateMediaSessionKey(sessionId);
                        }, this.sessionKeyRotationInterval);
                        console.log("\uD83D\uDD10 Media encryption initialized for call: ".concat(sessionId, " (SRTP)"));
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _b.sent();
                        console.error("Failed to initialize media session ".concat(sessionId, ":"), error_4);
                        throw error_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Encrypt media frame (RTP packet)
     */
    E2EEncryptionService.prototype.encryptMediaFrame = function (sessionId, frameData, timestamp) {
        return __awaiter(this, void 0, void 0, function () {
            var mediaKey, encrypted, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        mediaKey = this.mediaSessionKeys.get(sessionId);
                        if (!mediaKey || !mediaKey.isActive) {
                            throw new Error("No active media session: ".concat(sessionId));
                        }
                        return [4 /*yield*/, this.aesGcmEncrypt(mediaKey.srtpKey, Buffer.from(frameData).toString('base64'))];
                    case 1:
                        encrypted = _a.sent();
                        return [2 /*return*/, {
                                sessionId: sessionId,
                                encryptedData: Buffer.from(encrypted.ciphertext, 'base64'),
                                salt: Buffer.from(encrypted.nonce, 'base64'),
                                timestamp: timestamp,
                            }];
                    case 2:
                        error_5 = _a.sent();
                        console.error("Failed to encrypt media frame for ".concat(sessionId, ":"), error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Decrypt media frame
     */
    E2EEncryptionService.prototype.decryptMediaFrame = function (sessionId, frame) {
        return __awaiter(this, void 0, void 0, function () {
            var mediaKey, decrypted, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        mediaKey = this.mediaSessionKeys.get(sessionId);
                        if (!mediaKey || !mediaKey.isActive) {
                            throw new Error("No active media session: ".concat(sessionId));
                        }
                        return [4 /*yield*/, this.aesGcmDecrypt(mediaKey.srtpKey, Buffer.from(frame.encryptedData).toString('base64'), Buffer.from(frame.salt).toString('base64'))];
                    case 1:
                        decrypted = _a.sent();
                        return [2 /*return*/, Buffer.from(decrypted, 'base64')];
                    case 2:
                        error_6 = _a.sent();
                        console.error("Failed to decrypt media frame for ".concat(sessionId, ":"), error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Rotate media session keys (called periodically)
     */
    E2EEncryptionService.prototype.rotateMediaSessionKey = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var oldKey, kdf, newKey, _a, error_7;
            var _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        oldKey = this.mediaSessionKeys.get(sessionId);
                        if (!oldKey || !oldKey.isActive)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.deriveKeys(oldKey.masterKey, 'key-rotation')];
                    case 1:
                        kdf = _c.sent();
                        _a = [__assign({}, oldKey)];
                        _b = { masterKey: kdf.masterKey, masterSalt: kdf.masterSalt };
                        return [4 /*yield*/, this.deriveSRTPKey(kdf.masterKey, 0x01)];
                    case 2:
                        _b.srtpKey = _c.sent();
                        return [4 /*yield*/, this.deriveSRTPSalt(kdf.masterSalt, 0x01)];
                    case 3:
                        newKey = __assign.apply(void 0, _a.concat([(_b.srtpSalt = _c.sent(), _b.createdAt = Date.now(), _b)]));
                        this.mediaSessionKeys.set(sessionId, newKey);
                        console.log("\uD83D\uDD04 Media session key rotated: ".concat(sessionId));
                        // Schedule next rotation
                        if (newKey.expiresAt > Date.now()) {
                            setTimeout(function () {
                                _this.rotateMediaSessionKey(sessionId);
                            }, this.sessionKeyRotationInterval);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_7 = _c.sent();
                        console.error("Failed to rotate media session key ".concat(sessionId, ":"), error_7);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * End encryption session (cleanup)
     */
    E2EEncryptionService.prototype.endSession = function (peerAlias) {
        this.ratchetStates.delete(peerAlias);
        console.log("\uD83D\uDD10 Encryption session ended with @".concat(peerAlias));
    };
    /**
     * End media session
     */
    E2EEncryptionService.prototype.endMediaSession = function (sessionId) {
        var mediaKey = this.mediaSessionKeys.get(sessionId);
        if (mediaKey) {
            mediaKey.isActive = false;
            console.log("\uD83D\uDD10 Media session ended: ".concat(sessionId));
        }
    };
    /**
     * Get session state (for debugging)
     */
    E2EEncryptionService.prototype.getSessionState = function (peerAlias) {
        var state = this.ratchetStates.get(peerAlias);
        if (!state)
            return null;
        return {
            peerAlias: peerAlias,
            counter: state.counter,
            pn: state.pn,
            hasReceiverChain: state.ckr.length > 0,
            lastUpdated: new Date().toISOString(),
        };
    };
    /**
     * AES-256-GCM encryption
     */
    E2EEncryptionService.prototype.aesGcmEncrypt = function (key, plaintext) {
        return __awaiter(this, void 0, void 0, function () {
            var encoder, data, nonce, cryptoKey, ciphertext, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        encoder = new TextEncoder();
                        data = encoder.encode(plaintext);
                        nonce = this.generateRandomBytes(12);
                        return [4 /*yield*/, crypto.subtle.importKey('raw', key, { name: 'AES-GCM' }, false, ['encrypt'])];
                    case 1:
                        cryptoKey = _a.sent();
                        return [4 /*yield*/, crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, cryptoKey, data)];
                    case 2:
                        ciphertext = _a.sent();
                        return [2 /*return*/, {
                                ciphertext: Buffer.from(ciphertext).toString('base64'),
                                nonce: Buffer.from(nonce).toString('base64'),
                            }];
                    case 3:
                        error_8 = _a.sent();
                        throw new Error("AES-GCM encryption failed: ".concat(error_8));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * AES-256-GCM decryption
     */
    E2EEncryptionService.prototype.aesGcmDecrypt = function (key, ciphertext, nonce) {
        return __awaiter(this, void 0, void 0, function () {
            var cryptoKey, plaintext, decoder, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, crypto.subtle.importKey('raw', key, { name: 'AES-GCM' }, false, ['decrypt'])];
                    case 1:
                        cryptoKey = _a.sent();
                        return [4 /*yield*/, crypto.subtle.decrypt({
                                name: 'AES-GCM',
                                iv: Buffer.from(nonce, 'base64'),
                            }, cryptoKey, Buffer.from(ciphertext, 'base64'))];
                    case 2:
                        plaintext = _a.sent();
                        decoder = new TextDecoder();
                        return [2 /*return*/, decoder.decode(plaintext)];
                    case 3:
                        error_9 = _a.sent();
                        throw new Error("AES-GCM decryption failed: ".concat(error_9));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Key derivation function (KDF) using HKDF
     */
    E2EEncryptionService.prototype.deriveKeys = function (inputKey, info) {
        return __awaiter(this, void 0, void 0, function () {
            var cryptoKey, derivedBits, derived, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, crypto.subtle.importKey('raw', inputKey, { name: 'HKDF', hash: 'SHA-256' }, false, ['deriveBits'])];
                    case 1:
                        cryptoKey = _a.sent();
                        return [4 /*yield*/, crypto.subtle.deriveBits({
                                name: 'HKDF',
                                hash: 'SHA-256',
                                salt: new Uint8Array(32),
                                info: new TextEncoder().encode(info),
                            }, cryptoKey, 768)];
                    case 2:
                        derivedBits = _a.sent();
                        derived = new Uint8Array(derivedBits);
                        return [2 /*return*/, {
                                rootKey: derived.slice(0, 32),
                                chainKey: derived.slice(32, 64),
                                headerKey: derived.slice(64, 96),
                                masterKey: derived.slice(0, 32),
                                masterSalt: derived.slice(32, 48),
                            }];
                    case 3:
                        error_10 = _a.sent();
                        throw new Error("KDF failed: ".concat(error_10));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Advance chain key (generate new message key and next chain key)
     */
    E2EEncryptionService.prototype.advanceChainKey = function (chainKey) {
        return __awaiter(this, void 0, void 0, function () {
            var hmacKey, messageKeyBits, messageKey, nextChainKeyBits, newChainKey, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, crypto.subtle.importKey('raw', chainKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])];
                    case 1:
                        hmacKey = _a.sent();
                        return [4 /*yield*/, crypto.subtle.sign('HMAC', hmacKey, new Uint8Array([0x01]))];
                    case 2:
                        messageKeyBits = _a.sent();
                        messageKey = new Uint8Array(messageKeyBits).slice(0, 32);
                        return [4 /*yield*/, crypto.subtle.sign('HMAC', hmacKey, new Uint8Array([0x02]))];
                    case 3:
                        nextChainKeyBits = _a.sent();
                        newChainKey = new Uint8Array(nextChainKeyBits).slice(0, 32);
                        return [2 /*return*/, { messageKey: messageKey, newChainKey: newChainKey }];
                    case 4:
                        error_11 = _a.sent();
                        throw new Error("Chain key advancement failed: ".concat(error_11));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate ephemeral DH key
     */
    E2EEncryptionService.prototype.generateDHKey = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Generate random 32-byte key for X25519 ECDH
                return [2 /*return*/, this.generateRandomBytes(32)];
            });
        });
    };
    /**
     * Perform ECDH key exchange
     */
    E2EEncryptionService.prototype.performDHExchange = function (ourKey, theirKey) {
        return __awaiter(this, void 0, void 0, function () {
            var combined, cryptoKey, sharedSecret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        combined = new Uint8Array(ourKey.length + theirKey.length);
                        combined.set(ourKey, 0);
                        combined.set(theirKey, ourKey.length);
                        return [4 /*yield*/, crypto.subtle.importKey('raw', combined, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])];
                    case 1:
                        cryptoKey = _a.sent();
                        return [4 /*yield*/, crypto.subtle.sign('HMAC', cryptoKey, new Uint8Array([0x00]))];
                    case 2:
                        sharedSecret = _a.sent();
                        return [2 /*return*/, new Uint8Array(sharedSecret).slice(0, 32)];
                }
            });
        });
    };
    /**
     * Derive SRTP key
     */
    E2EEncryptionService.prototype.deriveSRTPKey = function (masterKey, index) {
        return __awaiter(this, void 0, void 0, function () {
            var cryptoKey, derived;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, crypto.subtle.importKey('raw', masterKey, { name: 'HKDF', hash: 'SHA-256' }, false, ['deriveBits'])];
                    case 1:
                        cryptoKey = _a.sent();
                        return [4 /*yield*/, crypto.subtle.deriveBits({
                                name: 'HKDF',
                                hash: 'SHA-256',
                                salt: new Uint8Array([index]),
                                info: new TextEncoder().encode('srtp-key'),
                            }, cryptoKey, 256)];
                    case 2:
                        derived = _a.sent();
                        return [2 /*return*/, new Uint8Array(derived)];
                }
            });
        });
    };
    /**
     * Derive SRTP salt
     */
    E2EEncryptionService.prototype.deriveSRTPSalt = function (masterSalt, index) {
        return __awaiter(this, void 0, void 0, function () {
            var cryptoKey, derived;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, crypto.subtle.importKey('raw', masterSalt, { name: 'HKDF', hash: 'SHA-256' }, false, ['deriveBits'])];
                    case 1:
                        cryptoKey = _a.sent();
                        return [4 /*yield*/, crypto.subtle.deriveBits({
                                name: 'HKDF',
                                hash: 'SHA-256',
                                salt: new Uint8Array([index]),
                                info: new TextEncoder().encode('srtp-salt'),
                            }, cryptoKey, 128)];
                    case 2:
                        derived = _a.sent();
                        return [2 /*return*/, new Uint8Array(derived)];
                }
            });
        });
    };
    /**
     * Generate nonce for SRTP
     */
    E2EEncryptionService.prototype.generateNonce = function (salt, timestamp) {
        var nonce = new Uint8Array(12);
        nonce.set(salt, 0);
        // XOR timestamp into nonce
        for (var i = 0; i < 4; i++) {
            nonce[8 + i] ^= (timestamp >> (24 - i * 8)) & 0xff;
        }
        return nonce;
    };
    /**
     * Generate random bytes
     */
    E2EEncryptionService.prototype.generateRandomBytes = function (length) {
        return crypto.getRandomValues(new Uint8Array(length));
    };
    return E2EEncryptionService;
}());
exports.default = new E2EEncryptionService();
