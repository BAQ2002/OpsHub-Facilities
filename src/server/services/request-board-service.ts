import "server-only";

import type { RequestBoardData } from "@/app/types/concrete_entity/request-board";
import type { RequestBoardPageViewModel, RequestBoardWorkspaceData } from "@/app/types/navigation_entities/request-board";
import { backendJson } from "@/src/server/api-client";
import { apiChecklistRepository, apiMembershipRepository } from "@/src/server/repositories/api/api-repositories";

export type RequestBoardFilters = { startDate: string; endDate: string };

/**
 * Obtém em paralelo o quadro, os executores e as definições de checklist necessários à página.
 *
 * @param filters Intervalo usado para consultar o quadro inicial.
 * @returns Os dados necessários para renderizar o workspace de chamados.
 */
export async function getRequestBoardWorkspaceData(filters: RequestBoardFilters): Promise<RequestBoardWorkspaceData> {
  const [initialData, executors, checklistDefinitions] = await Promise.all([
    getRequestBoardPageData(filters),
    apiMembershipRepository.findExecutorOptions(),
    apiChecklistRepository.findActiveDefinitions(),
  ]);

  return { initialData, executors, checklistDefinitions };
}

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém request board page data para uso pelo fluxo solicitante.
 * Durante o fluxo, consulta o backend e transforma os dados no view model da página.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function getRequestBoardPageData(filters: RequestBoardFilters): Promise<RequestBoardPageViewModel> {
  const query = new URLSearchParams({
    start_date: filters.startDate,
    end_date: filters.endDate,
  });
  const data = await backendJson<RequestBoardData>(`/requests/board?${query}`);
  return mapRequestBoardDataToViewModel(data);
}

function mapRequestBoardDataToViewModel(data: RequestBoardData): RequestBoardPageViewModel {
  return {
    columns: data.statuses.map((status) => ({
      id: status.id,
      title: status.description,
      requests: data.requests
        .filter((request) => request.statusId === status.id)
        .map((request) => ({
          id: request.id,
          serviceTypeName: request.serviceTypeName,
          requesterName: request.requesterName,
          locationName: request.locationName,
          details: request.details,
          media: request.media,
          visits: request.visits,
        })),
    })),
  };
}
