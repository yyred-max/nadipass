'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LockClosedIcon } from '@heroicons/react/24/outline';

type Patient = {
  id: string;
  phoneHash: string;
  walletAddress: string | null;
  fullName: string | null;
  birthYear: number | null;
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
    if (!patient) return;
    router.push(`/e/${patient.id}/break`);
  };

  if (!patient || !criticalData) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
        <div className="text-center">
          <LockClosedIcon className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-lg text-red-600 font-semibold">
            Kartu tidak ditemukan.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Pastikan QR yang di-scan valid atau hubungi keluarga pasien.
          </p>
          <button
            className="mt-6 rounded-xl bg-teal-600 px-6 py-3 text-white font-semibold hover:bg-teal-700"
            onClick={() => router.push('/')}
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const initials = patient.fullName?.slice(0, 2).toUpperCase() || 'PN';
  const age = patient.birthYear
    ? new Date().getFullYear() - patient.birthYear
    : null;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-lg text-center">
        {/* Avatar / Inisial */}
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-teal-100 flex items-center justify-center text-3xl font-bold text-teal-700">
            {initials}
          </div>
        </div>

        {/* Nama */}
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {patient.fullName || 'Pasien NadiPass'}
        </h1>

        {/* Info: umur + gol darah */}
        <p className="mt-1 text-sm text-zinc-500">
          {age ? `${age} tahun` : 'Umur belum diisi'}
          {criticalData?.bloodType
            ? ` · Gol. Darah ${criticalData.bloodType}`
            : ' · Gol. Darah belum diisi'}
        </p>

        {/* Card terkunci */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <LockClosedIcon className="h-4 w-4 text-zinc-400" />
            <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
              Data kritis terkunci
            </p>
          </div>
          <p className="text-sm text-zinc-600">
            Data ini dijaga kerahasiaannya. Hanya petugas darurat yang bisa
            membukanya dengan alasan yang valid.
          </p>

          <button
            onClick={handleOpenData}
            className="mt-6 flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-base font-semibold text-white shadow-sm transition hover:bg-teal-500"
          >
            <LockClosedIcon className="h-5 w-5" />
            Buka Data Darurat
          </button>
        </div>

        {/* Info tambahan */}
        <div className="mt-4 rounded-xl bg-amber-50 border-l-4 border-amber-400 px-3 py-2 text-left">
          <p className="text-xs text-amber-800">
            <strong>Petugas:</strong> Setiap pembukaan data akan dicatat dan
            keluarga pasien akan dinotifikasi.
          </p>
        </div>

        {/* Disclaimer */}
        <p className="mt-4 text-xs text-zinc-400">
          NadiPass bukan rekam medis resmi. Bukan pengganti pemeriksaan klinis.
        </p>

        {/* Link scan QR lain */}
        <div className="mt-3 text-center">
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            Scan QR lain
          </Link>
        </div>
      </div>
    </div>
  );
}