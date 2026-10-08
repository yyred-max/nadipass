'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScanContent() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const handleScanSuccess = (decodedText: string) => {
    const match = decodedText.match(/\/e\/([a-z0-9]+)/i);
    if (match) {
      router.push(`/e/${match[1]}`);
    } else {
      setError('QR tidak valid. Pastikan QR dari NadiPass.');
    }
  };

  const startCamera = async () => {
    setError(null);
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        handleScanSuccess,
        () => {}
      );
      setScanning(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Kamera tidak bisa dibuka. Coba upload gambar.'
      );
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current.clear();
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;
      const decodedText = await html5QrCode.scanFile(file, /* multiple=*/ false);
      handleScanSuccess(decodedText);
    } catch {
      setError('Gagal membaca QR dari gambar.');
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Scan QR Pasien
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Arahkan kamera ke QR di HP/helm/dompet pasien.
        </p>

        <div
          id="qr-reader"
          className="mt-6 mx-auto rounded-xl border border-zinc-200 bg-black overflow-hidden"
          style={{ width: '100%', maxWidth: 400, aspectRatio: '1/1' }}
        />

        <div className="mt-4 flex items-center justify-center gap-3">
          {scanning ? (
            <button
              onClick={stopCamera}
              className="rounded-xl bg-red-600 px-5 py-3 text-white font-semibold shadow-sm transition hover:bg-red-500"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="rounded-xl bg-teal-600 px-5 py-3 text-white font-semibold shadow-sm transition hover:bg-teal-500"
            >
              Mulai Scan
            </button>
          )}
          <label className="cursor-pointer rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50">
            Upload Gambar QR
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}