// src/components/NavBar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/ui";

const tabs = [
  { href: "/admin/dashboard",  label: "Dashboard" },
  { href: "/admin/sponsorship",label: "Sponsorship" },
  { href: "/admin/curation",   label: "Kurasi" },
  { href: "/admin/warehouse",  label: "Gudang" },
  { href: "/admin/logistics",  label: "Logistik" },
  { href: "/scan",             label: "Scan" },            // scan tetap di root
  { href: "/admin/reports",    label: "Laporan" },
  { href: "/admin/settings",   label: "Pengaturan" },
];

export function NavBar() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Buku Kenangan MPK KAJ</h1>
          <p className="text-sm text-slate-500">Admin Demo UI · tema oranye–emas</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost">View as: <span className="font-semibold">Admin</span></button>
          <Link href="/login" className="btn btn-primary">Login (Magic Link)</Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={cn("btn btn-ghost", pathname.startsWith(t.href) && "ring-2 ring-[color:var(--brand)]")}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
