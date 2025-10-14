// src/app/admin/registrations/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { NavBar } from "@/src/components/NavBar";

type Registration = {
  id: string; // selalu string di UI (coerce dari DB number)
  instansi: string;
  pic: string;
  jabatan?: string;
  email: string;
  wa: string;
  alamat: string;
  kelurahan?: string;
  kecamatan?: string;
  kota: string;
  provinsi: string;
  kodepos?: string;
  catatan?: string;
  createdAt: string; // ISO
  lat?: number;
  lng?: number;
};

// ---- Seed fallback (kalau API gagal) ----
const seed: Registration[] = [
  {
    id: "RG-0001",
    instansi: "SMA St. Ignatius",
    pic: "Maria A.",
    jabatan: "Waka Kesiswaan",
    email: "maria@ignatius.sch.id",
    wa: "+62 812-0000-1111",
    alamat: "Jl. Mawar No. 12 RT 03/04",
    kelurahan: "Sukamaju",
    kecamatan: "Cipayung",
    kota: "Jakarta Timur",
    provinsi: "DKI Jakarta",
    kodepos: "13870",
    catatan: "Gerbang samping hijau",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "RG-0002",
    instansi: "SMP Pelita Bangsa",
    pic: "Budi S.",
    email: "budi@pelita.sch.id",
    wa: "+62 813-2222-3333",
    alamat: "Komplek Cendana Blok B1 No. 5",
    kelurahan: "Cengkareng Barat",
    kecamatan: "Cengkareng",
    kota: "Jakarta Barat",
    provinsi: "DKI Jakarta",
    kodepos: "11730",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// ---- Helpers ----
function toFullAddress(r: Registration) {
  const segs = [
    r.alamat,
    r.kelurahan && `Kel. ${r.kelurahan}`,
    r.kecamatan && `Kec. ${r.kecamatan}`,
    r.kota,
    r.provinsi,
    r.kodepos,
    "Indonesia",
  ].filter(Boolean);
  return segs.join(", ");
}

function toMapsUrl(r: Registration) {
  if (typeof r.lat === "number" && typeof r.lng === "number") {
    return `https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`;
  }
  const full = toFullAddress(r);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}`;
}

function toLabelURL(r: Registration) {
  const fullAddress = toFullAddress(r);
  const q = new URLSearchParams({
    instansi: r.instansi,
    pic: r.pic,
    jabatan: r.jabatan || "",
    email: r.email,
    wa: r.wa,
    alamat: r.alamat,
    kelurahan: r.kelurahan || "",
    kecamatan: r.kecamatan || "",
    kota: r.kota,
    provinsi: r.provinsi,
    kodepos: r.kodepos || "",
    catatan: r.catatan || "",
    fullAddress,
    lat: r.lat?.toString() ?? "",
    lng: r.lng?.toString() ?? "",
    // placeholder tokens (nanti diganti token BE)
    opsToken: "ops-demo-123",
    confirmToken: "confirm-demo-123",
  }).toString();
  return `/label/preview?${q}`;
}

export default function AdminRegistrationsPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  // Tarik dari API (fallback ke seed)
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${base}/api/registrations-list`;
    (async () => {
      try {
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("bad");
        const j = await res.json();
        // DB shape: id:number, created_at:string, lat/lng optional
        const mapped: Registration[] = (j.data as any[]).map((d) => ({
          id: String(d.id),
          instansi: d.instansi ?? "",
          pic: d.pic ?? "",
          jabatan: d.jabatan ?? "",
          email: d.email ?? "",
          wa: d.wa ?? "",
          alamat: d.alamat ?? "",
          kelurahan: d.kelurahan ?? "",
          kecamatan: d.kecamatan ?? "",
          kota: d.kota ?? "",
          provinsi: d.provinsi ?? "",
          kodepos: d.kodepos ?? "",
          catatan: d.catatan ?? "",
          createdAt: d.created_at ?? new Date().toISOString(),
          lat: typeof d.lat === "number" ? d.lat : d.lat ? Number(d.lat) : undefined,
          lng: typeof d.lng === "number" ? d.lng : d.lng ? Number(d.lng) : undefined,
        }));
        setRows(mapped);
      } catch {
        // fallback ke seed + (opsional) localStorage mock
        try {
          const raw = localStorage.getItem("bk_registrations");
          if (raw) {
            const ls: Registration[] = JSON.parse(raw);
            // gabung unik by instansi|email
            const map = new Map<string, Registration>();
            [...seed, ...ls].forEach((r) => map.set(`${r.instansi}|${r.email}`, r));
            setRows([...map.values()]);
          } else {
            setRows(seed);
          }
        } catch {
          setRows(seed);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) =>
      [r.instansi, r.pic, r.email, r.wa, r.kota, r.provinsi, r.kodepos, r.alamat]
        .filter(Boolean)
        .some((x) => x!.toLowerCase().includes(q))
    );
  }, [rows, query]);

  function toggleSelect(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function selectAll(v: boolean) {
    setSelected(v ? filtered.map((r) => r.id) : []);
  }

  function exportCSV() {
    const list = filtered;
    const header = [
      "ID",
      "Instansi",
      "PIC",
      "Jabatan",
      "Email",
      "WA",
      "Alamat",
      "Kelurahan",
      "Kecamatan",
      "Kota",
      "Provinsi",
      "KodePos",
      "Catatan",
      "CreatedAt",
      "Lat",
      "Lng",
    ];
    const lines = list.map((r) =>
      [
        r.id,
        r.instansi,
        r.pic,
        r.jabatan || "",
        r.email,
        r.wa,
        r.alamat,
        r.kelurahan || "",
        r.kecamatan || "",
        r.kota,
        r.provinsi,
        r.kodepos || "",
        (r.catatan || "").replace(/\n/g, " "),
        r.createdAt,
        r.lat ?? "",
        r.lng ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function bulkPrint() {
    const target = filtered.filter((r) => selected.includes(r.id));
    if (target.length === 0) return;
    target.slice(0, 6).forEach((r, i) => {
      setTimeout(() => window.open(toLabelURL(r), "_blank"), i * 200);
    });
  }

  return (
    <div>
      <NavBar />

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Registrasi Masuk</h2>
          <p className="text-sm text-slate-500">
            Data dari formulir publik <span className="font-medium">/pendaftaran</span>. Bisa cari dan ekspor CSV.
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/pendaftaran" target="_blank" rel="noreferrer" className="btn btn-ghost">
            Buka Form Publik
          </a>
          <button className="btn btn-ghost" onClick={exportCSV}>Export CSV</button>
          {/* Jika masih mau cetak label admin, biarkan tombol2 di bawah; kalau tidak, hapus dua tombol ini */}
          <button
            className="btn btn-primary disabled:opacity-50"
            onClick={bulkPrint}
            disabled={selected.length === 0}
            title={selected.length === 0 ? "Pilih minimal satu baris" : "Cetak label terpilih"}
          >
            Cetak Label (Terpilih)
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari instansi / PIC / kota / email / WA…"
            className="w-full sm:w-80 rounded-xl border border-amber-300/60 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="text-sm text-slate-500">
            {loading ? "Memuat…" : `${filtered.length} entri`}{selected.length ? ` · ${selected.length} terpilih` : ""}
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 px-2">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selected.length === filtered.length}
                    onChange={(e) => selectAll(e.target.checked)}
                    aria-label="Pilih semua"
                  />
                </th>
                <th className="py-2 px-2">Instansi</th>
                <th className="py-2 px-2">PIC & Kontak</th>
                <th className="py-2 px-2">Alamat Lengkap</th>
                <th className="py-2 px-2">Waktu</th>
                <th className="py-2 px-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!loading && filtered.map((r) => {
                const maps = toMapsUrl(r);
                return (
                  <tr key={r.id} className="align-top">
                    <td className="py-3 px-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        aria-label={`Pilih ${r.instansi}`}
                      />
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium">{r.instansi}</div>
                      {r.jabatan ? <div className="text-xs text-slate-500">{r.jabatan}</div> : null}
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium">{r.pic}</div>
                      <div className="text-xs text-slate-500">
                        {r.email} · {r.wa}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-xs text-slate-600 whitespace-pre-line">
                        {r.alamat}
                        {r.kelurahan ? `\nKel. ${r.kelurahan}` : ""}
                        {r.kecamatan ? `\nKec. ${r.kecamatan}` : ""}
                        {`\n${r.kota}, ${r.provinsi} ${r.kodepos || ""}`}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-xs text-slate-500 tabular-nums">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString("id-ID") : ""}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex justify-end gap-2">
                        <a className="btn btn-ghost" href={maps} target="_blank" rel="noreferrer">Maps</a>
                        <a className="btn btn-ghost" href={toLabelURL(r)} target="_blank" rel="noreferrer">Label</a>
                        <button className="btn btn-primary" onClick={() => window.open(toLabelURL(r), "_blank")}>
                          Cetak
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Belum ada data. Bagikan link <span className="font-medium">/pendaftaran</span> untuk mulai menerima registrasi.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">Memuat data…</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
