"use strict";
/**
 * Project Aegis - Error Logging Service
 * Handles local crash logs, error tracking, and diagnostic logging
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var SQLiteService_1 = require("./SQLiteService");
var ErrorLoggingService = /** @class */ (function () {
    function ErrorLoggingService() {
        this.logs = [];
        this.crashReports = [];
        this.maxLogs = 1000;
        this.debugEnabled = false;
        this.APP_VERSION = '1.0.0-phase4.2';
    }
    /**
     * Initialize error logging service
     */
    ErrorLoggingService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('[ErrorLogging] Initializing error logging service...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Load existing logs from database
                        return [4 /*yield*/, this.loadLogsFromDatabase()];
                    case 2:
                        // Load existing logs from database
                        _a.sent();
                        console.log('[ErrorLogging] ✅ Initialized');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('[ErrorLogging] Failed to initialize:', error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log an error with full context
     */
    ErrorLoggingService.prototype.logError = function (category, message, error, context) {
        var errorLog = {
            id: "error-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)),
            timestamp: Date.now(),
            level: 'error',
            category: category,
            message: message,
            stack: error === null || error === void 0 ? void 0 : error.stack,
            context: context,
        };
        this.addLog(errorLog);
        console.error("[".concat(category, "] ").concat(message), error, context);
    };
    /**
     * Log a warning
     */
    ErrorLoggingService.prototype.logWarning = function (category, message, context) {
        var warningLog = {
            id: "warn-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)),
            timestamp: Date.now(),
            level: 'warning',
            category: category,
            message: message,
            context: context,
        };
        this.addLog(warningLog);
        console.warn("[".concat(category, "] ").concat(message), context);
    };
    /**
     * Log info message (debug level)
     */
    ErrorLoggingService.prototype.logInfo = function (category, message, context) {
        if (!this.debugEnabled)
            return;
        var infoLog = {
            id: "info-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)),
            timestamp: Date.now(),
            level: 'info',
            category: category,
            message: message,
            context: context,
        };
        this.addLog(infoLog);
        console.log("[".concat(category, "] ").concat(message), context);
    };
    /**
     * Record a crash report
     */
    ErrorLoggingService.prototype.logCrash = function (error, context, userAlias) {
        var report = {
            id: "crash-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)),
            timestamp: Date.now(),
            error: error.message,
            stack: error.stack || 'No stack trace',
            context: context || {},
            userAlias: userAlias,
            appVersion: this.APP_VERSION,
            timestamp_formatted: new Date().toISOString(),
        };
        this.crashReports.push(report);
        // Keep only recent crash reports
        if (this.crashReports.length > 50) {
            this.crashReports = this.crashReports.slice(-50);
        }
        // Save to database
        this.saveCrashReport(report).catch(function (err) {
            console.error('[ErrorLogging] Failed to save crash report:', err);
        });
        console.error('[ErrorLogging] 💥 Crash report created:', report.id, error);
        return report;
    };
    /**
     * Add log to in-memory store
     */
    ErrorLoggingService.prototype.addLog = function (log) {
        this.logs.push(log);
        // Prevent unbounded memory growth
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
        // Optionally save to database (async)
        if (log.level === 'error' || log.level === 'warning') {
            this.saveLogToDatabase(log).catch(function (err) {
                console.error('[ErrorLogging] Failed to save log:', err);
            });
        }
    };
    /**
     * Get all logs (optionally filtered)
     */
    ErrorLoggingService.prototype.getLogs = function (category, level) {
        var filtered = this.logs;
        if (category) {
            filtered = filtered.filter(function (log) { return log.category === category; });
        }
        if (level) {
            filtered = filtered.filter(function (log) { return log.level === level; });
        }
        return filtered;
    };
    /**
     * Get all crash reports
     */
    ErrorLoggingService.prototype.getCrashReports = function () {
        return __spreadArray([], this.crashReports, true);
    };
    /**
     * Get recent logs (last N entries)
     */
    ErrorLoggingService.prototype.getRecentLogs = function (count) {
        if (count === void 0) { count = 100; }
        return this.logs.slice(-count);
    };
    /**
     * Clear all logs
     */
    ErrorLoggingService.prototype.clearLogs = function () {
        this.logs = [];
        console.log('[ErrorLogging] All logs cleared');
    };
    /**
     * Clear all crash reports
     */
    ErrorLoggingService.prototype.clearCrashReports = function () {
        this.crashReports = [];
        console.log('[ErrorLogging] All crash reports cleared');
    };
    /**
     * Export logs as JSON
     */
    ErrorLoggingService.prototype.exportLogs = function () {
        return JSON.stringify({
            exported_at: new Date().toISOString(),
            app_version: this.APP_VERSION,
            logs: this.logs,
            crash_reports: this.crashReports,
        }, null, 2);
    };
    /**
     * Export logs for text display
     */
    ErrorLoggingService.prototype.exportLogsAsText = function () {
        var lines = __spreadArray(__spreadArray(__spreadArray([
            "=== AEGIS CHAT ERROR EXPORT ===",
            "Exported: ".concat(new Date().toISOString()),
            "App Version: ".concat(this.APP_VERSION),
            "Total Logs: ".concat(this.logs.length),
            "Crash Reports: ".concat(this.crashReports.length),
            "",
            "--- RECENT LOGS (Last 50) ---"
        ], this.getRecentLogs(50).map(function (log) {
            return "[".concat(new Date(log.timestamp).toISOString(), "] [").concat(log.level.toUpperCase(), "] [").concat(log.category, "] ").concat(log.message);
        }), true), [
            "",
            "--- CRASH REPORTS ---"
        ], false), this.crashReports.map(function (report) {
            return "[".concat(report.timestamp_formatted, "] ").concat(report.error, "\n").concat(report.stack);
        }), true);
        return lines.join('\n');
    };
    /**
     * Enable debug logging
     */
    ErrorLoggingService.prototype.setDebugMode = function (enabled) {
        this.debugEnabled = enabled;
        console.log("[ErrorLogging] Debug mode: ".concat(enabled ? 'ON' : 'OFF'));
    };
    /**
     * Check if debug mode is enabled
     */
    ErrorLoggingService.prototype.isDebugEnabled = function () {
        return this.debugEnabled;
    };
    /**
     * Get diagnostic summary
     */
    ErrorLoggingService.prototype.getDiagnosticSummary = function () {
        var errorCount = this.logs.filter(function (l) { return l.level === 'error'; }).length;
        var warningCount = this.logs.filter(function (l) { return l.level === 'warning'; }).length;
        return {
            app_version: this.APP_VERSION,
            debug_enabled: this.debugEnabled,
            total_logs: this.logs.length,
            error_count: errorCount,
            warning_count: warningCount,
            crash_count: this.crashReports.length,
            logs_by_category: this.getLogsByCategory(),
            timestamp: Date.now(),
        };
    };
    /**
     * Get logs grouped by category
     */
    ErrorLoggingService.prototype.getLogsByCategory = function () {
        var categories = {};
        for (var _i = 0, _a = this.logs; _i < _a.length; _i++) {
            var log = _a[_i];
            categories[log.category] = (categories[log.category] || 0) + 1;
        }
        return categories;
    };
    /**
     * Save log to database (async)
     */
    ErrorLoggingService.prototype.saveLogToDatabase = function (log) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Store in SQLite for persistence
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.saveAppState("error_log_".concat(log.id), JSON.stringify(log))];
                    case 1:
                        // Store in SQLite for persistence
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        // Silently fail - don't cause cascading errors
                        console.error('[ErrorLogging] Failed to persist log:', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save crash report to database
     */
    ErrorLoggingService.prototype.saveCrashReport = function (report) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, SQLiteService_1.SQLiteService.saveAppState("crash_report_".concat(report.id), JSON.stringify(report))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('[ErrorLogging] Failed to persist crash report:', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load logs from database on startup
     */
    ErrorLoggingService.prototype.loadLogsFromDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Load persisted logs (simplified - in production would query properly)
                    console.log('[ErrorLogging] Loading persisted logs...');
                }
                catch (error) {
                    console.error('[ErrorLogging] Failed to load logs:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    return ErrorLoggingService;
}());
exports.default = new ErrorLoggingService();
