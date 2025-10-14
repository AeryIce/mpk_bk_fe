// src/app/label/preview/page.tsx
"use client";

export const dynamic = "force-dynamic"; // ⛔️ disable static prerender
export const revalidate = 0;

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function LabelPreviewPage() {
  const sp = useSearchParams();

  const instansi = sp.get("instansi") || "";
  const pic = sp.get("pic") || "";
  const jabatan = sp.get("jabatan") || "";
  const email = sp.get("email") || "";
  const wa = sp.get("wa") || "";
  const alamat = sp.get("alamat") || "";
  const kelurahan = sp.get("kelurahan") || "";
  const kecamatan = sp.get("kecamatan") || "";
  const kota = sp.get("kota") || "";
  const provinsi = sp.get("provinsi") || "";
  const kodepos = sp.get("kodepos") || "";
  const catatan = sp.get("catatan") || "";
  const fullAddress = sp.get("fullAddress") || "";

  const mapsUrl = useMemo(
    () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
    [fullAddress]
  );

  const qrUrl = useMemo(
    () => `https://chart.googleapis.com/chart?chs=260x260&cht=qr&chl=${encodeURIComponent(mapsUrl)}`,
    [mapsUrl]
  );

  useEffect(() => {
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-100 p-4 print:bg-white">
      <div
        className="mx-auto bg-white rounded-xl shadow p-4 print:shadow-none print:p-0"
        style={{ width: "105mm", height: "148mm" /* A6 portrait */ }}
      >
        {/* header brand */}
        <div className="flex items-center justify-between border-b pb-2">
          <div className="text-sm">
            <div className="font-semibold">Buku Kenangan MPK KAJ</div>
            <div className="text-xs text-slate-500">Label Pengiriman</div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/LogoMPK50th.png" alt="Logo" className="h-10 w-auto" />
        </div>

        {/* body */}
        <div className="grid grid-cols-2 gap-3 mt-3 h-[calc(148mm-60px)]">
          {/* alamat */}
          <div className="col-span-1 flex flex-col">
            <div className="text-xs text-slate-500">Tujuan</div>
            <div className="text-base font-semibold leading-snug">{instansi}</div>
            <div className="text-sm mt-1 leading-snug whitespace-pre-line">
              {alamat}
              {kelurahan && `\nKel. ${kelurahan}`}
              {kecamatan && `\nKec. ${kecamatan}`}
              {kota && `\n${kota}`}
              {provinsi && `\n${provinsi}`}
              {kodepos && ` ${kodepos}`}
            </div>
            <div className="mt-2 text-xs text-slate-600">
              PIC: <span className="font-medium">{pic}</span>
              {jabatan ? ` (${jabatan})` : ""}
            </div>
            <div className="text-xs text-slate-600">Email: {email || "-"}</div>
            <div className="text-xs text-slate-600">WA: {wa || "-"}</div>

            {catatan && (
              <div className="mt-2 text-xs">
                <span className="font-semibold">Catatan: </span>
                {catatan}
              </div>
            )}

            <div className="mt-auto pt-2 text-[10px] text-slate-500 break-words">Maps: {fullAddress}</div>
          </div>

          {/* QR */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR to Google Maps" className="w-[58mm] h-[58mm]" />
            <div className="mt-2 text-[10px] text-slate-500 text-center break-words">Scan untuk navigasi</div>
          </div>
        </div>
      </div>

      {/* print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A6;
            margin: 6mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
