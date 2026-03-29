"use client";

import { Suspense } from "react";
import OutreachClient from "./outreach-client";

// Server-Komponente mit Suspense Boundary für useSearchParams
export default function OutreachPage() {
  return (
    <Suspense fallback={<div className="p-6 text-zinc-500">Lade Outreach...</div>}>
      <OutreachClient />
    </Suspense>
  );
}
