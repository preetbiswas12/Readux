"use strict";
/**
 * Authentication Service
 * Orchestrates signup, login, and session management
 * Handles BIP-39 seed phrase, key derivation, and SEA authentication
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrivateKey = exports.getPublicKey = exports.getCurrentAlias = exports.getCurrentUserId = exports.isAuthenticated = exports.getAuthState = exports.logout = exports.login = exports.signup = void 0;
var bip39Service = __importStar(require("./bip39Service"));
var gundbService_1 = require("./gundbService");
var dbService = __importStar(require("./databaseService"));
var authState = {
    isAuthenticated: false,
    userId: null,
    alias: null,
    publicKey: null,
    privateKey: null,
};
/**
 * Signup: Generate seed phrase, derive keys, publish identity
 */
var signup = function (desiredAlias) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, mnemonic, seed, isValid, _b, publicKey, privateKey, userId, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 5, , 6]);
                // Step 1: Generate BIP-39 seed phrase
                console.log('[Auth] Generating BIP-39 seed phrase...');
                _a = bip39Service.generateSeedPhrase(), mnemonic = _a.mnemonic, seed = _a.seed, isValid = _a.isValid;
                if (!isValid) {
                    throw new Error('Invalid seed phrase generated');
                }
                // Step 2: Derive keypair from seed
                console.log('[Auth] Deriving ED25519 keypair...');
                _b = bip39Service.deriveKeyFromSeed(seed), publicKey = _b.publicKey, privateKey = _b.privateKey;
                userId = publicKey.substring(0, 16);
                // Step 4: Initialize local database
                console.log('[Auth] Initializing local database...');
                return [4 /*yield*/, dbService.initializeDatabase(userId)];
            case 1:
                _c.sent();
                // Step 5: Save identity locally (encrypted)
                console.log('[Auth] Saving identity...');
                return [4 /*yield*/, dbService.saveUserIdentity(userId, desiredAlias, publicKey, privateKey, mnemonic)];
            case 2:
                _c.sent();
                // Step 6: Initialize GunDB
                console.log('[Auth] Connecting to GunDB...');
                return [4 /*yield*/, gundbService_1.GunDBService.initializeGun()];
            case 3:
                _c.sent();
                // Step 7: Publish identity to DHT
                console.log('[Auth] Publishing identity to DHT...');
                return [4 /*yield*/, gundbService_1.GunDBService.publishUserIdentity(desiredAlias, publicKey, privateKey)];
            case 4:
                _c.sent();
                // Step 8: Update local auth state
                authState = {
                    isAuthenticated: true,
                    userId: userId,
                    alias: desiredAlias,
                    publicKey: publicKey,
                    privateKey: privateKey,
                };
                console.log('[Auth] Signup successful for @' + desiredAlias);
                return [2 /*return*/, {
                        success: true,
                        seedPhrase: mnemonic,
                        userId: userId,
                        alias: desiredAlias,
                        publicKey: publicKey,
                        message: 'Account created successfully. Save your recovery phrase!',
                    }];
            case 5:
                error_1 = _c.sent();
                console.error('[Auth] Signup failed:', error_1);
                return [2 /*return*/, {
                        success: false,
                        seedPhrase: '',
                        userId: '',
                        alias: '',
                        publicKey: '',
                        message: "Signup error: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'),
                    }];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.signup = signup;
/**
 * Login: Recover from seed phrase, restore session
 */
var login = function (seedPhrase, alias) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, publicKey, privateKey, userId, storedIdentity, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                // Step 1: Validate seed phrase
                console.log('[Auth] Validating seed phrase...');
                if (!bip39Service.validateSeedPhrase(seedPhrase)) {
                    throw new Error('Invalid seed phrase');
                }
                // Step 2: Derive keypair from seed
                console.log('[Auth] Deriving keypair from seed...');
                _a = bip39Service.mnemonicToKeyPair(seedPhrase), publicKey = _a.publicKey, privateKey = _a.privateKey;
                userId = publicKey.substring(0, 16);
                // Step 4: Initialize database
                console.log('[Auth] Loading local database...');
                return [4 /*yield*/, dbService.initializeDatabase(userId)];
            case 1:
                _b.sent();
                return [4 /*yield*/, dbService.getUserIdentity()];
            case 2:
                storedIdentity = _b.sent();
                if (storedIdentity && storedIdentity.alias !== alias) {
                    throw new Error('Seed phrase does not match stored account');
                }
                // Step 6: Initialize GunDB and verify online presence
                console.log('[Auth] Reconnecting to GunDB...');
                return [4 /*yield*/, gundbService_1.GunDBService.initializeGun()];
            case 3:
                _b.sent();
                // Step 7: Update presence to online
                console.log('[Auth] Setting online status...');
                return [4 /*yield*/, gundbService_1.GunDBService.updatePresence(alias, true)];
            case 4:
                _b.sent();
                // Step 8: Update auth state
                authState = {
                    isAuthenticated: true,
                    userId: userId,
                    alias: alias,
                    publicKey: publicKey,
                    privateKey: privateKey,
                };
                console.log('[Auth] Login successful for @' + alias);
                return [2 /*return*/, {
                        success: true,
                        userId: userId,
                        alias: alias,
                        publicKey: publicKey,
                        message: 'Welcome back!',
                    }];
            case 5:
                error_2 = _b.sent();
                console.error('[Auth] Login failed:', error_2);
                return [2 /*return*/, {
                        success: false,
                        userId: '',
                        alias: '',
                        publicKey: '',
                        message: "Login error: ".concat(error_2 instanceof Error ? error_2.message : 'Unknown error'),
                    }];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.login = login;
/**
 * Logout: Disconnect GunDB, update presence, clear session
 */
var logout = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                if (!authState.alias) return [3 /*break*/, 2];
                console.log('[Auth] Setting offline status...');
                return [4 /*yield*/, gundbService_1.GunDBService.updatePresence(authState.alias, false)];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2:
                console.log('[Auth] Disconnecting GunDB...');
                gundbService_1.GunDBService.disconnectGun();
                console.log('[Auth] Closing database...');
                return [4 /*yield*/, dbService.closeDatabase()];
            case 3:
                _a.sent();
                authState = {
                    isAuthenticated: false,
                    userId: null,
                    alias: null,
                    publicKey: null,
                    privateKey: null,
                };
                console.log('[Auth] Logout successful');
                return [3 /*break*/, 5];
            case 4:
                error_3 = _a.sent();
                console.error('[Auth] Logout error:', error_3);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.logout = logout;
/**
 * Get current auth state
 */
var getAuthState = function () {
    return __assign({}, authState);
};
exports.getAuthState = getAuthState;
/**
 * Check if user is authenticated
 */
var isAuthenticated = function () {
    return authState.isAuthenticated;
};
exports.isAuthenticated = isAuthenticated;
/**
 * Get current user ID
 */
var getCurrentUserId = function () {
    return authState.userId;
};
exports.getCurrentUserId = getCurrentUserId;
/**
 * Get current user alias
 */
var getCurrentAlias = function () {
    return authState.alias;
};
exports.getCurrentAlias = getCurrentAlias;
/**
 * Get current public key
 */
var getPublicKey = function () {
    return authState.publicKey;
};
exports.getPublicKey = getPublicKey;
/**
 * Get current private key (for signing)
 */
var getPrivateKey = function () {
    return authState.privateKey;
};
exports.getPrivateKey = getPrivateKey;
