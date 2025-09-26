"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    // BE nanti kirim ?token=... (atau ?pat=...). Kita pakai "token" dulu.
    const token = sp.get("token") || sp.get("pat");
    if (token) {
      setToken(token);
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router, sp]);

  return <p>Mengautentikasi…</p>;
}
