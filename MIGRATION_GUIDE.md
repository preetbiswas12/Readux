# React Native CLI Migration Guide - AegisChat
## Complete Expo Removal & Android Setup with Kotlin

**Date:** March 26, 2026  
**Status:** ✅ Complete Migration Package Ready  
**Platform:** Windows with VS Code  
**Target:** Pure React Native CLI + Kotlin Android + USB ADB Deploy

---

## 📋 SUMMARY OF CHANGES

Your project has been fully migrated from Expo to React Native CLI. Here are the key changes:

### Files Updated:
- ✅ `package.json` - Removed all Expo packages, added Firebase & standard libraries
- ✅ `metro.config.js` - Changed to use `@react-native/metro-config` (not Expo)
- ✅ `babel.config.js` - Created with standard React Native presets
- ✅ `index.js` - Created as new entry point
- ✅ `tsconfig.json` - Updated to standard React Native setup
- ✅ `android/app/build.gradle` - Removed Expo-specific build configurations
- ✅ `android/gradle.properties` - Added React Native standard SDK versions
- ✅ `android/app/src/main/AndroidManifest.xml` - Cleaned up Expo metadata
- ✅ `android/app/src/main/java/com/preetb12/aegischat/MainActivity.kt` - Kotlin (React Native CLI)
- ✅ `android/app/src/main/java/com/preetb12/aegischat/MainApplication.kt` - Kotlin (React Native CLI)
- ✅ `src/App.tsx` - Removed Expo imports (expo-status-bar), uses standard React Native

### Files to Delete:
```bash
rm -rf .expo/
rm app.json
rm eas.json
rm expo-env.d.ts
```

---

## 🚀 QUICK START (5 Minutes)

### Step 1: Install Android SDK & Tools

**On Windows:**

1. **Download & Install Android Studio:**
   - https://developer.android.com/studio
   - Run the installer and complete setup
   - Choose "Standard Installation"

2. **Verify Android SDK location:**
   - Android Studio will install SDK at: `C:\Users\<YourUsername>\AppData\Local\Android\sdk`
   - This is your `ANDROID_SDK_ROOT`

3. **Add to Environment Variables (Windows):**
   ```
   Variable Name: ANDROID_SDK_ROOT
   Variable Value: C:\Users\<YourUsername>\AppData\Local\Android\sdk
   ```
   - Or if you installed elsewhere, find it in Android Studio:
     - Android Studio → File → Settings → Appearance & Behavior → System Settings → Android SDK
     - Look at the top of the window for "Android SDK Location"

4. **Verify Installation:**
   ```bash
   adb --version
   ```
   - If adb is not found, add to PATH:
     - Add `C:\Users\<YourUsername>\AppData\Local\Android\sdk\platform-tools` to System PATH

### Step 2: Clean & Install Dependencies

```bash
cd c:\Users\preet\Downloads\Readux\AegisChat

# Clean old Expo cache
rm -rf node_modules
rm pnpm-lock.yaml

# Install fresh dependencies
npm install
```

### Step 3: Verify Setup

```bash
npx react-native doctor
```

Expected output should show:
- ✅ Node.js
- ✅ npm
- ✅ Android SDK
- ✅ Android NDK
- ✅ JDK

If anything is missing, the doctor will tell you how to fix it.

---

## 📱 DEPLOY TO ANDROID DEVICE (USB)

### Prerequisites:

1. **Connect your Android phone to Windows via USB**
2. **Enable USB Debugging on your phone:**
   - Developer Options: Settings → About Phone → Tap "Build Number" 7 times
   - Then: Settings → Developer Options → Enable "USB Debugging"
3. **Grant USB Permission on your phone** (prompt will appear when connecting)
4. **Verify device is recognized:**
   ```bash
   adb devices
   ```
   Expected output:
   ```
   List of attached devices
   XXXXXXX    device
   ```

### Deploy & Run App:

```bash
# Start Metro dev server (in terminal 1)
npm start

# In terminal 2, deploy to connected device
npm run android
```

The app will:
1. Build the debug APK
2. Install it on your connected device
3. Start the app automatically
4. Connect to Metro bundler for hot reload

**View Logs:**
```bash
npm run logcat-filter
```

---

