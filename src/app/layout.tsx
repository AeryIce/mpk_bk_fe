import Link from 'next/link';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buku Kenangan",
  description: "FE Buku Kenangan (Next.js App Router)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      {/* teks default gelap agar cocok dengan latar krem */}
      <body className="min-h-dvh text-slate-900 bk-bg">
        {/* aksen oranye sangat tipis dari bawah + glow putih */}
        <div className="bk-accent" />

        {/* Header kaca gradasi oranye */}
        <header className="bk-header">
          <nav className="container-max flex items-center gap-6 p-3 text-white">
            <Link href="/" className="font-extrabold text-lg tracking-wide hover:text-brand-gold transition">
              BK
            </Link>
            <Link href="/login" className="hover:text-brand-gold transition">Login</Link>
            <Link href="/dashboard" className="hover:text-brand-gold transition">Dashboard</Link>
            {/* <a href="/scan" className="hover:text-brand-gold transition">Scan</a> */}
          </nav>
        </header>

        <main className="container-max p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
