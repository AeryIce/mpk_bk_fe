// src/app/pendaftaran/PendaftaranClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MapPicker from "@/src/components/MapPicker";

type FormState = {
  instansi: string; pic: string; jabatan?: string;
  email: string; wa: string;
  alamat: string; kelurahan: string; kecamatan: string; kota: string; provinsi: string; kodepos: string;
  catatan?: string;
};

const LS_KEY = "bk_register_draft_v1";

export default function PendaftaranClient() {
  const [f, setF] = useState<FormState>({
    instansi: "", pic: "", jabatan: "", email: "", wa: "",
    alamat: "", kelurahan: "", kecamatan: "", kota: "", provinsi: "", kodepos: "",
    catatan: "",
  });
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  // submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FormState & { lat?: number; lng?: number };
        const { lat, lng, ...rest } = parsed;
        setF(rest);
        if (lat && lng) setCoords({ lat, lng });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ ...f, ...coords })); } catch {}
  }, [f, coords]);

  const fullAddress = useMemo(() => {
    const segs = [
      f.alamat,
      f.kelurahan && `Kel. ${f.kelurahan}`,
      f.kecamatan && `Kec. ${f.kecamatan}`,
      f.kota, f.provinsi, f.kodepos,
      "Indonesia",
    ].filter(Boolean);
    return segs.join(", ");
  }, [f]);

  const mapsUrl = useMemo(() => {
    if (coords.lat !== undefined && coords.lng !== undefined) {
      return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  }, [coords, fullAddress]);

  function onChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setF((prev) => ({ ...prev, [key]: val }));
  }

  async function useCurrentLocation() {
    setLocError(null);
    if (!("geolocation" in navigator)) {
      setLocError("Perangkat tidak mendukung geolokasi.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocLoading(false);
      },
      (err) => {
        setLocLoading(false);
        setLocError(err.message || "Gagal mengambil lokasi.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }

  async function submitPendaftaran() {
    setSubmitMsg(null);
    try {
      setSubmitting(true);
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const res = await fetch(`${base}/api/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          instansi: f.instansi.trim(),
          pic: f.pic.trim(),
          jabatan: f.jabatan?.trim() || null,
          email: f.email.trim(),
          wa: f.wa.trim(),
          alamat: f.alamat.trim(),
          kelurahan: f.kelurahan.trim() || null,
          kecamatan: f.kecamatan.trim() || null,
          kota: f.kota.trim(),
          provinsi: f.provinsi.trim(),
          kodepos: f.kodepos.trim() || null,
          lat: coords.lat ?? null,
          lng: coords.lng ?? null,
          catatan: f.catatan?.trim() || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSubmitMsg({ ok: true, text: "Pendaftaran tersimpan. Terima kasih!" });
      // localStorage.removeItem(LS_KEY); // aktifkan jika ingin kosongkan draft
    } catch {
      setSubmitMsg({ ok: false, text: "Gagal menyimpan. Coba lagi." });
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    f.instansi && f.pic && f.email && f.wa && f.alamat && f.kota && f.provinsi;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="card p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Pendaftaran Pengiriman (Distribusi)</h1>
            <p className="text-sm text-slate-500">Isi data PIC & alamat lengkap. Klik peta atau gunakan lokasi untuk memilih titik akurat.</p>
          </div>
          <Link href="/admin/registrations" className="btn btn-ghost">Ke Admin</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form kiri */}
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
              <Field label="Alamat Lengkap (jalan, RT/RW, nomor, gedung)" value={f.alamat} onChange={(v) => onChange("alamat", v)} required />
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

            {/* tombol */}
            <div className="mt-5 flex flex-col sm:flex-row flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-ghost w-full sm:w-auto"
                onClick={() => localStorage.removeItem(LS_KEY)}
              >
                Hapus Draft
              </button>

              <button
                type="button"
                className="btn btn-primary w-full sm:w-auto disabled:opacity-60"
                onClick={submitPendaftaran}
                disabled={!canSubmit || submitting}
                title={!canSubmit ? "Lengkapi data wajib terlebih dahulu" : ""}
              >
                {submitting ? "Menyimpan…" : "Kirim Pendaftaran"}
              </button>

              {submitMsg && (
                <div className={`text-sm ${submitMsg.ok ? "text-emerald-600" : "text-rose-600"} sm:ml-2`}>
                  {submitMsg.text}
                </div>
              )}
            </div>
          </div>

          {/* Peta kanan (picker) */}
          <div className="lg:col-span-2">
            <div className="card p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-slate-600">Pilih Titik di Peta</div>
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  className="btn btn-ghost text-xs w-auto"
                  disabled={locLoading}
                  title="Gunakan lokasi perangkat"
                >
                  {locLoading ? "Mengambil lokasi…" : "Gunakan Lokasi Saya"}
                </button>
              </div>

              <MapPicker lat={coords.lat} lng={coords.lng} onChange={setCoords} />

              {locError && <div className="mt-2 text-xs text-rose-600">{locError}</div>}

              <div className="mt-2 text-xs text-slate-600">
                Titik: {coords.lat !== undefined ? `${coords.lat.toFixed(5)}, ${coords.lng?.toFixed(5)}` : "Klik peta untuk memilih"}
              </div>
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs underline text-[color:var(--brand)]">
                Buka di Google Maps
              </a>
              <div className="mt-2 text-xs text-slate-500 break-words">
                {fullAddress || "Alamat lengkap akan muncul di sini…"}
              </div>
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
  label: string; value: string; onChange: (v: string) => void; type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; required?: boolean;
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
