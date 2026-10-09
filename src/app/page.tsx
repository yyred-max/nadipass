import Link from 'next/link';

const teal = '#0d9488';
const red = '#dc2626';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <section className="bg-white px-6 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-2xl">
          <img
            src="/logoNadipass.png"
            alt="NadiPass"
            className="mx-auto mb-10 h-14 w-auto sm:h-16 md:h-20"
          />
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
            Petugas bisa buka data darurat{' '}
            <span className="text-red-500">meski pasien pingsan.</span>
          </h1>
          <p className="mt-5 text-base leading-8 text-zinc-600 sm:text-lg">
            Keluarga langsung tahu. Setiap akses tercatat.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="flex h-[56px] items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-teal-500"
            >
              Daftar Sekarang
            </Link>
            <a
              href="/onboarding"
              className="flex h-[56px] items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-base font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              Coba Onboarding
            </a>
            <a
              href="/scan"
              className="flex h-[56px] items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 text-base font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Scan QR (Petugas)
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900">Cara Kerja</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { n: '01', t: 'Isi data kritis sekali', d: 'Alergi, obat, kontak darurat, dan golongan darah disimpan terpisah, terenkripsi di server.' },
              { n: '02', t: 'Tempel QR di HP / helm / dompet', d: 'QR berisi ID saja. Tidak ada login, hanya scan.' },
              { n: '03', t: 'Petugas scan · data terbuka 2 tap', d: 'Dua tap pembuka, data segera terbaca di layar petugas.' },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
                <span className="text-xs font-semibold text-teal-600">Langkah {s.n}</span>
                <h3 className="mt-2 text-lg font-semibold text-zinc-900">{s.t}</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-500">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900">
            Yang Membedakan
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { t: 'Tanpa login', d: 'Petugas tidak perlu akun. Cukup scan QR dan data terbuka.', c: 'border-l-4 border-l-teal-500 pl-4' },
              { t: 'Data terenkripsi', d: 'AES-256-GCM di server. Hanya field darurat yang dibuka saat pecah kaca.', c: 'border-l-4 border-l-red-500 pl-4' },
              { t: 'Keluarga dinotifikasi', d: 'Otomatis lewat WA / SMS saat petugas membuka data.', c: 'border-l-4 border-l-teal-500 pl-4' },
            ].map((s) => (
              <div key={s.t} className={`rounded-2xl border border-zinc-200 bg-white p-6 ${s.c}`}>
                <h3 className="text-lg font-semibold text-zinc-900">{s.t}</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-500">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-white px-6 py-10 text-center text-xs text-zinc-400">
        NadiPass bukan rekam medis resmi dan bukan pengganti pemeriksaan klinis.
      </footer>
    </div>
  );
}
