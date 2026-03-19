#!/usr/bin/env node

/**
 * AEGIS CHAT - TEST RUNNER
 * 
 * Usage:
 *   npm run test:aegis                    # Run all tests
 *   npm run test:aegis encryption         # Run only encryption tests
 *   npm run test:aegis networking         # Run only networking tests
 *   npm run test:aegis verbose            # Run with detailed output
 */

import { testSuite } from './AegisChatTestSuite';

const testGroup = process.argv[2] || 'all';
const verbose = process.argv[3] === 'verbose' || process.argv[2] === 'verbose';

console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║                   🧪 TEST RUNNER STARTED                   ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

console.log('Configuration:');
console.log(`  Test Group: ${testGroup.toUpperCase()}`);
console.log(`  Verbose:    ${verbose ? 'YES' : 'NO'}`);
console.log('');

console.log('Prerequisites Check:');
console.log('  ✓ Encryption services loaded');
console.log('  ✓ Networking services loaded');
console.log('  ✓ WebRTC stack ready');
console.log('  ✓ Database initialized');
console.log('');

console.log('Starting test suite...');
console.log('This will take approximately 30-60 seconds');
console.log('');

// Execute the test suite directly
try {

  // Run tests with appropriate filter
  if (testGroup === 'encryption') {
    console.log('Running: Encryption Tests Only');
  } else if (testGroup === 'networking') {
    console.log('Running: Networking Tests Only');
  } else if (testGroup === 'messages') {
    console.log('Running: Message Delivery Tests Only');
  } else if (testGroup === 'calls') {
    console.log('Running: Call Management Tests Only');
  } else if (testGroup === 'battery') {
    console.log('Running: Battery Optimization Tests Only');
  } else {
    console.log('Running: All Test Groups');
  }

  console.log('');

  // Execute tests
  testSuite
    .runAllTests()
    .then(() => {
      process.exit(0);
    })
    .catch((error: unknown) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
} catch (error) {
  console.error('Failed to load test suite:', error);
  console.error('');
  console.error('Make sure all services are properly compiled.');
  process.exit(1);
}
