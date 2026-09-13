import "server-only";

import type { ChecklistSubmission } from "@/src/domain/entities/checklist";
import { apiChecklistRepository, apiRequestTaskRepository } from "@/src/server/repositories/api/api-repositories";
import type { UpdateVisitInput, VisitInput } from "@/app/types/request-task";

/** Cria uma visita por meio da implementação HTTP de tarefas de solicitação. */
export function createVisit(input: VisitInput): Promise<void> {
  return apiRequestTaskRepository.createVisit(input);
}

/** Atualiza uma visita por meio da implementação HTTP de tarefas de solicitação. */
export function updateVisit(input: UpdateVisitInput): Promise<void> {
  return apiRequestTaskRepository.updateVisit(input);
}

/** Adiciona um checklist preenchido à visita indicada. */
export function addChecklistToVisit(visitId: number, submission: ChecklistSubmission): Promise<void> {
  return apiChecklistRepository.addToVisit(visitId, submission);
}

/** Exclui o checklist indicado de uma visita. */
export function deleteChecklistFromVisit(checklistId: number): Promise<void> {
  return apiChecklistRepository.deleteFromVisit(checklistId);
}
