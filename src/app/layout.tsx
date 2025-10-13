// src/app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Buku Kenangan",
  description: "Platform resmi Buku Kenangan MPK KAJ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gradient-to-b from-[#fff8ef] to-[#fffdf9] text-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </body>
    </html>
  );
}
