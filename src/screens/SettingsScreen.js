"use strict";
/**
 * Project Aegis - Settings Screen (Battery Mode Toggle)
 * Allows users to choose between Battery Saver and AlwaysOnline modes
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
exports.SettingsScreen = void 0;
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var AppContext_1 = require("../contexts/AppContext");
// eslint-disable-next-line
var BackgroundService_1 = __importDefault(require("../services/BackgroundService"));
var SettingsScreen = function (_a) {
    var _b;
    var onBack = _a.onBack, onOpenDiagnostics = _a.onOpenDiagnostics, onOpenTesting = _a.onOpenTesting;
    var appState = (0, AppContext_1.useApp)().appState;
    var _c = (0, react_1.useState)('saver'), batteryMode = _c[0], setBatteryMode = _c[1];
    var _d = (0, react_1.useState)(false), backgroundActive = _d[0], setBackgroundActive = _d[1];
    var encryptionActive = true; // E2EE always enabled in this phase
    (0, react_1.useEffect)(function () {
        // Initialize with current settings
        setBatteryMode(BackgroundService_1.default.getBatteryMode());
        setBackgroundActive(BackgroundService_1.default.isActive());
    }, []);
    var handleBatteryModeToggle = function () {
        var newMode = batteryMode === 'saver' ? 'always' : 'saver';
        BackgroundService_1.default.setBatteryMode(newMode);
        setBatteryMode(newMode);
    };
    var getCheckIntervalText = function () {
        var mode = batteryMode;
        if (mode === 'always') {
            return 'Always online (uses foreground service)';
        }
        else {
            return 'Check every 15 minutes (Battery Saver)';
        }
    };
    var getBatteryImpact = function () {
        if (batteryMode === 'always') {
            return '⚠️ High battery drain - for active users';
        }
        else {
            return '✅ Low battery drain - check periodically';
        }
    };
    return (<react_native_1.SafeAreaView style={styles.container}>
      <react_native_1.ScrollView style={styles.content}>
        {/* Header with Back Button */}
        <react_native_1.View style={styles.header}>
          <react_native_1.TouchableOpacity onPress={onBack} style={styles.backButton}>
            <react_native_1.Text style={styles.backButtonText}>← Back</react_native_1.Text>
          </react_native_1.TouchableOpacity>
          <react_native_1.Text style={styles.title}>Settings</react_native_1.Text>
          <react_native_1.View style={{ width: 60 }}/>
        </react_native_1.View>

        {/* Battery Mode Section */}
        <react_native_1.View style={styles.section}>
          <react_native_1.Text style={styles.sectionTitle}>⚡ Battery Mode</react_native_1.Text>

          <react_native_1.View style={styles.settingCard}>
            <react_native_1.View style={styles.settingRow}>
              <react_native_1.View style={styles.settingLabel}>
                <react_native_1.Text style={styles.settingName}>
                  {batteryMode === 'always' ? '🔋 AlwaysOnline' : '⚡ Battery Saver'}
                </react_native_1.Text>
                <react_native_1.Text style={styles.settingDescription}>{getCheckIntervalText()}</react_native_1.Text>
              </react_native_1.View>
              <react_native_1.Switch value={batteryMode === 'always'} onValueChange={handleBatteryModeToggle} trackColor={{ false: '#767577', true: '#81c784' }} thumbColor={batteryMode === 'always' ? '#4caf50' : '#f91155'}/>
            </react_native_1.View>

            <react_native_1.View style={styles.batteryInfo}>
              <react_native_1.Text style={styles.batteryImpactText}>{getBatteryImpact()}</react_native_1.Text>
            </react_native_1.View>

            {batteryMode === 'always' && (<react_native_1.View style={styles.warningBox}>
                <react_native_1.Text style={styles.warningText}>
                  📲 AlwaysOnline uses a foreground service (required by Android). You&apos;ll see a
                  permanent notification while the app is running.
                </react_native_1.Text>
              </react_native_1.View>)}

            {batteryMode === 'saver' && (<react_native_1.View style={styles.infoBox}>
                <react_native_1.Text style={styles.infoText}>
                  ✅ Battery Saver checks for messages every 15 minutes when the app is closed.
                  Messages will arrive with a slight delay.
                </react_native_1.Text>
              </react_native_1.View>)}
          </react_native_1.View>
        </react_native_1.View>

        {/* Background Service Status */}
        <react_native_1.View style={styles.section}>
          <react_native_1.Text style={styles.sectionTitle}>🔊 Background Listening</react_native_1.Text>

          <react_native_1.View style={styles.settingCard}>
            <react_native_1.View style={styles.statusRow}>
              <react_native_1.Text style={styles.statusLabel}>Status</react_native_1.Text>
              <react_native_1.View style={[
            styles.statusBadge,
            { backgroundColor: backgroundActive ? '#4caf50' : '#9ca3af' },
        ]}>
                <react_native_1.Text style={styles.statusBadgeText}>
                  {backgroundActive ? 'Active' : 'Inactive'}
                </react_native_1.Text>
              </react_native_1.View>
            </react_native_1.View>

            <react_native_1.View style={styles.divider}/>

            <react_native_1.View style={styles.statusRow}>
              <react_native_1.Text style={styles.statusLabel}>User:</react_native_1.Text>
              <react_native_1.Text style={styles.statusValue}>@{((_b = appState.currentUser) === null || _b === void 0 ? void 0 : _b.alias) || 'unknown'}</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>
        </react_native_1.View>

        {/* App Info */}
        <react_native_1.View style={styles.section}>
          <react_native_1.Text style={styles.sectionTitle}>ℹ️ About</react_native_1.Text>

          <react_native_1.View style={styles.settingCard}>
            <react_native_1.View style={styles.infoRow}>
              <react_native_1.Text style={styles.infoLabel}>App:</react_native_1.Text>
              <react_native_1.Text style={styles.infoValue}>Project Aegis</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.View style={styles.divider}/>
            <react_native_1.View style={styles.infoRow}>
              <react_native_1.Text style={styles.infoLabel}>Version:</react_native_1.Text>
              <react_native_1.Text style={styles.infoValue}>0.0.1 (Phase 4)</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.View style={styles.divider}/>
            <react_native_1.View style={styles.infoRow}>
              <react_native_1.Text style={styles.infoLabel}>Protocol:</react_native_1.Text>
              <react_native_1.Text style={styles.infoValue}>WebRTC + GunDB DHT</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.View style={styles.divider}/>
            <react_native_1.View style={styles.infoRow}>
              <react_native_1.Text style={styles.infoLabel}>Encryption:</react_native_1.Text>
              <react_native_1.Text style={styles.infoValue}>E2EE (Double Ratchet)</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>
        </react_native_1.View>

        {/* E2EE Encryption Status */}
        <react_native_1.View style={styles.section}>
          <react_native_1.Text style={styles.sectionTitle}>🔐 E2E Encryption</react_native_1.Text>

          <react_native_1.View style={styles.settingCard}>
            <react_native_1.View style={styles.statusRow}>
              <react_native_1.Text style={styles.statusLabel}>Protocol:</react_native_1.Text>
              <react_native_1.Text style={styles.statusValue}>Double Ratchet + SRTP</react_native_1.Text>
            </react_native_1.View>

            <react_native_1.View style={styles.divider}/>

            <react_native_1.View style={styles.statusRow}>
              <react_native_1.Text style={styles.statusLabel}>Message Encryption:</react_native_1.Text>
              <react_native_1.View style={[
            styles.statusBadge,
            { backgroundColor: encryptionActive ? '#10b981' : '#9ca3af' },
        ]}>
                <react_native_1.Text style={styles.statusBadgeText}>
                  {encryptionActive ? 'Active' : 'Standby'}
                </react_native_1.Text>
              </react_native_1.View>
            </react_native_1.View>

            <react_native_1.View style={styles.divider}/>

            <react_native_1.View style={styles.statusRow}>
              <react_native_1.Text style={styles.statusLabel}>Perfect Forward Secrecy:</react_native_1.Text>
              <react_native_1.View style={[styles.statusBadge, { backgroundColor: '#06b6d4' }]}>
                <react_native_1.Text style={styles.statusBadgeText}>✓ Enabled</react_native_1.Text>
              </react_native_1.View>
            </react_native_1.View>

            <react_native_1.View style={styles.divider}/>

            <react_native_1.View style={styles.statusRow}>
              <react_native_1.Text style={styles.statusLabel}>Key Rotation:</react_native_1.Text>
              <react_native_1.Text style={styles.statusValue}>Every 10 messages & 60s (media)</react_native_1.Text>
            </react_native_1.View>

            <react_native_1.View style={styles.encryptionHint}>
              <react_native_1.Text style={styles.encryptionHintText}>
                ✓ All messages and media streams are encrypted end-to-end. Keys rotate automatically
                to prevent decryption of old messages if a key is compromised.
              </react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>
        </react_native_1.View>

        {/* Diagnostics */}
        <react_native_1.View style={styles.section}>
          <react_native_1.Text style={styles.sectionTitle}>🔧 Diagnostics</react_native_1.Text>

          <react_native_1.TouchableOpacity style={styles.diagnosticsButton} onPress={onOpenDiagnostics}>
            <react_native_1.View style={styles.diagnosticsButtonContent}>
              <react_native_1.Text style={styles.diagnosticsButtonText}>View Logs & Network Status</react_native_1.Text>
              <react_native_1.Text style={styles.diagnosticsButtonArrow}>→</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.TouchableOpacity>

          <react_native_1.Text style={styles.diagnosticsHint}>
            Debug logs, error reports, and network diagnostics
          </react_native_1.Text>
        </react_native_1.View>

        {/* Testing */}
        <react_native_1.View style={styles.section}>
          <react_native_1.Text style={styles.sectionTitle}>🧪 E2E Testing</react_native_1.Text>

          <react_native_1.TouchableOpacity style={styles.testingButton} onPress={onOpenTesting}>
            <react_native_1.View style={styles.testingButtonContent}>
              <react_native_1.Text style={styles.testingButtonText}>Run Connectivity Tests</react_native_1.Text>
              <react_native_1.Text style={styles.testingButtonArrow}>→</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.TouchableOpacity>

          <react_native_1.Text style={styles.testingHint}>
            Test WebRTC, codecs, NAT traversal, and media capabilities
          </react_native_1.Text>
        </react_native_1.View>
      </react_native_1.ScrollView>
    </react_native_1.SafeAreaView>);
};
exports.SettingsScreen = SettingsScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    settingCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    settingLabel: {
        flex: 1,
    },
    settingName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        color: '#6b7280',
    },
    batteryInfo: {
        backgroundColor: '#fff3cd',
        borderRadius: 8,
        padding: 10,
        marginTop: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#ffc107',
    },
    batteryImpactText: {
        fontSize: 13,
        color: '#856404',
        fontWeight: '500',
    },
    warningBox: {
        backgroundColor: '#fed7d7',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#f56565',
    },
    warningText: {
        fontSize: 13,
        color: '#742a2a',
        lineHeight: 18,
    },
    infoBox: {
        backgroundColor: '#c6f6d5',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#48bb78',
    },
    infoText: {
        fontSize: 13,
        color: '#22543d',
        lineHeight: 18,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    statusValue: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    infoValue: {
        fontSize: 14,
        color: '#6b7280',
    },
    diagnosticsButton: {
        backgroundColor: '#f0f9ff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 2,
        borderColor: '#0284c7',
        marginBottom: 8,
    },
    diagnosticsButtonContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    diagnosticsButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0c4a6e',
    },
    diagnosticsButtonArrow: {
        fontSize: 20,
        color: '#0284c7',
    },
    diagnosticsHint: {
        fontSize: 13,
        color: '#0c4a6e',
        fontStyle: 'italic',
        marginLeft: 4,
    },
    testingButton: {
        backgroundColor: '#fef3c7',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 2,
        borderColor: '#d97706',
        marginBottom: 8,
    },
    testingButtonContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    testingButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#92400e',
    },
    testingButtonArrow: {
        fontSize: 20,
        color: '#d97706',
    },
    testingHint: {
        fontSize: 13,
        color: '#92400e',
        fontStyle: 'italic',
        marginLeft: 4,
    },
    encryptionHint: {
        backgroundColor: '#dbeafe',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#0284c7',
    },
    encryptionHintText: {
        fontSize: 13,
        color: '#0c4a6e',
        lineHeight: 18,
    },
});
exports.default = exports.SettingsScreen;
