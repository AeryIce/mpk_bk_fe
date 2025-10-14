// Server wrapper (NO "use client")
export const dynamic = "force-dynamic";
export const revalidate = 0;

import PendaftaranClient from "./PendaftaranClient";

export default function Page() {
  return <PendaftaranClient />;
}
