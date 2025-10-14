"use client";

import { useEffect, useState, type ReactNode } from "react";

type Role = "sponsor" | "admin" | "superadmin";

interface Props {
  children: ReactNode;
  allow?: Role[];
}

const DEFAULT_ALLOW: Role[] = ["admin", "superadmin"];

export default function AdminGate({ children, allow = DEFAULT_ALLOW }: Props) {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    if (!token) {
      setOk(false);
      return;
    }

    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    fetch(`${base}/api/me`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json() as Promise<{ ok: boolean; user?: { role?: Role } }>;
      })
      .then((d) => {
        const role = d.user?.role ?? "sponsor";
        setOk(allow.includes(role));
      })
      .catch(() => setOk(false));
  }, [allow]);

  if (ok === null) return <div className="p-6 text-sm text-slate-500">Memuat akses…</div>;
  if (!ok)
    return (
      <div className="p-6">
        Tidak berwenang.{" "}
        <a className="underline text-[color:var(--brand)]" href="/pendaftaran">
          Ke Form Publik
        </a>
      </div>
    );

  return <>{children}</>;
}
