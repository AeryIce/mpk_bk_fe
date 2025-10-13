// src/app/admin/dashboard/page.tsx
import { NavBar } from "@/src/components/NavBar";
import { StatCard } from "@/src/components/StatCard";
import { StatusPill } from "@/src/components/StatusPill";
import { kpis, uploads, packages } from "@/src/data/mock";

// tipe dari nilai array (tanpa perlu export type dari mock.ts)
type Kpi = (typeof kpis)[number];
type UploadT = (typeof uploads)[number];
type PackageT = (typeof packages)[number];

export default function Page() {
  return (
    <div>
      <NavBar />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k: Kpi) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      {/* Antrian Kurasi & Status Paket */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Antrian Kurasi</h2>
            <a className="text-sm text-[color:var(--brand)] hover:underline" href="/admin/curation">
              Lihat Semua
            </a>
          </div>
          <div className="divide-y">
            {uploads.slice(0, 4).map((u: UploadT) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{u.instansi}</div>
                  <div className="text-xs text-slate-500">
                    {u.file} • {u.size} • {u.date}
                  </div>
                </div>
                <StatusPill status={u.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Status Paket</h2>
            <a className="text-sm text-[color:var(--brand)] hover:underline" href="/admin/warehouse">
              Kelola Gudang
            </a>
          </div>
          <div className="divide-y">
            {packages.map((p: PackageT) => (
              <div key={p.id} className="py-3 grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-9">
                  <div className="font-medium">{p.tujuan}</div>
                  <div className="text-xs text-slate-500">
                    {p.alamat} · PIC {p.pic} ({p.wa})
                  </div>
                </div>
                <div className="sm:col-span-3 sm:text-right">
                  <StatusPill status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
