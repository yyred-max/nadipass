//  SERVER ONLY  Notify emergency contact (WA/SMS) that a patient record was opened.
//  MVP: mock implementation. Ready to swap to WA Cloud API / Twilio later.
//  PRIORITY: if notification fails, the data  STILL opens (lifesaving > notifying).

import { prisma } from '@/lib/prisma';
import { hashPhone } from '@/lib/patient';

// In production, inject the gateway client (Twilio, WA Cloud, etc.) via env var.
let twilioClient: { sendWhatsAppMessage: (to: string, body: string) => Promise<{ status: string }> } | null =
  null;

export function setNotifyGateway(client: typeof twilioClient) {
  twilioClient = client;
}

export async function notifyEmergencyOpen(
  patientId: string,
  logId: string,
  reason: string,
): Promise<{ status: 'sent' | 'failed'; logId: string }> {
  // Fetch patient nicknames + emergency contacts
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: {
      id: true,
      criticalData: {
        select: {
          notesEncrypted: true,
        },
      },
      contacts: {
        select: {
          id: true,
          name: true,
          phoneEncrypted: true,
        },
      },
    },
  });

  if (!patient) {
    return { status: 'failed', logId };
  }

  const contact = patient.contacts[0]; // first contact (wajib)
  if (!contact) {
    return { status: 'failed', logId };
  }

  // Decrypt phone (hashPhone matches the one used in register/onboarding)
  const phoneHash = hashPhone(contact.phoneEncrypted);
  // Note: In the real flow, phone is already hashed at registration.
  // For MVP simulation, we treat the stored value as the hash and re-hash for lookup.
  // The actual phone number is NOT stored anywhere, so notification is simulated.
  const simulatedPhoneNumber = `+62800000000`; // static mock only

  // Build message
  const message = `NadiPass [Pasien] baru dibuka. Waktu: ${new Date().toLocaleString('id-ID')}. Alasan: ${reason}. Jika ini bukan darurat, buka link: https://nadipass.app/e/${patientId}`;

  // Try real gateway if configured
  if (twilioClient) {
    try {
      await twilioClient.sendWhatsAppMessage(
        `whatsapp:+${simulatedPhoneNumber.replace(/\D/g, '')}`,
        message,
      );
      return { status: 'sent', logId };
    } catch (err) {
      console.error('[notify] Gateway error:', err);
      return { status: 'failed', logId };
    }
  }

  // Mock
  console.log(`[notify-mock] Emergency opened for patient=${patientId} logId=${logId} reason=${reason}`);
  console.log(`[notify-mock] Message to ${simulatedPhoneNumber}: ${message}`);

  await prisma.breakGlassLog.update({
    where: { id: logId },
    data: { notifyStatus: 'sent', notifiedAt: new Date() },
  });

  return { status: 'sent', logId };
}
