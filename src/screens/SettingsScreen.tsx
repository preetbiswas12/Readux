/**
 * Project Aegis - Settings Screen (Battery Mode Toggle)
 * Allows users to choose between Battery Saver and AlwaysOnline modes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import BackgroundService from '../services/BackgroundService';

export const SettingsScreen: React.FC = () => {
  const { appState } = useApp();
  const [batteryMode, setBatteryMode] = useState<'saver' | 'always'>('saver');
  const [backgroundActive, setBackgroundActive] = useState(false);

  useEffect(() => {
    // Initialize with current settings
    setBatteryMode(BackgroundService.getBatteryMode());
    setBackgroundActive(BackgroundService.isActive());
  }, []);

  const handleBatteryModeToggle = () => {
    const newMode = batteryMode === 'saver' ? 'always' : 'saver';
    BackgroundService.setBatteryMode(newMode);
    setBatteryMode(newMode);
  };

  const getCheckIntervalText = (): string => {
    const mode = batteryMode;
    if (mode === 'always') {
      return 'Always online (uses foreground service)';
    } else {
      return 'Check every 15 minutes (Battery Saver)';
    }
  };

  const getBatteryImpact = (): string => {
    if (batteryMode === 'always') {
      return '⚠️ High battery drain - for active users';
    } else {
      return '✅ Low battery drain - check periodically';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Battery Mode Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Battery Mode</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <Text style={styles.settingName}>
                  {batteryMode === 'always' ? '🔋 AlwaysOnline' : '⚡ Battery Saver'}
                </Text>
                <Text style={styles.settingDescription}>{getCheckIntervalText()}</Text>
              </View>
              <Switch
                value={batteryMode === 'always'}
                onValueChange={handleBatteryModeToggle}
                trackColor={{ false: '#767577', true: '#81c784' }}
                thumbColor={batteryMode === 'always' ? '#4caf50' : '#f91155'}
              />
            </View>

            <View style={styles.batteryInfo}>
              <Text style={styles.batteryImpactText}>{getBatteryImpact()}</Text>
            </View>

            {batteryMode === 'always' && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  📲 AlwaysOnline uses a foreground service (required by Android). You'll see a
                  permanent notification while the app is running.
                </Text>
              </View>
            )}

            {batteryMode === 'saver' && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  ✅ Battery Saver checks for messages every 15 minutes when the app is closed.
                  Messages will arrive with a slight delay.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Background Service Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔊 Background Listening</Text>

          <View style={styles.settingCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: backgroundActive ? '#4caf50' : '#9ca3af' },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {backgroundActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>User:</Text>
              <Text style={styles.statusValue}>@{appState.currentUser?.alias || 'unknown'}</Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>

          <View style={styles.settingCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App:</Text>
              <Text style={styles.infoValue}>Project Aegis</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version:</Text>
              <Text style={styles.infoValue}>0.0.1 (Phase 4)</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Protocol:</Text>
              <Text style={styles.infoValue}>WebRTC + GunDB DHT</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Encryption:</Text>
              <Text style={styles.infoValue}>E2EE (Double Ratchet)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
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
});

export default SettingsScreen;
