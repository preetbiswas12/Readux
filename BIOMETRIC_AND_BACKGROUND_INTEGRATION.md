# Project Aegis - Android Integration Guide

## Features Now Available in App

### 1. Biometric Authentication (Fingerprint/Face ID)

#### Initialize on App Launch

```typescript
// src/App.tsx
import BiometricAuthService from './services/BiometricAuthService';

useEffect(() => {
  // Initialize biometric service
  BiometricAuthService.initialize().then(() => {
    console.log('Biometric service ready');
  });
}, []);
```

#### Enable Fingerprint Unlock

```typescript
// src/screens/SettingsScreen.tsx
import BiometricAuthService from '../services/BiometricAuthService';

const enableBiometricUnlock = async () => {
  try {
    // User must authenticate first (fingerprint prompt)
    await BiometricAuthService.enableBiometricUnlock();
    Alert.alert('Success', 'Fingerprint unlock enabled');
    setIsBiometricEnabled(true);
  } catch (error) {
    Alert.alert('Error', `Failed: ${error.message}`);
  }
};
```

#### Authenticate User

```typescript
// src/screens/LoginScreen.tsx
const authenticateWithBiometric = async () => {
  if (!BiometricAuthService.isBiometricAvailable()) {
    Alert.alert('Not Available', 'This device does not support biometric auth');
    return;
  }

  const result = await BiometricAuthService.authenticate();
  
  if (result.success) {
    // User authenticated, proceed to app
    navigateToApp();
  } else {
    Alert.alert('Authentication Failed', result.error);
  }
};
```

#### Protect Sensitive Operations

```typescript
// src/screens/ChatDetailScreen.tsx
const sendCriticalMessage = async (message: string) => {
  // Require biometric confirmation for critical action
  const authorized = await BiometricAuthService.authenticateCritical(
    'Confirm sending this message'
  );

  if (!authorized) {
    Alert.alert('Not Authorised', 'Biometric confirmation required');
    return;
  }

  // Send message
  await MessageService.sendMessage(
    currentUser.alias,
    peerAlias,
    message,
    peerPublicKey
  );
};
```

#### Check Biometric Status

```typescript
const checkBiometricStatus = async () => {
  const available = BiometricAuthService.isBiometricAvailable();
  const enabled = await BiometricAuthService.isBiometricUnlockEnabled();
  const types = await BiometricAuthService.getAvailableBiometrics();

  console.log('Available:', available);
  console.log('Enabled:', enabled);
  console.log('Types:', types); // e.g., ['FINGERPRINT', 'FACE']
};
```

---

### 2. Foreground Service (Background P2P Listening)

#### Start Background Service

```typescript
// src/services/BatteryModeService.ts
import AndroidForegroundService from './AndroidForegroundService';

async startForegroundService() {
  if (this.mode === 'always') {
    try {
      await AndroidForegroundService.startForegroundService({
        title: 'AegisChat',
        message: 'Listening for messages...',
        channelId: 'aegis_p2p_channel',
        notificationId: 1,
      });
      console.log('✓ Foreground service started');
    } catch (error) {
      console.error('Failed to start service:', error);
    }
  }
}
```

#### Update Notification

```typescript
// When app receives a message in background
const updateNotification = async (peerAlias: string) => {
  await AndroidForegroundService.updateNotification(
    'AegisChat',
    `New message from @${peerAlias}`
  );
};
```

#### Monitor Service Status

```typescript
const checkServiceStatus = async () => {
  const isRunning = await AndroidForegroundService.isServiceRunning();
  
  if (isRunning) {
    console.log('✅ Background service is active');
  } else {
    console.log('⚠️ Background service is stopped');
  }
};
```

#### Stop Service on Logout

```typescript
// src/contexts/AppContext.tsx
const logout = async () => {
  // Stop background service
  await AndroidForegroundService.stopForegroundService();
  
  // Clear user data
  await StorageService.clearUser();
  
  // Navigate to login
  navigateToLogin();
};
```

---

### 3. Permissions Integration

#### Request Runtime Permissions

