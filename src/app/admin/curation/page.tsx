import { NavBar } from "@/src/components/NavBar";
import { uploads } from "@/src/data/mock";
import { StatusPill } from "@/src/components/StatusPill";


export default function Page() {
const queue = uploads.filter(u => ["Uploaded","Kurasi","Revisi"].includes(u.status));
return (
<div>
<NavBar />
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
{queue.map(u => (
<div key={u.id} className="card p-5">
<div className="flex items-start justify-between gap-3">
<div>
<div className="font-semibold">{u.instansi}</div>
<div className="text-xs text-slate-500">{u.file} • {u.size} • {u.date}</div>
</div>
<StatusPill status={u.status} />
</div>
<div className="mt-4 aspect-video rounded-xl bg-slate-100 grid place-items-center text-slate-400">
Preview Mock
</div>
<div className="mt-4 flex gap-2">
<button className="btn btn-ghost">Catatan</button>
<button className="btn btn-primary">Approve</button>
<button className="btn btn-ghost">Minta Revisi</button>
</div>
</div>
))}
</div>
</div>
);
}