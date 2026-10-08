'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { CameraIcon, PowerIcon, PencilIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get('patientId') || '';

  const [qr, setQr] = useState({ qrUrl: '', isActive: true, token: '' });
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!patientId) {
      router.push('/register');
      return;
    }
    fetchQr();
  }, [patientId, router]);

  async function fetchQr() {
    try {
      const res = await fetch(`/api/patient/qr?patientId=${patientId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membaca QR');
      setQr(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membaca QR');
    } finally {
      setLoading(false);
    }
  }

  async function toggleQr() {
    if (toggleLoading) return;
    setToggleLoading(true);
    try {
      const res = await fetch('/api/patient/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, isActive: !qr.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengupdate QR');
      setQr((prev) => ({ ...prev, isActive: !prev.isActive }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengupdate QR');
    } finally {
      setToggleLoading(false);
    }
  }

  async function onPrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </a>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-xs text-zinc-500">Data daruratan, siap dibuka petugas.</p>

          {error && <div className="mt-4 rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          {loading ? (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-zinc-500">
              Memuat QR...
            </div>
          ) : (
            <>
              {/* QR Section */}
              <div className="mt-6 text-center">
                <QRCodeSVG
                  value={qr.qrUrl}
                  size={280}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#000000"
                  className="mx-auto"
                />
                <p className="mt-3 text-xs text-zinc-400">
                  Scan QR di atas jika pasien tidak sadar
                </p>
              </div>

              {/* Action Cards */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={toggleQr}
                  disabled={toggleLoading}
                  className="flex h-[56px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:bg-zinc-100"
                >
                  <PowerIcon className={`h-5 w-5 ${qr.isActive ? 'text-zinc-400' : 'text-red-500'}`} />
                  {qr.isActive ? 'Matikan QR' : 'QR sudah dimatikan. Hubungi petugas atau keluarga untuk mengaktifkan kembali.'}
                </button>
                <a
                  href={`/onboarding?patientId=${patientId}`}
                  className="flex h-[56px] items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500"
                >
                  <PencilIcon className="h-5 w-5" />
                  Edit Data Kritis
                </a>
              </div>

              {/* Print Button */}
              <button
                onClick={onPrint}
                className="mt-3 flex h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                <CameraIcon className="h-5 w-5" />
                Cetak Kartu / Stiker
              </button>

              {/* Cetak link */}
              <p className="mt-3 text-center text-xs text-zinc-400">
                Atau buka di desktop:{' '}
                <a href={window.location.origin + '/print/' + patientId} className="text-teal-600 underline underline-offset-2">
                  /print/{patientId}
                </a>
              </p>

              {/* QR URL */}
              <div className="mt-4 rounded-xl bg-zinc-50 px-4 py-3 text-xs text-zinc-500">
                QR URL:{' '}
                <span className="font-mono">{qr.qrUrl}</span>
              </div>

              {/* History placeholder */}
              <div className="mt-6">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                  <CheckCircleIcon className="h-5 w-5 text-teal-500" /> Riwayat Pecah Kaca
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Belum ada riwayat.
                </p>
              </div>

              {/* Info Card */}
              <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs leading-5 text-zinc-500">
                  Nama kamu, foto, dan golongan darah akan muncul di kartu terkunci.
                  <br />
                  Data lain hanya terbuka saat petugas pecah kaca.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
