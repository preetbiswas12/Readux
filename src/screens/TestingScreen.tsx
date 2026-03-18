/**
 * Project Aegis - Testing Screen
 * UI for running and displaying E2E test results
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import E2ETestingService, {
  TestReport,
  TestResult,
  TestStatus,
  TestCategory,
} from '../services/E2ETestingService';

const styles = StyleSheet.create({
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

const getStatusEmoji = (status: TestStatus): string => {
  switch (status) {
    case TestStatus.PASSED:
      return '✅';
    case TestStatus.FAILED:
      return '❌';
    case TestStatus.RUNNING:
      return '⏳';
    case TestStatus.SKIPPED:
      return '⏭️';
    default:
      return '❓';
  }
};

const getCategoryColor = (category: TestCategory): string => {
  switch (category) {
    case TestCategory.CONNECTIVITY:
      return '#007AFF';
    case TestCategory.MEDIA:
      return '#5AC8FA';
    case TestCategory.CODECS:
      return '#34C759';
    case TestCategory.CALLS:
      return '#FF9500';
    case TestCategory.NAT:
      return '#FF3B30';
    default:
      return '#999';
  }
};

type TestingScreenProps = Record<string, never>;

interface TestingScreenState {
  isRunning: boolean;
  currentTest?: string;
  report: TestReport | null;
  selectedTest?: TestResult;
}

export const TestingScreen: React.FC<TestingScreenProps> = () => {
  const [state, setState] = useState<TestingScreenState>({
    isRunning: false,
    report: null,
  });
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Load any previous test results
    const previousReport = E2ETestingService.getCurrentReport();
    if (previousReport) {
      setState((prev) => ({ ...prev, report: previousReport }));
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unsubscribe]);

  const handleQuickTest = useCallback(async () => {
    setState((prev) => ({ ...prev, isRunning: true, currentTest: 'quick' }));

    const unsubFn = E2ETestingService.onTestComplete((result) => {
      setState((prev) => ({
        ...prev,
        currentTest: `${result.name}...`,
      }));
    });
    setUnsubscribe(() => unsubFn);

    try {
      const report = await E2ETestingService.runQuickTest();
      setState((prev) => ({
        ...prev,
        isRunning: false,
        report,
        currentTest: undefined,
      }));

      Alert.alert(
        'Quick Test Complete',
        `${report.passed}/${report.totalTests} tests passed`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Quick test failed:', error);
      Alert.alert('Error', `Quick test failed: ${error}`, [{ text: 'OK' }]);
      setState((prev) => ({
        ...prev,
        isRunning: false,
        currentTest: undefined,
      }));
    }
  }, []);

  const handleFullTest = useCallback(async () => {
    setState((prev) => ({ ...prev, isRunning: true, currentTest: 'full' }));

    const unsubFn = E2ETestingService.onTestComplete((result) => {
      setState((prev) => ({
        ...prev,
        currentTest: `${result.name}...`,
      }));
    });
    setUnsubscribe(() => unsubFn);

    try {
      const report = await E2ETestingService.runFullTestSuite();
      setState((prev) => ({
        ...prev,
        isRunning: false,
        report,
        currentTest: undefined,
      }));

      Alert.alert(
        'Full Test Complete',
        `${report.passed}/${report.totalTests} tests passed (${report.successRate.toFixed(1)}%)`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Full test failed:', error);
      Alert.alert('Error', `Full test failed: ${error}`, [{ text: 'OK' }]);
      setState((prev) => ({
        ...prev,
        isRunning: false,
        currentTest: undefined,
      }));
    }
  }, []);

  const handleClearResults = useCallback(() => {
    Alert.alert(
      'Clear Results?',
      'This will delete all test results. Continue?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Clear',
          onPress: () => {
            E2ETestingService.clearResults();
            setState((prev) => ({
              ...prev,
              report: null,
              selectedTest: undefined,
            }));
          },
          style: 'destructive',
        },
      ]
    );
  }, []);

  const handleExportJSON = useCallback(() => {
    if (!state.report) {
      Alert.alert('No Results', 'Run tests first to export results', [
        { text: 'OK' },
      ]);
      return;
    }

    const json = E2ETestingService.exportReportAsJSON(state.report);
    console.log('📋 Test Report (JSON):\n', json);

    Alert.alert('Export Complete', 'Test report exported to console', [
      { text: 'OK' },
    ]);
  }, [state.report]);

  const handleExportText = useCallback(() => {
    if (!state.report) {
      Alert.alert('No Results', 'Run tests first to export results', [
        { text: 'OK' },
      ]);
      return;
    }

    const text = E2ETestingService.exportReportAsText(state.report);
    console.log('📋 Test Report (Text):\n', text);

    Alert.alert('Export Complete', 'Test report exported to console', [
      { text: 'OK' },
    ]);
  }, [state.report]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>🧪 E2E Testing</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Test Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Suite</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleQuickTest}
              disabled={state.isRunning}
            >
              <Text style={styles.buttonText}>Quick Test</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleFullTest}
              disabled={state.isRunning}
            >
              <Text style={styles.buttonText}>Full Suite</Text>
            </TouchableOpacity>
          </View>

          {state.isRunning && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>
                {state.currentTest || 'Running tests...'}
              </Text>
            </View>
          )}
        </View>

        {/* Test Report Summary */}
        {state.report && !state.isRunning && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary</Text>

              {/* Progress Bar */}
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${state.report.successRate}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Success Rate</Text>
                <Text style={styles.summaryValue}>
                  {state.report.successRate.toFixed(1)}%
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Tests</Text>
                <Text style={styles.summaryValue}>
                  {state.report.totalTests}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>✅ Passed</Text>
                <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                  {state.report.passed}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>❌ Failed</Text>
                <Text style={[styles.summaryValue, { color: '#FF3B30' }]}>
                  {state.report.failed}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>⏭️ Skipped</Text>
                <Text style={[styles.summaryValue, { color: '#999' }]}>
                  {state.report.skipped}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>⏱️ Avg Duration</Text>
                <Text style={styles.summaryValue}>
                  {state.report.averageDuration.toFixed(0)}ms
                </Text>
              </View>
            </View>

            {/* Export & Clear Buttons */}
            <View style={styles.section}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.exportButton]}
                  onPress={handleExportJSON}
                >
                  <Text style={styles.buttonText}>Export JSON</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.exportButton]}
                  onPress={handleExportText}
                >
                  <Text style={styles.buttonText}>Export Text</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.dangerButton]}
                onPress={handleClearResults}
              >
                <Text style={styles.buttonText}>Clear Results</Text>
              </TouchableOpacity>
            </View>

            {/* Test Results List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Results</Text>

              {state.report.results.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No test results available
                  </Text>
                </View>
              ) : (
                state.report.results.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.testListItem}
                    onPress={() => {
                      setState((prev) => ({
                        ...prev,
                        selectedTest:
                          prev.selectedTest?.id === result.id
                            ? undefined
                            : result,
                      }));
                    }}
                  >
                    <View style={styles.testItemRow}>
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 4,
                          }}
                        >
                          <Text style={styles.testItemStatus}>
                            {getStatusEmoji(result.status)}
                          </Text>
                          <Text style={styles.testItemText}>
                            {result.name}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <View
                            style={[
                              styles.categoryBadge,
                              {
                                backgroundColor: getCategoryColor(
                                  result.category
                                ),
                              },
                            ]}
                          >
                            <Text
                              style={{
                                color: '#fff',
                                fontSize: 10,
                                fontWeight: '600',
                              }}
                            >
                              {result.category}
                            </Text>
                          </View>
                          <Text style={styles.testItemDuration}>
                            {result.duration}ms
                          </Text>
                        </View>
                      </View>
                    </View>

                    {state.selectedTest?.id === result.id && (
                      <>
                        {result.details && (
                          <Text
                            style={{
                              fontSize: 12,
                              color: '#666',
                              marginTop: 8,
                            }}
                          >
                            {result.details}
                          </Text>
                        )}
                        {result.error && (
                          <Text style={styles.errorText}>
                            Error: {result.error}
                          </Text>
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        )}

        {!state.report && !state.isRunning && (
          <View style={styles.section}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Run tests to get started
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TestingScreen;
