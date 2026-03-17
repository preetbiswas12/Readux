/**
 * Project Aegis - Error & Diagnostics Screen
 * View and export error logs and network diagnostics
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  SafeAreaView,
  Alert,
  Switch,
  FlatList,
} from 'react-native';
// @ts-ignore - ErrorLoggingService is default exported as singleton
import ErrorLoggingService from '../services/ErrorLoggingService';
// @ts-ignore - NetworkDiagnosticsService is default exported as singleton
import NetworkDiagnosticsService from '../services/NetworkDiagnosticsService';

interface ErrorExportScreenProps {
  onBack?: () => void;
}

export const ErrorExportScreen: React.FC<ErrorExportScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'diagnostics'>('logs');
  const [debugMode, setDebugMode] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [crashReports, setCrashReports] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    // Load initial data
    updateLogs();
  }, []);

  const updateLogs = () => {
    const recent = ErrorLoggingService.getRecentLogs(50);
    setLogs(recent);
    setCrashReports(ErrorLoggingService.getCrashReports());
    setDebugMode(ErrorLoggingService.isDebugEnabled());
  };

  const handleDebugToggle = () => {
    const newState = !debugMode;
    ErrorLoggingService.setDebugMode(newState);
    setDebugMode(newState);
    Alert.alert(
      'Debug Mode',
      newState ? 'Debug logging enabled' : 'Debug logging disabled'
    );
  };

  const handleExportLogs = async () => {
    try {
      const jsonExport = ErrorLoggingService.exportLogs();

      await Share.share({
        message: jsonExport,
        title: 'Aegis Chat Error Logs',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export logs');
    }
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all error logs?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Clear',
          onPress: () => {
            ErrorLoggingService.clearLogs();
            updateLogs();
            Alert.alert('Success', 'Logs cleared');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleRunDiagnostics = async () => {
    setRunning(true);
    try {
      const result = await NetworkDiagnosticsService.runDiagnostics();
      setDiagnostics(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to run diagnostics');
    } finally {
      setRunning(false);
    }
  };

  const handleExportDiagnostics = async () => {
    if (!diagnostics) {
      Alert.alert('No Data', 'Run diagnostics first');
      return;
    }

    try {
      const formatted = NetworkDiagnosticsService.formatResults(diagnostics);
      await Share.share({
        message: formatted,
        title: 'Network Diagnostics',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export diagnostics');
    }
  };

  const getDiagnosticsSummary = () => {
    const summary = ErrorLoggingService.getDiagnosticSummary();
    return summary;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Diagnostics</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'logs' && styles.activeTab]}
          onPress={() => setActiveTab('logs')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'logs' && styles.activeTabText,
            ]}
          >
            📋 Logs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'diagnostics' && styles.activeTab]}
          onPress={() => setActiveTab('diagnostics')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'diagnostics' && styles.activeTabText,
            ]}
          >
            🔧 Network
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'logs' && (
          <>
            {/* Debug Mode Toggle */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Debug Mode</Text>
                <Switch
                  value={debugMode}
                  onValueChange={handleDebugToggle}
                  trackColor={{ false: '#767577', true: '#81c784' }}
                  thumbColor={debugMode ? '#4caf50' : '#f91155'}
                />
              </View>
              <Text style={styles.sectionDescription}>
                {debugMode
                  ? '🔴 Debug logging is ON - more detailed logs will be captured'
                  : '🔴 Debug logging is OFF - only errors and warnings'}
              </Text>
            </View>

            {/* Summary Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Summary</Text>
              <View style={styles.statsCard}>
                {(() => {
                  const summary = getDiagnosticsSummary();
                  return (
                    <>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Total Logs:</Text>
                        <Text style={styles.statValue}>
                          {summary.total_logs}
                        </Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Errors:</Text>
                        <Text style={[styles.statValue, { color: '#ef4444' }]}>
                          {summary.error_count}
                        </Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Warnings:</Text>
                        <Text
                          style={[styles.statValue, { color: '#f59e0b' }]}
                        >
                          {summary.warning_count}
                        </Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Crashes:</Text>
                        <Text style={[styles.statValue, { color: '#dc2626' }]}>
                          {summary.crash_count}
                        </Text>
                      </View>
                    </>
                  );
                })()}
              </View>
            </View>

            {/* Recent Logs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                🔵 Recent Logs ({logs.length})
              </Text>
              {logs.length > 0 ? (
                <FlatList
                  data={logs}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View style={styles.logItem}>
                      <Text style={styles.logTimestamp}>
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </Text>
                      <Text
                        style={[
                          styles.logLevel,
                          {
                            color:
                              item.level === 'error'
                                ? '#ef4444'
                                : item.level === 'warning'
                                ? '#f59e0b'
                                : '#3b82f6',
                          },
                        ]}
                      >
                        {item.level.toUpperCase()}
                      </Text>
                      <Text style={styles.logCategory}>[{item.category}]</Text>
                      <Text style={styles.logMessage}>{item.message}</Text>
                    </View>
                  )}
                  keyExtractor={item => item.id}
                />
              ) : (
                <Text style={styles.emptyText}>No logs yet</Text>
              )}
            </View>

            {/* Crash Reports */}
            {crashReports.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💥 Crash Reports</Text>
                {crashReports.map((report: any) => (
                  <View key={report.id} style={styles.crashItem}>
                    <Text style={styles.crashError}>{report.error}</Text>
                    <Text style={styles.crashTime}>
                      {new Date(report.timestamp).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleExportLogs}
              >
                <Text style={styles.buttonText}>📤 Export Logs</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.dangerButton]}
                onPress={handleClearLogs}
              >
                <Text style={styles.buttonText}>🗑️ Clear Logs</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeTab === 'diagnostics' && (
          <>
            {/* Run Diagnostics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔧 Network Diagnostics</Text>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  running && styles.buttonDisabled,
                ]}
                onPress={handleRunDiagnostics}
                disabled={running}
              >
                <Text style={styles.buttonText}>
                  {running ? '⏳ Running...' : '▶️ Run Diagnostics'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Results */}
            {diagnostics && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📡 Results</Text>
                  <View style={styles.diagnosticsCard}>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Overall Quality:</Text>
                      <Text
                        style={[
                          styles.resultValue,
                          {
                            color:
                              diagnostics.overall_quality === 'excellent'
                                ? '#10b981'
                                : diagnostics.overall_quality === 'good'
                                ? '#3b82f6'
                                : diagnostics.overall_quality === 'fair'
                                ? '#f59e0b'
                                : diagnostics.overall_quality === 'poor'
                                ? '#ef4444'
                                : '#9ca3af',
                          },
                        ]}
                      >
                        {diagnostics.overall_quality.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>GunDB Status:</Text>
                      <Text
                        style={[
                          styles.resultValue,
                          {
                            color: diagnostics.gun_db_connected
                              ? '#10b981'
                              : '#ef4444',
                          },
                        ]}
                      >
                        {diagnostics.gun_db_connected ? '✅ Connected' : '❌ Failed'} ({diagnostics.gun_db_latency}ms)
                      </Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>WebRTC/STUN:</Text>
                      <Text
                        style={[
                          styles.resultValue,
                          {
                            color: diagnostics.webrtc_available
                              ? '#10b981'
                              : '#ef4444',
                          },
                        ]}
                      >
                        {diagnostics.webrtc_available ? '✅ Available' : '❌ Failed'} ({diagnostics.stun_latency}ms)
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Recommendations */}
                {diagnostics.recommendations.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💡 Recommendations</Text>
                    {diagnostics.recommendations.map(
                      (rec: string, idx: number) => (
                        <View key={idx} style={styles.recommendationItem}>
                          <Text style={styles.recommendationText}>
                            {rec}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={handleExportDiagnostics}
                  >
                    <Text style={styles.buttonText}>📤 Export</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
