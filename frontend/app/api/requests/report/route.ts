import { getBackendUrl } from "@/app/services/api-client";

export async function GET(request: Request) {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();
  for (const key of ["start_date", "end_date", "business_id", "service_category_ids", "status_ids", "search"]) {
    incoming.getAll(key).forEach((value) => params.append(key, value));
  }
  try {
    const response = await fetch(`${getBackendUrl()}/api/v1/requests/report?${params}`, {
      cache: "no-store", signal: request.signal,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const error = response.status === 422 && typeof data?.detail === "string"
        ? data.detail : "Não foi possível gerar o relatório. Verifique os filtros e tente novamente.";
      return Response.json({ error }, { status: response.status === 422 ? 422 : 502, headers: { "Cache-Control": "no-store" } });
    }
    return new Response(response.body, { headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": response.headers.get("Content-Disposition") ?? 'attachment; filename="relatorio_chamados.pdf"',
      "Cache-Control": "no-store",
    } });
  } catch {
    return Response.json({ error: "Não foi possível conectar ao serviço de relatórios. Tente novamente." }, { status: 502 });
  }
}
