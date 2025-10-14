'use client';

import { useEffect, useRef, useState } from 'react';

export default function TopBanner() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => setW(wrapRef.current!.clientWidth));
    ro.observe(wrapRef.current);
    setW(wrapRef.current.clientWidth);
    return () => ro.disconnect();
  }, []);

  // skala untuk jaga-jaga supaya tidak "bablas" melebar ke luar card
  const scale = 0.86;                   // boleh geser 0.80–0.92 sesuai selera
  const hRotated = Math.round((w || 0) * scale);

  return (
    <div className="sticky top-0 z-30 bg-transparent">
      <div className="mx-auto max-w-6xl px-4">
        <div
            ref={wrapRef}
            className="
                mx-auto max-w-6xl px-4
                h-28 md:h-36 lg:h-44
                relative overflow-hidden
                rounded-2xl bg-white/95 backdrop-blur
                shadow-sm ring-1 ring-black/5
                mb-4 md:mb-6
            "
            >
          {/* Gambar vertikal → rotate 90°.
             Height = lebar container * scale supaya lebar pas, tanpa bablas. */}
          <img
            src="/brand/Logo MPK-KAJ 50 Tahun Horisontal.png"
            alt="MPK-KAJ 50 Tahun"
            style={{ height: hRotated }}
            className="
              pointer-events-none select-none
              absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              rotate-90
            "
          />
        </div>
      </div>
    </div>
  );
}
