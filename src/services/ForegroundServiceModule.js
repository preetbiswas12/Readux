"use strict";
/**
 * Android Native Module Interface
 *
 * For Phase 4 native implementation (requires Expo Development Build or bare React Native)
 * This file documents what needs to be implemented in Kotlin/Java
 *
 * IMPLEMENTATION STEPS:
 * 1. Use `eas build --platform android --profile preview` to create native development build
 * 2. Add ForegroundServiceModule.kt to android/app/src/main/java/com/aegischat/
 * 3. Register module in android/app/src/main/java/com/aegischat/MainApplication.java
 * 4. Update AndroidManifest.xml with required permissions and service declaration
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
exports.ForegroundServiceModule = void 0;
/**
 * Production Implementation with Fallback
 * Attempts to load native module, falls back to polling if unavailable
 */
var NativeModule = null;
// Try to load native module (available after EAS build)
// Use dynamic import to avoid require() issues
Promise.resolve().then(function () { return __importStar(require('react-native')); }).then(function (rnModule) {
    if (rnModule && rnModule.NativeModules) {
        NativeModule = rnModule.NativeModules.ForegroundServiceModule;
    }
})
    .catch(function () {
    console.warn('[ForegroundService] React Native module not available');
});
// Also log on startup
console.warn('[ForegroundService] Native module not available initially. To enable:');
console.warn('  1. Run: eas build --platform android --profile development');
console.warn('  2. Install the resulting APK on an Android device');
exports.ForegroundServiceModule = {
    startService: function (config) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(NativeModule && NativeModule.startService)) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log("[ForegroundService] \uD83D\uDCF2 Starting native service for @".concat(config.userAlias, "..."));
                    return [4 /*yield*/, NativeModule.startService(config)];
                case 2:
                    _a.sent();
                    console.log('[ForegroundService] ✅ Service started (will persist when app backgrounded)');
                    return [2 /*return*/];
                case 3:
                    error_1 = _a.sent();
                    console.error('[ForegroundService] Native error:', error_1);
                    return [3 /*break*/, 4];
                case 4:
                    // Fallback log for development
                    console.log('[ForegroundService] 📲 Would start native foreground service:');
                    console.log("                    Title: \"".concat(config.title, "\""));
                    console.log("                    Message: \"".concat(config.message, "\""));
                    console.log("                    User: @".concat(config.userAlias));
                    console.log('[ForegroundService] ℹ️  For production: Build with EAS development build');
                    return [2 /*return*/];
            }
        });
    }); },
    stopService: function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(NativeModule && NativeModule.stopService)) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log('[ForegroundService] 📲 Stopping native foreground service...');
                    return [4 /*yield*/, NativeModule.stopService()];
                case 2:
                    _a.sent();
                    console.log('[ForegroundService] ✅ Service stopped');
                    return [2 /*return*/];
                case 3:
                    error_2 = _a.sent();
                    console.error('[ForegroundService] Native error:', error_2);
                    return [3 /*break*/, 4];
                case 4:
                    console.log('[ForegroundService] Foreground service stopped (or was not running)');
                    return [2 /*return*/];
            }
        });
    }); },
    updateNotification: function (message) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(NativeModule && NativeModule.updateNotification)) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, NativeModule.updateNotification(message)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
                case 3:
                    error_3 = _a.sent();
                    console.warn('[ForegroundService] Error updating notification:', error_3);
                    return [3 /*break*/, 4];
                case 4:
                    console.log("[ForegroundService] \uD83D\uDCE2 Notification: ".concat(message));
                    return [2 /*return*/];
            }
        });
    }); },
    isRunning: function () { return __awaiter(void 0, void 0, void 0, function () {
        var running, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(NativeModule && NativeModule.isRunning)) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, NativeModule.isRunning()];
                case 2:
                    running = _a.sent();
                    return [2 /*return*/, running];
                case 3:
                    error_4 = _a.sent();
                    console.warn('[ForegroundService] Error checking status:', error_4);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/, false];
            }
        });
    }); },
};