```typescript
// src/screens/ChatDetailScreen.tsx
import { PermissionsAndroid } from 'react-native';

const requestCameraPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'AegisChat needs access to your camera for video calls',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Camera permission granted');
    }
  } catch (err) {
    console.warn(err);
  }
};

const requestMicrophonePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone Permission',
        message: 'AegisChat needs access to your microphone for calls',
        buttonPositive: 'OK',
      }
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Microphone permission granted');
    }
  } catch (err) {
    console.warn(err);
  }
};

const requestStoragePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'AegisChat needs access to your storage',
        buttonPositive: 'OK',
      }
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Storage permission granted');
    }
  } catch (err) {
    console.warn(err);
  }
};
```

#### Check Permission Status

```typescript
const checkPermissions = async () => {
  const permissions = {
    camera: await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA),
    microphone: await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO),
    storage: await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE),
    biometric: await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.USE_BIOMETRIC),
  };

  console.log('Permissions:', permissions);
  return permissions;
};
```

---

### 4. Complete Settings Screen Example

```typescript
// src/screens/SettingsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Toggle, Alert } from 'react-native';
import BiometricAuthService from '../services/BiometricAuthService';
import AndroidForegroundService from '../services/AndroidForegroundService';

export function SettingsScreen() {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [serviceRunning, setServiceRunning] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);

  useEffect(() => {
    checkSettings();
  }, []);

  const checkSettings = async () => {
    try {
      // Check biometric
      const available = BiometricAuthService.isBiometricAvailable();
      setBiometricAvailable(available);

      if (available) {
        const enabled = await BiometricAuthService.isBiometricUnlockEnabled();
        setBiometricEnabled(enabled);

        const types = await BiometricAuthService.getAvailableBiometrics();
        setBiometricTypes(types);
      }

      // Check service
      const isRunning = await AndroidForegroundService.isServiceRunning();
      setServiceRunning(isRunning);
    } catch (error) {
      console.error('Error checking settings:', error);
    }
  };

  const toggleBiometric = async () => {
    try {
      if (biometricEnabled) {
        await BiometricAuthService.disableBiometricUnlock();
        setBiometricEnabled(false);
        Alert.alert('Disabled', 'Biometric unlock disabled');
      } else {
        await BiometricAuthService.enableBiometricUnlock();
        setBiometricEnabled(true);
        Alert.alert('Enabled', 'Biometric unlock enabled');
      }
    } catch (error) {
      Alert.alert('Error', `${error.message}`);
    }
  };

  const toggleForegroundService = async () => {
    try {
      if (serviceRunning) {
        await AndroidForegroundService.stopForegroundService();
        setServiceRunning(false);
        Alert.alert('Stopped', 'Background service stopped');
      } else {
        await AndroidForegroundService.startForegroundService({
          title: 'AegisChat',
          message: 'Listening for messages...',
        });
        setServiceRunning(true);
        Alert.alert('Started', 'Background service started');
      }
    } catch (error) {
      Alert.alert('Error', `${error.message}`);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Security Settings
      </Text>

      {/* Biometric Section */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          Biometric Authentication
        </Text>

        {biometricAvailable ? (
          <>
            <Text style={{ marginBottom: 8, color: '#666' }}>
              Available: {biometricTypes.join(', ')}
            </Text>

            <TouchableOpacity
              onPress={toggleBiometric}
              style={{
                padding: 12,
                backgroundColor: biometricEnabled ? '#4CAF50' : '#f0f0f0',
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: biometricEnabled ? 'white' : 'black',
                  fontWeight: '600',
                }}
              >
                {biometricEnabled ? '✓ Enabled' : 'Enable Fingerprint Unlock'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={{ color: '#999' }}>
            Biometric authentication not available on this device
          </Text>
        )}
      </View>

      {/* Background Service Section */}
      <View>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          Background Service
        </Text>

        <Text style={{ marginBottom: 8, color: '#666' }}>
          Status: {serviceRunning ? '🟢 Running' : '🔴 Stopped'}
        </Text>

        <TouchableOpacity
          onPress={toggleForegroundService}
          style={{
            padding: 12,
            backgroundColor: serviceRunning ? '#FF9800' : '#f0f0f0',
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: serviceRunning ? 'white' : 'black',
              fontWeight: '600',
            }}
          >
            {serviceRunning ? 'Stop Background Service' : 'Start Background Service'}
          </Text>
        </TouchableOpacity>

        <Text style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
          {serviceRunning
            ? 'Your device will stay connected to the P2P network even when the app is minimized.'
            : 'App will not receive messages in background until you enable this.'}
        </Text>
      </View>
    </ScrollView>
  );
}
```

