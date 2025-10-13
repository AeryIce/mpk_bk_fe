// src/components/AdminGate.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
type Role = "sponsor" | "admin" | "superadmin";

export default function AdminGate({ children, allow = ["admin","superadmin"] as Role[] }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) { router.replace("/login"); return; }
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    fetch(`${base}/api/me`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }})
      .then(r => r.json())
      .then((d) => setOk(allow.includes((d?.user?.role || "sponsor") as Role)))
      .catch(() => router.replace("/login"));
  }, [router, allow]);

  if (ok === null) return <div className="p-6 text-sm text-slate-500">Memuat akses…</div>;
  if (!ok) return <div className="p-6">Tidak berwenang. <a className="underline text-[color:var(--brand)]" href="/login">Login</a></div>;
  return <>{children}</>;
}
