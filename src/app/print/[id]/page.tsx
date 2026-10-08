import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
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
    <div className="grid max-w-4xl grid-cols-1 gap-6 px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="text-center">
        <p className="text-xs font-semibold tracking-widest text-teal-600 uppercase">NadiPass</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">SCAN JIKA TIDAK SADAR</h1>
        <p className="mt-1 text-sm text-zinc-500">{shortId}</p>
      </div>

      <div className="grid gap-6">
        {/* Layout 1: Stiker HP bulat */}
        <div className="flex justify-center">
          <div className="w-[5cm] h-[5cm] rounded-full bg-white p-3 shadow-lg">
            <div className="flex h-full min-h-[4.2cm] items-center justify-center rounded-[calc(50%-3px)] bg-zinc-50 px-4">
              <QRCodeSVG value={qrDataUrl} size={180} level="H" bgColor="#ffffff" fgColor="#000000" />
            </div>
            <p className="mt-2 text-center text-xs text-zinc-400">NadiPass • {id.slice(0, 6)}</p>
          </div>
        </div>

        {/* Layout 2: Stiker helm persegi */}
        <div className="flex justify-center">
          <div className="w-[6cm] h-[6cm] rounded-xl bg-white p-4 shadow-lg">
            <div className="flex h-full items-center justify-center rounded-lg bg-zinc-50 px-4">
              <QRCodeSVG value={qrDataUrl} size={220} level="H" bgColor="#ffffff" fgColor="#000000" />
            </div>
            <p className="mt-2 text-center text-xs text-zinc-400">NadiPass Stiker Helm</p>
          </div>
        </div>

        {/* Layout 3: Kartu ATM */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex h-[8.5cm] gap-4 p-4">
            {/* Depan */}
            <div className="flex-1 rounded-l-xl bg-[#f9fafb] p-3">
              <p className="text-xs font-semibold tracking-widest text-teal-600 uppercase">NadiPass</p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">SCAN JIKA TIDAK SADAR</p>
              <div className="mt-3 flex justify-center">
                <QRCodeSVG value={qrDataUrl} size={140} level="H" bgColor="#ffffff" fgColor="#000000" />
              </div>
              <p className="mt-2 text-center text-xs text-zinc-400">{shortId}</p>
            </div>
            {/* Belakang */}
            <div className="flex-1 rounded-r-xl bg-white p-3">
              <p className="text-xs font-semibold text-zinc-400">Nama / Data Darurat</p>
              <p className="mt-1 text-sm text-zinc-600">(Terbuka saat pecah kaca)</p>
              <p className="mt-3 text-xs text-zinc-400">- Nama</p>
              <p className="text-xs text-zinc-400">- No. HP</p>
              <p className="text-xs text-zinc-400">- Golongan Darah</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print button */}
      <div className="flex justify-center">
        <PrintButton />
      </div>

      <p className="text-center text-[11px] leading-4 text-zinc-400">
        NadiPass bukan rekam medis resmi. Bukan pengganti pemeriksaan klinis.
      </p>
    </div>
  );
}
