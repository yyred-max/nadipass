"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  TagIcon,
  UserCircleIcon,
  UserIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

type EmergencyContact = { name: string; phone: string };

export default function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get("patientId") || "";

  const [fullName, setFullName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [chronic, setChronic] = useState<Record<string, boolean>>({});
  const [meds, setMeds] = useState<string[]>([]);
  const [bloodType, setBloodType] = useState("");
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { name: "", phone: "" },
  ]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [touched, setTouched] = useState(false);
  const [newAllergy, setNewAllergy] = useState("");
  const [newMed, setNewMed] = useState("");

  useEffect(() => {
    if (!patientId) {
      router.push("/register");
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
        if (data.fullName) setFullName(data.fullName);
        if (data.birthYear) setBirthYear(String(data.birthYear));
      } catch {
        /* ignore corrupted session */
      }
    }
  }, [patientId, router]);

  const addAllergy = () => {
    const trimmed = newAllergy.trim();
    if (!trimmed) return;
    if (allergies.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      setError("Alergi ini sudah ada di daftar.");
      return;
    }
    if (allergies.length >= 10) {
      setError("Maksimal 10 alergi.");
      return;
    }
    setAllergies([...allergies, trimmed]);
    setNewAllergy("");
    setError("");
  };

  const addMed = () => {
    const trimmed = newMed.trim();
    if (!trimmed) return;
    if (meds.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      setError("Obat ini sudah ada di daftar.");
      return;
    }
    if (meds.length >= 10) {
      setError("Maksimal 10 obat rutin.");
      return;
    }
    setMeds([...meds, trimmed]);
    setNewMed("");
    setError("");
  };

  const updateContact = (
    index: number,
    field: "name" | "phone",
    value: string,
  ) => {
    setContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  };

  const removeContact = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const addContact = () => {
    if (contacts.length >= 3) {
      setError("Maksimal 3 kontak darurat.");
      return;
    }
    setContacts([...contacts, { name: "", phone: "" }]);
    setError("");
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setTouched(true);

    // Validasi
    const validContacts = contacts.filter((c) => c.name.trim() && c.phone.trim());
    if (!bloodType) {
      setError("Golongan darah wajib diisi.");
      return;
    }
    if (validContacts.length === 0) {
      setError("Minimal 1 kontak darurat lengkap (nama + HP).");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patientId,
        fullName: fullName.trim() || null,
        birthYear: birthYear ? parseInt(birthYear, 10) : null,
        allergies: allergies.filter(Boolean),
        chronicConditions: Object.keys(chronic).filter((k) => chronic[k]),
        routineMeds: meds.filter(Boolean),
        bloodType,
        emergencyContacts: validContacts,
        notes: notes.trim() || undefined,
      };
      const res = await fetch("/api/patient/critical-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem(
          `nadipass_onboarding_${patientId}`,
          JSON.stringify(payload),
        );
        setSaved(true);
        setTimeout(() => {
          window.location.href = `/dashboard?patientId=${patientId}`;
        }, 1500);
        return;
      }
      throw new Error(data.error || "Simpan gagal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simpan gagal");
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
            onClick={() => router.push("/register")}
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
        <a
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Kembali
        </a>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Isi Data Kritis
          </h1>
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
              {/* IDENTITAS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-teal-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Identitas (publik di kartu)
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Nama Lengkap / Panggilan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="sm:col-span-2 rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                    aria-label="Nama Lengkap"
                  />
                  <input
                    type="number"
                    name="birthYear"
                    placeholder="Tahun Lahir"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    min="1900"
                    max="2025"
                    className="rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                    aria-label="Tahun Lahir"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Nama & tahun lahir akan muncul di kartu terkunci. Data lain
                  terenkripsi.
                </p>
              </div>

              {/* ALERGI */}
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                  <TagIcon className="h-5 w-5 text-amber-500" /> Alergi (wajib
                  diisi)
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Masukkan satu per satu, tekan Enter atau klik + untuk tambah.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allergies.map((a, i) => (
                    <span
                      key={`allergy-${i}-${a}`}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800"
                    >
                      {a}
                      <button
                        type="button"
                        onClick={() =>
                          setAllergies((prev) => prev.filter((_, j) => j !== i))
                        }
                        className="hover:text-amber-600"
                      >
                        <XCircleIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAllergy();
                      }
                    }}
                    className="flex-1 min-w-[120px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    placeholder="Alergi..."
                    maxLength={60}
                  />
                </div>
                <button
                  type="button"
                  onClick={addAllergy}
                  className="mt-1 text-xs text-teal-600 hover:underline"
                >
                  + Tambah alergi
                </button>
              </div>

              {/* PENYAKIT KRONIS */}
              <div>
                <h2 className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
                  <CheckBadgeIcon className="h-5 w-5 text-teal-500" /> Penyakit
                  Kronis
                </h2>
                <div className="mt-2 flex flex-wrap gap-3">
                  {(["Diabetes", "Asma", "Epilepsi", "Jantung", "Lainnya"] as const).map(
                    (c) => (
                      <label
                        key={c}
                        className="inline-flex items-center gap-2 text-sm text-zinc-700"
                      >
                        <input
                          type="checkbox"
                          checked={chronic[c] || false}
                          onChange={(e) =>
                            setChronic((prev) => ({
                              ...prev,
                              [c]: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-200"
                        />
                        {c}
                      </label>
                    ),
                  )}
                </div>
              </div>

              {/* OBAT RUTIN */}
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                  <DocumentTextIcon className="h-5 w-5 text-violet-500" /> Obat
                  Rutin
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {meds.map((m, i) => (
                    <span
                      key={`med-${i}-${m}`}
                      className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-800"
                    >
                      {m}
                      <button
                        type="button"
                        onClick={() =>
                          setMeds((prev) => prev.filter((_, j) => j !== i))
                        }
                        className="hover:text-violet-600"
                      >
                        <XCircleIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={newMed}
                    onChange={(e) => setNewMed(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addMed();
                      }
                    }}
                    className="flex-1 min-w-[120px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    placeholder="Obat rutin..."
                    maxLength={60}
                  />
                </div>
                <button
                  type="button"
                  onClick={addMed}
                  className="mt-1 text-xs text-violet-600 hover:underline"
                >
                  + Tambah obat
                </button>
              </div>

              {/* GOLONGAN DARAH */}
              <div>
                <label
                  htmlFor="bloodType"
                  className="mb-1 block text-sm font-semibold text-zinc-800"
                >
                  Golongan Darah
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
                {touched && !bloodType && (
                  <p className="mt-1 text-xs text-red-600">
                    Golongan darah wajib diisi.
                  </p>
                )}
              </div>

              {/* KONTAK DARURAT */}
              <div>
                <h2 className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
                  <UserCircleIcon className="h-5 w-5 text-rose-500" /> Kontak
                  Darurat
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Minimal 1, maksimal 3 kontak.
                </p>
                <div className="mt-2 space-y-3">
                  {contacts.map((c, i) => (
                    <div
                      key={`contact-${i}`}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      <input
                        value={c.name}
                        onChange={(e) => updateContact(i, "name", e.target.value)}
                        placeholder={`Nama ${i === 0 ? "(wajib)" : "(opsional)"}`}
                        aria-label="Nama kontak darurat"
                        className="rounded-xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                        maxLength={60}
                      />
                      <input
                        value={c.phone}
                        onChange={(e) => updateContact(i, "phone", e.target.value)}
                        placeholder="No. HP"
                        aria-label="Nomor HP kontak darurat"
                        className="rounded-xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                        maxLength={14}
                      />
                      {contacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContact(i)}
                          className="text-xs text-zinc-400 hover:text-red-600 sm:col-span-2 text-left"
                        >
                          Hapus kontak ini
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {contacts.length < 3 && (
                  <button
                    type="button"
                    onClick={addContact}
                    className="mt-2 text-xs text-teal-600 hover:underline"
                  >
                    + Kontak darurat lain
                  </button>
                )}
                {touched &&
                  contacts.some((c) => !c.name.trim() || !c.phone.trim()) && (
                    <p className="mt-1 text-xs text-red-600">
                      Isi lengkap nama + HP untuk setiap kontak.
                    </p>
                  )}
              </div>

              {/* CATATAN */}
              <div>
                <label
                  htmlFor="notes"
                  className="mb-1 block text-sm font-semibold text-zinc-800"
                >
                  Catatan Singkat (opsional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: alergi obat tertentu, pakai alat bantu dengar, dll."
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  rows={4}
                  maxLength={500}
                />
              </div>

              {error && (
                <p className="rounded-lg border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
                  ⚠️ {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[56px] rounded-lg bg-teal-600 px-6 py-4 text-base font-semibold text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
              >
                {submitting ? "Menyimpan..." : "Simpan Data Kritis"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}