// middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'], // lindungi halaman & API admin
};

export function middleware(req: NextRequest) {
  // biarkan preflight/CORS lewat
  if (req.method === 'OPTIONS') return NextResponse.next();

  const auth = req.headers.get('authorization');
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  if (auth && user && pass) {
    const [scheme, encoded] = auth.split(' ');
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded); // Web API tersedia di Edge Runtime
      const [u, p] = decoded.split(':');
      if (u === user && p === pass) {
        return NextResponse.next(); // lolos
      }
    }
  }

  // tantang Basic Auth
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="MPK-KAJ Admin", charset="UTF-8"',
    },
  });
}
