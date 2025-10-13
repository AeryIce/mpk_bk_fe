// src/app/login/page.tsx
"use client";
import { useState } from "react";

type Mode = "login" | "register";

export default function LoginOrRegisterPage() {
  const [mode, setMode] = useState<Mode>("register");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const swap = (to: Mode) => { setMode(to); setMsg(null); };

  const onSubmitLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setLoading(true); setMsg(null);
    setTimeout(() => { setLoading(false); setMsg("Tautan login sudah dikirim ke email kamu."); }, 600);
  };
  const onSubmitRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setLoading(true); setMsg(null);
    setTimeout(() => { setLoading(false); setMsg("Pendaftaran diterima. Kami kirim tautan verifikasi ke email PIC."); }, 700);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="card p-4 sm:p-6 lg:p-8">
        {/* ⚓ Kunci tinggi di desktop supaya kiri gak goyang */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch lg:h-[620px]">
          {/* LEFT — brand (tetap centering vertikal) */}
          <div className="brand-wrap rounded-3xl bg-white/70 backdrop-blur ring-1 ring-amber-200/60 shadow-sm p-6 lg:p-8 h-full flex">
            <div className="relative z-10 flex flex-col justify-center items-center text-center w-full">
              <div className="rounded-[20px] border border-amber-200/70 p-6 sm:p-8 w-full max-w-[520px]">
                <img
                  src="/brand/LogoMPK50th.png"
                  alt="MPK-KAJ 50 Tahun"
                  className="w-64 h-auto drop-shadow-sm mx-auto"
                />
                <div className="mt-6 text-sm text-slate-600">
                  <div className="font-semibold text-slate-700">Buku Kenangan MPK KAJ</div>
                  <div className="mt-1">Satu portal untuk sponsor & panitia: upload materi, kurasi,
                    pengiriman, hingga laporan.</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — auth (tinggi penuh; animasi cuma di sini) */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/60 p-5 sm:p-6 lg:p-8 h-full flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="pr-2">
                <h1 className="text-2xl font-semibold text-slate-800">
                  {mode === "login" ? "Masuk Buku Kenangan" : "Daftar Buku Kenangan"}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {mode === "login"
                    ? "Gunakan email untuk menerima magic link."
                    : "Isi data PIC agar kami punya kontak email & WhatsApp untuk koordinasi."}
                </p>
              </div>
              <div className="seg rounded-xl bg-white/90 shadow-inner border border-amber-200/60 flex-shrink-0">
                <button
                  onClick={() => swap("login")}
                  aria-selected={mode === "login"}
                  className={`h-10 px-3 sm:px-4 text-[13px] sm:text-sm font-medium transition ${
                    mode === "login" ? "bg-[color:var(--brand)] text-white" : "hover:bg-white text-slate-700"
                  }`}
                >
                  Masuk
                </button>
                <button
                  onClick={() => swap("register")}
                  aria-selected={mode === "register"}
                  className={`h-10 px-3 sm:px-4 text-[13px] sm:text-sm font-medium transition ${
                    mode === "register" ? "bg-[color:var(--brand)] text-white" : "hover:bg-white text-slate-700"
                  }`}
                >
                  <span className="sm:hidden">Daftar PIC</span>
                  <span className="hidden sm:inline">Daftar (PIC/Instansi)</span>
                </button>
              </div>
            </div>

            {/* 🛝 Slider area: fixed-height di dalam panel kanan */}
            <div className="relative mt-5 overflow-hidden flex-1 min-h-0">
              {/* LOGIN */}
              <form
                onSubmit={onSubmitLogin}
                className={`absolute inset-0 w-full transition-transform duration-300 ease-out ${
                  mode === "login" ? "translate-x-0" : "-translate-x-full"
                } ${mode === "login" ? "" : "pointer-events-none"}`}
                aria-hidden={mode !== "login"}
              >
                <Field type="email" label="Email" name="email" placeholder="nama@sekolah.id" required />
                <button disabled={loading} className="btn btn-primary w-full mt-3">
                  {loading ? "Memproses…" : "Kirim Magic Link →"}
                </button>
                {msg && mode === "login" && <div className="mt-3 text-sm text-emerald-600">{msg}</div>}
                <div className="mt-3 text-xs text-slate-500">Kami tidak menyimpan password. Tautan berlaku terbatas.</div>
                <div className="mt-2 text-sm text-slate-600">
                  Belum punya akun?{" "}
                  <button type="button" onClick={() => swap("register")} className="underline text-[color:var(--brand)]">
                    Daftar sebagai PIC/Instansi
                  </button>
                </div>
                <div className="mt-4 text-xs">
                  Powered by{" "}
                  <a className="underline text-[color:var(--brand2)]" href="#" onClick={(e) => e.preventDefault()}>
                    MPK KAJ
                  </a>
                </div>
              </form>

              {/* REGISTER (scroll internal kalau konten lebih tinggi) */}
              <form
                onSubmit={onSubmitRegister}
                className={`absolute inset-0 w-full transition-transform duration-300 ease-out ${
                  mode === "register" ? "translate-x-0" : "translate-x-full"
                } ${mode === "register" ? "" : "pointer-events-none"} overflow-auto pr-1`}
                aria-hidden={mode !== "register"}
              >
                <Field label="Instansi / Sekolah" name="instansi" placeholder="Contoh: SMA St. Ignatius" required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Nama PIC" name="pic" placeholder="Nama lengkap PIC" required />
                  <Field label="Jabatan (opsional)" name="jabatan" placeholder="Wakil Kepala Sekolah" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field type="email" label="Email PIC" name="email" placeholder="nama@sekolah.id" required />
                  <Field label="No. WA PIC" name="wa" placeholder="+62 812-xxx-xxxx" inputMode="tel" required />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Dengan menekan daftar, Anda menyetujui untuk dihubungi melalui email/WhatsApp terkait program Buku
                  Kenangan MPK KAJ.
                </p>
                <button disabled={loading} className="btn btn-primary w-full mt-3">
                  {loading ? "Memproses…" : "Kirim Pendaftaran →"}
                </button>
                {msg && mode === "register" && <div className="mt-3 text-sm text-emerald-600">{msg}</div>}
                <div className="mt-2 text-sm text-slate-600">
                  Sudah terdaftar?{" "}
                  <button type="button" onClick={() => swap("login")} className="underline text-[color:var(--brand)]">
                    Masuk dengan email
                  </button>
                </div>
                <div className="mt-4 text-xs">
                  Powered by{" "}
                  <a className="underline text-[color:var(--brand2)]" href="#" onClick={(e) => e.preventDefault()}>
                    MPK KAJ
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="sr-only">Logo path: /public/brand/LogoMPK50th.png</div>
    </div>
  );
}

function Field({
  label, name, placeholder, type = "text", required, inputMode,
}: {
  label: string; name: string; placeholder?: string; type?: string; required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <input
        name={name} type={type} inputMode={inputMode} placeholder={placeholder} required={required}
        className="mt-1 w-full rounded-xl border border-amber-300/60 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
      />
    </label>
  );
}
