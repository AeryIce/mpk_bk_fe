"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type FormState = {
  instansi: string;
  pic: string;
  jabatan?: string;
  email: string;
  wa: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kodepos: string;
  catatan?: string;
};

const LS_KEY = "bk_register_draft_v1";

export default function RegisterPage() {
  const [f, setF] = useState<FormState>({
    instansi: "",
    pic: "",
    jabatan: "",
    email: "",
    wa: "",
    alamat: "",
    kelurahan: "",
    kecamatan: "",
    kota: "",
    provinsi: "",
    kodepos: "",
    catatan: "",
  });

  // restore draft jika ada
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setF(JSON.parse(raw));
    } catch {}
  }, []);

  // simpan draft tiap perubahan
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(f)); } catch {}
  }, [f]);

  const fullAddress = useMemo(() => {
    const segs = [
      f.alamat,
      f.kelurahan && `Kel. ${f.kelurahan}`,
      f.kecamatan && `Kec. ${f.kecamatan}`,
      f.kota,
      f.provinsi,
      f.kodepos,
      "Indonesia",
    ].filter(Boolean);
    return segs.join(", ");
  }, [f]);

  const mapsUrl = useMemo(
    () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
    [fullAddress]
  );

  function onChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setF((prev) => ({ ...prev, [key]: val }));
  }

  function openLabelPreview() {
    // oper data via querystring ke halaman label preview
    const q = new URLSearchParams({
      instansi: f.instansi,
      pic: f.pic,
      jabatan: f.jabatan || "",
      email: f.email,
      wa: f.wa,
      alamat: f.alamat,
      kelurahan: f.kelurahan,
      kecamatan: f.kecamatan,
      kota: f.kota,
      provinsi: f.provinsi,
      kodepos: f.kodepos,
      catatan: f.catatan || "",
      fullAddress,
    }).toString();
    window.open(`/label/preview?${q}`, "_blank");
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="card p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Registrasi Pengiriman (Distribusi)</h1>
            <p className="text-sm text-slate-500">
              Isi data PIC & alamat lengkap. Kita pakai ini untuk cetak label dan negosiasi ekspedisi.
            </p>
          </div>
          <Link href="/admin/warehouse" className="btn btn-ghost">Ke Gudang</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form kiri (lebih lebar) */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Instansi / Sekolah" value={f.instansi} onChange={(v) => onChange("instansi", v)} required />
              <Field label="Nama PIC" value={f.pic} onChange={(v) => onChange("pic", v)} required />
              <Field label="Jabatan (opsional)" value={f.jabatan || ""} onChange={(v) => onChange("jabatan", v)} />
              <Field type="email" label="Email PIC" value={f.email} onChange={(v) => onChange("email", v)} required />
              <Field label="No. WhatsApp PIC" value={f.wa} onChange={(v) => onChange("wa", v)} inputMode="tel" required />
              <Field label="Kode Pos" value={f.kodepos} onChange={(v) => onChange("kodepos", v)} inputMode="numeric" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <Field
                label="Alamat Lengkap (jalan, RT/RW, nomor, gedung)"
                value={f.alamat}
                onChange={(v) => onChange("alamat", v)}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Kelurahan" value={f.kelurahan} onChange={(v) => onChange("kelurahan", v)} />
                <Field label="Kecamatan" value={f.kecamatan} onChange={(v) => onChange("kecamatan", v)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Kota/Kabupaten" value={f.kota} onChange={(v) => onChange("kota", v)} required />
                <Field label="Provinsi" value={f.provinsi} onChange={(v) => onChange("provinsi", v)} required />
              </div>
              <Field label="Catatan untuk kurir (opsional)" value={f.catatan || ""} onChange={(v) => onChange("catatan", v)} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="btn btn-ghost" onClick={() => localStorage.removeItem(LS_KEY)}>
                Hapus Draft
              </button>
              <button type="button" className="btn btn-primary" onClick={openLabelPreview}>
                Preview & Cetak Label →
              </button>
            </div>
          </div>

          {/* Peta kanan (live) */}
          <div className="lg:col-span-2">
            <div className="card p-4">
              <div className="mb-2 text-sm text-slate-600">Preview Peta Tujuan</div>
              <div className="text-xs text-slate-500 break-words">{fullAddress || "Alamat lengkap akan muncul di sini…"}</div>
              <div className="mt-3 aspect-video w-full rounded-xl overflow-hidden border border-amber-200/60">
                {fullAddress ? (
                  <iframe
                    title="Map preview"
                    className="w-full h-full"
                    style={{ border: 0 }}
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`}
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-slate-400 text-sm">Isi alamat untuk preview peta</div>
                )}
              </div>
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs underline text-[color:var(--brand)]">
                Buka di Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", inputMode, required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-amber-300/60 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
      />
    </label>
  );
}
