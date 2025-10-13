export function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
return (
<div className="card p-5">
<div className="text-sm text-slate-500">{label}</div>
<div className="mt-1 text-3xl font-semibold text-slate-900">{value.toLocaleString()}</div>
{sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
</div>
);
}