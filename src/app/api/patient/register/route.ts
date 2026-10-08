//  SERVER ONLY  POST /api/patient/register
//  Registers a patient, creates their QR token, and returns the QR URL.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQRToken, hashPhone } from '@/lib/patient';

const PHONE_REGEX = /^08\d{8,14}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as { phone?: string; consent?: boolean }));
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const consent = body.consent === true;

    if (!consent) {
      return NextResponse.json({ error: 'Consent harus disetujui.' }, { status: 400 });
    }

    if (!PHONE_REGEX.test(phone)) {
      return NextResponse.json({ error: 'Format HP harus 08 diikuti minimal 10 digit.' }, { status: 400 });
    }

    const phoneHash = hashPhone(phone);

    const existing = await prisma.patient.findUnique({
      where: { phoneHash },
    });

    if (existing) {
      const [activeToken] = await prisma.qRToken.findMany({
        where: { patientId: existing.id, isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });
      if (activeToken) {
        return NextResponse.json({
          patientId: existing.id,
          qrToken: activeToken.token,
          qrUrl: `https://nadipass.app/e/${existing.id}`,
        });
      }
    }

    const patient = await prisma.patient.create({
      data: {
        phoneHash,
        profileHash: 'pending',
      },
      select: { id: true },
    });

    const qrToken = await prisma.qRToken.create({
      data: {
        patientId: patient.id,
        token: generateQRToken(),
      },
      select: { token: true },
    });

    return NextResponse.json({
      patientId: patient.id,
      qrToken: qrToken.token,
      qrUrl: `https://nadipass.app/e/${patient.id}`,
    });
  } catch (err) {
    console.error('[patient/register]', err);
    if (err instanceof Error && err.message.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Nomor HP sudah terdaftar.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal menyimpan data.' }, { status: 500 });
  }
}
