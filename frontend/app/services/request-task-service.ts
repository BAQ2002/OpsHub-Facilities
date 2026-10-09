import "server-only";
import type { VisitEntities, MemberSummary, ChecklistEntities } from "@/app/entities/api/entity-responses";
import type { VisitCatalogs } from "@/app/entities/navigation_entities/chamados_kanbanboard_viewModels";
import { mapVisit, mapChecklistDefinition } from "./mappers/entity-view-models";

import type { ChecklistSubmission, UpdateVisitInput, VisitInput } from "@/app/entities/navigation_entities/chamados_kanbanboard_viewModels";
import { backendJson, jsonRequest, serializeFile } from "@/app/services/api-client";
import { BackendError } from "@/app/entities/api/api-result";
import { getLegacyRequestDetails, type RequestBoardFilters } from "./request-board-service";

/** Cria uma visita por meio da implementação HTTP de tarefas de solicitação. */
export async function createVisit(input: VisitInput): Promise<void> {
  await backendJson<void>("/request-tasks", jsonRequest(await visitBody(input)));
}

/** Atualiza uma visita por meio da implementação HTTP de tarefas de solicitação. */
export async function updateVisit(input: UpdateVisitInput): Promise<void> {
  await backendJson<void>(`/request-tasks/${input.visitId}`, jsonRequest(await visitBody(input), "PUT"));
}

async function visitBody(input: VisitInput | UpdateVisitInput) {
  return { ...input, photos: await Promise.all(input.photos.map(serializeFile)) };
}

/** Adiciona um checklist preenchido à visita indicada. */
export function addChecklistToVisit(visitId: number, submission: ChecklistSubmission): Promise<void> {
  return backendJson<void>(`/checklists/visits/${visitId}`, jsonRequest(submission));
}

/** Exclui o checklist indicado de uma visita. */
export function deleteChecklistFromVisit(checklistId: number): Promise<void> {
  return backendJson<void>(`/checklists/${checklistId}`, { method: "DELETE" });
}

export async function getVisitDetails(visitId: number, requestId?: number, filters?: RequestBoardFilters) {
  try {
    return mapVisit(await backendJson<VisitEntities>(`/request-tasks/${visitId}/details`));
  } catch (error) {
    if (!(error instanceof BackendError) || error.failure.status !== 404 || requestId === undefined) throw error;
    const request = await getLegacyRequestDetails(requestId, filters);
    const visit = request?.visits.find((item) => item.task.id === visitId);
    if (!visit) throw error;
    return mapVisit(visit);
  }
}

export async function getVisitCatalogs(): Promise<VisitCatalogs> {
  const [members, definitions] = await Promise.all([
    backendJson<MemberSummary[]>("/memberships/executors"), backendJson<ChecklistEntities[]>("/checklists"),
  ]);
  return { executors: members.map((member) => ({ id: member.id, name: member.name || "Não informado" })),
    checklistDefinitions: definitions.map(mapChecklistDefinition) };
}
