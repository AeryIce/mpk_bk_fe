"use client";

import { useState } from "react";
import { NavBar } from "@/src/components/NavBar";

export default function SettingsPage() {
  const [apiBase, setApiBase] = useState<string>(process.env.NEXT_PUBLIC_API_BASE_URL || "");
  const [magicExpiry, setMagicExpiry] = useState<number>(15);
  const [defaultRole, setDefaultRole] = useState<"sponsor" | "admin" | "superadmin">("sponsor");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifWA, setNotifWA] = useState(true);
  const [saved, setSaved] = useState<string | null>(null);

  function saveMock(e: React.FormEvent) {
    e.preventDefault();
    setSaved("Pengaturan tersimpan (mock).");
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div>
      <NavBar />

      <h2 className="text-xl font-semibold text-slate-900 mb-1">Pengaturan</h2>
      <p className="text-sm text-slate-500 mb-4">Konfigurasi tampilan, API, dan preferensi (UI demo).</p>

      <form onSubmit={saveMock} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General */}
        <section className="card p-5 lg:col-span-2">
          <h3 className="text-lg font-semibold">General</h3>
          <p className="text-sm text-slate-500 mb-4">Brand & preferensi dasar.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LabelInput label="Nama Aplikasi" placeholder="Buku Kenangan MPK KAJ" defaultValue="Buku Kenangan MPK KAJ" />
            <LabelInput label="Tema" placeholder="Oranye–Emas" defaultValue="Oranye–Emas" disabled />
            <LabelInput label="Domain Frontend" placeholder="https://bk.mpk-kaj.id" />
            <LabelInput label="Email Support" placeholder="support@mpk-kaj.id" />
          </div>
        </section>

        {/* API & Auth */}
        <section className="card p-5 lg:col-span-1">
          <h3 className="text-lg font-semibold">API & Auth</h3>
          <p className="text-sm text-slate-500 mb-4">Koneksi backend & magic link.</p>
          <label className="block mb-3">
            <span className="text-xs font-medium text-slate-600">API Base URL</span>
            <input value={apiBase} onChange={(e) => setApiBase(e.target.value)} placeholder="https://api.bukukenangan.id" className="mt-1 w-full rounded-xl border border-amber-300/60 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400" />
          </label>
          <label className="block mb-3">
            <span className="text-xs font-medium text-slate-600">Masa berlaku Magic Link (menit)</span>
            <input type="number" min={5} max={120} value={magicExpiry} onChange={(e) => setMagicExpiry(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-amber-300/60 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Default Role Pendaftar</span>
            <select value={defaultRole} onChange={(e) => setDefaultRole(e.target.value as any)} className="mt-1 w-full rounded-xl border border-amber-300/60 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400">
              <option value="sponsor">Sponsor (default)</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </label>
        </section>

        {/* Notifikasi */}
        <section className="card p-5 lg:col-span-2">
          <h3 className="text-lg font-semibold">Notifikasi</h3>
          <p className="text-sm text-slate-500 mb-4">Atur cara panitia menerima update.</p>
          <div className="flex flex-col gap-3">
            <Toggle checked={notifEmail} onChange={setNotifEmail} label="Email notifikasi" desc="Terima ringkasan harian & update status kurasi." />
            <Toggle checked={notifWA} onChange={setNotifWA} label="WhatsApp notifikasi" desc="Kirimkan update penting via WhatsApp (PIC & panitia)." />
          </div>
        </section>

        {/* RBCA Preview */}
        <section className="card p-5 lg:col-span-1">
          <h3 className="text-lg font-semibold">RBCA (Preview)</h3>
          <p className="text-sm text-slate-500 mb-4">Hak akses per peran (mock).</p>
          <div className="space-y-2 text-sm">
            <RoleLine role="Superadmin" items={["Semua modul", "Pengaturan", "RBCA"]} />
            <RoleLine role="Admin" items={["Kurasi", "Gudang", "Logistik", "Laporan"]} />
            <RoleLine role="Sponsor" items={["Upload", "Status Upload"]} />
          </div>
        </section>

        {/* Save bar */}
        <div className="lg:col-span-3 flex items-center justify-between">
          {saved ? <div className="text-sm text-emerald-600">{saved}</div> : <div />}
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost">Reset (Mock)</button>
            <button type="submit" className="btn btn-primary">Simpan (Mock)</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function LabelInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, className, ...rest } = props;
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <input
        {...rest}
        className={`mt-1 w-full rounded-xl border border-amber-300/60 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 ${className || ""}`}
      />
    </label>
  );
}

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="font-medium">{label}</div>
        {desc && <div className="text-xs text-slate-500">{desc}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-[color:var(--brand)]" : "bg-slate-300"}`}
        aria-pressed={checked}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

function RoleLine({ role, items }: { role: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-amber-200/60 bg-white/70 p-3">
      <div className="text-sm font-semibold">{role}</div>
      <div className="mt-1 flex flex-wrap gap-2">
        {items.map((x) => (
          <span key={x} className="pill bg-slate-100 text-slate-700">{x}</span>
        ))}
      </div>
    </div>
  );
}
