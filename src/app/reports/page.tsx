import { NavBar } from "@/src/components/NavBar";


function PlaceholderChart({ title }: { title: string }) {
return (
<div className="card p-5">
<div className="mb-3 text-lg font-semibold">{title}</div>
<div className="h-56 rounded-xl bg-slate-100 grid place-items-center text-slate-400">Chart Placeholder</div>
</div>
);
}


export default function Page() {
return (
<div>
<NavBar />
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<PlaceholderChart title="Upload per Status" />
<PlaceholderChart title="Kurasi Mingguan" />
<PlaceholderChart title="Distribusi Paket" />
</div>
</div>
);
}