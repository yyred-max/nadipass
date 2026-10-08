//  SERVER ONLY  Diagnostic script: inspect how encrypted fields are stored in DB.
//  Run with: npx tsx src/scripts/inspect-encrypted.ts
//  Prints length + first 50 chars of each encrypted field, and whether it is valid JSON.

import 'dotenv/config';

import { prisma } from '../lib/prisma';
import crypto from 'node:crypto';

// ---- Find the latest patient that has criticalData and contacts -----------------
async function main() {
  console.log('=== NadiPass Encrypted-Field Inspector ===\n');

  // Find a patient with criticalData populated (any ID)
  const patient = await prisma.patient.findFirst({
    where: { criticalData: { not: null }, contacts: { some: { not: null } } },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });

  if (!patient) {
    console.log('No patient found with criticalData + contacts.');
    process.exit(1);
  }

  const { id } = patient;
  console.log('Patient ID:', id);
  console.log('Created:', patient.createdAt);

  // ---- CriticalData ----------------------------------------------------------
  const criticalData = await prisma.criticalData.findUnique({
    where: { patientId: id },
    select: {
      allergiesEncrypted: true,
      conditionsEncrypted: true,
      medsEncrypted: true,
      notesEncrypted: true,
      bloodType: true,
    },
  });

  console.log('\n--- CriticalData ---');
  if (!criticalData) {
    console.log('No criticalData for this patient.');
  } else {
    for (const [key, value] of Object.entries(criticalData)) {
      if (value === null || value === undefined) {
        console.log(`${key}: null`);
        continue;
      }
      const str = String(value);
      const isJson = isValidJson(str);
      let pretty;
      try {
        const parsed = JSON.parse(str) as { ciphertext?: string; iv?: string; tag?: string; [k: string]: unknown };
        pretty =
          typeof parsed.ciphertext === 'string' && typeof parsed.iv === 'string' && typeof parsed.tag === 'string'
            ? `ciphertext=${parsed.ciphertext.slice(0, 12)}… iv=${parsed.iv.slice(0, 6)}… tag=${parsed.tag.slice(0, 6)}…`
            : typeof parsed === 'object'
              ? `object keys=${Object.keys(parsed).join(',')}`
              : str;
      } catch {
        pretty = str;
      }
      console.log(`${key}: ${str.length} chars | starts: ${str.slice(0, 50)}… | validJson=${isJson} | ${pretty}`);
    }
  }

  // ---- EmergencyContacts ------------------------------------------------------
  const contacts = await prisma.emergencyContact.findMany({
    where: { patientId: id },
    select: { name: true, phoneEncrypted: true },
  });

  console.log('\n--- EmergencyContacts ---');
  for (const c of contacts) {
    const str = String(c.phoneEncrypted);
    const isJson = isValidJson(str);
    let pretty;
    try {
      const parsed = JSON.parse(str) as { ciphertext?: string; iv?: string; tag?: string; [k: string]: unknown };
      pretty =
        typeof parsed.ciphertext === 'string' && typeof parsed.iv === 'string' && typeof parsed.tag === 'string'
          ? `ciphertext=${parsed.ciphertext.slice(0, 12)}… iv=${parsed.iv.slice(0, 6)}… tag=${parsed.tag.slice(0, 6)}…`
          : typeof parsed === 'object'
            ? `object keys=${Object.keys(parsed).join(',')}`
            : str;
    } catch {
      pretty = str;
    }
    console.log(`${c.name}: ${str.length} chars | starts: ${str.slice(0, 50)}… | validJson=${isJson} | ${pretty}`);
  }

  // ---- Decrypt test -----------------------------------------------------------
  console.log('\n--- Decrypt test (mock) ---');
  console.log('(decryptField needs MEDICAL_ENCRYPTION_KEY; not run here. Inspect structure above.)');
  console.log('\n=== Done ===');
}

function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