---

### 5. Complete App Flow with Biometric

```typescript
// src/App.tsx
import React, { useEffect, useState } from 'react';
import BiometricAuthService from './services/BiometricAuthService';
import { StorageService } from './services/StorageService';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [needsBiometric, setNeedsBiometric] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize biometric service
      await BiometricAuthService.initialize();

      // Check if user was logged in before
      const user = await StorageService.getUser();

      if (user) {
        // Check if biometric unlock is enabled
        const isBioEnabled = await BiometricAuthService.isBiometricUnlockEnabled();

        if (isBioEnabled) {
          // Require biometric auth
          setNeedsBiometric(true);
        } else {
          // Show app
          setIsReady(true);
        }
      } else {
        // Show login screen
        setIsReady(true);
      }
    } catch (error) {
      console.error('App initialization failed:', error);
      setIsReady(true);
    }
  };

  const handleBiometricAuth = async () => {
    const result = await BiometricAuthService.authenticate();

    if (result.success) {
      setNeedsBiometric(false);
      setIsReady(true);
    } else {
      Alert.alert('Authentication Failed', result.error);
    }
  };

  if (!isReady) {
    return <SplashScreen />;
  }

  if (needsBiometric) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ marginBottom: 20, fontSize: 18 }}>
          Unlock with Fingerprint
        </Text>
        <TouchableOpacity
          onPress={handleBiometricAuth}
          style={{
            padding: 12,
            backgroundColor: '#007AFF',
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>
            Authenticate
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <MainApp />;
}
```

---

## Permission Matrix

| Permission | Purpose | Android Level | Request |
|-----------|---------|----------------|---------|
| `CAMERA` | Video calls | API 16+ | Runtime |
| `RECORD_AUDIO` | Audio calls, WebRTC | API 16+ | Runtime |
| `READ_EXTERNAL_STORAGE` | File transfer | API 16+ | Runtime |
| `WRITE_EXTERNAL_STORAGE` | Save files | API 16+ | Runtime |
| `ACCESS_FINE_LOCATION` | NAT type detection | API 16+ | Runtime |
| `USE_BIOMETRIC` | Fingerprint/Face ID | API 28+ | Manifest only |
| `FOREGROUND_SERVICE` | Background listening | API 31+ | Manifest only |
| `WAKE_LOCK` | Keep device awake | API 16+ | Manifest only |
| `MODIFY_AUDIO_SETTINGS` | Control audio | API 16+ | Manifest only |

---

## Testing Checklist

- [ ] Fingerprint authentication works on device
- [ ] Biometric unlock state persists after app restart
- [ ] Background service notification appears
- [ ] Messages arrive while app is minimized
- [ ] Service stops when logging out
- [ ] All permissions requested at runtime
- [ ] No crashes with missing permissions
- [ ] Biometric fallback to PIN works
- [ ] Service survives device sleep/wake

---

## Debugging Tips

```bash
# View detailed logs
adb logcat | grep "AegisChat\|AegisForeground\|Biometric"

# Check running services
adb shell dumpsys activity services

# View foreground service
adb shell cmd notification list_notifications

# Monitor app permissions
adb shell dumpsys package com.aegischat | grep android.permission
```

---

## Next Steps

1. ✅ Download APK (via EAS Build or local gradle)
2. ✅ Install on Android device
3. ✅ Test biometric authentication
4. ✅ Enable background service
5. ✅ Send/receive messages in background
6. ✅ Make calls with P2P encryption
7. Submit to Google Play Store (requires developer account)

Everything is ready to deploy! 🚀
