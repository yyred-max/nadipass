'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BreakGlassReason } from '@/lib/types';

const REASONS: { value: BreakGlassReason; label: string; desc: string }[] = [
  { value: 'IGD', label: 'IGD', desc: 'IGD / IGD' },
  { value: 'AMBULANS', label: 'Ambulans', desc: 'Ambulans' },
  { value: 'EVENT', label: 'Acara / Event', desc: 'Acara / pesta' },
  { value: 'LAINNYA', label: 'Lainnya', desc: 'Lainnya' },
];

export default function BreakForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId') || '';
  const [reason, setReason] = useState<BreakGlassReason>('IGD');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit() {
    if (!confirmed || !patientId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/break-glass/${patientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, confirmed: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuka data');

      // Redirect to unlocked with the session token
      const token = data.sessionToken;
      const searchParams = new URLSearchParams({ token });
      router.push(`/e/${patientId}/unlocked?${searchParams.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuka data');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <a
          href={`/e/${patientId || ''}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </a>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Buka Data Darurat</h1>
          <p className="mt-1 text-xs text-zinc-500">
            2 tap. Data akan terbuka tanpa akun.
          </p>

          {error && <div className="mt-4 rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          {!confirmed ? (
            <>
              <div className="mt-6 space-y-3">
                {REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex cursor-pointer items-center justify-center gap-3 rounded-xl border p-4 text-center transition focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                      reason === r.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      className="h-4 w-4 border-zinc-300 text-teal-600 focus:ring-teal-200"
                    />
                    <div>
                      <p className="font-semibold text-zinc-900">{r.label}</p>
                      <p className="text-xs text-zinc-500">{r.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-200"
                />
                <span className="text-sm text-red-800">
                  Saya membuka karena ada darurat (petugas, keluarga, atau alasan darurat).
                </span>
              </label>

              <button
                onClick={onSubmit}
                disabled={!confirmed || loading}
                className="mt-6 flex h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-base font-semibold text-white shadow-sm transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {loading ? 'Membuka...' : 'Buka Sekarang'}
              </button>
            </>
          ) : (
            <div className="mt-6 text-center">
              <p className="text-sm text-zinc-500">Klik tombol <b>Buka Sekarang</b> untuk membuka data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
