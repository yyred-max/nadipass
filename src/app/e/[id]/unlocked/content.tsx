'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { LockClosedIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function UnlockedContent() {
  const params = useParams();
  const patientId = params.id as string | undefined;
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [data, setData] = useState<{
    allergies: string[];
    chronicConditions: string[];
    routineMeds: string[];
    bloodType: string;
    emergencyContacts: { name: string; phone: string }[];
    notes?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notified, setNotified] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<'active' | 'expired' | 'invalid'>('active');
  const [timer, setTimer] = useState(7200);

  useEffect(() => {
    if (!token) {
      setSessionStatus('invalid');
      setLoading(false);
      return;
    }

    // Fetch data
    fetch(`/api/emergency/[id]?token=${encodeURIComponent(token)}`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        if (res.status === 401) {
          setSessionStatus('invalid');
          return null;
        }
        if (!res.ok) throw new Error('Gagal membaca data');
        return res.json();
      })
      .then((json) => {
        if (json?.payload) {
          setData(json.payload);
          setNotified(true);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Gagal membaca data');
        if (err.message !== 'Gagal membaca data') {
          setSessionStatus('invalid');
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Count down 2 hours
  useEffect(() => {
    if (!token || sessionStatus !== 'active') return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setSessionStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [token, sessionStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <p className="text-gray-500">Memuat data...</p>
      </div>
    );
  }

  if (sessionStatus === 'invalid') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <LockClosedIcon className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-lg text-red-600">Sesi tidak valid.</p>
          <button
            className="mt-4 rounded-xl bg-teal-600 px-5 py-3 text-white"
            onClick={() => { window.location.href = '/e/' + patientId; }}
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (sessionStatus === 'expired') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <ClockIcon className="h-12 w-12 text-amber-500 mx-auto" />
          <p className="mt-4 text-lg text-amber-600">Sesi kedaluwarsa. Data terkunci lagi.</p>
          <button
            className="mt-4 rounded-xl bg-teal-600 px-5 py-3 text-white"
            onClick={() => { window.location.href = '/e/' + patientId; }}
          >
            Buka Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-lg text-red-600">{error || 'Data tidak tersedia.'}</p>
          <button
            className="mt-4 rounded-xl bg-teal-600 px-5 py-3 text-white"
            onClick={() => { window.location.href = '/e/' + patientId; }}
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <a
            href={`/e/${typeof window !== 'undefined' ? '' : ''}`}
            className="flex items-center gap-2 text-sm text-zinc-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </a>
          <span className="text-xs text-zinc-400">
            {Math.floor(timer / 3600)}:{(String(Math.floor((timer % 3600) / 60)).padStart(2, '0'))}
            menit
          </span>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
          {/* ALERGI — atas, huruf besar, merah, kontras tinggi */}
          {data.allergies.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-semibold tracking-widest text-red-600 uppercase">
                ALERGI
              </p>
              <ul className="mt-2 list-inside list-disc text-sm font-bold text-red-800">
                {data.allergies.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* OBAT RUTIN */}
          {data.routineMeds.length > 0 && (
            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs font-semibold tracking-widest text-zinc-600 uppercase">
                OBAT RUTIN
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-zinc-800">
                {data.routineMeds.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* PENYAKIT KRONIS */}
          {data.chronicConditions.length > 0 && (
            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs font-semibold tracking-widest text-zinc-600 uppercase">
                PENYAKIT KRONIS
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-zinc-800">
                {data.chronicConditions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* GOLONGAN DARAH */}
          {data.bloodType && (
            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs font-semibold tracking-widest text-zinc-600 uppercase">
                GOLONGAN DARAH
              </p>
              <p className="mt-1 text-lg font-bold text-zinc-900">{data.bloodType}</p>
            </div>
          )}

          {/* KONTAK DARURAT */}
          {data.emergencyContacts.length > 0 && (
            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs font-semibold tracking-widest text-zinc-600 uppercase">
                KONTAK DARURAT
              </p>
              <div className="mt-2 space-y-1">
                {data.emergencyContacts.map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-800">{c.name}</span>
                    <span className="text-sm text-zinc-600 font-mono">{c.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATATAN */}
          {data.notes && (
            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs font-semibold tracking-widest text-zinc-600 uppercase">
                CATATAN
              </p>
              <p className="mt-1 text-sm text-zinc-700">{data.notes}</p>
            </div>
          )}

          {/* NOTIF KELUARGA */}
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-700">
            <svg className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notified ? 'Kontak darurat telah diberi tahu.' : 'Notifikasi gagal — tetap terbuka (nyawa > notifikasi).'}
          </div>

          {/* DISCLAIMER */}
          <p className="mt-4 text-center text-xs text-zinc-400">
            Data diisi pasien, belum tentu terverifikasi medis. Petugas tetap lakukan pemeriksaan klinis.
          </p>

          {/* FIELD OPSIONAL (boleh dilewati) */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Nama petugas (opsional)"
              className="flex-1 rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
            />
            <input
              type="text"
              placeholder="Instansi (opsional)"
              className="flex-1 rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
