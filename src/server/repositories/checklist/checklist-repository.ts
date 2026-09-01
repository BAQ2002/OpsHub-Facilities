import type { ChecklistDefinition, ChecklistSubmission } from "@/src/domain/entities/checklist";

export interface ChecklistRepository {
  findActiveDefinitions(): Promise<ChecklistDefinition[]>;
  addToVisit(visitId: number, submission: ChecklistSubmission): Promise<void>;
  deleteFromVisit(checklistId: number): Promise<void>;
}
