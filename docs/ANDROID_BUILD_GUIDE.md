# Project Aegis - Android APK Build Guide

## ✅ Setup Complete - All Android Components Ready

This guide walks you through building the Project Aegis APK with:
- ✅ Fingerprint Authentication (Biometric)
- ✅ Foreground Service (Background P2P Listening)
- ✅ All OS-Level Permissions
- ✅ Camera, Microphone, Storage Access

---

## 📋 Prerequisites

```bash
# 1. Install Node.js 18+ and pnpm
node --version    # v18+ recommended
pnpm --version    # 10.15+

# 2. Install Android SDK (via Android Studio or CLI)
# Set ANDROID_HOME environment variable:
# Windows (PowerShell):
$env:ANDROID_HOME = "C:\Users\[YourUsername]\AppData\Local\Android\sdk"

# 3. Install Gradle 8.0+ (included with Android Studio)

# 4. Install Java 11 or higher
java -version     # openjdk 11+
```

---

## 🔧 Build Options

### Option 1: Build via EAS (Easiest - Recommended for First Time)

**Requires:** Expo Account (free at https://expo.dev)

```bash
# 1. Login to Expo
eas login

# 2. Build APK for production
eas build --platform android --profile production

# 3. Download APK when ready (~10-15 minutes)
# APK location: AegisChat-v1.0.0.apk
```

### Option 2: Build Locally (Faster Iteration)

**Requires:** Android SDK, Java 11+, Gradle

```bash
# 1. Generate Expo development build
eas build --platform android --profile development --local

# 2. Or use Gradle directly from android/ folder
cd android
./gradlew :app:assembleRelease

# 3. APK output: android/app/build/outputs/apk/release/app-release.apk
```

### Option 3: Build via React Native CLI

```bash
# 1. Install React Native CLI
npm install -g react-native-cli

# 2. Build APK
cd android
./gradlew assembleRelease

# 3. Find APK in: android/app/build/outputs/apk/release/
```

---

## 📦 Native Components Included

### 1. **Foreground Service** (`AegisForegroundService.kt`)
- Keeps P2P connection alive in background
- Shows persistent notification
- Allows messages to arrive even when app is backgrounded
- Android 8.0+ compatible

### 2. **React Native Native Module** (`AegisForegroundServiceModule.kt`)
- Bridges TypeScript with Android native code
- Manages service lifecycle
- Updates notifications

### 3. **Biometric Authentication** (`BiometricAuthService.ts`)
- Fingerprint unlock
- Face ID support (Pixel 4+)
- PIN fallback
- Critical operation confirmation

### 4. **Permissions** (AndroidManifest.xml)
```xml
✅ INTERNET - P2P communication
✅ CAMERA - Video calls
✅ RECORD_AUDIO - Audio calls & WebRTC
✅ READ/WRITE_EXTERNAL_STORAGE - File transfer
✅ ACCESS_FINE_LOCATION - NAT detection
✅ USE_BIOMETRIC - Fingerprint/Face ID
✅ FOREGROUND_SERVICE - Background listening
✅ WAKE_LOCK - Keep device awake
✅ MODIFY_AUDIO_SETTINGS - Audio control
```

---

## 🚀 Building Step-by-Step (Local Build)

### Step 1: Setup Android Environment

```bash
# Windows PowerShell
$env:ANDROID_HOME = "C:\Users\[YourName]\AppData\Local\Android\sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jre"

# Verify
$env:ANDROID_HOME
java -version
```

### Step 2: Build APK

```bash
cd c:\Users\preet\Downloads\Readux\AegisChat

# Method A: Using Gradle wrapper
cd android
./gradlew :app:assembleRelease

# Method B: Using Expo CLI
eas build --platform android --local --profile production
```

### Step 3: Sign APK (For Production)

```bash
# Create keystore (one time)
keytool -genkey -v -keystore aegis.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias aegis-key

# Sign APK
jarsigner -verbose \
  -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore aegis.keystore \
  android/app/build/outputs/apk/release/app-release.apk \
  aegis-key

# Optimize
zipalign -v 4 \
  android/app/build/outputs/apk/release/app-release.apk \
  AegisChat-signed.apk
```

### Step 4: Install on Device

```bash
# Connect Android device and enable USB debugging
adb devices

# Install APK
adb install -r AegisChat-signed.apk

# Or install directly from build output
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### Step 5: Run App

```bash
# Open app on device
adb shell am start -n com.aegischat/.MainActivity

# Or tap app icon on phone
```

---

## 🔐 Features Now Available

### Biometric Authentication
```typescript
// In your app code
import BiometricAuthService from '../services/BiometricAuthService';

// Enable fingerprint unlock
await BiometricAuthService.enableBiometricUnlock();

// Authenticate user
const result = await BiometricAuthService.authenticate();

// Critical operation confirmation
const authorized = await BiometricAuthService.authenticateCritical(
  'Confirm device pairing'
);
```

### Foreground Service (Background Listening)
```typescript
// In your app code
import AndroidForegroundService from '../services/AndroidForegroundService';

// Start background service
await AndroidForegroundService.startForegroundService({
  title: 'AegisChat',
  message: 'Listening for messages...',
});

// Check if running
const isRunning = await AndroidForegroundService.isServiceRunning();

// Stop service
await AndroidForegroundService.stopForegroundService();
```

---

## 📊 APK Specifications

**Pre-built unsigned APK:**
- Location: `android/app/build/outputs/apk/debug/app-debug.apk`
- Size: ~45-55 MB
- SDK Version: API 26 (Android 8.0) minimum
- Target: API 34 (Android 14)
- Architecture: arm64-v8a, armeabi-v7a

**Signed APK:**
- Location: `AegisChat-signed.apk` (after signing)
- Size: ~50-60 MB (with signature)
- Ready for Google Play Store
- Keystore: `aegis.keystore`

---

## 🐛 Troubleshooting

### Error: "Cannot find Java"
```bash
# Set JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Java\openjdk-11"
java -version
```

### Error: "ANDROID_HOME not set"
```bash
# Set ANDROID_HOME
$env:ANDROID_HOME = "C:\Users\[YourName]\AppData\Local\Android\sdk"
```

### Error: "Build tools not found"
```bash
# Download from Android SDK Manager
# Open: C:\Users\[YourName]\AppData\Local\Android\sdk
# Run: tools/bin/sdkmanager "build-tools;34.0.0"
```

### Error: "Gradle daemon failed"
```bash
cd android
./gradlew clean
./gradlew :app:assembleRelease
```

### Foreground Service Not Starting
- Ensure `FOREGROUND_SERVICE` permission is in manifest ✓
- Check Android version (requires API 26+) ✓
- Verify service is declared in Android manifest ✓

---

## ✅ Verification Checklist

Before submitting to Google Play Store:

- [ ] APK compiles without errors
- [ ] APK installs on Android device
- [ ] App launches successfully
- [ ] Fingerprint unlock works
- [ ] Background service stays alive
- [ ] Permissions are properly requested
- [ ] Messages arrive in background
- [ ] Calls can be initiated/received
- [ ] Camera and microphone work
- [ ] Storage access works
- [ ] No crashes in production build

---

## 📱 Testing on Emulator

```bash
# List available emulators
emulator -list-avds

# Start emulator
emulator -avd Pixel_4_API_31

# Install APK on emulator
adb install android/app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat | grep "AegisChat\|AegisForeground"
```

---

## 🎯 Next Steps

1. **Build APK** using one of the methods above
2. **Test on device** - Install and verify all features
3. **Configure keystore** for production signing
4. **Submit to Google Play Store** (requires developer account)
5. **Monitor crash reports** via Google Play Console

---

## 📞 Support

For issues with:
- **Expo Build**: `eas build --help`
- **React Native**: https://reactnative.dev/docs/android-setup
- **Android Studio**: Help menu in Android Studio
- **Project Aegis**: Check src/services/ for integration

---

## 🔗 Resources

- Android SDK Setup: https://developer.android.com/studio
- EAS Build Docs: https://docs.expo.dev/build/setup/
- Kotlin Guide: https://kotlinlang.org/docs/
- React Native Android: https://reactnative.dev/docs/android-setup

---

**Build Status: ✅ READY FOR COMPILATION**

All native components, permissions, and build configuration are prepared. You're ready to build!
