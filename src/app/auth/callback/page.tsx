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
    let token = params.get('token') || '';
    if (token.includes('/consume/')) {
      token = token.split('/consume/').pop() || '';
    }

    if (!token) {
      setError('Token tidak ditemukan.');
      setLoading(false);
      return;
    }

    async function consume() {
      try {
        const res = await postJSON<Record<string, unknown>>(
          '/api/auth/magic-link/consume',
          { token }
        );

        // === DEBUG LOG ===
        console.log('[DEBUG][consume response]', res);

        // cari kemungkinan field token
        const pat =
          (res['token'] as string | undefined) ||
          (res['plainTextToken'] as string | undefined) ||
          (res['access_token'] as string | undefined);

        if (res['ok'] && pat) {
          localStorage.setItem('auth_token', pat);
          router.replace('/dashboard');
        } else {
          setError('Respon tidak mengandung PAT. Lihat console log.');
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
