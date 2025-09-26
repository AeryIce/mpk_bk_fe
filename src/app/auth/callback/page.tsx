'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { postJSON, HttpError } from '@/lib/api';

function CallbackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = params.get('token'); // token dari query ?token=...
    if (!token) {
      setError('Token tidak ditemukan.');
      setLoading(false);
      return;
    }

    async function consume() {
      try {
        const res = await postJSON<{ ok: boolean; token: string; user: unknown }>(
          '/api/auth/magic-link/consume',
          { token }
        );
        if (res?.ok && res.token) {
          // Simpan PAT di localStorage
          localStorage.setItem('auth_token', res.token);
          router.replace('/dashboard');
        } else {
          setError('Token tidak valid atau sudah dipakai.');
        }
      } catch (err: unknown) {
        if (err instanceof HttpError) setError(err.message);
        else if (err instanceof Error) setError(err.message);
        else setError('Terjadi kesalahan.');
      } finally {
        setLoading(false);
      }
    }

    consume();
  }, [params, router]);

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-neutral-600">
        Memproses tautan…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-rose-600">
        {error}
      </div>
    );
  }

  return null;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[100dvh] items-center justify-center">Loading…</div>}>
      <CallbackInner />
    </Suspense>
  );
}
