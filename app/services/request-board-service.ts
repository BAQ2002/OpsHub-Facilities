import "server-only";

import type { BoardEntities, ChecklistEntities, MemberSummary } from "@/app/entities/api/entity-responses";
import { mapBoardCard, mapChecklistDefinition } from "./mappers/entity-view-models";

import type { RequestBoardPageViewModel, RequestBoardWorkspaceData } from "@/app/entities/navigation_entities/chamados_kanbanboard_viewModels";

import { backendJson } from "@/src/server/api-client";

export type RequestBoardFilters = { startDate: string; endDate: string; search?: string };

/**
 * Obtém em paralelo o quadro, os executores e as definições de checklist necessários à página.
 *
 * @param filters Intervalo usado para consultar o quadro inicial.
 * @returns Os dados necessários para renderizar o workspace de chamados.
 */
export async function getRequestBoardWorkspaceData(filters: RequestBoardFilters): Promise<RequestBoardWorkspaceData> {
  const [initialData, executors, checklistDefinitions] = await Promise.all([
    getRequestBoardPageData(filters),
    backendJson<MemberSummary[]>("/memberships/executors"),
    backendJson<ChecklistEntities[]>("/checklists"),
  ]);

  return {
    initialData,
    executors: executors.map((member) => ({ id: member.id, name: member.name || "Não informado" })),
    checklistDefinitions: checklistDefinitions.map(mapChecklistDefinition),
  };
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
  const search = filters.search?.trim();
  if (search) query.set("search", search);
  const data = await backendJson<BoardEntities>(`/requests/board?${query}`);
  return mapBoardEntitiesToViewModel(data);
}

function mapBoardEntitiesToViewModel(data: BoardEntities): RequestBoardPageViewModel {
  return {
    columns: data.statuses.map((status) => ({
      id: status.id, title: status.description ?? "Não informado",
      requests: data.requests.filter((item) => item.request.idRequestStatus === status.id).map(mapBoardCard),
    })),
  };
}
