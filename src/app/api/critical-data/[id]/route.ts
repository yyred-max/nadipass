//  SERVER ONLY  GET /api/critical-data/[id]
//  Returns critical data: bloodType is public, all other fields are encrypted.

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

    const criticalData = await prisma.criticalData.findUnique({
      where: { patientId: id },
      select: {
        id: true,
        patientId: true,
        allergiesEncrypted: true,
        conditionsEncrypted: true,
        medsEncrypted: true,
        bloodType: true,
        notesEncrypted: true,
        updatedAt: true,
      },
    });

    if (!criticalData) {
      return NextResponse.json({ error: 'Data kritis belum diisi.' }, { status: 404 });
    }

    return NextResponse.json(criticalData);
  } catch (err) {
    console.error('[critical-data] GET error:', err);
    return NextResponse.json({ error: 'Gagal membaca data kritis.' }, { status: 500 });
  }
}