## 🔧 COMMON COMMANDS

```bash
# Development
npm start                  # Start Metro bundler
npm start -- --reset      # Reset Metro cache

# Building
npm run android           # Build & deploy to device
npm run build-android     # Build debug APK (no deploy)
npm run build-android-release  # Build release APK

# Debugging
adb devices              # List connected devices
npm run logcat           # View full Android logs
npm run logcat-filter    # View only React Native logs

# Cleaning
npm run clean            # Remove node_modules and Gradle cache
npm run clean-build      # Clean and reinstall everything
```

---

## 📦 FIREBASE CLOUD MESSAGING SETUP (FCM)

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Create a Project"
3. Name: `AegisChat`
4. Accept all default options
5. Click "Create Project"

### Step 2: Add Android App to Firebase

1. In Firebase Console, click the Android icon
2. Package name: `com.aegix.readux`
3. Debug signing certificate SHA-1: 
   ```bash
   # On Windows, find it with:
   keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
   ```
   - Copy the SHA1 fingerprint
4. Click "Register App"
5. Download `google-services.json`
6. Place it at: `android/app/google-services.json`

### Step 3: Add Firebase Dependencies to Project

Already added to `package.json`:
```json
"@react-native-firebase/app": "^20.0.0",
"@react-native-firebase/messaging": "^20.0.0"
```

### Step 4: Update android/build.gradle

Add to `android/build.gradle` (already mostly done, verify):

```gradle
buildscript {
  dependencies {
    classpath 'com.google.gms:google-services:4.3.15'
  }
}
```

### Step 5: Update android/app/build.gradle

Add at the bottom:

```gradle
apply plugin: 'com.google.gms.google-services'
```

### Step 6: Create Firebase Notification Service (Kotlin)

Create: `android/app/src/main/java/com/preetb12/aegischat/FirebaseMessagingService.kt`

```kotlin
package com.aegix.readux

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class FirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        // Handle notification here
        if (remoteMessage.notification != null) {
            showNotification(
                remoteMessage.notification!!.title ?: "AegisChat",
                remoteMessage.notification!!.body ?: "New message"
            )
        }
    }

    override fun onNewToken(token: String) {
        // Save token to your backend or Firebase Database
        // This is called when a new token is generated
        android.util.Log.d("FCM", "New token: $token")
    }

    private fun showNotification(title: String, message: String) {
        createNotificationChannel()
        
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

        val notification = NotificationCompat.Builder(this, "aegischat_channel")
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(1, notification)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "aegischat_channel",
                "AegisChat Notifications",
                NotificationManager.IMPORTANCE_HIGH
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }
}
```

### Step 7: Register Service in AndroidManifest.xml

Add inside `<application>` tag in `android/app/src/main/AndroidManifest.xml`:

```xml
<service
    android:name=".FirebaseMessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
```

### Step 8: Get FCM Token in React Native

Create a service: `src/services/FCMService.ts`

```typescript
import messaging from '@react-native-firebase/messaging';

class FCMService {
  private static instance: FCMService;

  private constructor() {
    this.initialize();
  }

  static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  private initialize() {
    // Get initial FCM token
    messaging()
      .getToken()
      .then(token => {
        console.log('FCM Token:', token);
        // Send to your backend/server
      });

    // Listen for new token
    messaging().onTokenRefresh(token => {
      console.log('FCM Token Refreshed:', token);
      // Update on your backend
    });

    // Listen for messages when app is in foreground
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground Message:', remoteMessage);
      // Handle notification in app
    });
  }
}

export default FCMService.getInstance();
```

---

## 🔐 IMPORTANT: Permission Handling

### Add to src/App.tsx

```typescript
import { PermissionsAndroid, Platform } from 'react-native';

// Add this in useEffect before app renders
useEffect(() => {
  if (Platform.OS === 'android') {
    requestAndroidPermissions();
  }
}, []);

async function requestAndroidPermissions() {
  try {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);
  } catch (err) {
    console.warn(err);
  }
}
```

---

## 🐛 TROUBLESHOOTING

### Problem: "adb: command not found"

**Solution:**
1. Find adb location: `C:\Users\<YourUsername>\AppData\Local\Android\sdk\platform-tools`
2. Add to PATH:
   - Right-click "This PC" → Properties
   - Advanced system settings → Environment Variables
   - Add the platform-tools path to PATH

