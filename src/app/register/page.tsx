'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function RegisterPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/patient/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, consent }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registrasi gagal');
      }
      router.push(`/onboarding?patientId=${data.patientId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-5 py-8 sm:py-12">
      <div className="mx-auto max-w-sm">
        <a href="/" className="mb-4 inline-block text-sm text-zinc-500">
          ← Kembali
        </a>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Daftar Sekarang</h1>

          <p className="mt-1 text-xs text-zinc-500">
            Isi HP. Data kritis nanti via <a href="/onboarding" className="underline underline-offset-2">Onboarding</a>.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-zinc-700">
                No. HP
              </label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                minLength={10}
                maxLength={14}
                required
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-200"
              />
              <span>
                Saya setuju data saya dibuka petugas jika saya tidak sadar. Keluarga saya akan diberi tahu.
              </span>
            </label>
            <p className="text-xs text-zinc-400">
              Consent diperlukan agar petugas bisa membuka data di meja pelayanan.
            </p>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={!consent || loading}
              className="flex h-[56px] w-full rounded-xl bg-teal-600 px-4 text-base font-semibold text-white shadow-sm transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {loading ? 'Sedang memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] leading-4 text-zinc-400">
            NadiPass adalah alat bantu identifikasi darurat. Bukan pengganti rekam medis resmi.
          </p>
        </div>
      </div>
    </div>
  );
}
