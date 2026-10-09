import { BackendError } from "@/app/entities/api/api-result";
import { backendJson } from "@/app/services/api-client";
import type { RequestContext } from "@/app/entities/api/entity-responses";
import { mapActivity } from "@/app/services/mappers/entity-view-models";

type BackendPage = { items: RequestContext[]; total: number; page: number; pageSize: number };

export async function GET(request: Request) {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();
  for (const key of ["start_date", "end_date", "status", "business_name", "page", "page_size"]) {
    incoming.getAll(key).forEach((value) => params.append(key, value));
  }
  try {
    const page = await backendJson<BackendPage>(`/requests/activities/page?${params}`, { signal: request.signal });
    return Response.json({ ...page, items: page.items.map(mapActivity) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (!(error instanceof BackendError)) throw error;
    return Response.json({ error: error.failure }, { status: error.failure.status ?? (error.failure.kind === "timeout" ? 504 : 502), headers: { "Cache-Control": "no-store" } });
  }
}
