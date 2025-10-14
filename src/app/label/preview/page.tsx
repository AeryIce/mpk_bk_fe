// Server Component (jangan pakai "use client")
export const dynamic = "force-dynamic";
export const revalidate = 0;

import LabelPreviewClient from "./LabelPreviewClient";

export default function Page() {
  return <LabelPreviewClient />;
}
