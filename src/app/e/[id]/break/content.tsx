'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BreakGlassReason } from '@/lib/types';

const REASONS: { value: BreakGlassReason; label: string; desc: string }[] = [
  { value: 'IGD', label: 'IGD', desc: 'IGD / IGD' },
  { value: 'AMBULANS', label: 'Ambulans', desc: 'Ambulans' },
  { value: 'EVENT', label: 'Acara / Event', desc: 'Acara / pesta' },
  { value: 'LAINNYA', label: 'Lainnya', desc: 'Lainnya' },
];

export default function BreakForm() {
  const router = useRouter();
  const params = useParams();
  const patientId = (params?.id as string) || '';

  const [reason, setReason] = useState<BreakGlassReason>('IGD');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('[BreakForm] handleSubmit called', { confirmed, patientId, reason });

    if (!confirmed || !patientId) {
      console.log(
        '[BreakForm] early return: confirmed=',
        confirmed,
        'patientId=',
        patientId,
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/break-glass/${patientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, confirmed: true }),
      });

      console.log('[BreakForm] fetch done, status=', res.status);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal membuka data');

      // Redirect ke unlocked dengan token session
      const token = data.sessionToken;
      const query = new URLSearchParams({ token }).toString();
      router.push(`/e/${patientId}/unlocked?${query}`);
    } catch (err) {
      console.error('[BreakForm] error:', err);
      setError(err instanceof Error ? err.message : 'Gagal membuka data');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <a
          href={`/e/${patientId}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali
        </a>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Buka Data Darurat
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            2 tap. Data akan terbuka tanpa akun.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pilihan alasan */}
            <div>
              <h2 className="text-sm font-semibold mb-3">
                Alasan membuka data:
              </h2>
              <div className="space-y-2">
                {REASONS.map((r) => (
                  <label
                    key={r.value}
                    className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border p-4 text-center transition focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 hover:bg-zinc-50"
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
            </div>

            {/* Checkbox konfirmasi */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-200"
              />
              <span className="text-sm text-red-800">
                Saya membuka karena ada darurat (petugas, keluarga, atau
                alasan darurat).
              </span>
            </label>

            {/* Tombol submit */}
            <button
              type="submit"
              disabled={!confirmed || !reason || loading}
              className="w-full h-16 rounded-xl bg-teal-600 text-white font-semibold text-lg disabled:opacity-50 hover:bg-teal-700"
            >
              {loading ? 'Membuka...' : 'Buka Sekarang'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}