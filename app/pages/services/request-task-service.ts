import "server-only";

import type { ChecklistSubmission } from "@/app/types/concrete_entity/checklist";
import { backendJson, jsonRequest, serializeFile } from "@/src/server/api-client";
import type { UpdateVisitInput, VisitInput } from "@/app/types/concrete_entity/request-task";

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
