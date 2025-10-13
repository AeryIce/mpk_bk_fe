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
    if (token.includes('/consume/')) token = token.split('/consume/').pop() || '';

    if (!token) {
      setError('Token tidak ditemukan.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await postJSON<{ ok: boolean; token?: string; user?: unknown }>(
          '/api/auth/magic-link/consume',
          { token }
        );
        if (res?.ok && res.token) {
          localStorage.setItem('auth_token', res.token);
          router.replace('/dashboard');
        } else {
          setError('Respon tidak valid. Silakan minta tautan baru.');
        }
      } catch (err: unknown) {
        if (err instanceof HttpError) setError(err.message);
        else if (err instanceof Error) setError(err.message);
        else setError('Terjadi kesalahan.');
      } finally {
        setLoading(false);
      }
    })();
  }, [params, router]);

  if (loading) return <div className="flex min-h-[100dvh] items-center justify-center text-neutral-600">Memproses tautan…</div>;
  if (error)   return <div className="flex min-h-[100dvh] items-center justify-center text-rose-600">{error}</div>;
  return null;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[100dvh] items-center justify-center">Loading…</div>}>
      <CallbackInner />
    </Suspense>
  );
}
