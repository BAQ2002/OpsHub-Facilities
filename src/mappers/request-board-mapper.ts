import type { RequestBoardData } from "@/src/domain/entities/request-board";
import type { RequestBoardPageViewModel } from "@/src/presentation/view-models/request-board-view-model";

/**
 * Acionada pela camada de serviço ao converter dados entre domínio e apresentação.
 *
 * Map request board data to view model para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona `map`, `filter`.
 *
 * @param data Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function mapRequestBoardDataToViewModel(data: RequestBoardData): RequestBoardPageViewModel {
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
