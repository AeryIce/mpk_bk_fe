// /src/lib/api.ts
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ||
  'https://mpkbkbe-production.up.railway.app';

export type Json = Record<string, unknown>;

export class HttpError extends Error {
  status?: number;
  body?: unknown;
  constructor(message: string, opts: { status?: number; body?: unknown } = {}) {
    super(message);
    this.status = opts.status;
    this.body = opts.body;
  }
}

function pickMessage(u: unknown): string | undefined {
  if (u && typeof u === 'object' && 'message' in u) {
    const m = (u as { message?: unknown }).message;
    return typeof m === 'string' ? m : undefined;
  }
  return undefined;
}

export async function postJSON<T = unknown>(
  path: string,
  body: Json,
  init?: RequestInit
): Promise<T> {
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

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // response bukan JSON (boleh diabaikan)
  }

  if (!res.ok) {
    const msg = pickMessage(data) || `HTTP ${res.status}`;
    throw new HttpError(msg, { status: res.status, body: data });
  }
  return data as T;
}
