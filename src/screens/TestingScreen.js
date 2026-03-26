"use strict";
/**
 * Project Aegis - Testing Screen
 * UI for running and displaying E2E test results
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
exports.TestingScreen = void 0;
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var E2ETestingService_1 = __importStar(require("../services/E2ETestingService"));
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#007AFF',
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    headerText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    section: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: '#007AFF',
    },
    secondaryButton: {
        backgroundColor: '#5AC8FA',
    },
    dangerButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    statusBadge: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginBottom: 8,
    },
    statusText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '700',
    },
    testListItem: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    testItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    testItemText: {
        flex: 1,
        fontSize: 13,
        color: '#333',
    },
    testItemStatus: {
        fontSize: 12,
        fontWeight: '600',
        marginRight: 8,
    },
    testItemDuration: {
        fontSize: 12,
        color: '#999',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 4,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#999',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
    },
    categoryBadge: {
        display: 'flex',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 3,
        marginRight: 6,
        fontSize: 10,
        fontWeight: '600',
    },
    exportButton: {
        backgroundColor: '#34C759',
    },
});
var getStatusEmoji = function (status) {
    switch (status) {
        case E2ETestingService_1.TestStatus.PASSED:
            return '✅';
        case E2ETestingService_1.TestStatus.FAILED:
            return '❌';
        case E2ETestingService_1.TestStatus.RUNNING:
            return '⏳';
        case E2ETestingService_1.TestStatus.SKIPPED:
            return '⏭️';
        default:
            return '❓';
    }
};
var getCategoryColor = function (category) {
    switch (category) {
        case E2ETestingService_1.TestCategory.CONNECTIVITY:
            return '#007AFF';
        case E2ETestingService_1.TestCategory.MEDIA:
            return '#5AC8FA';
        case E2ETestingService_1.TestCategory.CODECS:
            return '#34C759';
        case E2ETestingService_1.TestCategory.CALLS:
            return '#FF9500';
        case E2ETestingService_1.TestCategory.NAT:
            return '#FF3B30';
        default:
            return '#999';
    }
};
var TestingScreen = function () {
    var _a = (0, react_1.useState)({
        isRunning: false,
        report: null,
    }), state = _a[0], setState = _a[1];
    var _b = (0, react_1.useState)(null), unsubscribe = _b[0], setUnsubscribe = _b[1];
    (0, react_1.useEffect)(function () {
        // Load any previous test results
        var previousReport = E2ETestingService_1.default.getCurrentReport();
        if (previousReport) {
            setState(function (prev) { return (__assign(__assign({}, prev), { report: previousReport })); });
        }
        return function () {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [unsubscribe]);
    var handleQuickTest = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var unsubFn, report_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setState(function (prev) { return (__assign(__assign({}, prev), { isRunning: true, currentTest: 'quick' })); });
                    unsubFn = E2ETestingService_1.default.onTestComplete(function (result) {
                        setState(function (prev) { return (__assign(__assign({}, prev), { currentTest: "".concat(result.name, "...") })); });
                    });
                    setUnsubscribe(function () { return unsubFn; });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, E2ETestingService_1.default.runQuickTest()];
                case 2:
                    report_1 = _a.sent();
                    setState(function (prev) { return (__assign(__assign({}, prev), { isRunning: false, report: report_1, currentTest: undefined })); });
                    react_native_1.Alert.alert('Quick Test Complete', "".concat(report_1.passed, "/").concat(report_1.totalTests, " tests passed"), [{ text: 'OK' }]);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Quick test failed:', error_1);
                    react_native_1.Alert.alert('Error', "Quick test failed: ".concat(error_1), [{ text: 'OK' }]);
                    setState(function (prev) { return (__assign(__assign({}, prev), { isRunning: false, currentTest: undefined })); });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    var handleFullTest = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var unsubFn, report_2, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setState(function (prev) { return (__assign(__assign({}, prev), { isRunning: true, currentTest: 'full' })); });
                    unsubFn = E2ETestingService_1.default.onTestComplete(function (result) {
                        setState(function (prev) { return (__assign(__assign({}, prev), { currentTest: "".concat(result.name, "...") })); });
                    });
                    setUnsubscribe(function () { return unsubFn; });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, E2ETestingService_1.default.runFullTestSuite()];
                case 2:
                    report_2 = _a.sent();
                    setState(function (prev) { return (__assign(__assign({}, prev), { isRunning: false, report: report_2, currentTest: undefined })); });
                    react_native_1.Alert.alert('Full Test Complete', "".concat(report_2.passed, "/").concat(report_2.totalTests, " tests passed (").concat(report_2.successRate.toFixed(1), "%)"), [{ text: 'OK' }]);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Full test failed:', error_2);
                    react_native_1.Alert.alert('Error', "Full test failed: ".concat(error_2), [{ text: 'OK' }]);
                    setState(function (prev) { return (__assign(__assign({}, prev), { isRunning: false, currentTest: undefined })); });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    var handleClearResults = (0, react_1.useCallback)(function () {
        react_native_1.Alert.alert('Clear Results?', 'This will delete all test results. Continue?', [
            { text: 'Cancel', onPress: function () { } },
            {
                text: 'Clear',
                onPress: function () {
                    E2ETestingService_1.default.clearResults();
                    setState(function (prev) { return (__assign(__assign({}, prev), { report: null, selectedTest: undefined })); });
                },
                style: 'destructive',
            },
        ]);
    }, []);
    var handleExportJSON = (0, react_1.useCallback)(function () {
        if (!state.report) {
            react_native_1.Alert.alert('No Results', 'Run tests first to export results', [
                { text: 'OK' },
            ]);
            return;
        }
        var json = E2ETestingService_1.default.exportReportAsJSON(state.report);
        console.log('📋 Test Report (JSON):\n', json);
        react_native_1.Alert.alert('Export Complete', 'Test report exported to console', [
            { text: 'OK' },
        ]);
    }, [state.report]);
    var handleExportText = (0, react_1.useCallback)(function () {
        if (!state.report) {
            react_native_1.Alert.alert('No Results', 'Run tests first to export results', [
                { text: 'OK' },
            ]);
            return;
        }
        var text = E2ETestingService_1.default.exportReportAsText(state.report);
        console.log('📋 Test Report (Text):\n', text);
        react_native_1.Alert.alert('Export Complete', 'Test report exported to console', [
            { text: 'OK' },
        ]);
    }, [state.report]);
    return (<react_native_1.View style={styles.container}>
      <react_native_1.View style={styles.header}>
        <react_native_1.Text style={styles.headerText}>🧪 E2E Testing</react_native_1.Text>
      </react_native_1.View>

      <react_native_1.ScrollView style={styles.content}>
        {/* Test Controls */}
        <react_native_1.View style={styles.section}>
          <react_native_1.Text style={styles.sectionTitle}>Test Suite</react_native_1.Text>
          <react_native_1.View style={styles.buttonContainer}>
            <react_native_1.TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleQuickTest} disabled={state.isRunning}>
              <react_native_1.Text style={styles.buttonText}>Quick Test</react_native_1.Text>
            </react_native_1.TouchableOpacity>
            <react_native_1.TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleFullTest} disabled={state.isRunning}>
              <react_native_1.Text style={styles.buttonText}>Full Suite</react_native_1.Text>
            </react_native_1.TouchableOpacity>
          </react_native_1.View>

          {state.isRunning && (<react_native_1.View style={styles.loadingContainer}>
              <react_native_1.ActivityIndicator size="large" color="#007AFF"/>
              <react_native_1.Text style={styles.loadingText}>
                {state.currentTest || 'Running tests...'}
              </react_native_1.Text>
            </react_native_1.View>)}
        </react_native_1.View>

        {/* Test Report Summary */}
        {state.report && !state.isRunning && (<>
            <react_native_1.View style={styles.section}>
              <react_native_1.Text style={styles.sectionTitle}>Summary</react_native_1.Text>

              {/* Progress Bar */}
              <react_native_1.View style={styles.progressBar}>
                <react_native_1.View style={[
                styles.progressFill,
                {
                    width: "".concat(state.report.successRate, "%"),
                },
            ]}/>
              </react_native_1.View>

              <react_native_1.View style={styles.summaryRow}>
                <react_native_1.Text style={styles.summaryLabel}>Success Rate</react_native_1.Text>
                <react_native_1.Text style={styles.summaryValue}>
                  {state.report.successRate.toFixed(1)}%
                </react_native_1.Text>
              </react_native_1.View>

              <react_native_1.View style={styles.summaryRow}>
                <react_native_1.Text style={styles.summaryLabel}>Total Tests</react_native_1.Text>
                <react_native_1.Text style={styles.summaryValue}>
                  {state.report.totalTests}
                </react_native_1.Text>
              </react_native_1.View>

              <react_native_1.View style={styles.summaryRow}>
                <react_native_1.Text style={styles.summaryLabel}>✅ Passed</react_native_1.Text>
                <react_native_1.Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                  {state.report.passed}
                </react_native_1.Text>
              </react_native_1.View>

              <react_native_1.View style={styles.summaryRow}>
                <react_native_1.Text style={styles.summaryLabel}>❌ Failed</react_native_1.Text>
                <react_native_1.Text style={[styles.summaryValue, { color: '#FF3B30' }]}>
                  {state.report.failed}
                </react_native_1.Text>
              </react_native_1.View>

              <react_native_1.View style={styles.summaryRow}>
                <react_native_1.Text style={styles.summaryLabel}>⏭️ Skipped</react_native_1.Text>
                <react_native_1.Text style={[styles.summaryValue, { color: '#999' }]}>
                  {state.report.skipped}
                </react_native_1.Text>
              </react_native_1.View>

              <react_native_1.View style={styles.summaryRow}>
                <react_native_1.Text style={styles.summaryLabel}>⏱️ Avg Duration</react_native_1.Text>
                <react_native_1.Text style={styles.summaryValue}>
                  {state.report.averageDuration.toFixed(0)}ms
                </react_native_1.Text>
              </react_native_1.View>
            </react_native_1.View>

            {/* Export & Clear Buttons */}
            <react_native_1.View style={styles.section}>
              <react_native_1.View style={styles.buttonContainer}>
                <react_native_1.TouchableOpacity style={[styles.button, styles.exportButton]} onPress={handleExportJSON}>
                  <react_native_1.Text style={styles.buttonText}>Export JSON</react_native_1.Text>
                </react_native_1.TouchableOpacity>
                <react_native_1.TouchableOpacity style={[styles.button, styles.exportButton]} onPress={handleExportText}>
                  <react_native_1.Text style={styles.buttonText}>Export Text</react_native_1.Text>
                </react_native_1.TouchableOpacity>
              </react_native_1.View>

              <react_native_1.TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearResults}>
                <react_native_1.Text style={styles.buttonText}>Clear Results</react_native_1.Text>
              </react_native_1.TouchableOpacity>
            </react_native_1.View>

            {/* Test Results List */}
            <react_native_1.View style={styles.section}>
              <react_native_1.Text style={styles.sectionTitle}>Results</react_native_1.Text>

              {state.report.results.length === 0 ? (<react_native_1.View style={styles.emptyState}>
                  <react_native_1.Text style={styles.emptyStateText}>
                    No test results available
                  </react_native_1.Text>
                </react_native_1.View>) : (state.report.results.map(function (result, index) {
                var _a;
                return (<react_native_1.TouchableOpacity key={index} style={styles.testListItem} onPress={function () {
                        setState(function (prev) {
                            var _a;
                            return (__assign(__assign({}, prev), { selectedTest: ((_a = prev.selectedTest) === null || _a === void 0 ? void 0 : _a.id) === result.id
                                    ? undefined
                                    : result }));
                        });
                    }}>
                    <react_native_1.View style={styles.testItemRow}>
                      <react_native_1.View style={{ flex: 1 }}>
                        <react_native_1.View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 4,
                    }}>
                          <react_native_1.Text style={styles.testItemStatus}>
                            {getStatusEmoji(result.status)}
                          </react_native_1.Text>
                          <react_native_1.Text style={styles.testItemText}>
                            {result.name}
                          </react_native_1.Text>
                        </react_native_1.View>
                        <react_native_1.View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                          <react_native_1.View style={[
                        styles.categoryBadge,
                        {
                            backgroundColor: getCategoryColor(result.category),
                        },
                    ]}>
                            <react_native_1.Text style={{
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: '600',
                    }}>
                              {result.category}
                            </react_native_1.Text>
                          </react_native_1.View>
                          <react_native_1.Text style={styles.testItemDuration}>
                            {result.duration}ms
                          </react_native_1.Text>
                        </react_native_1.View>
                      </react_native_1.View>
                    </react_native_1.View>

                    {((_a = state.selectedTest) === null || _a === void 0 ? void 0 : _a.id) === result.id && (<>
                        {result.details && (<react_native_1.Text style={{
                                fontSize: 12,
                                color: '#666',
                                marginTop: 8,
                            }}>
                            {result.details}
                          </react_native_1.Text>)}
                        {result.error && (<react_native_1.Text style={styles.errorText}>
                            Error: {result.error}
                          </react_native_1.Text>)}
                      </>)}
                  </react_native_1.TouchableOpacity>);
            }))}
            </react_native_1.View>
          </>)}

        {!state.report && !state.isRunning && (<react_native_1.View style={styles.section}>
            <react_native_1.View style={styles.emptyState}>
              <react_native_1.Text style={styles.emptyStateText}>
                Run tests to get started
              </react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>)}
      </react_native_1.ScrollView>
    </react_native_1.View>);
};
exports.TestingScreen = TestingScreen;
exports.default = exports.TestingScreen;
