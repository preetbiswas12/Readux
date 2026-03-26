"use strict";
/**
 * Project Aegis - Biometric Authentication Service
 * Handles fingerprint/face ID authentication on Android & iOS
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
exports.BiometricAuthService = void 0;
var LocalAuthentication = __importStar(require("expo-local-authentication"));
var SecureStore = __importStar(require("expo-secure-store"));
var BiometricAuthService = /** @class */ (function () {
    function BiometricAuthService() {
    }
    /**
     * Initialize and check biometric availability
     */
    BiometricAuthService.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var compatible, types, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, LocalAuthentication.hasHardwareAsync()];
                    case 1:
                        compatible = _a.sent();
                        this.isAvailable = compatible;
                        if (!compatible) return [3 /*break*/, 3];
                        return [4 /*yield*/, LocalAuthentication.supportedAuthenticationTypesAsync()];
                    case 2:
                        types = _a.sent();
                        console.log("\u2713 Biometric authentication available: ".concat(types.join(', ')));
                        return [3 /*break*/, 4];
                    case 3:
                        console.warn('⚠️ Device does not support biometric authentication');
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error('Failed to initialize biometric service:', error_1);
                        this.isAvailable = false;
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if biometric authentication is available on this device
     */
    BiometricAuthService.isBiometricAvailable = function () {
        return this.isAvailable;
    };
    /**
     * Get the type of biometric authentication available
     * Possible values: FACIAL_RECOGNITION, IRIS_RECOGNITION, FINGERPRINT
     */
    BiometricAuthService.getAvailableBiometrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, LocalAuthentication.supportedAuthenticationTypesAsync()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Failed to get biometric types:', error_2);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Authenticate user with biometric (fingerprint/face ID)
     */
    BiometricAuthService.authenticate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isAvailable) {
                            return [2 /*return*/, { success: false, error: 'Biometric authentication not available' }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, LocalAuthentication.authenticateAsync({
                                fallbackLabel: 'Use PIN',
                                disableDeviceFallback: false,
                                requireConfirmation: true,
                            })];
                    case 2:
                        result = _a.sent();
                        if (result.success) {
                            console.log('✅ Biometric authentication successful');
                            return [2 /*return*/, { success: true }];
                        }
                        else {
                            console.warn('❌ Biometric authentication failed or cancelled');
                            return [2 /*return*/, { success: false, error: 'Authentication cancelled' }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Biometric authentication error:', error_3);
                        return [2 /*return*/, { success: false, error: error_3.message }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Require biometric for app unlock
     * Stores preference in secure storage
     */
    BiometricAuthService.enableBiometricUnlock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isAvailable) {
                            throw new Error('Biometric authentication not available on this device');
                        }
                        return [4 /*yield*/, this.authenticate()];
                    case 1:
                        result = _a.sent();
                        if (!result.success) {
                            throw new Error('Biometric authentication failed');
                        }
                        // Store preference
                        return [4 /*yield*/, SecureStore.setItemAsync(this.BIOMETRIC_ENABLED_KEY, 'true')];
                    case 2:
                        // Store preference
                        _a.sent();
                        console.log('✓ Biometric unlock enabled');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Disable biometric unlock
     */
    BiometricAuthService.disableBiometricUnlock = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, SecureStore.setItemAsync(this.BIOMETRIC_ENABLED_KEY, 'false')];
                    case 1:
                        _a.sent();
                        console.log('✓ Biometric unlock disabled');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if biometric unlock is enabled
     */
    BiometricAuthService.isBiometricUnlockEnabled = function () {
        return __awaiter(this, void 0, void 0, function () {
            var value, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, SecureStore.getItemAsync(this.BIOMETRIC_ENABLED_KEY)];
                    case 1:
                        value = _b.sent();
                        return [2 /*return*/, value === 'true'];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Authenticate for critical operation (higher security)
     * This might use a stricter timeout or require confirmation
     */
    BiometricAuthService.authenticateCritical = function () {
        return __awaiter(this, arguments, void 0, function (reason) {
            var result, error_4;
            if (reason === void 0) { reason = 'Confirm this critical action'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isAvailable) {
                            console.warn('Biometric not available, skipping critical auth');
                            return [2 /*return*/, true]; // Allow if device doesn't support biometric
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, LocalAuthentication.authenticateAsync({
                                fallbackLabel: 'Use PIN',
                                disableDeviceFallback: false,
                                requireConfirmation: true,
                            })];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result.success];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Critical authentication error:', error_4);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BiometricAuthService.isAvailable = false;
    BiometricAuthService.BIOMETRIC_ENABLED_KEY = 'biometric_unlock_enabled';
    return BiometricAuthService;
}());
exports.BiometricAuthService = BiometricAuthService;
exports.default = BiometricAuthService;
