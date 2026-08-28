import type { RequestEntity } from "@/src/domain/entities/request";
import type { RequestViewModel } from "@/src/presentation/view-models/request-view-model";

/**
 * Acionada pela camada de serviço ao converter dados entre domínio e apresentação.
 *
 * Map request entity to view model para o formato esperado pelo fluxo.
 *
 * @param request Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function mapRequestEntityToViewModel(request: RequestEntity): RequestViewModel {
  return {
    id: request.id,
    title: request.title,
    createdAt: request.createdAt,
    status: request.status,
    hasUnreadMessage: request.hasUnreadMessage,
  };
}
