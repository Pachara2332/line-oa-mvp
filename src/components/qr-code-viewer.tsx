"use client";

import { useState } from "react";
import Image from "next/image";
import { Download } from "lucide-react";
import { Modal } from "./ui/modal";

export function QrCodeViewer({ qrUrl, sourceName, code }: { qrUrl: string; sourceName: string; code: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const qrImageSrc = `/api/qr?text=${encodeURIComponent(qrUrl)}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrImageSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR_${code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download QR code", error);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="overflow-hidden rounded-xl border border-slate-200 transition-transform hover:scale-105 hover:border-emerald-400 focus:outline-none"
        title="View large QR Code"
      >
        <Image alt={sourceName} height={64} src={qrImageSrc} unoptimized width={64} className="bg-white" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="QR Code">
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="rounded-2xl border-4 border-emerald-100 bg-white p-4 shadow-sm">
            <Image alt={sourceName} height={256} src={qrImageSrc} unoptimized width={256} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-gray-100">{sourceName}</h3>
          <p className="mt-1 text-sm text-slate-500">รหัส: <code className="rounded bg-slate-100 px-2 py-1 text-xs dark:bg-zinc-800">{code}</code></p>
          
          <button 
            onClick={handleDownload}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <Download size={18} />
            ดาวน์โหลด QR Code
          </button>
        </div>
      </Modal>
    </>
  );
}
