import { NavBar } from "@/src/components/NavBar";
import { uploads } from "@/src/data/mock";
import { StatusPill } from "@/src/components/StatusPill";


export default function Page() {
return (
<div>
<NavBar />
<div className="card p-5">
<div className="flex items-center justify-between">
<div>
<h2 className="text-lg font-semibold">Pooling Konten Sponsorship</h2>
<p className="text-sm text-slate-500">Upload → Kurasi → Revisi/Approved</p>
</div>
<button className="btn btn-primary">+ Upload (Mock)</button>
</div>
<div className="mt-4 overflow-x-auto">
<table className="min-w-full text-sm">
<thead>
<tr className="text-left text-slate-500">
<th className="py-2 pr-6">ID</th>
<th className="py-2 pr-6">Instansi</th>
<th className="py-2 pr-6">PIC</th>
<th className="py-2 pr-6">File</th>
<th className="py-2 pr-6">Status</th>
<th className="py-2">Tanggal</th>
</tr>
</thead>
<tbody>
{uploads.map(u => (
<tr key={u.id} className="border-t">
<td className="py-3 pr-6 font-mono text-xs">{u.id}</td>
<td className="py-3 pr-6">{u.instansi}</td>
<td className="py-3 pr-6">{u.pic}</td>
<td className="py-3 pr-6 underline text-[color:var(--brand)]">{u.file}</td>
<td className="py-3 pr-6"><StatusPill status={u.status} /></td>
<td className="py-3">{u.date}</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
</div>
);
}