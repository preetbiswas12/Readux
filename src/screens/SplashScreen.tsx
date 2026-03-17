/**
 * Project Aegis - Splash Screen
 * Initial loading screen during app startup
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export const SplashScreen: React.FC = () => {
  // Splash screen is shown while app initializes

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>⚡ Aegis Chat</Text>
      <Text style={styles.subtitle}>Initializing P2P Network...</Text>
      <ActivityIndicator size="large" color="#007AFF" style={styles.spinner} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  spinner: {
    marginTop: 20,
  },
});
