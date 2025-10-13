import { cn } from "@/src/lib/ui";
export function StatusPill({ status }: { status: string }) {
const map: Record<string, string> = {
Uploaded: "bg-slate-100 text-slate-700",
Kurasi: "bg-amber-100 text-amber-800",
Revisi: "bg-rose-100 text-rose-800",
Approved: "bg-emerald-100 text-emerald-800",
Ready: "bg-slate-100 text-slate-700",
Dispatched: "bg-blue-100 text-blue-800",
Received: "bg-emerald-100 text-emerald-800",
};
return <span className={cn("pill", map[status] || "bg-slate-100 text-slate-700")}>{status}</span>;
}