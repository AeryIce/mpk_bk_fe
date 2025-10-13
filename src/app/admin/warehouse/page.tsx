import { NavBar } from "@/src/components/NavBar";
import { packages } from "@/src/data/mock";
import { StatusPill } from "@/src/components/StatusPill";


export default function Page() {
return (
<div>
<NavBar />
<div className="card p-5">
<div className="flex items-center justify-between">
  <div>
    <h2 className="text-lg font-semibold">Gudang & Paket</h2>
    <p className="text-sm text-slate-500">Buat paket per instansi, cetak label/QR, dan siap kirim.</p>
  </div>
  <div className="flex gap-2">
    <button className="btn btn-ghost">Filter: Ready</button>
    <button className="btn btn-primary">+ Buat Paket</button>
  </div>
</div>

<div className="mt-4 divide-y">
{packages.map(p => (
<div key={p.id} className="py-3 grid grid-cols-1 lg:grid-cols-12 gap-2 items-center">
<div className="lg:col-span-6">
<div className="font-medium">{p.tujuan}</div>
<div className="text-xs text-slate-500">{p.alamat} · PIC {p.pic} ({p.wa})</div>
</div>
<div className="lg:col-span-3"><StatusPill status={p.status} /></div>
<div className="lg:col-span-3 flex gap-2 lg:justify-end">
<button className="btn btn-ghost">Print Label</button>
<button className="btn btn-ghost">Detail</button>
</div>
</div>
))}
</div>
</div>
</div>
);
}