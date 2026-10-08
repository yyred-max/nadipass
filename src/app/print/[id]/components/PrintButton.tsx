"use client";

import { QRCodeSVG } from "qrcode.react";

export default function PrintButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`inline-flex h-[56px] items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-500 ${className}`}
    >
      Print / Cetak
    </button>
  );
}
