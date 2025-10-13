import { NavBar } from "@/src/components/NavBar";


export default function Page() {
return (
<div>
<NavBar />
<div className="card p-5">
<h2 className="text-lg font-semibold">Pengaturan (Mock)</h2>
<p className="mt-2 text-sm text-slate-600">Tempatkan konfigurasi seperti domain API, tema, dan preferensi UI.</p>
</div>
</div>
);
}

