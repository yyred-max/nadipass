import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import PrintButton from "./components/PrintButton";

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id },
  });

  if (!patient) {
    notFound();
  }

  const qrDataUrl = `https://nadipass.app/e/${id}`;
  const shortId = id.slice(0, 6).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 print:py-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logoNadipass.png"
            alt="NadiPass"
            width={64}
            height={64}
            className="w-16 h-16 shrink-0"
          />
          <div>
            <p className="text-xs font-semibold tracking-widest text-teal-600 uppercase">
              NadiPass
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">
              SCAN JIKA TIDAK SADAR
            </h1>
            <p className="mt-1 text-sm text-zinc-500">ID: {shortId}</p>
          </div>
        </div>
        <Image
          src="/mascot.png"
          alt="Maskot NadiPass"
          width={128}
          height={128}
          className="w-24 h-24 sm:w-32 sm:h-32 shrink-0"
          priority
        />
      </div>

      {/* Cara Penggunaan */}
      <div className="mb-8 rounded-2xl bg-teal-50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Image
            src="/logoNadipass.png"
            alt="NadiPass Logo"
            width={48}
            height={48}
            className="w-12 h-12 shrink-0"
          />
          <Image
            src="/mascot.png"
            alt="Nadi"
            width={48}
            height={48}
            className="w-12 h-12"
          />
          <h2 className="text-lg font-bold text-zinc-800">Cara Penggunaan</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-lg">
              1
            </div>
            <p className="mt-2 text-sm font-semibold text-zinc-700">Scan QR</p>
            <p className="text-xs text-zinc-500 mt-1">
              Petugas scan QR di HP/helm/dompet
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-lg">
              2
            </div>
            <p className="mt-2 text-sm font-semibold text-zinc-700">Pilih Alasan</p>
            <p className="text-xs text-zinc-500 mt-1">
              Tap IGD / Ambulans / Event
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-lg">
              3
            </div>
            <p className="mt-2 text-sm font-semibold text-zinc-700">Data Terbuka</p>
            <p className="text-xs text-zinc-500 mt-1">
              Alergi, obat, kontak langsung tampil
            </p>
          </div>
        </div>
      </div>

      {/* 3 Layout Stiker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {/* Stiker HP bulat */}
        <div className="flex flex-col items-center">
          <div className="w-[5cm] h-[5cm] rounded-full bg-white p-3 shadow-lg border-4 border-teal-600 flex flex-col items-center justify-center">
            <Image
              src="/logoNadipass.png"
              alt="NadiPass"
              width={36}
              height={36}
              className="w-6 h-6"
            />
            <QRCodeSVG
              value={qrDataUrl}
              size={130}
              level="H"
              bgColor="#ffffff"
              fgColor="#000000"
            />
            <p className="mt-1 text-[8px] font-bold text-red-600 text-center leading-tight">
              SCAN JIKA
              <br />
              TIDAK SADAR
            </p>
            <Image
              src="/mascot.png"
              alt="Nadi"
              width={20}
              height={20}
              className="w-4 h-4 mt-1"
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500 text-center">
            Stiker HP (5cm bulat)
          </p>
        </div>

        {/* Stiker helm persegi */}
        <div className="flex flex-col items-center">
          <div className="w-[6cm] h-[6cm] rounded-xl bg-white p-3 shadow-lg border-4 border-teal-600 flex flex-col items-center justify-center relative">
            <Image
              src="/logoNadipass.png"
              alt="NadiPass"
              width={40}
              height={40}
              className="w-7 h-7"
            />
            <QRCodeSVG
              value={qrDataUrl}
              size={160}
              level="H"
              bgColor="#ffffff"
              fgColor="#000000"
            />
            <p className="mt-1 text-[9px] font-bold text-red-600 text-center leading-tight">
              SCAN JIKA TIDAK SADAR
            </p>
            <Image
              src="/mascot.png"
              alt="Nadi"
              width={24}
              height={24}
              className="w-5 h-5 absolute bottom-2 right-2"
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500 text-center">
            Stiker Helm (6cm persegi)
          </p>
        </div>
      </div>

      {/* Kartu ATM */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-[8.5cm] h-[5.4cm] rounded-xl bg-white shadow-lg border-2 border-zinc-300 flex overflow-hidden relative">
          {/* Depan */}
          <div className="flex-1 p-3 flex flex-col justify-between bg-gradient-to-br from-teal-50 to-white border-r border-zinc-200">
            <div>
              <Image
                src="/logoNadipass.png"
                alt="NadiPass"
                width={48}
                height={48}
                className="w-10 h-10"
              />
              <p className="text-[10px] font-bold text-red-600 mt-1 leading-tight">
                SCAN JIKA
                <br />
                TIDAK SADAR
              </p>
            </div>
            <div className="flex justify-center">
              <QRCodeSVG
                value={qrDataUrl}
                size={100}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <p className="text-[8px] text-zinc-400 text-center">ID: {shortId}</p>
          </div>
          {/* Belakang */}
          <div className="flex-1 p-3 flex flex-col justify-between bg-white relative">
            <div>
              <p className="text-[10px] font-bold text-zinc-700">
                Nama: {patient.fullName || "-"}
              </p>
              <p className="text-[9px] text-zinc-500 mt-1">
                Data darurat terbuka saat pecah kaca
              </p>
            </div>
            <ul className="text-[8px] text-zinc-400 space-y-0.5">
              <li>• Nama & tahun lahir (kartu terkunci)</li>
              <li>• Alergi, obat, penyakit (pecah kaca)</li>
              <li>• Kontak keluarga (otomatis diberi tahu)</li>
            </ul>
            <Image
              src="/mascot.png"
              alt="Nadi"
              width={28}
              height={28}
              className="w-6 h-6 absolute bottom-2 right-2"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-zinc-500 text-center">
          Kartu Dompet (8.5 x 5.4 cm)
        </p>
      </div>

      {/* Tombol Print */}
      <div className="flex justify-center print:hidden">
        <PrintButton />
      </div>

      {/* Footer dengan Maskot */}
      <div className="mt-8 pt-4 border-t border-zinc-200 flex items-center justify-center gap-2 text-xs text-zinc-400">
        <Image
          src="/mascot.png"
          alt="Nadi"
          width={24}
          height={24}
          className="w-6 h-6"
        />
        <span>NadiPass · nadipass.app · v1.0</span>
      </div>

      <p className="mt-2 text-center text-[11px] leading-4 text-zinc-400">
        NadiPass bukan rekam medis resmi. Bukan pengganti pemeriksaan klinis.
      </p>
    </div>
  );
}