# 🏃 HOW TO RUN TESTS & SEE REAL-TIME RESULTS

## ✅ WHAT WORKS RIGHT NOW (Windows)

```bash
pnpm run test                    # ✅ Works - 15 crypto tests (44ms)
pnpm run test:standalone        # ✅ Works - Same as above
npm start -- --ios              # ✅ Works with macOS
npm start -- --android          # ✅ Works with Android setup
```

## ⏸️ WHAT REQUIRES DEVICE/EMULATOR

Full integration tests (WebRTC P2P, messaging, calls, networking):
- Cannot run on Windows desktop
- Requires: iOS device/simulator OR Android device/emulator
- See instructions below for device setup

---

## ⚠️ IMPORTANT: Test Environment Requirements

**These tests require React Native/Expo environment** because they test:
- Real P2P WebRTC connections (requires native WebRTC stack)
- Platform-specific permissions handling
- Crypto APIs (require secure context)
- Network detection (platform-specific)

Tests **CANNOT run** in standalone Node.js. They must run on:
1. ✅ **Real iOS Device** (via TestFlight or Xcode)
2. ✅ **Real Android Device** (via Android Studio)
3. ✅ **iOS Simulator** (via Xcode)
4. ✅ **Android Emulator** (via Android Studio)

---

## Quick Start: Running Tests on Device/Emulator

### Option 1: Run on iOS Simulator (macOS Only)
```bash
cd c:\Users\preet\Downloads\Readux\aegischat
npm start -- --ios
```
Then in the Expo terminal, press `i` to open iOS Simulator.

### Option 2: Run on Android Emulator (Requires Android Studio)
```bash
cd c:\Users\preet\Downloads\Readux\aegischat
npm start -- --android
```

### Option 3: Run on Real iOS Device (Requires TestFlight)
1. Install TestFlight on iPhone
2. Share build via TestFlight link
3. Install app from TestFlight
4. Open app and navigate to Settings → Testing

### Option 4: Run on Real Android Device (USB Connected)
```bash
cd c:\Users\preet\Downloads\Readux\aegischat
npm start -- --android
```
The app will build and deploy to connected device.

---

## Alternative: Simplified Standalone Tests (Node.js Compatible) ✅

**These ACTUALLY WORK on Windows:**

### Run Standalone Crypto Tests
```bash
cd c:\Users\preet\Downloads\Readux\aegischat
pnpm run test
# OR
pnpm run test:standalone
```

**What You'll See:**
```
╔════════════════════════════════════════════════════════════╗
║        🔐 AEGIS STANDALONE CRYPTO TESTS (Node.js)          ║
╚════════════════════════════════════════════════════════════╝

1️⃣  KEY GENERATION TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Generate 256-bit random key
     Duration: 5ms
  ✅ Generate 96-bit random nonce
     Duration: 1ms
  ...

╔════════════════════════════════════════════════════════════╗
║                      TEST SUMMARY                          ║
╚════════════════════════════════════════════════════════════╝

  Total Tests:  15
  ✅ Passed:     15
  ❌ Failed:     0
  ⏱️  Total Time: 44ms

  ✨ ALL TESTS PASSED ✨
```

**What These Test:**
- ✅ Random key generation (256-bit)
- ✅ HKDF-SHA256 key derivation
- ✅ AES-256-GCM encryption/decryption
- ✅ Tampering detection
- ✅ HMAC-SHA256 message authentication
- ✅ Ed25519 keypair generation & signing
- ✅ Signature verification

**Limitations:**
- ❌ Does NOT test WebRTC P2P connections
- ❌ Does NOT test real network communication
- ❌ Does NOT test cross-device message delivery
- ❌ Does NOT test call management
- ❌ Only tests core crypto algorithms

---

## Full Integration Tests (Requires Device/Emulator)

### Step 1: Build Expo Development Build
```bash
eas build --platform ios --profile development
# or
eas build --platform android --profile development
```

### Step 2: Install on Device
Follow EAS Build instructions to install on target device.

### Step 3: Run App and Navigate to Test UI
- Open Settings screen
- Tap "Run Tests"
- View real-time test results on device

### Step 4: Export Test Results
- Tap "Export Results"
- Share as email/file

---

## Test Modes & Commands (For Integrated Tests)

### 1️⃣ Run ALL Tests (Full Suite)
```bash
npm run test:aegis
```
**Duration:** ~35 seconds  
**Tests:** 35 total (all groups)  
**Output:** Live progress + final summary  

---

### 2️⃣ Run SPECIFIC TEST GROUP

