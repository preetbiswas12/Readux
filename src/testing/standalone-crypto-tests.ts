#!/usr/bin/env node

/**
 * AEGIS CHAT - STANDALONE CRYPTO TESTS
 * 
 * These tests run in Node.js WITHOUT React Native dependencies
 * Tests pure cryptographic functions and algorithms
 * 
 * Usage:
 *   npx tsx src/testing/standalone-crypto-tests.ts
 */

import crypto from 'crypto';

interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  duration: number;
  message: string;
}

const results: TestResult[] = [];

// Helper: Run individual test
async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const startTime = performance.now();
  try {
    await testFn();
    const duration = Math.round(performance.now() - startTime);
    results.push({ name, status: 'pass', duration, message: 'OK' });
    console.log(`  ✅ ${name}`);
    console.log(`     Duration: ${duration}ms`);
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    results.push({
      name,
      status: 'fail',
      duration,
      message: String(error)
    });
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error}`);
  }
}

// Helper: HKDF-SHA256 implementation
function hkdf(
  ikm: Buffer,
  salt: Buffer = Buffer.alloc(32),
  info: Buffer = Buffer.alloc(0),
  length: number = 32
): Buffer {
  const hash = 'sha256';
  const hashLen = 32;

  // Extract
  const prk = crypto.createHmac(hash, salt).update(ikm).digest();

  // Expand
  let t: Buffer = Buffer.alloc(0);
  let okm: Buffer = Buffer.alloc(0);
  const iterations = Math.ceil(length / hashLen);

  for (let i = 0; i < iterations; i++) {
    const input = Buffer.concat([t, info, Buffer.from([i + 1])]);
    const digest = crypto.createHmac(hash, prk).update(input).digest();
    t = Buffer.from(digest);
    okm = Buffer.concat([okm, t]);
  }

  return okm.subarray(0, length);
}

// Test Suite
async function runTests(): Promise<void> {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        🔐 AEGIS STANDALONE CRYPTO TESTS (Node.js)          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  // Test 1: Random Key Generation
  console.log('1️⃣  KEY GENERATION TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await runTest('Generate 256-bit random key', async () => {
    const key = crypto.randomBytes(32);
    if (key.length !== 32) throw new Error('Wrong key length');
    if (!Buffer.isBuffer(key)) throw new Error('Not a buffer');
  });

  await runTest('Generate 96-bit random nonce', async () => {
    const nonce = crypto.randomBytes(12);
    if (nonce.length !== 12) throw new Error('Wrong nonce length');
  });

  await runTest('Generate 32 different random values', async () => {
    const values = new Set<string>();
    for (let i = 0; i < 32; i++) {
      const val = crypto.randomBytes(16).toString('hex');
      values.add(val);
    }
    if (values.size !== 32) throw new Error('Collision detected!');
  });

  console.log('');

  // Test 2: HKDF Key Derivation
  console.log('2️⃣  HKDF-SHA256 KEY DERIVATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await runTest('Derive 96-byte key material', async () => {
    const secret = crypto.randomBytes(32);
    const derived = hkdf(secret, Buffer.alloc(32), Buffer.from('test'), 96);
    if (derived.length !== 96) throw new Error('Wrong derived length');
  });

  await runTest('HKDF deterministic output', async () => {
    const secret = Buffer.from('fixed-secret-123456789012345678');
    const salt = Buffer.from('fixed-salt-1234567890123456789012');
    const info = Buffer.from('test-context');

    const out1 = hkdf(secret, salt, info, 32);
    const out2 = hkdf(secret, salt, info, 32);

    if (!out1.equals(out2)) throw new Error('Output not deterministic');
  });

  await runTest('HKDF different contexts produce different keys', async () => {
    const secret = crypto.randomBytes(32);
    const key1 = hkdf(secret, Buffer.alloc(32), Buffer.from('ctx1'), 32);
    const key2 = hkdf(secret, Buffer.alloc(32), Buffer.from('ctx2'), 32);
    if (key1.equals(key2)) throw new Error('Keys should differ with different context');
  });

  console.log('');

  // Test 3: AES-256-GCM Encryption
  console.log('3️⃣  AES-256-GCM ENCRYPTION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await runTest('Encrypt message with AES-256-GCM', async () => {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);
    const plaintext = 'Hello, encrypted world!';
    const aad = Buffer.from('additional-data');

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(aad);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    if (authTag.length !== 16) throw new Error('Invalid auth tag size');
    if (encrypted.length === 0) throw new Error('Encryption failed');
  });

  await runTest('Decrypt AES-256-GCM ciphertext', async () => {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);
    const plaintext = 'Secret message for decryption test';
    const aad = Buffer.from('additional-data');

    // Encrypt
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(aad);
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    // Decrypt
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(aad);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    if (decrypted !== plaintext) throw new Error('Decryption mismatch');
  });

  await runTest('Reject tampered AES-256-GCM ciphertext', async () => {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);
    const plaintext = 'Important encrypted data';
    const aad = Buffer.from('additional-data');

    // Encrypt
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(aad);
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    let authTag = cipher.getAuthTag();

    // Tamper with ciphertext
    const tamperedCiphertext = (
      parseInt(ciphertext.substring(0, 2), 16) ^ 0xff
    )
      .toString(16)
      .padStart(2, '0') + ciphertext.substring(2);

    // Try to decrypt
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(aad);
    decipher.setAuthTag(authTag);

    try {
      decipher.update(tamperedCiphertext, 'hex', 'utf8');
      decipher.final('utf8');
      throw new Error('Should have rejected tampered data');
    } catch (e) {
      if ((e as Error).message === 'Should have rejected tampered data') {
        throw e;
      }
      // Correctly rejected
    }
  });

  console.log('');

  // Test 4: HMAC-SHA256
  console.log('4️⃣  HMAC-SHA256 AUTHENTICATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await runTest('Generate HMAC-SHA256 tag', async () => {
    const key = crypto.randomBytes(32);
    const message = Buffer.from('message-to-authenticate');
    const tag = crypto.createHmac('sha256', key).update(message).digest();
    if (tag.length !== 32) throw new Error('Wrong tag length');
  });

  await runTest('HMAC deterministic for same input', async () => {
    const key = Buffer.from('fixed-key-123456789012345678901234');
    const message = Buffer.from('fixed-message');
    const tag1 = crypto.createHmac('sha256', key).update(message).digest();
    const tag2 = crypto.createHmac('sha256', key).update(message).digest();
    if (!tag1.equals(tag2)) throw new Error('HMAC not deterministic');
  });

  await runTest('Different messages produce different HMACs', async () => {
    const key = crypto.randomBytes(32);
    const tag1 = crypto.createHmac('sha256', key).update('msg1').digest();
    const tag2 = crypto.createHmac('sha256', key).update('msg2').digest();
    if (tag1.equals(tag2)) throw new Error('Should produce different tags');
  });

  console.log('');

  // Test 5: ECDH Key Agreement (Curve25519)
  console.log('5️⃣  ELLIPTIC CURVE KEY EXCHANGE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await runTest('Generate Ed25519 keypair', async () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    if (!publicKey || !privateKey) throw new Error('Failed to generate keypair');
  });

  await runTest('Sign and verify with Ed25519', async () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    const message = Buffer.from('message-to-sign');
    const signature = crypto.sign(null, message, privateKey);
    const verified = crypto.verify(null, message, publicKey, signature);
    if (!verified) throw new Error('Signature verification failed');
  });

  await runTest('Reject tampered signature', async () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    const message = Buffer.from('original-message');
    const signature = crypto.sign(null, message, privateKey);

    // Tamper with signature
    const tamperedSig = Buffer.from(signature);
    tamperedSig[0] = tamperedSig[0] ^ 0xff;

    const verified = crypto.verify(null, message, publicKey, tamperedSig);
    if (verified) throw new Error('Should have rejected tampered signature');
  });

  console.log('');

  // Summary
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Total Tests:  ${results.length}`);
  console.log(`  ✅ Passed:     ${passed}`);
  console.log(`  ❌ Failed:     ${failed}`);
  console.log(`  ⏱️  Total Time: ${totalTime}ms`);
  console.log('');

  if (failed === 0) {
    console.log('  ✨ ALL TESTS PASSED ✨');
  } else {
    console.log(`  ⚠️  ${failed} test(s) failed`);
    process.exit(1);
  }

  console.log('');
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
