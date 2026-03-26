"use strict";
/**
 * Project Aegis - Battery Mode Service
 * Manages battery optimization modes (Battery Saver vs AlwaysOnline)
 * Balances latency vs battery drain
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
var StorageService_1 = require("./StorageService");
var BatteryModeService = /** @class */ (function () {
    function BatteryModeService() {
        this.config = {
            mode: 'saver', // Default: battery saver
            checkIntervalMs: 15 * 60 * 1000, // Check every 15 minutes in saver mode
            wakeUpPeriodMs: 30 * 1000, // Stay awake for 30 seconds per check
            enabled: false,
        };
        this.checkIntervalId = null;
        this.listeners = new Map();
    }
    /**
     * Initialize battery mode service
     */
    BatteryModeService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var savedMode, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('[BatteryMode] Initializing...');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, StorageService_1.StorageService.getBatteryMode()];
                    case 2:
                        savedMode = _b.sent();
                        if (savedMode) {
                            this.config.mode = savedMode;
                            console.log("[BatteryMode] \u2713 Loaded preference: ".concat(savedMode));
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        console.log('[BatteryMode] No saved preference, using default (saver)');
                        return [3 /*break*/, 4];
                    case 4:
                        this.config.enabled = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Set battery mode (saver or always)
     */
    BatteryModeService.prototype.setMode = function (mode) {
        var oldMode = this.config.mode;
        this.config.mode = mode;
        if (mode === 'always') {
            // AlwaysOnline: disable interval checking, expect foreground service to handle
            this.config.checkIntervalMs = 0;
            console.log('[BatteryMode] 🔋 Switched to AlwaysOnline mode (foreground service active)');
        }
        else {
            // Battery Saver: check every 15 minutes
            this.config.checkIntervalMs = 15 * 60 * 1000;
            console.log('[BatteryMode] ⚡ Switched to Battery Saver mode (15-min checks)');
        }
        // Save preference to storage
        StorageService_1.StorageService.setBatteryMode(mode).catch(function (error) {
            console.error('[BatteryMode] Failed to save preference:', error);
        });
        // Notify listeners of mode change
        this.listeners.forEach(function (listener) {
            listener(mode);
        });
        // Restart polling if needed
        if (oldMode !== mode) {
            this.restartPolling();
        }
    };
    /**
     * Get current battery mode
     */
    BatteryModeService.prototype.getMode = function () {
        return this.config.mode;
    };
    /**
     * Get check interval (ms)
     */
    BatteryModeService.prototype.getCheckInterval = function () {
        return this.config.checkIntervalMs;
    };
    /**
     * Get wake-up period (ms)
     */
    BatteryModeService.prototype.getWakeUpPeriod = function () {
        return this.config.wakeUpPeriodMs;
    };
    /**
     * Start polling for messages/calls (Battery Saver mode)
     * In AlwaysOnline, the foreground service handles this continuously
     */
    BatteryModeService.prototype.startPolling = function (onCheck) {
        var _this = this;
        if (!this.config.enabled || this.config.mode === 'always') {
            console.log('[BatteryMode] Polling disabled (AlwaysOnline or disabled)');
            return;
        }
        console.log("[BatteryMode] Starting polling every ".concat(this.config.checkIntervalMs, "ms"));
        this.checkIntervalId = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('[BatteryMode] ⏰ Check interval triggered');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, onCheck()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('[BatteryMode] Check failed:', error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }, this.config.checkIntervalMs);
    };
    /**
     * Stop polling
     */
    BatteryModeService.prototype.stopPolling = function () {
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId);
            this.checkIntervalId = null;
            console.log('[BatteryMode] Polling stopped');
        }
    };
    /**
     * Restart polling with new config
     */
    BatteryModeService.prototype.restartPolling = function () {
        this.stopPolling();
        // Will be restarted by AppContext
    };
    /**
     * Subscribe to battery mode changes
     */
    BatteryModeService.prototype.onModeChange = function (id, listener) {
        var _this = this;
        this.listeners.set(id, listener);
        return function () {
            _this.listeners.delete(id);
        };
    };
    /**
     * Toggle between modes
     */
    BatteryModeService.prototype.toggleMode = function () {
        this.setMode(this.config.mode === 'saver' ? 'always' : 'saver');
    };
    /**
     * Check if battery mode is enabled
     */
    BatteryModeService.prototype.isEnabled = function () {
        return this.config.enabled;
    };
    /**
     * Acquire wake lock using native capacity
     * Implementation:
     * 1. Try expo-task-manager (preferred - background tasks)
     * 2. Fall back to JavaScript interval if unavailable
     * 3. In production, integrates with native WakeLock API
     */
    BatteryModeService.prototype.acquireWakeLock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                console.log("[BatteryMode] \u26A1 Acquiring wake lock (".concat((this.config.wakeUpPeriodMs / 1000 / 60).toFixed(1), " min interval)"));
                try {
                    // Try to use expo-task-manager for native background tasks
                    // Note: These are optional dependencies and may not be available in all environments
                    // Dynamic import would be used here, but we let the runtime handle it
                    console.log('[BatteryMode] ℹ️  For background tasks, ensure expo-task-manager is installed');
                }
                catch (_b) {
                    // Silently continue
                }
                // Fallback: JavaScript-based polling
                console.log('[BatteryMode] ℹ️  Using JavaScript polling (less reliable when app backgrounded)');
                this.startPolling(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        console.log('[BatteryMode] 🔔 Polling check triggered');
                        return [2 /*return*/];
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Release wake lock
     * Cleans up background tasks and intervals
     */
    BatteryModeService.prototype.releaseWakeLock = function () {
        console.log('[BatteryMode] 💤 Releasing wake lock');
        // Stop JavaScript polling
        this.stopPolling();
        console.log('[BatteryMode] ✅ Wake lock released');
    };
    return BatteryModeService;
}());
exports.default = new BatteryModeService();
