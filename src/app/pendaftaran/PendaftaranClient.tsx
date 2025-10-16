"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MapPicker from "@/src/components/MapPicker";

// ===================== Types & Draft =====================
type FormState = {
  instansi: string; pic: string; jabatan?: string;
  email: string; wa: string;
  alamat: string; kelurahan: string; kecamatan: string; kota: string; provinsi: string; kodepos: string;
  catatan?: string;
};

type NominatimResp = { address?: Record<string, string> };

type PathMode = "perusahaan" | "yayasan" | "sekolah";

type YayasanItem = { id: string; name: string };
type SekolahItem = {
  id: string;
  name: string;
  jenjang?: string | null;
  kecamatan?: string | null;
  kabupaten?: string | null;
  kota?: string | null;
  yayasanId: string;
};
type PerusahaanItem = { id: string; name: string };

type Option = { value: string; label: string; meta?: unknown };

const LS_KEY = "bk_register_draft_v1";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const DEBOUNCE_MS = 300;

// ===================== Utils =====================
const emptyForm: FormState = {
  instansi: "", pic: "", jabatan: "",
  email: "", wa: "",
  alamat: "", kelurahan: "", kecamatan: "", kota: "", provinsi: "", kodepos: "",
  catatan: "",
};

// ✅ khusus string → mencegah error generic/unknown[]
function debounceString(
  fn: (q: string) => void | Promise<void>,
  ms = DEBOUNCE_MS
) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (q: string) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => { void fn(q); }, ms);
  };
}

const iIncludes = (a: string, b: string) => a.toLowerCase().includes(b.toLowerCase());
const eqi = (a?: string | null, b?: string | null) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
const pickCity = (s: SekolahItem) =>
  (s.kabupaten?.trim() || s.kota?.trim() || [s.kecamatan, s.kabupaten].filter(Boolean).join("/") || "");

// ===================== API helpers =====================
// — basic yayasan (tab Yayasan)
async function fetchYayasan(q: string, limit = 50, signal?: AbortSignal): Promise<YayasanItem[]> {
  const url = `${API_BASE}/api/master/yayasan?q=${encodeURIComponent(q)}&limit=${limit}`;
  const res = await fetch(url, { headers: { Accept: "application/json" }, signal });
  if (!res.ok) throw new Error("Gagal memuat yayasan");
  return res.json() as Promise<YayasanItem[]>;
}

// — versi BE-scope (path Sekolah): scope by jenjang; pencarian (q) difilter di FE (case-insensitive)
async function fetchYayasanByJenjang(jenjang: string, signal?: AbortSignal): Promise<YayasanItem[]> {
  const sp = new URLSearchParams();
  if (jenjang) sp.set("jenjang", jenjang);
  sp.set("limit", "200");
  const url = `${API_BASE}/api/master/yayasan?${sp.toString()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" }, signal });
  if (!res.ok) throw new Error("Gagal memuat yayasan");
  return res.json() as Promise<YayasanItem[]>;
}

async function fetchCities(params: { yayasanId: string; jenjang?: string }, signal?: AbortSignal): Promise<string[]> {
  const sp = new URLSearchParams({ yayasanId: params.yayasanId });
  if (params.jenjang) sp.set("jenjang", params.jenjang);
  const url = `${API_BASE}/api/master/sekolah/cities?${sp.toString()}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal });
    if (!res.ok) return [];
    return res.json() as Promise<string[]>;
  } catch { return []; }
}

async function fetchSekolah(
  params: { yayasanId: string; jenjang?: string; kota?: string; q?: string; limit?: number },
  signal?: AbortSignal
): Promise<SekolahItem[]> {
  const sp = new URLSearchParams({ yayasanId: params.yayasanId });
  if (params.jenjang) sp.set("jenjang", params.jenjang);
  if (params.kota) sp.set("kota", params.kota);
  // q difilter di FE supaya insensitive
  sp.set("limit", String(params.limit ?? 500));
  const url = `${API_BASE}/api/master/sekolah?${sp.toString()}`;

  let raw: SekolahItem[] = [];
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal });
    if (res.ok) raw = (await res.json()) as SekolahItem[];
  } catch { /* noop */ }

  let data = raw;
  if (params.jenjang) data = data.filter((s) => eqi(s.jenjang ?? "", params.jenjang ?? ""));
  if (params.kota)   data = data.filter((s) => eqi(pickCity(s), params.kota ?? ""));
  if (params.q)      data = data.filter((s) => iIncludes(s.name, params.q!));
  return data;
}

