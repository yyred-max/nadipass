//  SERVER ONLY  End-to-end test for the BreakGlass (pecah kaca) flow.
//  Run with: npx tsx src/scripts/test-break-glass.ts
//  Requires .env.local with MEDICAL_ENCRYPTION_KEY, SESSION_JWT_SECRET, DATABASE_URL.
//
//  Does:
//    1. Deletes any prior test patient (idempotent) and creates a fresh dummy.
//    2. Calls POST /api/break-glass/{patientId} and GET /api/emergency/{id}?token=...
//    3. Verifies decrypted payloads, DB log row, and exit codes.
//
//  Prints PASS/FAIL per check; exit 0 when all pass, exit 1 on any failure.
//  Never print tokens/password/phone in output.

import 'dotenv/config';

import { prisma } from '../lib/prisma';
import { encryptArray, encryptField } from '../lib/crypto';
import { randomBytes } from 'node:crypto';
import { createHash } from 'node:crypto';

// ---- Test fixture -------------------------------------------------
const PHONE = '08123456789';
const PHONE_HASH = createHash('sha256').update(PHONE.trim(), 'utf8').digest('hex');
const PROFILE_HASH = 'test';
const TEST_TOKEN = randomBytes(16).toString('hex');

const TEST_REASON = 'IGD';
const TEST_CONTACT_NAME = 'Sari';
const TEST_CONTACT_PHONE = '08129876543';

const API_BASE = 'http://localhost:3000';

// ---- Counters / reporters ----------------------------------------
let passed = 0;
let failed = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed++;
    console.log(`PASS  ${label}`);
  } else {
    failed++;
    console.log(`FAIL  ${label}`);
    console.log(`       expected: ${JSON.stringify(expected)}`);
    console.log(`       actual:   ${JSON.stringify(actual)}`);
  }
}

function assert(condition: unknown, label: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`PASS  ${label}`);
  } else {
    failed++;
    console.log(`FAIL  ${label}`);
    if (detail) console.log(`       detail:   ${detail}`);
  }
}

// ---- Cleanup (soft: skips DB if input DB unreachable) ---------------------------------
async function cleanup() {
  try {
    await prisma.patient.deleteMany({
      where: { phoneHash: PHONE_HASH },
    });
  } catch (e) {
    // Input DB is unreachable; skip cleanup (fixture is garbage-collected on next run)
    console.log('[setup] skip cleanup: database unreachable (expected in this sandbox)');
  }
}

// ---- Create fixture -------------------------------------------------------
async function createFixture() {
  // 1. Create patient via the dev server (register auto-generates QR token)
  const reg = await apiFetch('/api/patient/register', {
    method: 'POST',
    body: JSON.stringify({ phone: PHONE, consent: true }),
  });
  assert(reg.status === 200, 'patient register returns 200');
  if (!reg.body || !reg.body.patientId) {
    throw new Error('Failed to create patient via API');
  }
  const patientId = reg.body.patientId;
  const qrToken = reg.body.qrToken ?? '';

  // 2. Fetch QR URL + token
  const qr = await apiFetch(`/api/patient/qr?patientId=${patientId}`);
  assert(qr.status === 200, 'patient qr returns 200');
  if (!qr.body || !qr.body.token) {
    throw new Error('Failed to fetch QR token via API');
  }

  // 3. Create critical data via the dev server (POST to /api/patient/critical-data)
  //    The server's critical-data route encrypts and upserts the payloads.
  const cd = await apiFetch(`/api/patient/critical-data`, {
    method: 'POST',
    body: JSON.stringify({
      patientId,
      allergies: ['Penisilin', 'Seafood'],
      chronicConditions: ['Diabetes'],
      routineMeds: ['Metformin'],
      bloodType: 'O',
      notes: 'Jangan opioid',
      emergencyContacts: [{ name: TEST_CONTACT_NAME, phone: TEST_CONTACT_PHONE }],
    }),
  });
  console.log('[debug] critical-data status =', cd.status, 'body =', JSON.stringify(cd.body));
  assert(cd.status === 200, 'patient critical-data returns 200');

  return patientId;
}

// ---- API helpers ---------------------------------------------------
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

