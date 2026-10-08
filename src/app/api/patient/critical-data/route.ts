//  SERVER ONLY  POST /api/patient/critical-data
//  Encrypts and upserts critical data, replaces emergency contacts.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptArray, encryptField } from '@/lib/crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      patientId,
      allergies,
      chronicConditions,
      routineMeds,
      bloodType,
      emergencyContacts,
      notes,
      fullName,
      birthYear,
    } = body;

    if (!patientId) {
      return NextResponse.json({ error: 'patientId wajib.' }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient tidak ditemukan.' }, { status: 404 });
    }

    if (fullName || birthYear) {
      await prisma.patient.update({
        where: { id: patientId },
        data: {
          fullName: fullName || patient.fullName,
          birthYear: birthYear ? parseInt(birthYear, 10) : patient.birthYear,
        },
      });
    }

    // 1. Encrypt & upsert CriticalData
    const allergiesEncrypted = encryptArray(Array.isArray(allergies) ? allergies : []);
    const conditionsEncrypted = encryptArray(Array.isArray(chronicConditions) ? chronicConditions : []);
    const medsEncrypted = encryptArray(Array.isArray(routineMeds) ? routineMeds : []);
    const notesEncrypted = notes ? JSON.stringify(encryptField(notes)) : null;

    await prisma.criticalData.upsert({
      where: { patientId },
      update: {
        allergiesEncrypted,
        conditionsEncrypted,
        medsEncrypted,
        bloodType: bloodType || '',
        notesEncrypted,
      },
      create: {
        patientId,
        allergiesEncrypted,
        conditionsEncrypted,
        medsEncrypted,
        bloodType: bloodType || '',
        notesEncrypted,
      },
    });

    // 2. Replace emergency contacts
    if (Array.isArray(emergencyContacts)) {
      await prisma.emergencyContact.deleteMany({ where: { patientId } });

      const contacts = emergencyContacts.map((c: { name: string; phone: string }) => ({
        patientId,
        name: c.name || '',
        phoneEncrypted: JSON.stringify(encryptField(c.phone)),
      }));

      if (contacts.length > 0) {
        await prisma.emergencyContact.createMany({ data: contacts });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[patient/critical-data] error:', err);
    return NextResponse.json({ error: 'Gagal menyimpan data kritis.' }, { status: 500 });
  }
}