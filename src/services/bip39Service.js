"use strict";
/**
 * BIP-39 Seed Phrase Service
 * Generates, validates, and derives ED25519 keys from BIP-39 mnemonics
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mnemonicToKeyPair = exports.deriveKeyFromSeed = exports.mnemonicToSeed = exports.validateSeedPhrase = exports.generateSeedPhrase = void 0;
var bip39 = __importStar(require("bip39"));
var crypto_1 = __importDefault(require("crypto"));
/**
 * Generate a new 12-word BIP-39 mnemonic
 */
var generateSeedPhrase = function () {
    var mnemonic = bip39.generateMnemonic();
    var seed = bip39.mnemonicToSeedSync(mnemonic);
    return {
        mnemonic: mnemonic,
        seed: seed,
        isValid: bip39.validateMnemonic(mnemonic),
    };
};
exports.generateSeedPhrase = generateSeedPhrase;
/**
 * Validate a 12-word BIP-39 mnemonic
 */
var validateSeedPhrase = function (mnemonic) {
    return bip39.validateMnemonic(mnemonic);
};
exports.validateSeedPhrase = validateSeedPhrase;
/**
 * Convert mnemonic to seed
 */
var mnemonicToSeed = function (mnemonic) {
    if (!(0, exports.validateSeedPhrase)(mnemonic)) {
        throw new Error('Invalid BIP-39 mnemonic');
    }
    return bip39.mnemonicToSeedSync(mnemonic);
};
exports.mnemonicToSeed = mnemonicToSeed;
/**
 * Derive ED25519 keypair from BIP-39 seed
 * Uses the first derivation path: m/44'/0'/0'/0/0
 */
var deriveKeyFromSeed = function (seed) {
    // For this MVP, we'll use a simple HMAC-SHA512 approach
    // In production, use proper BIP-32/BIP-44 derivation
    var hmac = crypto_1.default.createHmac('sha512', 'BIP32 seed');
    hmac.update(seed);
    var digest = hmac.digest();
    var privateKeyBytes = digest.slice(0, 32);
    var secretKey = new Uint8Array(privateKeyBytes);
    // Convert to hex strings for Gun/SEA compatibility
    var privateKey = privateKeyBytes.toString('hex');
    var publicKey = derivePublicKeyFromPrivate(privateKey);
    return {
        publicKey: publicKey,
        privateKey: privateKey,
        secretKey: secretKey,
    };
};
exports.deriveKeyFromSeed = deriveKeyFromSeed;
/**
 * Derive public key from private key (placeholder - SEA will handle actual derivation)
 */
var derivePublicKeyFromPrivate = function (privateKey) {
    // This will be handled by Gun's SEA library
    // For now, return a derived representation
    var hash = crypto_1.default.createHash('sha256');
    hash.update(privateKey);
    return hash.digest('hex');
};
/**
 * Complete flow: mnemonic -> seed -> keypair
 */
var mnemonicToKeyPair = function (mnemonic) {
    var seed = (0, exports.mnemonicToSeed)(mnemonic);
    return (0, exports.deriveKeyFromSeed)(seed);
};
exports.mnemonicToKeyPair = mnemonicToKeyPair;
