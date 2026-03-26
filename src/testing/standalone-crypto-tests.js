#!/usr/bin/env node
"use strict";
/**
 * AEGIS CHAT - STANDALONE CRYPTO TESTS
 *
 * These tests run in Node.js WITHOUT React Native dependencies
 * Tests pure cryptographic functions and algorithms
 *
 * Usage:
 *   npx tsx src/testing/standalone-crypto-tests.ts
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
var crypto_1 = __importDefault(require("crypto"));
var results = [];
// Helper: Run individual test
function runTest(name, testFn) {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, duration, error_1, duration;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    startTime = performance.now();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, testFn()];
                case 2:
                    _a.sent();
                    duration = Math.round(performance.now() - startTime);
                    results.push({ name: name, status: 'pass', duration: duration, message: 'OK' });
                    console.log("  \u2705 ".concat(name));
                    console.log("     Duration: ".concat(duration, "ms"));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    duration = Math.round(performance.now() - startTime);
                    results.push({
                        name: name,
                        status: 'fail',
                        duration: duration,
                        message: String(error_1)
                    });
                    console.log("  \u274C ".concat(name));
                    console.log("     Error: ".concat(error_1));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Helper: HKDF-SHA256 implementation
function hkdf(ikm, salt, info, length) {
    if (salt === void 0) { salt = Buffer.alloc(32); }
    if (info === void 0) { info = Buffer.alloc(0); }
    if (length === void 0) { length = 32; }
    var hash = 'sha256';
    var hashLen = 32;
    // Extract
    var prk = crypto_1.default.createHmac(hash, salt).update(ikm).digest();
    // Expand
    var t = Buffer.alloc(0);
    var okm = Buffer.alloc(0);
    var iterations = Math.ceil(length / hashLen);
    for (var i = 0; i < iterations; i++) {
        var input = Buffer.concat([t, info, Buffer.from([i + 1])]);
        var digest = crypto_1.default.createHmac(hash, prk).update(input).digest();
        t = Buffer.from(digest);
        okm = Buffer.concat([okm, t]);
    }
    return okm.subarray(0, length);
}
// Test Suite
function runTests() {
    return __awaiter(this, void 0, void 0, function () {
        var passed, failed, totalTime;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('');
                    console.log('╔════════════════════════════════════════════════════════════╗');
                    console.log('║        🔐 AEGIS STANDALONE CRYPTO TESTS (Node.js)          ║');
                    console.log('╚════════════════════════════════════════════════════════════╝');
                    console.log('');
                    // Test 1: Random Key Generation
                    console.log('1️⃣  KEY GENERATION TESTS');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    return [4 /*yield*/, runTest('Generate 256-bit random key', function () { return __awaiter(_this, void 0, void 0, function () {
                            var key;
                            return __generator(this, function (_a) {
                                key = crypto_1.default.randomBytes(32);
                                if (key.length !== 32)
                                    throw new Error('Wrong key length');
                                if (!Buffer.isBuffer(key))
                                    throw new Error('Not a buffer');
                                return [2 /*return*/];
                            });
                        }); })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, runTest('Generate 96-bit random nonce', function () { return __awaiter(_this, void 0, void 0, function () {
                            var nonce;
                            return __generator(this, function (_a) {
                                nonce = crypto_1.default.randomBytes(12);
                                if (nonce.length !== 12)
                                    throw new Error('Wrong nonce length');
                                return [2 /*return*/];
                            });
                        }); })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, runTest('Generate 32 different random values', function () { return __awaiter(_this, void 0, void 0, function () {
                            var values, i, val;
                            return __generator(this, function (_a) {
                                values = new Set();
                                for (i = 0; i < 32; i++) {
                                    val = crypto_1.default.randomBytes(16).toString('hex');
                                    values.add(val);
                                }
                                if (values.size !== 32)
                                    throw new Error('Collision detected!');
                                return [2 /*return*/];
                            });
                        }); })];
                case 3:
                    _a.sent();
                    console.log('');
                    // Test 2: HKDF Key Derivation
                    console.log('2️⃣  HKDF-SHA256 KEY DERIVATION');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    return [4 /*yield*/, runTest('Derive 96-byte key material', function () { return __awaiter(_this, void 0, void 0, function () {
                            var secret, derived;
                            return __generator(this, function (_a) {
                                secret = crypto_1.default.randomBytes(32);
                                derived = hkdf(secret, Buffer.alloc(32), Buffer.from('test'), 96);
                                if (derived.length !== 96)
                                    throw new Error('Wrong derived length');
                                return [2 /*return*/];
                            });
                        }); })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, runTest('HKDF deterministic output', function () { return __awaiter(_this, void 0, void 0, function () {
                            var secret, salt, info, out1, out2;
                            return __generator(this, function (_a) {
                                secret = Buffer.from('fixed-secret-123456789012345678');
                                salt = Buffer.from('fixed-salt-1234567890123456789012');
                                info = Buffer.from('test-context');
                                out1 = hkdf(secret, salt, info, 32);
                                out2 = hkdf(secret, salt, info, 32);
                                if (!out1.equals(out2))
                                    throw new Error('Output not deterministic');
                                return [2 /*return*/];
                            });
                        }); })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, runTest('HKDF different contexts produce different keys', function () { return __awaiter(_this, void 0, void 0, function () {
                            var secret, key1, key2;
                            return __generator(this, function (_a) {
                                secret = crypto_1.default.randomBytes(32);
                                key1 = hkdf(secret, Buffer.alloc(32), Buffer.from('ctx1'), 32);
                                key2 = hkdf(secret, Buffer.alloc(32), Buffer.from('ctx2'), 32);
                                if (key1.equals(key2))
                                    throw new Error('Keys should differ with different context');
                                return [2 /*return*/];
                            });
                        }); })];
                case 6:
                    _a.sent();
                    console.log('');
                    // Test 3: AES-256-GCM Encryption
                    console.log('3️⃣  AES-256-GCM ENCRYPTION');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    return [4 /*yield*/, runTest('Encrypt message with AES-256-GCM', function () { return __awaiter(_this, void 0, void 0, function () {
                            var key, iv, plaintext, aad, cipher, encrypted, authTag;
                            return __generator(this, function (_a) {
                                key = crypto_1.default.randomBytes(32);
                                iv = crypto_1.default.randomBytes(12);
                                plaintext = 'Hello, encrypted world!';
                                aad = Buffer.from('additional-data');
                                cipher = crypto_1.default.createCipheriv('aes-256-gcm', key, iv);
                                cipher.setAAD(aad);
                                encrypted = cipher.update(plaintext, 'utf8', 'hex');
                                encrypted += cipher.final('hex');
                                authTag = cipher.getAuthTag();
                                if (authTag.length !== 16)
                                    throw new Error('Invalid auth tag size');
                                if (encrypted.length === 0)
                                    throw new Error('Encryption failed');
                                return [2 /*return*/];
                            });
                        }); })];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, runTest('Decrypt AES-256-GCM ciphertext', function () { return __awaiter(_this, void 0, void 0, function () {
                            var key, iv, plaintext, aad, cipher, ciphertext, authTag, decipher, decrypted;
                            return __generator(this, function (_a) {
                                key = crypto_1.default.randomBytes(32);
                                iv = crypto_1.default.randomBytes(12);
                                plaintext = 'Secret message for decryption test';
                                aad = Buffer.from('additional-data');
                                cipher = crypto_1.default.createCipheriv('aes-256-gcm', key, iv);
                                cipher.setAAD(aad);
                                ciphertext = cipher.update(plaintext, 'utf8', 'hex');
                                ciphertext += cipher.final('hex');
                                authTag = cipher.getAuthTag();
                                decipher = crypto_1.default.createDecipheriv('aes-256-gcm', key, iv);
                                decipher.setAAD(aad);
                                decipher.setAuthTag(authTag);
                                decrypted = decipher.update(ciphertext, 'hex', 'utf8');
                                decrypted += decipher.final('utf8');
                                if (decrypted !== plaintext)
                                    throw new Error('Decryption mismatch');
                                return [2 /*return*/];
                            });
                        }); })];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, runTest('Reject tampered AES-256-GCM ciphertext', function () { return __awaiter(_this, void 0, void 0, function () {
                            var key, iv, plaintext, aad, cipher, ciphertext, authTag, tamperedCiphertext, decipher;
                            return __generator(this, function (_a) {
                                key = crypto_1.default.randomBytes(32);
                                iv = crypto_1.default.randomBytes(12);
                                plaintext = 'Important encrypted data';
                                aad = Buffer.from('additional-data');
                                cipher = crypto_1.default.createCipheriv('aes-256-gcm', key, iv);
                                cipher.setAAD(aad);
                                ciphertext = cipher.update(plaintext, 'utf8', 'hex');
                                ciphertext += cipher.final('hex');
                                authTag = cipher.getAuthTag();
                                tamperedCiphertext = (parseInt(ciphertext.substring(0, 2), 16) ^ 0xff)
                                    .toString(16)
                                    .padStart(2, '0') + ciphertext.substring(2);
                                decipher = crypto_1.default.createDecipheriv('aes-256-gcm', key, iv);
                                decipher.setAAD(aad);
                                decipher.setAuthTag(authTag);
                                try {
                                    decipher.update(tamperedCiphertext, 'hex', 'utf8');
                                    decipher.final('utf8');
                                    throw new Error('Should have rejected tampered data');
                                }
                                catch (e) {
                                    if (e.message === 'Should have rejected tampered data') {
                                        throw e;
                                    }
                                    // Correctly rejected
                                }
                                return [2 /*return*/];
                            });
                        }); })];
                case 9:
                    _a.sent();
                    console.log('');
                    // Test 4: HMAC-SHA256
                    console.log('4️⃣  HMAC-SHA256 AUTHENTICATION');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    return [4 /*yield*/, runTest('Generate HMAC-SHA256 tag', function () { return __awaiter(_this, void 0, void 0, function () {
                            var key, message, tag;
                            return __generator(this, function (_a) {
                                key = crypto_1.default.randomBytes(32);
                                message = Buffer.from('message-to-authenticate');
                                tag = crypto_1.default.createHmac('sha256', key).update(message).digest();
                                if (tag.length !== 32)
                                    throw new Error('Wrong tag length');
                                return [2 /*return*/];
                            });
                        }); })];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, runTest('HMAC deterministic for same input', function () { return __awaiter(_this, void 0, void 0, function () {
                            var key, message, tag1, tag2;
                            return __generator(this, function (_a) {
                                key = Buffer.from('fixed-key-123456789012345678901234');
                                message = Buffer.from('fixed-message');
                                tag1 = crypto_1.default.createHmac('sha256', key).update(message).digest();
                                tag2 = crypto_1.default.createHmac('sha256', key).update(message).digest();
                                if (!tag1.equals(tag2))
                                    throw new Error('HMAC not deterministic');
                                return [2 /*return*/];
                            });
                        }); })];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, runTest('Different messages produce different HMACs', function () { return __awaiter(_this, void 0, void 0, function () {
                            var key, tag1, tag2;
                            return __generator(this, function (_a) {
                                key = crypto_1.default.randomBytes(32);
                                tag1 = crypto_1.default.createHmac('sha256', key).update('msg1').digest();
                                tag2 = crypto_1.default.createHmac('sha256', key).update('msg2').digest();
                                if (tag1.equals(tag2))
                                    throw new Error('Should produce different tags');
                                return [2 /*return*/];
                            });
                        }); })];
                case 12:
                    _a.sent();
                    console.log('');
                    // Test 5: ECDH Key Agreement (Curve25519)
                    console.log('5️⃣  ELLIPTIC CURVE KEY EXCHANGE');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    return [4 /*yield*/, runTest('Generate Ed25519 keypair', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, publicKey, privateKey;
                            return __generator(this, function (_b) {
                                _a = crypto_1.default.generateKeyPairSync('ed25519'), publicKey = _a.publicKey, privateKey = _a.privateKey;
                                if (!publicKey || !privateKey)
                                    throw new Error('Failed to generate keypair');
                                return [2 /*return*/];
                            });
                        }); })];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, runTest('Sign and verify with Ed25519', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, publicKey, privateKey, message, signature, verified;
                            return __generator(this, function (_b) {
                                _a = crypto_1.default.generateKeyPairSync('ed25519'), publicKey = _a.publicKey, privateKey = _a.privateKey;
                                message = Buffer.from('message-to-sign');
                                signature = crypto_1.default.sign(null, message, privateKey);
                                verified = crypto_1.default.verify(null, message, publicKey, signature);
                                if (!verified)
                                    throw new Error('Signature verification failed');
                                return [2 /*return*/];
                            });
                        }); })];
                case 14:
                    _a.sent();
                    return [4 /*yield*/, runTest('Reject tampered signature', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, publicKey, privateKey, message, signature, tamperedSig, verified;
                            return __generator(this, function (_b) {
                                _a = crypto_1.default.generateKeyPairSync('ed25519'), publicKey = _a.publicKey, privateKey = _a.privateKey;
                                message = Buffer.from('original-message');
                                signature = crypto_1.default.sign(null, message, privateKey);
                                tamperedSig = Buffer.from(signature);
                                tamperedSig[0] = tamperedSig[0] ^ 0xff;
                                verified = crypto_1.default.verify(null, message, publicKey, tamperedSig);
                                if (verified)
                                    throw new Error('Should have rejected tampered signature');
                                return [2 /*return*/];
                            });
                        }); })];
                case 15:
                    _a.sent();
                    console.log('');
                    passed = results.filter(function (r) { return r.status === 'pass'; }).length;
                    failed = results.filter(function (r) { return r.status === 'fail'; }).length;
                    totalTime = results.reduce(function (sum, r) { return sum + r.duration; }, 0);
                    console.log('╔════════════════════════════════════════════════════════════╗');
                    console.log('║                      TEST SUMMARY                          ║');
                    console.log('╚════════════════════════════════════════════════════════════╝');
                    console.log('');
                    console.log("  Total Tests:  ".concat(results.length));
                    console.log("  \u2705 Passed:     ".concat(passed));
                    console.log("  \u274C Failed:     ".concat(failed));
                    console.log("  \u23F1\uFE0F  Total Time: ".concat(totalTime, "ms"));
                    console.log('');
                    if (failed === 0) {
                        console.log('  ✨ ALL TESTS PASSED ✨');
                    }
                    else {
                        console.log("  \u26A0\uFE0F  ".concat(failed, " test(s) failed"));
                        process.exit(1);
                    }
                    console.log('');
                    return [2 /*return*/];
            }
        });
    });
}
// Run tests
runTests().catch(function (error) {
    console.error('Fatal error:', error);
    process.exit(1);
});
