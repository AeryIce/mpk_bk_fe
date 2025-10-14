// Server wrapper (NO "use client")
export const dynamic = "force-dynamic";
export const revalidate = 0;

import TopBanner from "@/src/components/TopBanner";
import PendaftaranClient from "./PendaftaranClient";

export default function Page() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBanner />
      <PendaftaranClient />
    </div>
  );
}
