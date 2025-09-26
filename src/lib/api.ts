// /src/lib/api.ts
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ||
  'https://mpkbkbe-production.up.railway.app';

type Json = Record<string, unknown>;

export async function postJSON<T = any>(path: string, body: Json, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
    body: JSON.stringify(body),
    ...init,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // ignore parse error
  }

  if (!res.ok) {
    const err: any = new Error(data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data as T;
}
