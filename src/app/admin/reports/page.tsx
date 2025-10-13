// src/app/admin/reports/page.tsx
import { NavBar } from "@/src/components/NavBar";

type Stat = { label: string; value: number; color: string };

const uploadsByStatus: Stat[] = [
  { label: "Uploaded", value: 18, color: "bg-slate-300" },
  { label: "Kurasi", value: 9, color: "bg-amber-400" },
  { label: "Revisi", value: 5, color: "bg-rose-400" },
  { label: "Approved", value: 24, color: "bg-emerald-500" },
];

type WeeklyRow = { w: string; approved: number; revisi: number; kurasi: number };
const weekly: WeeklyRow[] = [
  { w: "M-1", approved: 5, revisi: 3, kurasi: 4 },
  { w: "M-2", approved: 7, revisi: 2, kurasi: 5 },
  { w: "M-3", approved: 6, revisi: 4, kurasi: 6 },
  { w: "M-4", approved: 10, revisi: 3, kurasi: 7 },
];

const shipping: Stat[] = [
  { label: "Ready", value: 12, color: "bg-slate-300" },
  { label: "Dispatched", value: 8, color: "bg-blue-400" },
  { label: "Received", value: 14, color: "bg-emerald-500" },
];

function BarRow({ s, total }: { s: Stat; total: number }) {
  const pct = Math.max(4, Math.round((s.value / Math.max(1, total)) * 100)); // min 4% biar kelihatan
  return (
    <div className="py-2">
      <div className="flex items-center justify-between text-sm">
        <div className="font-medium">{s.label}</div>
        <div className="tabular-nums text-slate-500">{s.value}</div>
      </div>
      <div className="mt-1 h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${s.color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const totalUpload = uploadsByStatus.reduce((sum: number, s: Stat) => sum + s.value, 0);
  const totalShip = shipping.reduce((sum: number, s: Stat) => sum + s.value, 0);
  const totalApproved = weekly.reduce((sum: number, r: WeeklyRow) => sum + r.approved, 0);
  const totalRevisi = weekly.reduce((sum: number, r: WeeklyRow) => sum + r.revisi, 0);

  return (
    <div>
      <NavBar />

      {/* Header actions */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Laporan</h2>
          <p className="text-sm text-slate-500">Ringkasan operasional dan statistik (mock).</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost">Export CSV (Mock)</button>
          <button className="btn btn-primary">Export PDF (Mock)</button>
        </div>
      </div>

      {/* KPI quick glance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="text-sm text-slate-500">Total Upload</div>
          <div className="text-3xl font-semibold">{totalUpload}</div>
          <div className="text-xs text-slate-500 mt-1">semua status</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-slate-500">Approved (bulan ini)</div>
          <div className="text-3xl font-semibold">{totalApproved}</div>
          <div className="text-xs text-slate-500 mt-1">akumulasi 4 minggu</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-slate-500">Revisi (bulan ini)</div>
          <div className="text-3xl font-semibold">{totalRevisi}</div>
          <div className="text-xs text-slate-500 mt-1">butuh tindak lanjut</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-slate-500">Paket (total)</div>
          <div className="text-3xl font-semibold">{totalShip}</div>
          <div className="text-xs text-slate-500 mt-1">ready + dispatched + received</div>
        </div>
      </div>

      {/* Chart-like cards */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload per Status */}
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Upload per Status</h3>
            <span className="text-xs text-slate-500">{totalUpload} item</span>
          </div>
          <div>
            {uploadsByStatus.map((s: Stat) => (
              <BarRow key={s.label} s={s} total={totalUpload} />
            ))}
          </div>
        </div>

        {/* Kurasi Mingguan */}
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Kurasi Mingguan</h3>
            <span className="text-xs text-slate-500">4 minggu</span>
          </div>
          <div className="grid grid-cols-4 gap-3 items-end h-40">
            {weekly.map((w: WeeklyRow) => {
              const max = Math.max(w.approved, w.revisi, w.kurasi, 1);
              return (
                <div key={w.w} className="flex flex-col items-center gap-1">
                  <div className="flex w-full gap-1 items-end">
                    <div className="bg-emerald-500/80 w-1/3 rounded-t-md" style={{ height: `${(w.approved / max) * 100}%` }} />
                    <div className="bg-rose-400/80 w-1/3 rounded-t-md" style={{ height: `${(w.revisi / max) * 100}%` }} />
                    <div className="bg-amber-400/80 w-1/3 rounded-t-md" style={{ height: `${(w.kurasi / max) * 100}%` }} />
                  </div>
                  <div className="text-xs text-slate-500">{w.w}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-emerald-500" /> Approved</div>
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-rose-400" /> Revisi</div>
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-400" /> Kurasi</div>
          </div>
        </div>

        {/* Distribusi Paket */}
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Distribusi Paket</h3>
            <span className="text-xs text-slate-500">{totalShip} paket</span>
          </div>
          <div>
            {shipping.map((s: Stat) => (
              <BarRow key={s.label} s={s} total={totalShip} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
