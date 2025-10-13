import { NavBar } from "@/src/components/NavBar";


export default function Page() {
return (
<div>
<NavBar />
<div className="grid lg:grid-cols-2 gap-6">
<div className="card p-5">
<h2 className="text-lg font-semibold mb-3">Scan Dispatch</h2>
<div className="aspect-video rounded-xl bg-slate-100 grid place-items-center text-slate-400">Camera Mock</div>
<div className="mt-3 text-sm text-slate-500">Scan QR paket saat berangkat dari gudang.</div>
<button className="mt-4 btn btn-primary">Mulai</button>
</div>
<div className="card p-5">
<h2 className="text-lg font-semibold mb-3">Scan Received</h2>
<div className="aspect-video rounded-xl bg-slate-100 grid place-items-center text-slate-400">Camera Mock</div>
<div className="mt-3 text-sm text-slate-500">Penerima login → buka halaman ini → scan QR paket.</div>
<button className="mt-4 btn btn-primary">Mulai</button>
</div>
</div>
</div>
);
}