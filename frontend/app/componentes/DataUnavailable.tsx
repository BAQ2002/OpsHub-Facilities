"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ApiFailure } from "@/app/entities/api/api-result";

export function DataUnavailable({ error, retry, pending = false }: {
  error: ApiFailure; retry?: () => void; pending?: boolean;
}) {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  const busy = pending || refreshing;
  return <div role="status" aria-busy={busy} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
    <p>{error.message}</p>
    <button type="button" disabled={busy} className="mt-2 font-semibold underline disabled:opacity-50"
      onClick={() => retry ? retry() : startTransition(() => router.refresh())}>
      {busy ? "Tentando novamente..." : "Tentar novamente"}
    </button>
  </div>;
}
