import "server-only";

import type { RequestBoardData } from "@/src/domain/entities/request-board";
import type { RequestBoardPageViewModel } from "@/src/presentation/view-models/request-board-view-model";
import type { RequestBoardFilters } from "@/src/server/queries/request-board/request-board-query";
import { getRequestBoardQuery } from "@/src/server/queries/request-board/request-board-query-provider";

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém request board page data para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona {@link mapRequestBoardDataToViewModel}, {@link findData}, {@link getRequestBoardQuery}.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function getRequestBoardPageData(filters: RequestBoardFilters): Promise<RequestBoardPageViewModel> {
  return mapRequestBoardDataToViewModel(await getRequestBoardQuery().findData(filters));
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
