import type { RequestBoardData } from "@/src/domain/entities/request-board";
import type { RequestBoardPageViewModel } from "@/src/presentation/view-models/request-board-view-model";

export function mapRequestBoardDataToViewModel(data: RequestBoardData): RequestBoardPageViewModel {
  return {
    columns: data.statuses.map((status) => ({
      id: status.id,
      title: status.description,
      requests: data.requests
        .filter((request) => request.statusId === status.id)
        .map((request) => ({
          id: request.id,
          label: `${request.id}-${request.serviceTypeName}`,
        })),
    })),
  };
}
