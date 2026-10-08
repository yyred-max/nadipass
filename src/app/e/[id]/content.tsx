'use client';

import { useRouter } from 'next/navigation';
import { LockClosedIcon } from '@heroicons/react/24/outline';

type Patient = {
  id: string;
  phoneHash: string;
  profileHash: string;
  createdAt: Date;
  updatedAt: Date;
};

type CriticalData = {
  id: string;
  patientId: string;
  allergiesEncrypted: string;
  conditionsEncrypted: string;
  medsEncrypted: string;
  bloodType: string;
  notesEncrypted: string | null;
  updatedAt: Date;
};

type Props = {
  params: Promise<{ id: string }>;
  patient: Patient | null;
  criticalData: CriticalData | null;
};

export default function LockedCardContent({ patient, criticalData }: Props) {
  const router = useRouter();

  const handleOpenData = () => {
    router.push(`/e/${typeof window !== 'undefined' ? '' : ''}/break`);
  };

  if (!patient || !criticalData) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <LockClosedIcon className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-lg text-red-600">Kartu tidak ditemukan.</p>
          <button
            className="mt-4 rounded-xl bg-teal-600 px-5 py-3 text-white"
            onClick={() => { window.location.href = '/'; }}
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-zinc-200 flex items-center justify-center text-3xl font-bold text-zinc-500">
            {patient.profileHash?.slice(0, 2) || 'PN'}
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {patient.phoneHash?.slice(0, 4) || 'Pasien NadiPass'}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {criticalData?.bloodType ? `Gol. Darah: ${criticalData.bloodType}` : 'Golongan darah belum diisi'}
        </p>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
            Data kritis terkunci
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            Sayangnya, data ini dijaga kerahasiaannya. Hanya petugas darurat yang bisa
            membukanya dengan alasan yang valid.
          </p>

          <button
            onClick={handleOpenData}
            className="mt-6 flex h-[64px] w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-base font-semibold text-white shadow-sm transition hover:bg-teal-500"
          >
            <LockClosedIcon className="h-5 w-5" />
            Buka Data Darurat
          </button>
        </div>

        <p className="mt-4 text-xs text-zinc-400">
          NadiPass bukan rekam medis resmi. Bukan pengganti pemeriksaan klinis.
        </p>
      </div>
    </div>
  );
}
