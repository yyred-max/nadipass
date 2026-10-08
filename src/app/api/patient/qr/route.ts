//  SERVER ONLY  GET /api/patient/qr?patientId=xxx
//  POST /api/patient/qr  { patientId, isActive }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    if (!patientId) {
      return NextResponse.json({ error: 'patientId wajib.' }, { status: 400 });
    }

    const token = await prisma.qRToken.findUnique({
      where: { patientId },
      select: { token: true, isActive: true },
    });

    if (!token) {
      return NextResponse.json({ error: 'QR token tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({
      qrUrl: `https://nadipass.app/e/${patientId}`,
      isActive: token.isActive,
      token: token.token,
    });
  } catch (err) {
    console.error('[patient/qr] GET error:', err);
    return NextResponse.json({ error: 'Gagal membaca QR token.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as { patientId?: string; isActive?: boolean }));
    const { patientId, isActive } = body;
    if (!patientId || isActive === undefined) {
      return NextResponse.json({ error: 'patientId dan isActive wajib.' }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient tidak ditemukan.' }, { status: 404 });
    }

    await prisma.qRToken.update({
      where: { patientId },
      data: { isActive },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[patient/qr] POST error:', err);
    return NextResponse.json({ error: 'Gagal mengupdate QR token.' }, { status: 500 });
  }
}
