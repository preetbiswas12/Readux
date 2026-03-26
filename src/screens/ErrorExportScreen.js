"use strict";
/**
 * Project Aegis - Error & Diagnostics Screen
 * View and export error logs and network diagnostics
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
exports.ErrorExportScreen = void 0;
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
// @ts-ignore - ErrorLoggingService is default exported as singleton
var ErrorLoggingService_1 = __importDefault(require("../services/ErrorLoggingService"));
// @ts-ignore - NetworkDiagnosticsService is default exported as singleton
var NetworkDiagnosticsService_1 = __importDefault(require("../services/NetworkDiagnosticsService"));
var ErrorExportScreen = function (_a) {
    var onBack = _a.onBack;
    var _b = (0, react_1.useState)('logs'), activeTab = _b[0], setActiveTab = _b[1];
    var _c = (0, react_1.useState)(false), debugMode = _c[0], setDebugMode = _c[1];
    var _d = (0, react_1.useState)([]), logs = _d[0], setLogs = _d[1];
    var _e = (0, react_1.useState)([]), crashReports = _e[0], setCrashReports = _e[1];
    var _f = (0, react_1.useState)(null), diagnostics = _f[0], setDiagnostics = _f[1];
    var _g = (0, react_1.useState)(false), running = _g[0], setRunning = _g[1];
    (0, react_1.useEffect)(function () {
        // Load initial data
        updateLogs();
    }, []);
    var updateLogs = function () {
        var recent = ErrorLoggingService_1.default.getRecentLogs(50);
        setLogs(recent);
        setCrashReports(ErrorLoggingService_1.default.getCrashReports());
        setDebugMode(ErrorLoggingService_1.default.isDebugEnabled());
    };
    var handleDebugToggle = function () {
        var newState = !debugMode;
        ErrorLoggingService_1.default.setDebugMode(newState);
        setDebugMode(newState);
        react_native_1.Alert.alert('Debug Mode', newState ? 'Debug logging enabled' : 'Debug logging disabled');
    };
    var handleExportLogs = function () { return __awaiter(void 0, void 0, void 0, function () {
        var jsonExport, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    jsonExport = ErrorLoggingService_1.default.exportLogs();
                    return [4 /*yield*/, react_native_1.Share.share({
                            message: jsonExport,
                            title: 'Aegis Chat Error Logs',
                        })];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    react_native_1.Alert.alert('Error', 'Failed to export logs');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleClearLogs = function () {
        react_native_1.Alert.alert('Clear Logs', 'Are you sure you want to clear all error logs?', [
            { text: 'Cancel', onPress: function () { } },
            {
                text: 'Clear',
                onPress: function () {
                    ErrorLoggingService_1.default.clearLogs();
                    updateLogs();
                    react_native_1.Alert.alert('Success', 'Logs cleared');
                },
                style: 'destructive',
            },
        ]);
    };
    var handleRunDiagnostics = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setRunning(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, NetworkDiagnosticsService_1.default.runDiagnostics()];
                case 2:
                    result = _b.sent();
                    setDiagnostics(result);
                    return [3 /*break*/, 5];
                case 3:
                    _a = _b.sent();
                    react_native_1.Alert.alert('Error', 'Failed to run diagnostics');
                    return [3 /*break*/, 5];
                case 4:
                    setRunning(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleExportDiagnostics = function () { return __awaiter(void 0, void 0, void 0, function () {
        var formatted, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!diagnostics) {
                        react_native_1.Alert.alert('No Data', 'Run diagnostics first');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    formatted = NetworkDiagnosticsService_1.default.formatResults(diagnostics);
                    return [4 /*yield*/, react_native_1.Share.share({
                            message: formatted,
                            title: 'Network Diagnostics',
                        })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    react_native_1.Alert.alert('Error', 'Failed to export diagnostics');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getDiagnosticsSummary = function () {
        var summary = ErrorLoggingService_1.default.getDiagnosticSummary();
        return summary;
    };
    return (<react_native_1.SafeAreaView style={styles.container}>
      {/* Header */}
      <react_native_1.View style={styles.header}>
        <react_native_1.TouchableOpacity onPress={onBack} style={styles.backButton}>
          <react_native_1.Text style={styles.backButtonText}>← Back</react_native_1.Text>
        </react_native_1.TouchableOpacity>
        <react_native_1.Text style={styles.title}>Diagnostics</react_native_1.Text>
        <react_native_1.View style={{ width: 60 }}/>
      </react_native_1.View>

      {/* Tab Navigation */}
      <react_native_1.View style={styles.tabContainer}>
        <react_native_1.TouchableOpacity style={[styles.tab, activeTab === 'logs' && styles.activeTab]} onPress={function () { return setActiveTab('logs'); }}>
          <react_native_1.Text style={[
            styles.tabText,
            activeTab === 'logs' && styles.activeTabText,
        ]}>
            📋 Logs
          </react_native_1.Text>
        </react_native_1.TouchableOpacity>
        <react_native_1.TouchableOpacity style={[styles.tab, activeTab === 'diagnostics' && styles.activeTab]} onPress={function () { return setActiveTab('diagnostics'); }}>
          <react_native_1.Text style={[
            styles.tabText,
            activeTab === 'diagnostics' && styles.activeTabText,
        ]}>
            🔧 Network
          </react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>

      <react_native_1.ScrollView style={styles.content}>
        {activeTab === 'logs' && (<>
            {/* Debug Mode Toggle */}
            <react_native_1.View style={styles.section}>
              <react_native_1.View style={styles.sectionHeader}>
                <react_native_1.Text style={styles.sectionTitle}>Debug Mode</react_native_1.Text>
                <react_native_1.Switch value={debugMode} onValueChange={handleDebugToggle} trackColor={{ false: '#767577', true: '#81c784' }} thumbColor={debugMode ? '#4caf50' : '#f91155'}/>
              </react_native_1.View>
              <react_native_1.Text style={styles.sectionDescription}>
                {debugMode
                ? '🔴 Debug logging is ON - more detailed logs will be captured'
                : '🔴 Debug logging is OFF - only errors and warnings'}
              </react_native_1.Text>
            </react_native_1.View>

            {/* Summary Stats */}
            <react_native_1.View style={styles.section}>
              <react_native_1.Text style={styles.sectionTitle}>📊 Summary</react_native_1.Text>
              <react_native_1.View style={styles.statsCard}>
                {(function () {
                var summary = getDiagnosticsSummary();
                return (<>
                      <react_native_1.View style={styles.statRow}>
                        <react_native_1.Text style={styles.statLabel}>Total Logs:</react_native_1.Text>
                        <react_native_1.Text style={styles.statValue}>
                          {summary.total_logs}
                        </react_native_1.Text>
                      </react_native_1.View>
                      <react_native_1.View style={styles.statRow}>
                        <react_native_1.Text style={styles.statLabel}>Errors:</react_native_1.Text>
                        <react_native_1.Text style={[styles.statValue, { color: '#ef4444' }]}>
                          {summary.error_count}
                        </react_native_1.Text>
                      </react_native_1.View>
                      <react_native_1.View style={styles.statRow}>
                        <react_native_1.Text style={styles.statLabel}>Warnings:</react_native_1.Text>
                        <react_native_1.Text style={[styles.statValue, { color: '#f59e0b' }]}>
                          {summary.warning_count}
                        </react_native_1.Text>
                      </react_native_1.View>
                      <react_native_1.View style={styles.statRow}>
                        <react_native_1.Text style={styles.statLabel}>Crashes:</react_native_1.Text>
                        <react_native_1.Text style={[styles.statValue, { color: '#dc2626' }]}>
                          {summary.crash_count}
                        </react_native_1.Text>
                      </react_native_1.View>
                    </>);
            })()}
              </react_native_1.View>
            </react_native_1.View>

            {/* Recent Logs */}
            <react_native_1.View style={styles.section}>
              <react_native_1.Text style={styles.sectionTitle}>
                🔵 Recent Logs ({logs.length})
              </react_native_1.Text>
              {logs.length > 0 ? (<react_native_1.FlatList data={logs} scrollEnabled={false} renderItem={function (_a) {
                    var item = _a.item;
                    return (<react_native_1.View style={styles.logItem}>
                      <react_native_1.Text style={styles.logTimestamp}>
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </react_native_1.Text>
                      <react_native_1.Text style={[
                            styles.logLevel,
                            {
                                color: item.level === 'error'
                                    ? '#ef4444'
                                    : item.level === 'warning'
                                        ? '#f59e0b'
                                        : '#3b82f6',
                            },
                        ]}>
                        {item.level.toUpperCase()}
                      </react_native_1.Text>
                      <react_native_1.Text style={styles.logCategory}>[{item.category}]</react_native_1.Text>
                      <react_native_1.Text style={styles.logMessage}>{item.message}</react_native_1.Text>
                    </react_native_1.View>);
                }} keyExtractor={function (item) { return item.id; }}/>) : (<react_native_1.Text style={styles.emptyText}>No logs yet</react_native_1.Text>)}
            </react_native_1.View>

            {/* Crash Reports */}
            {crashReports.length > 0 && (<react_native_1.View style={styles.section}>
                <react_native_1.Text style={styles.sectionTitle}>💥 Crash Reports</react_native_1.Text>
                {crashReports.map(function (report) { return (<react_native_1.View key={report.id} style={styles.crashItem}>
                    <react_native_1.Text style={styles.crashError}>{report.error}</react_native_1.Text>
                    <react_native_1.Text style={styles.crashTime}>
                      {new Date(report.timestamp).toLocaleString()}
                    </react_native_1.Text>
                  </react_native_1.View>); })}
              </react_native_1.View>)}

            {/* Action Buttons */}
            <react_native_1.View style={styles.actionButtons}>
              <react_native_1.TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleExportLogs}>
                <react_native_1.Text style={styles.buttonText}>📤 Export Logs</react_native_1.Text>
              </react_native_1.TouchableOpacity>
              <react_native_1.TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearLogs}>
                <react_native_1.Text style={styles.buttonText}>🗑️ Clear Logs</react_native_1.Text>
              </react_native_1.TouchableOpacity>
            </react_native_1.View>
          </>)}

        {activeTab === 'diagnostics' && (<>
            {/* Run Diagnostics */}
            <react_native_1.View style={styles.section}>
              <react_native_1.Text style={styles.sectionTitle}>🔧 Network Diagnostics</react_native_1.Text>
              <react_native_1.TouchableOpacity style={[
                styles.button,
                styles.primaryButton,
                running && styles.buttonDisabled,
            ]} onPress={handleRunDiagnostics} disabled={running}>
                <react_native_1.Text style={styles.buttonText}>
                  {running ? '⏳ Running...' : '▶️ Run Diagnostics'}
                </react_native_1.Text>
              </react_native_1.TouchableOpacity>
            </react_native_1.View>

            {/* Results */}
            {diagnostics && (<>
                <react_native_1.View style={styles.section}>
                  <react_native_1.Text style={styles.sectionTitle}>📡 Results</react_native_1.Text>
                  <react_native_1.View style={styles.diagnosticsCard}>
                    <react_native_1.View style={styles.resultRow}>
                      <react_native_1.Text style={styles.resultLabel}>Overall Quality:</react_native_1.Text>
                      <react_native_1.Text style={[
                    styles.resultValue,
                    {
                        color: diagnostics.overall_quality === 'excellent'
                            ? '#10b981'
                            : diagnostics.overall_quality === 'good'
                                ? '#3b82f6'
                                : diagnostics.overall_quality === 'fair'
                                    ? '#f59e0b'
                                    : diagnostics.overall_quality === 'poor'
                                        ? '#ef4444'
                                        : '#9ca3af',
                    },
                ]}>
                        {diagnostics.overall_quality.toUpperCase()}
                      </react_native_1.Text>
                    </react_native_1.View>
                    <react_native_1.View style={styles.resultRow}>
                      <react_native_1.Text style={styles.resultLabel}>GunDB Status:</react_native_1.Text>
                      <react_native_1.Text style={[
                    styles.resultValue,
                    {
                        color: diagnostics.gun_db_connected
                            ? '#10b981'
                            : '#ef4444',
                    },
                ]}>
                        {diagnostics.gun_db_connected ? '✅ Connected' : '❌ Failed'} ({diagnostics.gun_db_latency}ms)
                      </react_native_1.Text>
                    </react_native_1.View>
                    <react_native_1.View style={styles.resultRow}>
                      <react_native_1.Text style={styles.resultLabel}>WebRTC/STUN:</react_native_1.Text>
                      <react_native_1.Text style={[
                    styles.resultValue,
                    {
                        color: diagnostics.webrtc_available
                            ? '#10b981'
                            : '#ef4444',
                    },
                ]}>
                        {diagnostics.webrtc_available ? '✅ Available' : '❌ Failed'} ({diagnostics.stun_latency}ms)
                      </react_native_1.Text>
                    </react_native_1.View>
                  </react_native_1.View>
                </react_native_1.View>

                {/* Recommendations */}
                {diagnostics.recommendations.length > 0 && (<react_native_1.View style={styles.section}>
                    <react_native_1.Text style={styles.sectionTitle}>💡 Recommendations</react_native_1.Text>
                    {diagnostics.recommendations.map(function (rec, idx) { return (<react_native_1.View key={idx} style={styles.recommendationItem}>
                          <react_native_1.Text style={styles.recommendationText}>
                            {rec}
                          </react_native_1.Text>
                        </react_native_1.View>); })}
                  </react_native_1.View>)}

                <react_native_1.View style={styles.actionButtons}>
                  <react_native_1.TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleExportDiagnostics}>
                    <react_native_1.Text style={styles.buttonText}>📤 Export</react_native_1.Text>
                  </react_native_1.TouchableOpacity>
                </react_native_1.View>
              </>)}
          </>)}
      </react_native_1.ScrollView>
    </react_native_1.SafeAreaView>);
};
exports.ErrorExportScreen = ErrorExportScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000000',
        flex: 1,
        textAlign: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#fff',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#007AFF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9ca3af',
    },
    activeTabText: {
        color: '#007AFF',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    sectionDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
        fontStyle: 'italic',
    },
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginTop: 12,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    statLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    statValue: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '700',
    },
    logItem: {
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#d1d5db',
    },
    logTimestamp: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 4,
    },
    logLevel: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
    },
    logCategory: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    logMessage: {
        fontSize: 13,
        color: '#374151',
    },
    emptyText: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        paddingVertical: 20,
    },
    crashItem: {
        backgroundColor: '#fee2e2',
        padding: 12,
        marginBottom: 10,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#dc2626',
    },
    crashError: {
        fontSize: 13,
        color: '#7f1d1d',
        fontWeight: '600',
        marginBottom: 4,
    },
    crashTime: {
        fontSize: 12,
        color: '#991b1b',
    },
    diagnosticsCard: {
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#bfdbfe',
        marginTop: 12,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#dbeafe',
    },
    resultLabel: {
        fontSize: 14,
        color: '#1e40af',
        fontWeight: '600',
    },
    resultValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    recommendationItem: {
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
    },
    recommendationText: {
        fontSize: 13,
        color: '#374151',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
        marginBottom: 32,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#007AFF',
    },
    dangerButton: {
        backgroundColor: '#ef4444',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
});
