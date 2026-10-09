import { backendFetch } from "@/app/services/api-client";
import { BackendError } from "@/app/entities/api/api-result";

export async function GET(request: Request) {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();
  for (const key of ["start_date", "end_date", "business_id", "service_category_ids", "status_ids", "search"]) {
    incoming.getAll(key).forEach((value) => params.append(key, value));
  }
  try {
    const response = await backendFetch(`/requests/report?${params}`, { signal: request.signal }, 60_000);
    // Read before sending headers so a timeout or interrupted PDF yields a useful error.
    const pdf = await response.arrayBuffer();
    return new Response(pdf, { headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": response.headers.get("Content-Disposition") ?? 'attachment; filename="relatorio_chamados.pdf"',
      "Cache-Control": "no-store",
    } });
  } catch (error) {
    const failure = error instanceof BackendError ? error.failure : {
      kind: "connection", message: "Não foi possível receber o relatório completo. Tente novamente.", status: undefined,
    };
    return Response.json({ error: failure.message }, { status: failure.status ?? 502, headers: { "Cache-Control": "no-store" } });
  }
}
