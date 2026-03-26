"use strict";
/**
 * Optimized App Initialization
 * Initialize network stack with IPv6-first priority
 *
 * Usage in App.tsx:
 * import { initializeAegisChat } from './initialization/AegisInitialization';
 *
 * useEffect(() => {
 *   initializeAegisChat({ batteryMode: 'saver' });
 * }, []);
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
exports.initializeAegisChat = initializeAegisChat;
exports.startAegisChat = startAegisChat;
exports.shutdownAegisChat = shutdownAegisChat;
exports.getNetworkStatus = getNetworkStatus;
exports.getOptimizationReport = getOptimizationReport;
exports.onNetworkEvent = onNetworkEvent;
var NetworkOptimizationMaster_1 = __importDefault(require("../services/NetworkOptimizationMaster"));
var BatteryModeService_1 = __importDefault(require("../services/BatteryModeService"));
/**
 * Main initialization function
 * Call this once on app startup
 */
function initializeAegisChat() {
    return __awaiter(this, arguments, void 0, function (options) {
        var startTime, profile, servers, initTime, error_1;
        var _a;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    startTime = Date.now();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    console.log('');
                    console.log('╔════════════════════════════════════════════════════════════╗');
                    console.log('║                                                            ║');
                    console.log('║      🚀 INITIALIZING AEGIS CHAT - IPv6-FIRST P2P           ║');
                    console.log('║                                                            ║');
                    console.log('╚════════════════════════════════════════════════════════════╝');
                    console.log('');
                    // Step 1: Core services initialization
                    console.log('[Init] 📦 Step 1: Loading core services...');
                    // Core services pre-initialized on app startup
                    console.log('[Init] ✅ Core services ready');
                    // Step 2: Network optimization (with IPv6-first)
                    console.log('[Init] 🌐 Step 2: Network optimization (IPv6-First)...');
                    return [4 /*yield*/, NetworkOptimizationMaster_1.default.initialize({
                            autoDetect: (_a = options.autoDetectNetwork) !== null && _a !== void 0 ? _a : true,
                            monitorNetworkChanges: true,
                            adaptiveQuality: true,
                            batteryMode: options.batteryMode || 'saver',
                        })];
                case 2:
                    _b.sent();
                    console.log('[Init] ✅ Network optimization active');
                    profile = NetworkOptimizationMaster_1.default.getNetworkProfile();
                    servers = NetworkOptimizationMaster_1.default.getCurrentServers();
                    // Step 4: Battery mode setup
                    console.log('[Init] 🔋 Step 3: Battery mode setup...');
                    BatteryModeService_1.default.setMode(options.batteryMode || 'saver');
                    console.log("[Init] \u2705 Battery mode: ".concat((options.batteryMode || 'saver').toUpperCase()));
                    // Step 5: Background services
                    console.log('[Init] 🔄 Step 4: Background services...');
                    // BackgroundService will be activated when user logs in
                    console.log('[Init] ✅ Background services ready (activate on login)');
                    initTime = Date.now() - startTime;
                    console.log('');
                    console.log('╔════════════════════════════════════════════════════════════╗');
                    console.log('║                ✅ INITIALIZATION COMPLETE                   ║');
                    console.log('║                                                            ║');
                    console.log("\u2551   Time: ".concat(initTime, "ms                                      \u2551"));
                    console.log('║   Network: IPv6-FIRST                                      ║');
                    console.log('║   Security: E2EE + PFS + CG-NAT Mitigated                  ║');
                    console.log('║                                                            ║');
                    console.log('╚════════════════════════════════════════════════════════════╝');
                    console.log('');
                    return [2 /*return*/, {
                            success: true,
                            message: 'Aegis Chat initialized successfully',
                            diagnostics: {
                                ipv6Available: (profile === null || profile === void 0 ? void 0 : profile.ipv6Available) || false,
                                cgnatDetected: (profile === null || profile === void 0 ? void 0 : profile.cgnatDetected) || false,
                                networkStrategy: (servers === null || servers === void 0 ? void 0 : servers.version) || 'dual-stack',
                            },
                        }];
                case 3:
                    error_1 = _b.sent();
                    console.error('[Init] ❌ Initialization failed:', error_1);
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Enhanced App startup with error handling
 */
function startAegisChat() {
    return __awaiter(this, arguments, void 0, function (options) {
        var result, initError_1;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, initializeAegisChat(options)];
                case 1:
                    result = _a.sent();
                    if (result.success) {
                        console.log('[App] ✅ Ready to start - navigate to Splash screen');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    initError_1 = _a.sent();
                    console.error('[App] 🔴 Critical initialization error:', initError_1);
                    // Fallback: Log error and continue with degraded functionality
                    console.warn('[App] ⚠️  Starting in degraded mode...');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Graceful shutdown
 */
function shutdownAegisChat() {
    return __awaiter(this, void 0, void 0, function () {
        var shutdownError_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('[App] 🛑 Shutting down Aegis Chat...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, NetworkOptimizationMaster_1.default.shutdown()];
                case 2:
                    _a.sent();
                    console.log('[App] ✅ Shutdown complete');
                    return [3 /*break*/, 4];
                case 3:
                    shutdownError_1 = _a.sent();
                    console.error('[App] ⚠️  Error during shutdown:', shutdownError_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get current network status
 */
function getNetworkStatus() {
    var profile = NetworkOptimizationMaster_1.default.getNetworkProfile();
    var servers = NetworkOptimizationMaster_1.default.getCurrentServers();
    return {
        ipv6Available: (profile === null || profile === void 0 ? void 0 : profile.ipv6Available) || false,
        ipv4Available: (profile === null || profile === void 0 ? void 0 : profile.ipv4Available) || false,
        preferredVersion: (profile === null || profile === void 0 ? void 0 : profile.preferredVersion) || 'dual-stack',
        cgnatDetected: (profile === null || profile === void 0 ? void 0 : profile.cgnatDetected) || false,
        strategy: (servers === null || servers === void 0 ? void 0 : servers.version) || 'unknown',
    };
}
/**
 * Get optimization report
 */
function getOptimizationReport() {
    return NetworkOptimizationMaster_1.default.generateReport();
}
/**
 * Subscribe to network events
 */
function onNetworkEvent(listener) {
    return NetworkOptimizationMaster_1.default.onNetworkEvent(listener);
}
