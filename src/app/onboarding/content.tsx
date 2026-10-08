'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  TagIcon,
  UserCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

type EmergencyContact = { name: string; phone: string };

export default function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get('patientId') || '';

  const [allergies, setAllergies] = useState<string[]>([]);
  const [chronic, setChronic] = useState<Record<string, boolean>>({});
  const [meds, setMeds] = useState<string[]>([]);
  const [bloodType, setBloodType] = useState('');
  const [contacts, setContacts] = useState<EmergencyContact[]>([{ name: '', phone: '' }]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!patientId) {
      router.push('/register');
      return;
    }
    const stored = sessionStorage.getItem(`nadipass_onboarding_${patientId}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.allergies) setAllergies(data.allergies);
        if (data.chronic) setChronic(data.chronic);
        if (data.meds) setMeds(data.meds);
        if (data.bloodType) setBloodType(data.bloodType);
        if (data.contacts) setContacts(data.contacts);
        if (data.notes) setNotes(data.notes);
      } catch {
        /* ignore corrupted session */
      }
    }
  }, [patientId, router]);

  const addAllergy = () => {
    setAllergies((prev) => [...prev, '']);
  };

  const addMed = () => {
    setMeds((prev) => [...prev, '']);
  };

  const addContact = () => {
    setContacts((prev) => [...prev, { name: '', phone: '' }]);
  };

  const removeContact = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: 'name' | 'phone', value: string) => {
    setContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        patientId,
        allergies: allergies.filter(Boolean),
        chronicConditions: Object.keys(chronic).filter((k) => chronic[k]),
        routineMeds: meds.filter(Boolean),
        bloodType,
        emergencyContacts: contacts.filter((c) => c.name && c.phone),
        notes: notes.trim() || undefined,
      };
      const res = await fetch('/api/patient/critical-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Simpan gagal');
      sessionStorage.setItem(`nadipass_onboarding_${patientId}`, JSON.stringify(payload));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simpan gagal');
    } finally {
      setSubmitting(false);
    }
  }

  if (!patientId) {
    return (
      <div className="min-h-screen bg-zinc-50 px-5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-zinc-600">Tidak ada patientId.</p>
          <button
            className="mt-4 rounded-xl bg-teal-600 px-5 py-3 text-white"
            onClick={() => router.push('/register')}
          >
            Daftar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-5 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <a href="/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500">
          <ArrowLeftIcon className="h-4 w-4" /> Kembali
        </a>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Isi Data Kritis</h1>
          <p className="mt-1 text-xs text-zinc-500">
            Data ini akan terbuka otomatis saat petugas pecah kaca.
          </p>

          {saved ? (
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-700">
              <CheckCircleIcon className="h-5 w-5" />
              Data tersimpan. Anda akan dialihkan ke dashboard...
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-6">
              {/* a. ALERGI */}
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                  <TagIcon className="h-5 w-5 text-amber-500" /> ALERGI (wajib)
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Masukkan satu per satu, tekan Enter atau klik + untuk tambah.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allergies.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
                      {a}
                      <button
                        type="button"
                        onClick={() => setAllergies((prev) => prev.filter((x) => x !== a))}
                        className="hover:text-amber-100"
                      >
                        <XCircleIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={allergies[allergies.length - 1] || ''}
                    onChange={(e) =>
                      setAllergies([
                        ...allergies.slice(0, allergies.length - 1),
                        e.target.value,
                      ])
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        e.preventDefault();
                        setAllergies([...allergies, e.currentTarget.value]);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="flex-1 min-w-[120px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    placeholder="Alergi..."
                    maxLength={60}
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAllergies([...allergies, ''])
                  }
                  className="mt-1 text-xs text-teal-600 hover:underline"
                >
                  + Tambah alergi
                </button>
                {allergies.some((a) => !a) && (
                  <p className="mt-1 text-xs text-red-600">Isi alergi yang valid.</p>
                )}
              </div>

              {/* b. PENYAKIT KRONIS */}
              <div>
                <h2 className="text-sm font-semibold text-zinc-800">
                  <CheckBadgeIcon className="h-5 w-5 text-teal-500" /> PENYAKIT KRONIS
                </h2>
                <div className="mt-2 flex flex-wrap gap-3">
                  {(['Diabetes', 'Asma', 'Epilepsi', 'Jantung', 'Lainnya'] as const).map((c) => (
                    <label key={c} className="inline-flex items-center gap-2 text-sm text-zinc-700">
                      <input
                        type="checkbox"
                        checked={chronic[c] || false}
                        onChange={(e) =>
                          setChronic((prev) => ({ ...prev, [c]: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-200"
                      />
                      {c}
                    </label>
                  ))}
                </div>
              </div>

              {/* c. OBAT RUTIN */}
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                  <DocumentTextIcon className="h-5 w-5 text-violet-500" /> OBAT RUTIN
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {meds.map((m) => (
                    <span key={m} className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-800">
                      {m}
                      <button
                        type="button"
                        onClick={() => setMeds((prev) => prev.filter((x) => x !== m))}
                        className="hover:text-violet-100"
                      >
                        <XCircleIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={meds[meds.length - 1] || ''}
                    onChange={(e) =>
                      setMeds([...meds.slice(0, meds.length - 1), e.target.value])
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        e.preventDefault();
                        setMeds([...meds, e.currentTarget.value]);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="flex-1 min-w-[120px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    placeholder="Obat rutin..."
                    maxLength={60}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setMeds([...meds, ''])}
                  className="mt-1 text-xs text-violet-600 hover:underline"
                >
                  + Tambah obat
                </button>
              </div>

              {/* d. GOLONGAN DARAH */}
              <div>
                <label htmlFor="bloodType" className="mb-1 block text-sm font-medium text-zinc-700">
                  GOLONGAN DARAH
                </label>
                <select
                  id="bloodType"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                >
                  <option value="">Pilih...</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                  <option value="Tidak tahu">Tidak tahu</option>
                </select>
                {!bloodType && <p className="mt-1 text-xs text-red-600">Golongan darah wajib.</p>}
              </div>

              {/* e & f. KONTAK DARURAT */}
              <div>
                <h2 className="text-sm font-semibold text-zinc-800">
                  <UserCircleIcon className="h-5 w-5 text-rose-500" /> KONTAK DARURAT
                </h2>
                <div className="mt-2 space-y-3">
                  {contacts.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={c.name}
                        onChange={(e) =>
                          setContacts((prev) => prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                        }
                        placeholder={`Nama ${i === 0 ? '(wajib)' : '(opsional)'}`}
                        className="min-w-[140px] flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                        maxLength={60}
                      />
                      <input
                        value={c.phone}
                        onChange={(e) =>
                          setContacts((prev) => prev.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)))
                        }
                        placeholder="No. HP"
                        className="min-w-[120px] flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                        maxLength={14}
                      />
                      {contacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setContacts((prev) => prev.filter((_, j) => j !== i))}
                          className="text-xs text-zinc-400 hover:text-red-600"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setContacts([...contacts, { name: '', phone: '' }])}
                  className="mt-2 text-xs text-teal-600 hover:underline"
                >
                  + Kontak darurat lain
                </button>
                {contacts.some((c) => !c.name || !c.phone) && (
                  <p className="mt-1 text-xs text-red-600">Isi lengkap kontak darurat.</p>
                )}
              </div>

              {/* g. CATATAN */}
              <div>
                <label htmlFor="notes" className="mb-1 block text-sm font-medium text-zinc-700">
                  CATATAN SINGKAT (opsional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: jangan opioid, pakai alat bantu dengar"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  rows={4}
                  maxLength={500}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="flex h-[56px] w-full rounded-xl bg-teal-600 px-4 text-base font-semibold text-white shadow-sm transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Data Kritis'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
