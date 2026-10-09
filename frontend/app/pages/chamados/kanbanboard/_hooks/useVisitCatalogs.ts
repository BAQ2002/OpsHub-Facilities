"use client";
import type { ApiResult } from "@/app/entities/api/api-result";
import type { VisitCatalogs } from "@/app/entities/navigation_entities/chamados_kanbanboard_viewModels";
import { loadVisitCatalogs } from "../actions";
import { useAsyncResource } from "./useAsyncResource";

// Short-lived cache, shared only by forms in this browser session; failures are never cached.
let cached: { value: VisitCatalogs; expires: number } | undefined;
let inFlight: Promise<ApiResult<VisitCatalogs>> | undefined;
async function load(): Promise<ApiResult<VisitCatalogs>> {
  if (cached && cached.expires > Date.now()) return { ok: true, data: cached.value };
  if (inFlight) return inFlight;
  inFlight = loadVisitCatalogs();
  try {
    const result = await inFlight;
    if (result.ok) cached = { value: result.data, expires: Date.now() + 60_000 };
    return result;
  } finally { inFlight = undefined; }
}

export function useVisitCatalogs(enabled = true) {
  return useAsyncResource(load, enabled);
}