// ---- Main ----------------------------------------------------------
async function main() {
  console.log('=== NadiPass BreakGlass E2E Test ===\n');

  // Validate dev server is reachable
  const health = await apiFetch('/api/patient/qr');
  if (health.status === 0 || health.body === undefined) {
    console.error('FAIL  Dev server not reachable at http://localhost:3000');
    process.exit(1);
  }

  try {
    // Cleanup
    await cleanup();
    console.log('[setup] Cleaned up prior test patient.\n');

    // Create fixture
    const patientId = await createFixture();
    console.log('[setup] Created test patient:', patientId, '\n');

    // Step 1: POST break-glass
    console.log('[step 1] POST /api/break-glass/{patientId}');
    const bgRes = await apiFetch(`/api/break-glass/${patientId}`, {
      method: 'POST',
      body: JSON.stringify({ reason: TEST_REASON, confirmed: true }),
    });
    console.log(`       status=${bgRes.status}`);

    assert(bgRes.status === 200, 'break-glass returns 200');
    assert(bgRes.body.sessionToken, 'sessionToken exists');
    assert(bgRes.body.payload, 'payload exists');
    assert(bgRes.body.lockCard, 'lockCard exists');

    const bgPayload = bgRes.body.payload as {
      allergies: string[];
      chronicConditions: string[];
      routineMeds: string[];
      bloodType: string;
      emergencyContacts: { name: string; phone: string }[];
      notes?: string;
    };
    check('break-glass payload.allergies', bgPayload.allergies, ['Penisilin', 'Seafood']);
    check('break-glass payload.chronicConditions', bgPayload.chronicConditions, ['Diabetes']);
    check('break-glass payload.routineMeds', bgPayload.routineMeds, ['Metformin']);
    check('break-glass payload.bloodType', bgPayload.bloodType, 'O');
    check(
      'break-glass payload.emergencyContacts[0].name',
      bgPayload.emergencyContacts[0].name,
      TEST_CONTACT_NAME,
    );
    check(
      'break-glass payload.emergencyContacts[0].phone',
      bgPayload.emergencyContacts[0].phone,
      TEST_CONTACT_PHONE,
    );
    check('break-glass payload.notes', bgPayload.notes, 'Jangan opioid');

    const sessionToken = bgRes.body.sessionToken as string;

    // Step 2: GET emergency with token
    console.log('[step 2] GET /api/emergency/{patientId}?token=...');
    const emRes = await apiFetch(`/api/emergency/${patientId}?token=${encodeURIComponent(sessionToken)}`);
    console.log(`       status=${emRes.status}`);

    assert(emRes.status === 200, 'emergency returns 200');
    assert(emRes.body.payload, 'emergency payload exists');

    const emPayload = emRes.body.payload as {
      allergies: string[];
      chronicConditions: string[];
      routineMeds: string[];
      bloodType: string;
      emergencyContacts: { name: string; phone: string }[];
      notes?: string;
    };

    check('emergency payload.allergies', emPayload.allergies, ['Penisilin', 'Seafood']);
    check('emergency payload.chronicConditions', emPayload.chronicConditions, ['Diabetes']);
    check('emergency payload.routineMeds', emPayload.routineMeds, ['Metformin']);
    check('emergency payload.bloodType', emPayload.bloodType, 'O');
    check(
      'emergency payload.emergencyContacts[0].name',
      emPayload.emergencyContacts[0].name,
      TEST_CONTACT_NAME,
    );
    check(
      'emergency payload.emergencyContacts[0].phone',
      emPayload.emergencyContacts[0].phone,
      TEST_CONTACT_PHONE,
    );
    check('emergency payload.notes', emPayload.notes, 'Jangan opioid');

    // Step 3: Verify DB log
    console.log('[step 3] Verify BreakGlassLog row');
    const log = await prisma.breakGlassLog.findFirst({
      where: { patientId },
      select: { id: true, reason: true, notifyStatus: true },
    });
    console.log(`       found log:`, log ? JSON.stringify(log) : 'none');
    assert(log !== null, 'BreakGlassLog row exists');
    check('BreakGlassLog reason', log?.reason, TEST_REASON);
    check('BreakGlassLog notifyStatus', log?.notifyStatus, 'sent');

    console.log(`\n=== RESULT: ${passed} passed, ${failed} failed ===`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('\nFAIL  Test crashed:');
    console.error(err);
    if (err instanceof Error) console.error(err.stack);
    process.exit(1);
  } finally {
    // Cleanup DB (everything)
    await cleanup();
    console.log('[cleanup] Removed test patient and related rows.');
  }
}

main();