### Problem: "ANDROID_SDK_ROOT not set"

**Solution:**
```bash
# Set environment variable (Windows Command Prompt)
set ANDROID_SDK_ROOT=C:\Users\<YourUsername>\AppData\Local\Android\sdk

# Or permanently in system variables (as shown above)
```

### Problem: "Gradle build failed"

**Solution:**
```bash
npm run clean
npm run build-android
```

### Problem: "Metro bundler won't start"

**Solution:**
```bash
npm start -- --reset
```

### Problem: "App crashes on startup"

**Check logs:**
```bash
npm run logcat-filter
```

Look for red error messages and fix accordingly.

### Problem: "Cannot find development server"

**Solution:**
1. Make sure Metro is running: `npm start`
2. On your phone, open developer menu: Shake device or Menu button
3. Tap "Settings" → "Debug server host & port for device"
4. Enter: `<YOUR_MACHINE_IP>:8081`
   - Find your IP: `ipconfig` (Windows) → Look for "IPv4 Address"

---

## 📁 PROJECT STRUCTURE (After Migration)

```
AegisChat/
├── index.js                          # ✅ Entry point (NEW)
├── babel.config.js                   # ✅ NEW
├── metro.config.js                   # ✅ Updated
├── package.json                      # ✅ Updated (no Expo)
├── tsconfig.json                     # ✅ Updated
├── android/
│   ├── app/
│   │   ├── build.gradle              # ✅ Updated
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml   # ✅ Updated
│   │   │   └── java/com/preetb12/aegischat/
│   │   │       ├── MainActivity.kt   # ✅ Updated
│   │   │       ├── MainApplication.kt  # ✅ Updated
│   │   │       └── FirebaseMessagingService.kt  # ← Add this
│   ├── gradle.properties             # ✅ Updated
│   └── build.gradle                  # ✅ OK
├── src/
│   ├── App.tsx                       # ✅ Updated (no Expo)
│   └── ... (other source files)
├── .expo/                            # ❌ DELETE
├── app.json                          # ❌ DELETE
├── eas.json                          # ❌ DELETE
└── expo-env.d.ts                      # ❌ DELETE
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Android SDK installed and ANDROID_SDK_ROOT set
- [ ] `android/app/google-services.json` downloaded (if using Firebase)
- [ ] `npm install` completed successfully
- [ ] `npx react-native doctor` shows all green
- [ ] USB device connected and visible in `adb devices`
- [ ] Can run `npm run android` without errors
- [ ] App appears on phone and connects to Metro
- [ ] Hot reload works (edit and see changes)
- [ ] No red error screens on device

---

## 🔄 NEXT STEPS

### Immediate:
1. Run through "QUICK START" section above
2. Deploy to device using `npm run android`
3. Verify app runs without errors

### Firebase (if needed):
1. Follow "FIREBASE CLOUD MESSAGING SETUP" section
2. Test push notifications

### Development:
1. Use `npm start` for Metro bundler
2. Use `npm run logcat-filter` to debug
3. Make code changes - they'll hot reload on device

### Production Build:
1. Generate signing key:
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
   ```
2. Update `android/app/build.gradle` with signing config
3. Build: `npm run build-android-release`

---

## 📚 RESOURCES

- [React Native Documentation](https://reactnative.dev)
- [Android Development Docs](https://developer.android.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Kotlin Documentation](https://kotlinlang.org/docs)
- [Gradle Documentation](https://gradle.org/features/)

---

## ⚠️ IMPORTANT NOTES

1. **No More Expo:** The project no longer uses Expo. It's 100% pure React Native CLI.
2. **Kotlin Native Code:** You can now add custom Kotlin/Java modules easily.
3. **USB Debugging:** Required for development - must be enabled on phone.
4. **Android Studio Optional:** You don't need Android Studio open during development, just VS Code.
5. **Metro Bundler:** Must be running (`npm start`) for the app to reload when you make changes.
6. **Package Name:** `com.aegix.readux` - Change in AndroidManifest.xml if needed in future.

---

**Migration Complete! 🎉**
Your project is now a standard React Native CLI project with full Android support.
