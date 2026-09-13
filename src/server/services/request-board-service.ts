import "server-only";

import type { RequestBoardData } from "@/src/domain/entities/request-board";
import type { RequestBoardPageViewModel } from "@/src/presentation/view-models/request-board-view-model";
import { backendJson } from "@/src/server/api-client";

export type RequestBoardFilters = { startDate: string; endDate: string };

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
