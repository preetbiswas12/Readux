/**
 * Project Aegis - Signup Screen
 * User creates account and receives 12-word recovery seed
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

interface SignupScreenProps {
  onSignupComplete?: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onSignupComplete }) => {
  const { signup } = useApp();
  const [alias, setAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const [seedCopied, setSeedCopied] = useState(false);
  const [confirmCopy, setConfirmCopy] = useState(false);

  const handleSignup = async () => {
    if (!alias.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    setLoading(true);
    try {
      const { seed } = await signup(alias.trim());
      setSeedPhrase(seed);
      Alert.alert(
        'Account Created!',
        'Your 12-word recovery seed has been generated.\n\n⚠️  Save it safely. This is your only way to recover your account.'
      );
    } catch (error) {
      Alert.alert('Signup Failed', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (seedPhrase) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Your Recovery Seed</Text>
          <Text style={styles.warning}>
            ⚠️  Keep this seed safe. Anyone with this seed can access your account.
          </Text>

          <View style={styles.seedBox}>
            <Text style={styles.seedText}>{seedPhrase}</Text>
          </View>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => {
              // In real app: use Clipboard API
              setSeedCopied(true);
              setTimeout(() => setSeedCopied(false), 2000);
            }}
          >
            <Text style={styles.buttonText}>
              {seedCopied ? '✓ Copied!' : 'Copy to Clipboard'}
            </Text>
          </TouchableOpacity>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, confirmCopy && styles.checkboxChecked]}
              onPress={() => setConfirmCopy(!confirmCopy)}
            >
              {confirmCopy && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              I have saved my recovery seed in a safe place
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.continueButton, !confirmCopy && styles.buttonDisabled]}
            disabled={!confirmCopy}
            onPress={() => {
              setSeedPhrase(null);
              onSignupComplete?.();
            }}
          >
            <Text style={styles.buttonText}>Continue to Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.label}>Username (e.g., @alice)</Text>
        <TextInput
          style={styles.input}
          placeholder="Your username"
          value={alias}
          onChangeText={setAlias}
          editable={!loading}
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.signupButton, loading && styles.buttonDisabled]}
          disabled={loading}
          onPress={handleSignup}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.info}>
          You will receive a 12-word recovery seed.
        </Text>
      </View>
    </View>
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
    marginBottom: 20,
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
  signupButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    fontSize: 13,
    color: '#666',
    marginTop: 20,
    lineHeight: 20,
  },
  warning: {
    fontSize: 14,
    color: '#FF6B6B',
    marginBottom: 16,
    fontWeight: '500',
  },
  seedBox: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FFB84D',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  seedText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#333',
    fontFamily: 'Menlo',
  },
  copyButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});
