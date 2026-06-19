import type { RequestEntity } from "@/src/domain/entities/request";
import type { RequestViewModel } from "@/src/presentation/view-models/request-view-model";

export function mapRequestEntityToViewModel(request: RequestEntity): RequestViewModel {
  return {
    id: request.id,
    title: request.title,
    createdAt: request.createdAt,
    status: request.status,
    hasUnreadMessage: request.hasUnreadMessage,
  };
}
