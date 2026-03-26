"use strict";
/**
 * Project Aegis - Android Foreground Service Module
 * Handles persistent background service for P2P listening on Android
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AndroidForegroundService = void 0;
var react_native_1 = require("react-native");
var LINKING_ERROR = "The package 'aegis-foreground-service' doesn't seem to be linked. Make sure: " +
    '* You rebuilt the app after installing the package\n' +
    '* You are not using Expo managed workflow\n';
var ForegroundServiceModule = react_native_1.NativeModules.AegisForegroundService
    ? react_native_1.NativeModules.AegisForegroundService
    : new Proxy({}, {
        get: function () {
            throw new Error(LINKING_ERROR);
        },
    });
var AndroidForegroundService = /** @class */ (function () {
    function AndroidForegroundService() {
    }
    /**
     * Start the foreground service
     */
    AndroidForegroundService.startForegroundService = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (react_native_1.Platform.OS !== 'android') {
                            console.warn('Foreground service only available on Android');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ForegroundServiceModule.startForegroundService({
                                channelId: config.channelId || 'aegis_p2p_channel',
                                channelName: config.channelName || 'AegisChat P2P',
                                notificationId: config.notificationId || 1,
                                title: config.title || 'AegisChat',
                                message: config.message || 'Listening for messages...',
                                priority: config.priority || 1,
                                icon: config.icon,
                            })];
                    case 2:
                        _a.sent();
                        console.log('✅ Foreground service started');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Failed to start foreground service:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop the foreground service
     */
    AndroidForegroundService.stopForegroundService = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (react_native_1.Platform.OS !== 'android')
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ForegroundServiceModule.stopForegroundService()];
                    case 2:
                        _a.sent();
                        console.log('✅ Foreground service stopped');
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Failed to stop foreground service:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update the foreground service notification
     */
    AndroidForegroundService.updateNotification = function (title, message) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (react_native_1.Platform.OS !== 'android')
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ForegroundServiceModule.updateNotification(title, message)];
                    case 2:
                        _a.sent();
                        console.log('✅ Notification updated');
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Failed to update notification:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if service is running
     */
    AndroidForegroundService.isServiceRunning = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (react_native_1.Platform.OS !== 'android')
                            return [2 /*return*/, false];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ForegroundServiceModule.isServiceRunning()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Failed to check service status:', error_4);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AndroidForegroundService;
}());
exports.AndroidForegroundService = AndroidForegroundService;
exports.default = AndroidForegroundService;
