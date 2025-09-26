import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// NOTE: Belum ada proteksi; hanya contoh struktur.
// Di sesi berikutnya, kita akan baca cookie/header atau lakukan redirect kalau belum login.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // nanti: "/dashboard/:path*", "/scan/:path*", dsb.
  ],
};
