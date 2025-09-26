'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { postJSON } from '@/lib/api';

type ApiOk = { ok: boolean; message?: string };

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Buku Kenangan';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('idle');
    setErrorMsg('');

    try {
      // BE expects: { email, purpose }
      const res = await postJSON<ApiOk>('/api/auth/magic-link/request', {
        email: email.trim(),
        purpose: 'login',
      });

      if (res?.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(res?.message || 'Permintaan gagal. Coba lagi.');
      }
    } catch (err: any) {
      setStatus('error');
      // Mapping error yang sering muncul
      if (err?.status === 429) {
        setErrorMsg('Terlalu sering. Coba lagi sebentar lagi.');
      } else if (err?.status === 422) {
        setErrorMsg(err?.body?.message || 'Email tidak valid.');
      } else if (err?.status === 500) {
        setErrorMsg('Server sibuk. Coba beberapa saat lagi.');
      } else {
        setErrorMsg(err?.message || 'Terjadi kesalahan.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-white via-[#fff7ed] to-white">
      {/* Container center */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-4xl items-center justify-center px-4">
        {/* Split Card */}
        <div className="grid w-full overflow-hidden rounded-2xl border border-[#CDA4341a] bg-white/70 shadow-xl backdrop-blur-md md:grid-cols-2">
          {/* Left side (branding) */}
          <div className="relative flex items-center justify-center bg-white/60 p-6 md:p-8">
            <Image
              src="/LogoMPK50th.png"
              alt="MPK-KAJ 50 Tahun"
              width={400}
              height={400}
              className="object-contain"
              priority
            />
          </div>

          {/* Right side (form) */}
          <div className="flex flex-col justify-center p-6 md:p-8">
            {/* Header */}
            <div className="mb-6 text-center md:text-left">
              <h1 className="text-2xl font-semibold tracking-tight text-[#CDA434]">
                Masuk {appName}
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                Gunakan email untuk menerima <span className="font-medium">magic link</span>.
              </p>
            </div>

            {/* Alerts */}
            {status === 'success' && (
              <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Tautan sudah dikirim ke email <span className="font-semibold">{email}</span>.
                Periksa inbox atau folder spam.
              </div>
            )}
            {status === 'error' && (
              <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-neutral-700">Email</span>
                <input
                  type="email"
                  required
                  placeholder="nama@sekolah.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting || status === 'success'}
                  className="w-full rounded-xl border border-[#CDA43433] bg-white/80 px-4 py-3 text-neutral-800 outline-none transition focus:border-[#CDA434] focus:ring-2 focus:ring-[#CDA43433] disabled:opacity-60"
                />
              </label>

              <button
                type="submit"
                disabled={submitting || !email || status === 'success'}
                className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 py-3 font-semibold text-white transition hover:scale-[1.01] hover:bg-[#EA580C] active:scale-[0.99] disabled:opacity-60"
              >
                <span>{submitting ? 'Mengirim…' : 'Kirim Magic Link'}</span>
                {!submitting && (
                  <svg
                    className="h-4 w-4 transition group-hover:translate-x-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 12H2" />
                    <path d="m15 5 7 7-7 7" />
                  </svg>
                )}
              </button>

              <p className="text-center text-xs text-neutral-500">
                Kami tidak menyimpan password. Tautan berlaku terbatas.
              </p>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-neutral-500">
              Powered by <span className="font-semibold text-[#EA580C]">MPK KAJ</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
