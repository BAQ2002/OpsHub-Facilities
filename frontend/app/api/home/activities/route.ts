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
  } catch {
    return Response.json({ error: "Não foi possível carregar as atividades." }, { status: 502 });
  }
}
