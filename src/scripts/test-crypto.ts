//  SERVER ONLY  Test script for the AES-256-GCM crypto layer (src/lib/crypto.ts).
//  Run with: npx tsx src/scripts/test-crypto.ts
//  Requires MEDICAL_ENCRYPTION_KEY in .env.local.
//
//  Prints a roundtrip: encryptField / decryptField on strings,
//  plus encryptArray / decryptArray on lists, and reports PASS/FAIL.

import 'dotenv/config';

import { decryptArray, decryptField, encryptArray, encryptField } from '../lib/crypto';

let failures = 0;

function assert(condition: unknown, label: string) {
  if (condition) {
    console.log(`PASS  ${label}`);
  } else {
    failures++;
    console.log(`FAIL  ${label}`);
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

const key = process.env.MEDICAL_ENCRYPTION_KEY;
if (!key || !/^[0-9a-fA-F]{64}$/.test(key)) {
  console.error(
    'FAIL: MEDICAL_ENCRYPTION_KEY is not set or is not 64 hex chars. ' +
      'Add it to .env.local and restart.',
  );
  process.exit(1);
}

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    console.log(`PASS  ${label}`);
  } else {
    failures++;
    console.log(`FAIL  ${label}`);
    console.log(`       expected: ${JSON.stringify(expected)}`);
    console.log(`       actual:   ${JSON.stringify(actual)}`);
  }
}

// 1. String roundtrip
const plaintext = 'Pasien NadiPass - allergy response to penicillin';
const encrypted = encryptField(plaintext);
const encryptedObj = encrypted as { ciphertext: string; iv: string; tag: string };

assert(isNonEmptyString(encryptedObj.ciphertext), 'ciphertext is a non-empty string');
assert(isNonEmptyString(encryptedObj.iv), 'iv is a non-empty string');
assert(isNonEmptyString(encryptedObj.tag), 'tag is a non-empty string');
check('decryptField roundtrip', decryptField(encrypted.ciphertext, encrypted.iv, encrypted.tag), plaintext);

// 2. Array roundtrip
const list = ['sakit kepala ringan', 'alergi penicillin', 'diabetes tipe 2'];
const encryptedList = encryptArray(list);
check('encryptArray returns JSON string', typeof encryptedList, 'string');
check('decryptArray roundtrip', decryptArray(encryptedList), list);

// 3. Bad input is rejected (authenticated encryption should fail)
try {
  decryptField('invalid-base64!!!', 'invalid-iv', 'invalid-tag');
  console.log('FAIL  decryptField does not throw on garbage input');
  failures++;
} catch {
  console.log('PASS  decryptField throws on malformed ciphertext');
}

console.log(failures === 0 ? '\nALL CRYPTO TESTS PASSED' : `\n${failures} CRYPTO TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
