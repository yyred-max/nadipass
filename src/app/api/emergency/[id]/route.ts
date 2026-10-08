//  SERVER ONLY  GET /api/emergency/[id]?token=JWT
//  Returns decrypted critical data for a valid 2-hour break-glass session.

import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptArray, decryptField } from '@/lib/crypto';
import { verifySession } from '@/lib/session';
import { BreakGlassReason } from '@/lib/types';

// ---- Helpers ----

// Decrypt a stored encrypted field that was saved as a JSON string
// ({"ciphertext":"...","iv":"...","tag":"..."}). See break-glass route fix.
function decryptStored(stored: string): string {
  const parsed = JSON.parse(stored) as { ciphertext: string; iv: string; tag: string };
  return decryptField(parsed.ciphertext, parsed.iv, parsed.tag);
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'patientId wajib.' }, { status: 400 });
    }

    // 1. Validate session token
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'token wajib.' }, { status: 400 });
    }

    const verified = await verifySession(token);
    if (!verified) {
      return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
    }

    // 2. Verify the token belongs to this patient
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        criticalData: true,
        contacts: { select: { id: true, name: true, phoneEncrypted: true } },
      },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient tidak ditemukan.' }, { status: 404 });
    }

    const criticalData = patient.criticalData;
    if (!criticalData) {
      return NextResponse.json({ error: 'Data kritis belum diisi.' }, { status: 400 });
    }

    // 3. Decrypt emergency fields
    const allergies = decryptArray(criticalData.allergiesEncrypted) ?? [];
    const chronicConditions = decryptArray(criticalData.conditionsEncrypted) ?? [];
    const routineMeds = decryptArray(criticalData.medsEncrypted) ?? [];
    const bloodType = criticalData.bloodType ?? '';
    const notes = criticalData.notesEncrypted
      ? decryptStored(criticalData.notesEncrypted)
      : undefined;

    const emergencyContacts = patient.contacts.map((c) => ({
      name: c.name || '',
      phone: c.phoneEncrypted ? decryptStored(c.phoneEncrypted) : '',
    }));

    return NextResponse.json({
      payload: {
        allergies,
        chronicConditions,
        routineMeds,
        bloodType,
        emergencyContacts,
        notes,
      },
    });
  } catch (err) {
    console.error('[emergency] error:', err);
    return NextResponse.json({ error: 'Gagal membaca data darurat.' }, { status: 500 });
  }
}
