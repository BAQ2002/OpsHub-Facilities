import type { ApiResult } from "@/app/entities/api/api-result";
import type { RequestBoardWorkspaceData } from "@/app/entities/navigation_entities/chamados_kanbanboard_viewModels";
import { DataUnavailable } from "@/app/componentes/DataUnavailable";
import { ChamadosFilters } from "./ChamadosFilters";

export async function ChamadosFiltersLoader({ options }: { options: Promise<ApiResult<RequestBoardWorkspaceData["filterOptions"]>> }) {
  const result = await options;
  return result.ok ? <ChamadosFilters filterOptions={result.data} />
    : <section aria-label="Filtros de chamados"><DataUnavailable error={result.error} /></section>;
}