// opsional — jika nanti ada data perusahaan
async function fetchPerusahaan(q: string, limit = 50, signal?: AbortSignal): Promise<PerusahaanItem[]> {
  const url = `${API_BASE}/api/master/perusahaan?q=${encodeURIComponent(q)}&limit=${limit}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal });
    if (!res.ok) return [];
    return res.json() as Promise<PerusahaanItem[]>;
  } catch {
    return [];
  }
}

// ===================== Inline AutoComplete =====================
function AutoComplete({
  label,
  value,
  onChange,
  onSelectOption,
  fetcher,
  placeholder,
  required,
  allowFreeText = true,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSelectOption?: (opt: Option) => void;
  fetcher: (q: string, signal?: AbortSignal) => Promise<Option[]>;
  placeholder?: string;
  required?: boolean;
  allowFreeText?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const acRef = useRef<HTMLLabelElement | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const [hi, setHi] = useState(-1);

  // ✅ pakai debounceString supaya typed sebagai (q: string) => void
  const runFetch = useMemo(
    () =>
      debounceString(async (qq) => {
        if (abortRef.current) abortRef.current.abort();
        const ctl = new AbortController();
        abortRef.current = ctl;
        setLoading(true);
        setErr(null);
        try {
          const opts = await fetcher(qq, ctl.signal);
          setList(opts);
        } catch {
          setErr("Gagal memuat saran");
        } finally {
          setLoading(false);
        }
      }, DEBOUNCE_MS),
    [fetcher]
  );

  // fetch saat ketik & saat dibuka
  useEffect(() => { if (open) runFetch(q); }, [q, open, runFetch]);

  // fetch “tampil semua” saat fokus pertama kali (q kosong)
  useEffect(() => {
    if (!open || q) return;
    runFetch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    function onDoc(ev: MouseEvent) {
      if (!acRef.current) return;
      if (!acRef.current.contains(ev.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const showEmpty = !loading && !err && list.length === 0 && q.trim() !== "";

  return (
    <label className="block relative" ref={acRef}>
      <span className="text-xs font-medium text-slate-600">
        {label}{required ? " *" : ""}
      </span>
      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        onFocus={() => setOpen(true)}
        onChange={(e) => { const v = e.target.value; onChange(v); setQ(v); setOpen(true); }}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setHi((p) => Math.min(p + 1, list.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHi((p) => Math.max(p - 1, 0)); }
          else if (e.key === "Enter") {
            e.preventDefault();
            const idx = hi >= 0 ? hi : 0;
            const opt = list[idx];
            if (opt) { onChange(opt.label); onSelectOption?.(opt); setOpen(false); }
            else if (allowFreeText) { setOpen(false); }
          } else if (e.key === "Escape") { setOpen(false); }
        }}
        className="mt-1 w-full rounded-xl border border-amber-300/60 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-amber-300/60 bg-white shadow-lg max-h-72 overflow-auto">
          {loading && <div className="px-3 py-2 text-xs text-slate-500">Memuat…</div>}
          {err && <div className="px-3 py-2 text-xs text-rose-600">{err}</div>}
          {showEmpty && <div className="px-3 py-2 text-xs text-slate-500">Tidak ada saran</div>}
          {!loading && !err && list.map((opt, idx) => (
            <div
              key={opt.value + idx}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(opt.label); onSelectOption?.(opt); setOpen(false); }}
              onMouseEnter={() => setHi(idx)}
              className={`px-3 py-2 text-sm cursor-pointer ${idx === hi ? "bg-amber-50" : ""}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </label>
  );
}

