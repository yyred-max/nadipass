//  SERVER ONLY  GET /api/patient/[id]
//  Returns patient profile (public fields only, no sensitive data).

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'patientId wajib.' }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id },
      select: {
        id: true,
        phoneHash: true,
        profileHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (err) {
    console.error('[patient] GET error:', err);
    return NextResponse.json({ error: 'Gagal membaca data pasien.' }, { status: 500 });
  }
}