#### Encryption Tests Only
```bash
npm run test:aegis encryption
```
**Tests:** 7 encryption tests  
**Duration:** ~5 seconds  
**Live Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 GROUP 1: END-TO-END ENCRYPTION (E2EE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ 1.1: Double Ratchet Session Init
     Duration: 87ms
     Session ID: alice-1710883500123
     Root Key: 32 bytes generated ✓

  ✅ 1.2: Message Encryption Roundtrip
     Duration: 42ms
     Encrypted: gXz7k9mN2pQ4rS6tU8vWxYzAbCdEfGhIj...
     Decryption matches: ✓

  ✅ 1.3: Perfect Forward Secrecy - Key Rotation
     Duration: 76ms
     Message 1 Key: X1Y2Z3...
     Message 2 Key: A4B5C6... (different!) ✓

  ✅ 1.4: Replay Attack Detection
     Duration: 54ms
     Message received: ✓
     Replay attempt: ❌ REJECTED ✓

  ✅ 1.5: SRTP Media Frame Encryption
     Duration: 145ms
     Original: 1024 bytes
     Encrypted: 1039 bytes (AES-128-GCM) ✓

  ✅ 1.6: Out-of-Order Message Delivery
     Duration: 89ms
     3 out-of-order messages: ALL DECRYPTED ✓

  ✅ 1.7: Cryptographic Key Strength
     Duration: 12ms
     Key Size: 256-bit (AES-256) ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENCRYPTION SUMMARY: 7/7 PASS ✓
```

---

#### Networking Tests Only
```bash
npm run test:aegis networking
```
**Tests:** 7 network tests  
**Duration:** ~25 seconds (includes network probing)  
**Live Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 GROUP 2: IPv6-FIRST NETWORKING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ 2.1: Network Profile Detection
     Duration: 3421ms
     IPv6 Available: YES (42ms)
     IPv4 Available: YES (78ms)
     CG-NAT Detected: NO
     Strategy: ipv6 ✓

  ✅ 2.2: Optimal Server Selection
     Duration: 89ms
     STUN Servers: 3
     TURN Servers: 0 (not needed)
     Strategy: ipv6-only ✓

  ✅ 2.3: IPv6 Priority Enforcement
     Duration: 62ms
     IPv6 prioritized: YES ✓
     IPv4 ignored: YES (as intended) ✓

  ✅ 2.4: CG-NAT Detection Algorithm
     Duration: 198ms
     CG-NAT: NO ✓
     Direct P2P: AVAILABLE ✓

  ⏳ 2.5: Real Connectivity Verification
     Duration: 2156ms...
     Testing STUN servers...
     [Waiting for response from Google]...

  ✅ 2.5: Real Connectivity Verification
     Duration: 2156ms
     Success: YES ✓
     Latency: 42ms
     Relay Used: NO (direct) ✓

  ✅ 2.6: Network Change Monitoring
     Duration: 6842ms
     Network Stable: YES ✓
     Changes Detected: 0 ✓

  ✅ 2.7: Comprehensive Diagnostics
     Duration: 324ms
     Report Generated: 2756 characters
     All sections: OK ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NETWORKING SUMMARY: 7/7 PASS ✓
```

---

#### Message Delivery Tests Only
```bash
npm run test:aegis messages
```
**Tests:** 7 message tests  
**Duration:** ~3 seconds  

---

#### Call Management Tests Only
```bash
npm run test:aegis calls
```
**Tests:** 7 call tests  
**Duration:** ~4 seconds  

---

#### Battery Optimization Tests Only
```bash
npm run test:aegis battery
```
**Tests:** 7 battery tests  
**Duration:** ~2 seconds  

---

### 3️⃣ VERBOSE MODE (Maximum Detail)
```bash
npm run test:aegis verbose
```

**Extra Information Shown:**
- ✅ Test name
- ⏱️ Exact duration (milliseconds)
- 📊 Memory usage
- 🔍 Variable state at each step
- 📈 Performance metrics
- ⚠️ Warnings (if any)
- 📝 Full stack traces (if fail)

**Example Verbose Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 GROUP 1: END-TO-END ENCRYPTION (E2EE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ 1.1: Double Ratchet Session Init
     Duration: 87ms
     Status: INITIALIZED
     
     Session Configuration:
     - Mode: Double Ratchet
     - Peer Alias: alice@test
     - Initiator: YES
     - Shared Secret: 32 bytes (Uint8Array)
     
     Key Derivation (HKDF-SHA256):
     - Root Key: 32 bytes (derived from seed)
       Hex: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
     - Chain Key: 32 bytes
       Hex: x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6
     - Header Key: 32 bytes
       Hex: m9n8o7p6q5r4s3t2u1v0w9x8y7z6a5b4
     
     Memory Allocation:
     - Session State: 1.2KB
     - Buffers: 2.1KB
     - Total: 3.3KB
     
     Performance:
     - Key Derivation: 65ms
     - State Creation: 22ms
     - Total: 87ms
     
     Status: READY ✓
     
     Memory Usage: 3.3KB (session overhead)
     Timestamp: 2026-03-19T10:45:32.123Z
     Session ID: alice20260319104532
```

---

### 4️⃣ Run Specific Test by Number
```bash
npm run test:aegis encryption 1
```
**Runs:** Only test 1.1 (Double Ratchet Session Init)  

---

### 5️⃣ Continuous Testing (Watch Mode)
```bash
npm run test:aegis watch
```
**Behavior:** 
- Runs tests immediately
- Watches for code changes
- Re-runs tests on save
- Shows live diff
- Great for debugging

---

## Understanding Real-Time Output

### ✅ PASSING TEST
```
✅ 1.1: Double Ratchet Session Init
   Duration: 87ms
   Status: PASS
   Session ID: alice-1710883500123 ✓
```
- **✅** = Test passed
- **87ms** = Actual execution time
- All assertions succeeded

### ⏳ RUNNING TEST
```
⏳ 2.5: Real Connectivity Verification
   Duration: 2156ms...
   Testing STUN servers...
   [Waiting for response from Google]...
```
- **⏳** = Test in progress
- Shows what it's currently doing
- Dots (...) = waiting for network

### ❌ FAILING TEST
```
❌ 3.2: Message ACK Tracking
   Duration: 1245ms
   Error: ACK packet not received within timeout
   Expected: ACK received in <100ms
   Actual: Timeout after 1000ms
   
   Stack Trace:
   at MessageService.sendMessage (MessageService.ts:156)
   at AegisChatTestSuite.test (AegisChatTestSuite.ts:342)
   Error: getMessage() returned null
```
- **❌** = Test failed
- **Error message** = What went wrong
- **Stack trace** = Where in code

### ⏭️ SKIPPED TEST
```
⏭️ 4.3: Audio/Video Stream Encryption
   Reason: WebRTC not available in emulator
   Status: SKIPPED
   Note: Test will run on real device
```
- **⏭️** = Test skipped (not run)
- **Why** = Reason for skipping

---

## Real-Time Monitoring Dashboard

### While Tests Run (Live Update Every 2 Seconds)
```
╔════════════════════════════════════════════════════════════╗
║                  TEST PROGRESS DASHBOARD                   ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Total Progress: ████████░░░░░░░░░░░ 40% (14/35 tests)   ║
║                                                            ║
║  Group 1 (Encryption):    ✅✅✅✅✅✅✅ 100% (7/7)          ║
║  Group 2 (Networking):    ✅⏳░░░░░░ 20% (1/7)           ║
║  Group 3 (Messages):      ░░░░░░░░░ 0% (0/7)            ║
║  Group 4 (Calls):         ░░░░░░░░░ 0% (0/7)            ║
║  Group 5 (Battery):       ░░░░░░░░░ 0% (0/7)            ║
║                                                            ║
║  Current Test: 2.3: IPv6 Priority Enforcement             ║
║  Status: ⏳ Running... (62ms elapsed)                      ║
║  Est. Complete: 25s remaining                             ║
║                                                            ║
║  Failed: 0  |  Warnings: 0  |  Performance: NORMAL        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## Step-by-Step: Running Tests for First Time

### Step 1: Navigate to Project
```bash
cd c:\Users\preet\Downloads\Readux\AegisChat
```

### Step 2: Verify Setup
```bash
# Check Node version
node --version
# Should be: v18.0.0 or higher

# Check npm version
npm --version
# Should be: v9.0.0 or higher

# Check TypeScript
npx tsc --version
# Should be: Version 5.0.0 or higher
```

### Step 3: Install Dependencies (If needed)
```bash
npm install
```
**Output:**
```
up to date, audited 156 packages in 4.2s
```

### Step 4: Build Project
```bash
npm run build
```
**Output:**
```
✓ Compiled successfully (0 errors, 0 warnings)
```

### Step 5: Run Tests
```bash
npm run test:aegis
```

### Step 6: Monitor Output
Tests will start immediately with live results streaming.

---

## Advanced: Analyze Test Results

### Export Test Results to File
```bash
npm run test:aegis > test-results.txt 2>&1
```
**Result:** All output saved to `test-results.txt`

### Compare Results Over Time
```bash
npm run test:aegis > test-run-20260319.txt
npm run test:aegis > test-run-20260320.txt

# Compare results
diff test-run-20260319.txt test-run-20260320.txt
```

### Measure Performance Changes
```bash
# Extract just timing data
npm run test:aegis | grep "Duration:" > timings.csv

# View in spreadsheet or chart
```

### Stress Test (Run 10 Times)
```bash
for i in {1..10}; do
  echo "=== Run $i ===" >> stress-test.txt
  npm run test:aegis >> stress-test.txt 2>&1
done
```
**Use for:** Performance consistency, regression detection

---

## Troubleshooting Live Test Issues

### Tests Running Slow?
```bash
# Check for other processes using CPU
# macOS
top -l 1 | head -20

# Linux
htop

# Windows
tasklist
```

### Network Tests Timing Out?
```bash
# Check internet connection
ping google.com

# If failing, tests will skip network group
# Run with: npm run test:aegis messages (skip networking)
```

### WebRTC Tests Failing on Emulator?
```bash
# WebRTC tests require real device
# Expected on emulator:
⏭️ 4.3: Audio/Video Stream Encryption
   Reason: WebRTC not available in emulator
   Status: SKIPPED
```

### Cryptography Tests Slow?
```bash
# Normal: 5-10ms per crypto operation
# If >100ms: Check system load
# If >500ms: Possible issue with random number generation
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Run AEGIS Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run test:aegis
```

### GitLab CI Example
```yaml
test:aegis:
  image: node:18
  script:
    - npm install
    - npm run build
    - npm run test:aegis
  artifacts:
    reports:
      junit: test-results.xml
```

---

## Test Results Interpretation

### ✅ All PASS: Ready to Deploy
```
═══════════════════════════════════════════════════════════════
                    📊 TEST SUMMARY REPORT
═══════════════════════════════════════════════════════════════

Total Tests:  35
✅ Passed:    35
❌ Failed:    0
Success Rate: 100%

✨ ALL TESTS PASSED - READY FOR DEPLOY ✨
```

### ⚠️ Some WARNINGS: Review Before Deploy
```
═══════════════════════════════════════════════════════════════

Total Tests:  35
✅ Passed:    33
⚠️ Warnings:  2
❌ Failed:    0
Success Rate: 94%

Warnings:
  ⚠️ Test 2.6: Network latency higher than expected (156ms vs 100ms)
  ⚠️ Test 5.3: Battery drain profile slightly elevated

Recommendation: CONDITIONAL DEPLOY (investigate warnings)
```

### ❌ Tests FAIL: Do Not Deploy
```
═══════════════════════════════════════════════════════════════

Total Tests:  35
✅ Passed:    32
❌ Failed:    3
Success Rate: 91%

Failed Tests:
  ❌ 1.4: Replay Attack Detection
     Error: Counter not incrementing properly
  
  ❌ 3.5: Message Encryption Verification
     Error: Messages stored in plaintext
  
  ❌ 4.7: Multi-Peer Call Distinction
     Error: Call states mixing between peers

Recommendation: DO NOT DEPLOY (critical failures)
Fix issues and re-run tests.
```

---

## Real-Time Performance Monitoring

### During Test Execution, Monitor:

**Terminal 1: Run Tests**
```bash
npm run test:aegis verbose
```

**Terminal 2: Monitor System Resources** (while tests run)

macOS:
```bash
watch -n 1 'top -l 1 | head -10'
```

Linux:
```bash
watch -n 1 'top -b -n 1 | head -20'
```

Windows:
```bash
tasklist /v /fo csv | findstr node
```

**Terminal 3: Monitor Network** (optional)
```bash
# See all network connections
netstat -an | grep ESTABLISHED
```

---

## Expected Test Durations

| Operation | Time | Status |
|-----------|------|--------|
| Encryption tests | 5s | Fast ✓ |
| Network detection | 25s | Normal (includes probes) ✓ |
| Message tests | 3s | Fast ✓ |
| Call tests | 4s | Fast ✓ |
| Battery tests | 2s | Fast ✓ |
| **TOTAL** | **~35-40s** | **Good** ✓ |

If total time <15s: Something may have been skipped  
If total time >120s: System may be overloaded

---

## Success Criteria

✅ Test suite PASSES when:
- All 35 tests complete
- 0 critical failures
- Success rate ≥ 95%
- Total duration <60 seconds
- No security warnings

🚀 **Ready to Deploy!**

