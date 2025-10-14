"use client";

import { useEffect, useMemo, useState } from "react";
import MapPicker from "@/src/components/MapPicker";

type FormState = {
  instansi: string; pic: string; jabatan?: string;
  email: string; wa: string;
  alamat: string; kelurahan: string; kecamatan: string; kota: string; provinsi: string; kodepos: string;
  catatan?: string;
};

type NominatimResp = { address?: Record<string, string> };

const LS_KEY = "bk_register_draft_v1";

const emptyForm: FormState = {
  instansi: "", pic: "", jabatan: "",
  email: "", wa: "",
  alamat: "", kelurahan: "", kecamatan: "", kota: "", provinsi: "", kodepos: "",
  catatan: "",
};

export default function PendaftaranClient() {
  const [f, setF] = useState<FormState>(emptyForm);
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // load draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FormState & { lat?: number; lng?: number };
        const { lat, lng, ...rest } = parsed;
        setF({ ...emptyForm, ...rest });
        setCoords({ lat: lat ?? null, lng: lng ?? null });
      }
    } catch {}
  }, []);

  // save draft
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ ...f, ...coords })); } catch {}
  }, [f, coords]);

  // helpers
  function normProv(p?: string) {
    if (!p) return "";
    const t = p.toLowerCase();
    if (t.includes("jakarta")) return "DKI Jakarta";
    return p;
  }
  function onChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setF((prev) => ({ ...prev, [key]: val }));
  }
  const canSubmit = useMemo(() =>
    !!(f.email.trim() && f.wa.trim() && f.instansi.trim() && f.pic.trim()), [f]);

  // reset alamat saat pointing berubah
  useEffect(() => {
    if (coords.lat == null || coords.lng == null) return;
    setF((prev) => ({ ...prev, alamat: "", kelurahan: "", kecamatan: "", kota: "", provinsi: "", kodepos: "" }));
  }, [coords.lat, coords.lng]);

  // reverse geocode
  useEffect(() => {
    if (coords.lat == null || coords.lng == null) return;
    let ignore = false;
    setGeoMsg("Mengambil alamat dari peta…");

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&zoom=18&lat=${coords.lat}&lon=${coords.lng}`;
    fetch(url, { headers: { Accept: "application/json", "Accept-Language": "id" } })
      .then((r) => r.json() as Promise<NominatimResp>)
      .then((j) => {
        if (ignore) return;
        const a = j.address ?? {};
        const jalan = [a.road, a.residential, a.pedestrian, a.footway, a.path, a.house_number].filter(Boolean).join(" ").trim();
        const kel = (a.village || a.hamlet || a.neighbourhood || a.suburb || "") as string;
        const kotaGuess = (a.city || a.town || a.municipality || a.county || a.city_district || "") as string;
        let kec = (a.subdistrict || a.district || (a.suburb && a.suburb !== kel ? a.suburb : "")) as string;
        if (!kec && a.city_district && !/jakarta/i.test(a.city_district as string)) kec = a.city_district as string;
        if (kec && kotaGuess && kec.toLowerCase() === kotaGuess.toLowerCase()) kec = "";
        const prov = normProv((a.state || a.region || a.province || "") as string);
        const kodepos = (a.postcode || "") as string;

        setF((prev) => ({ ...prev, alamat: jalan, kelurahan: kel, kecamatan: kec, kota: kotaGuess, provinsi: prov, kodepos }));
        setGeoMsg(null);
      })
      .catch(() => setGeoMsg("Gagal mengambil alamat otomatis. Isi manual tidak apa-apa."));
    return () => { ignore = true; };
  }, [coords.lat, coords.lng]);

  const fullAddress = useMemo(() => {
    const segs = [f.alamat, f.kelurahan && `Kel. ${f.kelurahan}`, f.kecamatan && `Kec. ${f.kecamatan}`, f.kota, f.provinsi, f.kodepos, "Indonesia"].filter(Boolean);
    return segs.join(", ");
  }, [f]);

  const mapsUrl = useMemo(() => {
    if (coords.lat != null && coords.lng != null) return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  }, [coords, fullAddress]);

  async function useCurrentLocation() {
    setLocError(null);
    if (!("geolocation" in navigator)) { setLocError("Perangkat tidak mendukung geolokasi."); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { const { latitude, longitude } = pos.coords; setCoords({ lat: latitude, lng: longitude }); setLocLoading(false); },
      (err) => { setLocLoading(false); setLocError(err.message || "Gagal mengambil lokasi."); },
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
      setSubmitMsg({ ok: true, text: "Terima kasih! Data berhasil dikirim." });
      setSubmitting(false);
    } catch {
      setSubmitting(false);
      setSubmitMsg({ ok: false, text: "Gagal mengirim. Mohon cek kembali isian." });
    }
  }

  function resetForm() {
    localStorage.removeItem(LS_KEY);
    setF(emptyForm);
    setCoords({ lat: null, lng: null });
    setLocError(null);
    setGeoMsg(null);
    setSubmitMsg(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* CARD besar mengikuti UI lama */}
      <div className="relative bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-black/5 p-5 md:p-7">
        {/* GRID: kiri form, kanan peta */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
          {/* === KIRI: FORM + WATERMARK tipis === */}
          <div className="relative">
            {/* watermark tidak mengubah layout */}
            <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <img
                src="/brand/LogoMPK50th.png"
                alt=""
                className="max-w-[65%]"
                style={{ opacity: 0.06, filter: "blur(0.8px)" }}
              />
            </div>

            <div className="relative z-10">
              <h1 className="text-2xl font-semibold text-neutral-800">Form Pendaftaran Pengiriman</h1>
              <p className="text-neutral-600 mt-1 text-sm">
                Isi data berikut dengan benar. <span className="font-medium text-orange-600">Email</span> dan{" "}
                <span className="font-medium text-orange-600">No WhatsApp</span> wajib diisi.
              </p>

              {/* IDENTITAS */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Instansi / Sekolah" value={f.instansi} onChange={(v) => onChange("instansi", v)} required />
                <Field label="Nama PIC" value={f.pic} onChange={(v) => onChange("pic", v)} required />
                <Field label="Jabatan (opsional)" value={f.jabatan || ""} onChange={(v) => onChange("jabatan", v)} />
                <Field type="email" label="Email PIC" value={f.email} onChange={(v) => onChange("email", v)} required />
                <Field label="No. WhatsApp PIC" value={f.wa} onChange={(v) => onChange("wa", v)} inputMode="tel" required />
                <Field label="Kode Pos" value={f.kodepos} onChange={(v) => onChange("kodepos", v)} inputMode="numeric" />
              </div>

              {/* ALAMAT */}
              <div className="mt-4 grid grid-cols-1 gap-3">
                <Field label="Alamat Lengkap (jalan, RT/RW, nomor…)" value={f.alamat} onChange={(v) => onChange("alamat", v)} required />
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

              {/* ACTIONS */}
              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <button type="button" className="btn btn-ghost w-full sm:w-auto" onClick={resetForm} title="Kosongkan semua isian & hapus draft">
                  Reset Form
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
                {submitMsg && <div className={`text-sm ${submitMsg.ok ? "text-emerald-600" : "text-rose-600"} sm:ml-2`}>{submitMsg.text}</div>}
              </div>
            </div>
          </div>

          {/* === KANAN: KARTU PETA === */}
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-neutral-800">Pilih Titik di Peta</div>
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locLoading}
                className="btn btn-primary !py-1"
                title="Gunakan lokasi saya"
              >
                {locLoading ? "Mendeteksi…" : "Gunakan Lokasi Saya"}
              </button>
            </div>

            <div className="mt-2">
              <MapPicker
                lat={coords.lat}
                lng={coords.lng}
                onPointChange={(lat, lng) => setCoords({ lat, lng })}
                height={320}
              />
            </div>

            {locError && <div className="mt-2 text-xs text-rose-600">{locError}</div>}
            {geoMsg && <div className="mt-2 text-xs text-amber-600">{geoMsg}</div>}

            <div className="mt-2 text-xs text-slate-600">
              {coords.lat != null && coords.lng != null
                ? <>Titik: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</>
                : <>Titik: Klik peta untuk memilih</>}
            </div>
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs underline text-orange-600">
              Buka di Google Maps
            </a>
            <div className="mt-1 text-xs text-slate-500">Indonesia</div>
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
      <span className="text-xs font-medium text-slate-600">{label}{required ? " *" : ""}</span>
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