// ===================== Main =====================
export default function PendaftaranClient() {
  const [f, setF] = useState<FormState>(emptyForm);
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // === New cascading state ===
  const [path, setPath] = useState<PathMode>("perusahaan");

  // Yayasan state
  const [yayasanId, setYayasanId] = useState<string>("");
  const [yayasanLabel, setYayasanLabel] = useState<string>("");

  // Sekolah state
  const [jenjang, setJenjang] = useState<string>("");
  const [kotaOpt, setKotaOpt] = useState<string>("");
  const [sekolahId, setSekolahId] = useState<string>("");
  const [hasCities, setHasCities] = useState<boolean>(false); // kota opsional dinamis

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

  // ===================== Cascading logic =====================
  // Reset bertingkat saat path berubah
  useEffect(() => {
    setJenjang("");
    setYayasanId(""); setYayasanLabel("");
    setKotaOpt(""); setSekolahId("");
    if (path === "perusahaan") {
      // instansi tetap bisa diketik bebas
    } else {
      setF((p) => ({ ...p, instansi: "" }));
    }
  }, [path]);

  // Hitung apakah ada daftar kota (agar field Kota opsional otomatis)
  useEffect(() => {
    let ignore = false;
    async function checkCities() {
      if (!yayasanId || !jenjang) { setHasCities(false); return; }
      const cities = await fetchCities({ yayasanId, jenjang });
      if (!ignore) setHasCities(cities.length > 0);
    }
    checkCities();
    return () => { ignore = true; };
  }, [yayasanId, jenjang]);

  // ===================== Submit =====================
  async function submitPendaftaran() {
    setSubmitMsg(null);
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/api/registrations`, {
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
          meta: { path, jenjang, yayasanId, yayasanLabel, kotaOpt, sekolahId },
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
    setPath("perusahaan");
    setJenjang(""); setYayasanId(""); setYayasanLabel(""); setKotaOpt(""); setSekolahId(""); setHasCities(false);
  }

  // ===================== UI =====================
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* CARD */}
      <div className="relative bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-black/5 p-5 md:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
          {/* === KIRI === */}
          <div className="relative">
            <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/LogoMPK50th.png" alt="" className="max-w-[65%]" style={{ opacity: 0.06, filter: "blur(0.8px)" }} />
            </div>

            <div className="relative z-10">
              <h1 className="text-2xl font-semibold text-neutral-800">Form Pendaftaran Pengiriman</h1>
              <p className="text-neutral-600 mt-1 text-sm">
                Isi data berikut dengan benar. <span className="font-medium text-orange-600">Email</span> dan{" "}
                <span className="font-medium text-orange-600">No WhatsApp</span> wajib diisi.
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Segmented: Perusahaan / Yayasan / Sekolah */}
                <div className="sm:col-span-2">
                  <span className="text-xs font-medium text-slate-600">Pilih Mode Tujuan</span>
                  <div className="mt-1 grid grid-cols-3 gap-2">
                    <button type="button" className={`btn ${path === "perusahaan" ? "btn-primary" : "btn-ghost"}`} onClick={() => setPath("perusahaan")}>
                      Perusahaan
                    </button>
                    <button type="button" className={`btn ${path === "yayasan" ? "btn-primary" : "btn-ghost"}`} onClick={() => setPath("yayasan")}>
                      Yayasan
                    </button>
                    <button type="button" className={`btn ${path === "sekolah" ? "btn-primary" : "btn-ghost"}`} onClick={() => setPath("sekolah")}>
                      Sekolah
                    </button>
                  </div>
                </div>

                {/* Perusahaan */}
                {path === "perusahaan" && (
                  <div className="sm:col-span-2">
                    <AutoComplete
                      label="Nama Perusahaan"
                      value={f.instansi}
                      onChange={(v) => onChange("instansi", v)}
                      onSelectOption={(opt) => onChange("instansi", opt.label)}
                      fetcher={async (q, signal) => {
                        const arr = await fetchPerusahaan(q, q ? 100 : 200, signal);
                        return arr.map((p) => ({ value: p.id, label: p.name }));
                      }}
                      placeholder="Ketik atau pilih perusahaan…"
                      required
                      allowFreeText
                    />
                  </div>
                )}

                {/* Yayasan */}
                {path === "yayasan" && (
                  <div className="sm:col-span-2">
                    <AutoComplete
                      label="Nama Yayasan"
                      value={yayasanLabel}
                      onChange={(label) => { setYayasanLabel(label); onChange("instansi", label); }}
                      onSelectOption={(opt) => {
                        setYayasanId(opt.value);
                        setYayasanLabel(opt.label);
                        onChange("instansi", opt.label);
                      }}
                      fetcher={async (q, signal) => {
                        const arr = await fetchYayasan(q, q ? 100 : 200, signal);
                        const filtered = q ? arr.filter((y) => iIncludes(y.name, q)) : arr;
                        return filtered.map((y) => ({ value: y.id, label: y.name }));
                      }}
                      placeholder="Cari dan pilih yayasan…"
                      required
                      allowFreeText={false}
                    />
                  </div>
                )}

                {/* Sekolah (Jenjang → Yayasan → Kota? → Sekolah) */}
                {path === "sekolah" && (
                  <>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-600">Jenjang *</span>
                      <select
                        className="mt-1 w-full rounded-xl border border-amber-300/60 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
                        value={jenjang}
                        onChange={(e) => {
                          setJenjang(e.target.value);
                          setYayasanId(""); setYayasanLabel("");
                          setKotaOpt(""); setSekolahId("");
                          onChange("instansi", "");
                        }}
                        required
                      >
                        <option value="">Pilih jenjang…</option>
                        <option value="TK">TK</option>
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA">SMA</option>
                        <option value="SMK">SMK</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </label>

                    <AutoComplete
                      label="Nama Yayasan *"
                      value={yayasanLabel}
                      onChange={(label) => { setYayasanLabel(label); setYayasanId(""); setKotaOpt(""); setSekolahId(""); onChange("instansi", ""); }}
                      onSelectOption={(opt) => { setYayasanId(opt.value); setYayasanLabel(opt.label); setKotaOpt(""); setSekolahId(""); }}
                      fetcher={async (q, signal) => {
                        if (!jenjang) return [];
                        const arr = await fetchYayasanByJenjang(jenjang, signal);
                        const filtered = q ? arr.filter((y) => iIncludes(y.name, q)) : arr;
                        return filtered.map((y) => ({ value: y.id, label: y.name }));
                      }}
                      placeholder={!jenjang ? "Pilih jenjang dulu" : "Cari yayasan…"}
                      required
                      allowFreeText={false}
                    />

                    {/* Kota opsional otomatis */}
                    {hasCities && (
                      <AutoComplete
                        label="Kota/Kabupaten *"
                        value={kotaOpt}
                        onChange={(label) => { setKotaOpt(label); setSekolahId(""); onChange("instansi", ""); }}
                        onSelectOption={(opt) => setKotaOpt(opt.label)}
                        fetcher={async (q, signal) => {
                          if (!yayasanId || !jenjang) return [];
                          const cities = await fetchCities({ yayasanId, jenjang }, signal);
                          const filtered = q ? cities.filter((c) => iIncludes(c, q)) : cities;
                          return filtered.map((c) => ({ value: c, label: c }));
                        }}
                        placeholder={!yayasanId || !jenjang ? "Pilih jenjang & yayasan dulu" : "Cari kota…"}
                        required
                        allowFreeText={false}
                        disabled={!yayasanId || !jenjang}
                      />
                    )}

                    <AutoComplete
                      label="Nama Sekolah *"
                      value={f.instansi}
                      onChange={(label) => onChange("instansi", label)}
                      onSelectOption={(opt) => { setSekolahId(opt.value); onChange("instansi", opt.label); }}
                      fetcher={async (q, signal) => {
                        if (!yayasanId || !jenjang) return [];
                        const arr = await fetchSekolah(
                          { yayasanId, jenjang, kota: hasCities ? kotaOpt : undefined, q, limit: 500 },
                          signal
                        );
                        return arr.map((s) => ({ value: s.id, label: s.name, meta: s }));
                      }}
                      placeholder={!yayasanId || !jenjang ? "Lengkapi jenjang & yayasan" : "Cari sekolah…"}
                      required
                      allowFreeText={false}
                      disabled={!yayasanId || !jenjang || (hasCities && !kotaOpt)}
                    />
                  </>
                )}

                {/* Input lain tetap */}
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

          {/* === KANAN: PETA === */}
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-neutral-800">Pilih Titik di Peta</div>
              <button type="button" onClick={useCurrentLocation} disabled={locLoading} className="btn btn-primary !py-1" title="Gunakan lokasi saya">
                {locLoading ? "Mendeteksi…" : "Gunakan Lokasi Saya"}
              </button>
            </div>

            <div className="mt-2">
              <MapPicker lat={coords.lat} lng={coords.lng} onPointChange={(lat, lng) => setCoords({ lat, lng })} height={320} />
            </div>

            {locError && <div className="mt-2 text-xs text-rose-600">{locError}</div>}
            {geoMsg && <div className="mt-2 text-xs text-amber-600">{geoMsg}</div>}

            <div className="mt-2 text-xs text-slate-600">
              {coords.lat != null && coords.lng != null ? <>Titik: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</> : <>Titik: Klik peta untuk memilih</>}
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

// ===================== Field (tetap) =====================
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
