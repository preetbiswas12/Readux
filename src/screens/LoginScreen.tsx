/**
 * Project Aegis - Login Screen
 * User enters 12-word recovery seed to login
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useApp } from '../contexts/AppContext';

interface LoginScreenProps {
  onLoginComplete?: () => void;
  onSwitchToSignup?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginComplete,
  onSwitchToSignup,
}) => {
  const { login } = useApp();
  const [seedPhrase, setSeedPhrase] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const seed = seedPhrase.trim();

    if (!seed) {
      Alert.alert('Error', 'Please enter your 12-word recovery seed');
      return;
    }

    setLoading(true);
    try {
      await login(seed);
      onLoginComplete?.();
    } catch (error) {
      Alert.alert('Login Failed', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Recover Your Account</Text>
        <Text style={styles.subtitle}>Enter your 12-word recovery seed</Text>

        <Text style={styles.label}>Recovery Seed (space-separated)</Text>
        <TextInput
          style={[styles.input, styles.seedInput]}
          placeholder="word1 word2 word3... word12"
          value={seedPhrase}
          onChangeText={setSeedPhrase}
          editable={!loading}
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          disabled={loading}
          onPress={handleLogin}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.divider}>or</Text>

        <TouchableOpacity
          style={styles.signupLink}
          onPress={onSwitchToSignup}
          disabled={loading}
        >
          <Text style={styles.signupLinkText}>Create New Account</Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Need help?</Text>
          <Text style={styles.infoText}>
            • Your seed is 12 words separated by spaces
            {'\n'}• You should have written it down when you signed up
            {'\n'}• Double-check spelling carefully
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  seedInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: 'Menlo',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 16,
  },
  signupLink: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  signupLinkText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});
