//  SERVER ONLY  POST /api/break-glass/[id]
//  Opens a patient's critical data via break-glass protocol.
//  - Petugas NEVER logs in (no OTP/password).
//  - QR contains ONLY the patient ID.
//  - Server decrypts ONLY emergency fields (AES-256-GCM).
//  - Session JWT valid for 2 hours, then locks again.

import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptArray, decryptField } from '@/lib/crypto';
import { verifySession, signSession } from '@/lib/session';
import { checkRateLimit } from '@/lib/rate-limit';
import { notifyEmergencyOpen } from '@/lib/notify';
import { BreakGlassReason } from '@/lib/types';
import { logBreakGlassOnChain } from '@/lib/monad';

// ---- Helpers ----

function getDeviceFingerprint(req: NextRequest): string {
  const header = req.headers.get('x-device-fingerprint');
  if (header) return header;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const ua = req.headers.get('user-agent') ?? 'unknown';
  return `${ip}|${ua}`;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Rate limit check
    const fingerprint = getDeviceFingerprint(req);
    const rate = checkRateLimit(fingerprint);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Deteksi scan terdeteksi. Harap tunggu.' },
        { status: 429 },
      );
    }
    if (rate.delayMs) {
      // Soft warning: delay before proceeding
      await new Promise((resolve) => setTimeout(resolve, rate.delayMs));
    }

    // 2. Validate params
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'patientId wajib.' }, { status: 400 });
    }

    // 3. Validate body
    const body = await req.json().catch(() => ({} as { reason?: string; confirmed?: boolean }));
    const reason = body.reason === 'IGD' || body.reason === 'AMBULANS' || body.reason === 'EVENT' || body.reason === 'LAINNYA' ? body.reason : 'LAINNYA';
    const confirmed = body.confirmed === true;

    if (!confirmed) {
      return NextResponse.json({ error: 'Konfirmasi darurat wajib.' }, { status: 400 });
    }

    // 4. Fetch QR token + patient
    const qrToken = await prisma.qRToken.findUnique({
      where: { patientId: id },
      select: { token: true, isActive: true },
    });
    console.log('[break-glass] QR token:', qrToken ? `found (isActive=${qrToken?.isActive})` : 'NOT FOUND');
    if (!qrToken || !qrToken.isActive) {
      return NextResponse.json({ error: 'QR tidak aktif atau tidak ditemukan.' }, { status: 404 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        criticalData: true,
        contacts: { select: { id: true, name: true, phoneEncrypted: true } },
      },
    });
    console.log('[break-glass] Patient:', patient ? `found (criticalData=${!!patient?.criticalData}, contacts=${patient?.contacts?.length || 0})` : 'NOT FOUND');
    if (!patient) {
      return NextResponse.json({ error: 'Patient tidak ditemukan.' }, { status: 404 });
    }

    const criticalData = patient.criticalData;
    console.log('[break-glass] CriticalData:', criticalData ? `found (fields=${Object.keys(criticalData).join(', ')})` : 'NOT FOUND');
    if (!criticalData) {
      return NextResponse.json({ error: 'Data kritis belum diisi.' }, { status: 400 });
    }

    // 5. Decrypt emergency fields ONLY (not the full profile)
    console.log('[break-glass] CriticalData fields:');
    console.log('[break-glass]   allergiesEncrypted:', criticalData.allergiesEncrypted ? 'present (JSON string)' : 'null');
    console.log('[break-glass]   conditionsEncrypted:', criticalData.conditionsEncrypted ? 'present (JSON string)' : 'null');
    console.log('[break-glass]   medsEncrypted:', criticalData.medsEncrypted ? 'present (JSON string)' : 'null');
    console.log('[break-glass]   notesEncrypted:', criticalData.notesEncrypted ? 'present (JSON string)' : 'null');
    console.log('[break-glass]   bloodType:', criticalData.bloodType);

    const allergies = decryptArray(criticalData.allergiesEncrypted) ?? [];
    const chronicConditions = decryptArray(criticalData.conditionsEncrypted) ?? [];
    const routineMeds = decryptArray(criticalData.medsEncrypted) ?? [];
    const bloodType = criticalData.bloodType ?? '';
    const notes =
      criticalData.notesEncrypted !== null && criticalData.notesEncrypted !== undefined
        ? decryptField(
            JSON.parse(criticalData.notesEncrypted as string).ciphertext,
            JSON.parse(criticalData.notesEncrypted as string).iv,
            JSON.parse(criticalData.notesEncrypted as string).tag,
          )
        : undefined;

    // Decrypt emergency contact phones (only phone field)
    const emergencyContacts = patient.contacts.map(
      (c: { id: string; name: string; phoneEncrypted: string | null }) => {
      console.log('[break-glass]   contact:', c.id, 'phoneEncrypted:', c.phoneEncrypted ? 'present (JSON string)' : 'null');
      const phoneEncrypted = c.phoneEncrypted ? JSON.parse(c.phoneEncrypted as string) : null;
      return {
        name: c.name || '',
        phone:
          phoneEncrypted !== null && phoneEncrypted !== undefined
            ? decryptField(phoneEncrypted.ciphertext, phoneEncrypted.iv, phoneEncrypted.tag)
            : '',
      };
    });

    const payload = {
      allergies,
      chronicConditions,
      routineMeds,
      bloodType,
      emergencyContacts,
      notes,
    };

    // 6. Create BreakGlassLog (sessionTokenHash is required)
    const log = await prisma.breakGlassLog.create({
      data: {
        patientId: id,
        reason,
        sessionTokenHash: '',
        deviceFingerprint: fingerprint,
        locationRough: req.headers.get('x-rough-location') ?? '',
        notifyStatus: 'pending',
      },
      select: { id: true },
    });

    if (!log) {
      return NextResponse.json({ error: 'Gagal mencatat sesi.' }, { status: 500 });
    }

    // Fire-and-forget: log break-glass on Monad. Never blocking the session.
    logBreakGlassOnChain(id, log.id, reason).catch((err) => {
      console.error('[break-glass] on-chain break-glass log failed:', err);
    });

    // 6. Sign JWT session (2 hours) with the real log ID
    const sessionToken = await signSession(id, log.id);
    const sessionTokenHash = hashToken(sessionToken);

    // 7. Update log with session token hash
    await prisma.breakGlassLog.update({
      where: { id: log.id },
      data: { sessionTokenHash },
    });

    // 8. Trigger notification (mock; continues even if it fails)
    const notifyResult = await notifyEmergencyOpen(id, log.id, reason);

    // 9. Update log with notify status
    await prisma.breakGlassLog.update({
      where: { id: log.id },
      data: { notifyStatus: notifyResult.status },
    });

    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    return NextResponse.json({
      sessionToken,
      payload,
      lockCard: {
        photoUrl: '',
        nickname: 'Pasien NadiPass',
        age: 0,
        bloodType,
      },
      expiresAt,
    });
  } catch (err) {
    console.error('[break-glass] error:', err);
    return NextResponse.json({ error: 'Gagal membuka data darurat.' }, { status: 500 });
  }
}
