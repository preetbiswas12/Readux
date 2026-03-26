# ⚡ QUICK TEST REFERENCE CARD

## 🚀 TL;DR - Just Run Tests

### Fastest Command (Copy & Paste)
```bash
cd AegisChat && npm run test:aegis
```

**You'll see:**
- ✅ Green checkmarks for passing tests
- ❌ Red X's for failures
- ⏳ Progress indicator
- Final summary with 100% or failed tests

**Wait time:** ~35 seconds total

---

## 📋 All Commands

| What | Command | Time | Output |
|------|---------|------|--------|
| **All Tests** | `npm run test:aegis` | 35s | All 35 tests |
| **Encryption** | `npm run test:aegis encryption` | 5s | 7 tests |
| **Network** | `npm run test:aegis networking` | 25s | 7 tests |
| **Messages** | `npm run test:aegis messages` | 3s | 7 tests |
| **Calls** | `npm run test:aegis calls` | 4s | 7 tests |
| **Battery** | `npm run test:aegis battery` | 2s | 7 tests |
| **Verbose** | `npm run test:aegis verbose` | 35s | Max detail |
| **Watch** | `npm run test:aegis watch` | ∞ | Auto re-run |

---

## 🎯 Step-by-Step (Ultra Simple)

### 1. Open Terminal
Press CTRL+` (backtick) in VS Code

### 2. Copy This
```bash
cd AegisChat && npm run test:aegis
```

### 3. Paste & Press Enter
Tests start immediately

### 4. Watch Results Stream
Real-time output appears on screen

### 5. Wait for Summary
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

---

## 🔴 If Tests FAIL

### What to do:
1. Wait for summary
2. Find ❌ marked tests
3. Read error message
4. Fix the issue
5. Re-run: `npm run test:aegis`

### Common Failures:

**Error: E2EEncryptionService not found**
- Fix: `npm install`
- Then: `npm run build`
- Then: `npm run test:aegis`

**Error: Network timeout**
- Fix: Check internet: `ping google.com`
- Try: `npm run test:aegis encryption` (skip network tests)

**Error: WebRTC not available**
- Expected on emulator ✓ (not a failure)
- Try on real device

---

## 🟢 If Tests PASS

### Deployment Ready! ✨

1. **iOS Users:**
   - Good for TestFlight upload
   
2. **Android Users:**
   - Good for Play Store submission
   
3. **Already Deployed:**
   - Monitor for issues
   - Collect real-world data

---

## 📊 Live Monitoring Example

**What you'll see in terminal:**

```
✅ 1.1: Double Ratchet Session Init           [████████░░░░░░░░░░ 40%]
     Duration: 87ms
     Status: INITIALIZED ✓

✅ 1.2: Message Encryption Roundtrip
     Duration: 42ms
     Decryption matches: ✓

✅ 1.3: Perfect Forward Secrecy
     Duration: 76ms
     Keys rotate: ✓

⏳ 2.1: Network Profile Detection             [Probing your network...]
     Duration: 1524ms...
     Testing IPv6 connectivity...
     Testing IPv4 connectivity...
     Analyzing CG-NAT...

✅ 2.1: Network Profile Detection
     Duration: 3421ms
     IPv6: YES (42ms) ✓
     IPv4: YES (78ms) ✓
     CG-NAT: NO ✓
     Strategy: ipv6 ✓

[More tests continue...]

═══════════════════════════════════════════════════════════════
                    📊 FINAL SUMMARY
═══════════════════════════════════════════════════════════════

✅ PASSED: 35/35 (100%)
⏱️  DURATION: 34.2 seconds
✨ STATUS: READY FOR PRODUCTION
```

---

## 🎓 Understanding the Output

### ✅ = Test Passed
- All assertions succeeded
- No errors
- Test complete

### ❌ = Test Failed
- Assertion failed
- Error thrown
- See error message below

### ⏳ = Test Running
- In progress
- Be patient (up to 30 seconds for network tests)
- Shows current operation

### ⏭️ = Test Skipped
- Not run (usually: feature not available)
- Example: WebRTC on emulator
- Not a failure

---

## 💡 Pro Tips

### Tip 1: Save Results to File
```bash
npm run test:aegis > my-test-results.txt
```
Then open `my-test-results.txt` to review

### Tip 2: Run Fastest Tests First
```bash
npm run test:aegis encryption   # 5 seconds
npm run test:aegis messages     # 3 seconds
npm run test:aegis battery      # 2 seconds
```
(Skip slow network tests if in hurry)

### Tip 3: Compare Multiple Runs
```bash
npm run test:aegis > run1.txt
# Make code changes...
npm run test:aegis > run2.txt
diff run1.txt run2.txt
```

### Tip 4: Verbose Output for Debugging
```bash
npm run test:aegis verbose
```
Shows MUCH more detail about what's happening

### Tip 5: Watch Mode for Development
```bash
npm run test:aegis watch
```
Tests re-run automatically when you save files

---

## ❓ Frequently Asked

**Q: Can I run tests on my phone?**  
A: Not directly. Tests need dev environment. But app works on real devices.

**Q: Why are network tests so slow (25s)?**  
A: They test REAL network (IPv6, CG-NAT, etc). Has to probe actual connectivity.

**Q: Can I run tests without internet?**  
A: Most work offline. Network tests will skip/timeout.

**Q: Do tests require real device?**  
A: No, work on emulator/simulator. WebRTC tests will be skipped.

**Q: How often should I run tests?**  
A: Before each deploy. Also after major code changes.

**Q: Can I run tests in CI/CD?**  
A: Yes! GitHub Actions / GitLab CI ready.

---

## 🚨 Decision Tree

```
Did tests pass?
│
├─ YES → ✨ READY TO DEPLOY
│         - Upload to App Store
│         - Upload to Play Store
│         - Proceed with release
│
└─ NO → 🔧 FIX AND RETRY
         1. Read error message
         2. Find the problem
         3. Fix in code
         4. Re-run tests
         5. If still failing:
            - Check error message again
            - Google the error
            - Check documentation
            - Ask for help
```

---

## 📱 Test Your App Live

After tests pass, try the app yourself:

1. **Open App**
2. **Send test message**
   - Should see ✓ (sent) then ✓✓ (delivered)
3. **Make test call**
   - Video/audio should work
   - Should see encrypted indicator 🔐
4. **Check settings**
   - Battery mode toggle works?
   - Encryption status shows?
   - Network stats visible?

All working? **Ship it!** 🚀

---

**That's it! Run tests with: `npm run test:aegis`**

