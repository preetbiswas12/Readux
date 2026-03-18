# GitHub Actions - APK Build Workflows

This directory contains GitHub Actions workflows for building, testing, and releasing AegisChat APKs.

## Workflows

### 1. `build-apk.yml` - Main Build Workflow
Automatically builds debug and release APKs on every push to `main` or `develop` branches, and on pull requests.

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**Output Artifacts:**
- `app-debug.apk` - Debug APK (7 days retention)
- `app-release-unsigned.apk` - Unsigned release APK (7 days retention)
- `build-logs` - Build output (on failure, 3 days retention)

### 2. `type-check.yml` - Code Quality
Runs TypeScript type checking and ESLint on every push and pull request.

**Checks:**
- TypeScript compilation (`tsc --noEmit`)
- ESLint linting

### 3. `release-build.yml` - Production Release
Builds, signs, and creates GitHub releases for production deployments.

**Triggers:**
- Manual workflow dispatch with build type selection
- Push with version tags (e.g., `v1.0.0`)

**Features:**
- Builds unsigned APK
- Signs with keystore
- Verifies signature
- Creates GitHub release
- Uploads signed APK

---

## Setup Instructions

### GitHub Secrets Configuration

To use the `release-build.yml` workflow, configure these secrets in your GitHub repository:

#### Step 1: Create Signing Keystore

```bash
# Generate a keystore (run once, keep safe)
keytool -genkey -v -keystore aegis.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias aegis-key

# Encode to Base64
base64 -i aegis.keystore > keystore.b64
# On Windows PowerShell:
# [Convert]::ToBase64String([IO.File]::ReadAllBytes("aegis.keystore")) | Set-Clipboard
```

#### Step 2: Add GitHub Secrets

Go to: **Repository Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Value |
|------------|-------|
| `SIGNING_KEY` | Base64-encoded keystore file content (from above) |
| `KEY_ALIAS` | Keystore alias (e.g., `aegis-key`) |
| `KEY_STORE_PASSWORD` | Keystore password (the one you set above) |
| `KEY_PASSWORD` | Key password (same as keystore password) |

#### Example (PowerShell):

```powershell
# Copy the Base64 content to clipboard
[Convert]::ToBase64String([IO.File]::ReadAllBytes("aegis.keystore")) | Set-Clipboard

# Then paste in GitHub Secrets UI as SIGNING_KEY
```

### Step 3: Verify Secrets Are Set

```bash
# List secrets (values are masked)
gh secret list -R preetbiswas12/Readux
```

---

## GitHub Actions Usage

### Manual APK Build

1. Go to: **Actions → Build Android APK → Run workflow**
2. Click **Run workflow**
3. Wait for build to complete (~10-15 minutes)
4. Download APK from artifacts

### Automatic Builds

APK builds automatically on every push to `main` or `develop`:
1. Commit code
2. Push to GitHub
3. Go to **Actions** tab to view build progress
4. Download APK from artifacts when complete

### Create Release with Signed APK

**Method 1: Manual Dispatch**
1. Go to **Actions → Build & Sign APK for Release → Run workflow**
2. Select build type: `release`
3. Click **Run workflow**
4. Artifacts available immediately after build

**Method 2: Tag Release (Automatic)**
```bash
# Create and push version tag
git tag v1.0.0
git push origin v1.0.0

# GitHub will automatically:
# - Build the APK
# - Sign it
# - Create a GitHub Release
# - Attach signed APK
```

---

## Workflow Status Badges

Add these badges to your README:

```markdown
![Build APK](https://github.com/preetbiswas12/Readux/actions/workflows/build-apk.yml/badge.svg)
![Type Check](https://github.com/preetbiswas12/Readux/actions/workflows/type-check.yml/badge.svg)
![Release Build](https://github.com/preetbiswas12/Readux/actions/workflows/release-build.yml/badge.svg)
```

---

## Installation from GitHub Actions

### Download and Install APK

```bash
# 1. Download APK from GitHub Actions artifacts
# Go to Actions → Latest run → Artifacts → app-debug (or app-release)

# 2. Connect Android device
adb devices

# 3. Install APK
adb install -r app-debug.apk
# or
adb install -r AegisChat-v1.0.0-signed.apk

# 4. Verify installation
adb shell pm list packages | grep aegis
```

---

## Environment Variables

The workflows use these environment variables:

| Variable | Purpose |
|----------|---------|
| `GRADLE_OPTS` | JVM memory settings for Gradle |
| `ANDROID_HOME` | Android SDK path (auto-set by setup-android) |
| `JAVA_HOME` | Java home path (auto-set by setup-java) |

---

## Troubleshooting

### Build Fails: "Gradle not found"
- Gradle wrapper is automatically used: `./gradlew`
- Check `android/gradle/wrapper/gradle-wrapper.properties`

### Build Fails: "Android SDK not found"
- `setup-android` action installs necessary SDK components
- Check workflow logs for SDK setup details

### Signing Fails: "Invalid keystore"
- Verify `SIGNING_KEY` secret is valid Base64
- Check keystore was created correctly
- Ensure alias and passwords match exactly

### Build Timeout
- Increase timeout by editing workflow job timeout
- GitHub default: 6 hours (usually sufficient)

---

## Best Practices

1. **Keep Secrets Safe**
   - Never commit keystore files
   - Store keystore securely (git-ignored)
   - Use strong passwords

2. **Automate Releases**
   - Use semantic versioning: `v1.0.0`
   - Push tags to auto-build releases
   - GitHub handles signing automatically

3. **Monitor Builds**
   - Check Actions tab regularly
   - Review build logs for issues
   - Download artifacts before they expire

4. **Clean Up Artifacts**
   - Set appropriate retention days
   - Remove old artifacts manually if needed
   - Archive important releases locally

---

## Advanced Setup

### Enable Firebase Test Lab Testing

To add Firebase Test Lab testing, add this job to workflows:

```yaml
test-firebase:
  runs-on: ubuntu-latest
  needs: build
  steps:
    - uses: actions/checkout@v4
    - name: Setup gcloud
      uses: google-github-actions/setup-gcloud@v1
      with:
        service_account_key: ${{ secrets.FIREBASE_TEST_LAB_KEY }}
    - name: Run tests on Firebase
      run: |
        gcloud firebase test android run \
          --app=android/app/build/outputs/apk/debug/app-debug.apk \
          --test=android/app/build/outputs/apk/androidTest/debug/*.apk
```

### Deploy to Google Play Store

To auto-deploy to Play Store, add this job:

```yaml
deploy-play-store:
  runs-on: ubuntu-latest
  needs: build-signed
  if: startsWith(github.ref, 'refs/tags/')
  steps:
    - uses: r0adkll/upload-google-play@v1
      with:
        serviceAccountJsonPlainText: ${{ secrets.PLAY_STORE_KEY }}
        packageName: com.aegischat
        releaseFiles: AegisChat-*.apk
        track: production
```

---

## Workflow Performance

Expected build times:
- **Debug APK**: ~8-10 minutes
- **Release APK (unsigned)**: ~10-12 minutes
- **Release APK (signed)**: ~12-15 minutes
- **Type checking**: ~2-3 minutes

Total GitHub Actions free tier: **2,000 minutes/month**
AegisChat builds: ~48 minutes × 5 builds = 240 minutes/month

---

## Future Enhancements

- [ ] Add Firebase Test Lab integration
- [ ] Auto-deploy to Google Play Store
- [ ] Add SonarQube code quality scanning
- [ ] Create iOS IPA workflows
- [ ] Add performance benchmarking

---

**Last Updated:** March 18, 2026  
**Status:** ✅ All workflows functional
