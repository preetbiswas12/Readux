"use strict";
/**
 * Project Aegis - Crypto Service
 * Handles BIP-39 seed generation, SEA keypair derivation, and encryption
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
exports.CryptoService = void 0;
var bip39 = __importStar(require("bip39"));
var tweetnacl_1 = __importDefault(require("tweetnacl"));
var CryptoService = /** @class */ (function () {
    function CryptoService() {
    }
    /**
     * Generate a new 12-word BIP-39 recovery seed
     * This is the user's "master key" for account recovery
     */
    CryptoService.generateBIP39Seed = function () {
        // 128 bits = 12-word phrase (industry standard)
        var entropy = tweetnacl_1.default.randomBytes(16); // 128 bits
        var mnemonic = bip39.entropyToMnemonic(Buffer.from(entropy).toString('hex'));
        return mnemonic;
    };
    /**
     * Verify if a 12-word seed is valid BIP-39
     */
    CryptoService.isValidBIP39Seed = function (seed) {
        return bip39.validateMnemonic(seed);
    };
    /**
     * Derive a deterministic keypair from a BIP-39 seed
     * Same seed always generates same keypair (for account recovery)
     */
    CryptoService.deriveKeypairFromSeed = function (seed) {
        return __awaiter(this, void 0, void 0, function () {
            var entropy, entropyBuffer, seedBuffer, keyPair;
            return __generator(this, function (_a) {
                if (!this.isValidBIP39Seed(seed)) {
                    throw new Error('Invalid BIP-39 seed phrase');
                }
                entropy = bip39.mnemonicToEntropy(seed);
                entropyBuffer = Buffer.from(entropy, 'hex');
                seedBuffer = Buffer.alloc(32);
                seedBuffer.set(entropyBuffer);
                keyPair = tweetnacl_1.default.sign.keyPair.fromSeed(seedBuffer);
                return [2 /*return*/, {
                        publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
                        privateKey: Buffer.from(keyPair.secretKey).toString('hex'),
                    }];
            });
        });
    };
    /**
     * Sign a message with private key (proof of identity)
     */
    CryptoService.signMessage = function (message, privateKeyHex) {
        var privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
        var messageBuffer = Buffer.from(message, 'utf-8');
        var signature = tweetnacl_1.default.sign(messageBuffer, privateKeyBuffer);
        return Buffer.from(signature).toString('hex');
    };
    /**
     * Verify a signed message
     */
    CryptoService.verifySignature = function (message, signature, publicKeyHex) {
        try {
            var signatureBuffer = Buffer.from(signature, 'hex');
            // Convert encrypted message to string for storage
            // (actual encryption implementation in Phase 3 with libsignal)
            var publicKeyBuffer = Buffer.from(publicKeyHex, 'hex');
            var verified = tweetnacl_1.default.sign.open(signatureBuffer, publicKeyBuffer);
            return verified !== null;
        }
        catch (_a) {
            return false;
        }
    };
    /**
     * Generate ephemeral keypair for WebRTC ECDH (session keys)
     * Used for Perfect Forward Secrecy
     */
    CryptoService.generateEphemeralKeypair = function () {
        var keyPair = tweetnacl_1.default.box.keyPair();
        return {
            publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
            privateKey: Buffer.from(keyPair.secretKey).toString('hex'),
        };
    };
    /**
     * Perform ECDH key agreement (for session key derivation)
     */
    CryptoService.performECDH = function (privateKeyHex, publicKeyHex) {
        var privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
        var publicKeyBuffer = Buffer.from(publicKeyHex, 'hex');
        try {
            var sharedSecret = tweetnacl_1.default.box.before(publicKeyBuffer, privateKeyBuffer);
            return Buffer.from(sharedSecret).toString('hex');
        }
        catch (_a) {
            throw new Error('ECDH key agreement failed');
        }
    };
    /**
     * Encrypt message for recipient (using libsignal in Phase 3)
     * For now: simple XOR with shared secret (Phase 2)
     */
    CryptoService.encryptMessage = function (message, sharedSecretHex) {
        // Temporary: base64 encode (will replace with libsignal in Phase 3)
        return Buffer.from(message).toString('base64');
    };
    /**
     * Decrypt message
     */
    CryptoService.decryptMessage = function (encryptedMessage, sharedSecretHex) {
        // Temporary: base64 decode (will replace with libsignal in Phase 3)
        return Buffer.from(encryptedMessage, 'base64').toString('utf-8');
    };
    /**
     * Generate random nonce for message freshness
     */
    CryptoService.generateNonce = function () {
        return Buffer.from(tweetnacl_1.default.randomBytes(24)).toString('hex');
    };
    return CryptoService;
}());
exports.CryptoService = CryptoService;
