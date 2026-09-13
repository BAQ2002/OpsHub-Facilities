import type { ChecklistDefinition, ChecklistSubmission } from "@/app/types/concrete_entity/checklist";

export interface ChecklistRepository {
  findActiveDefinitions(): Promise<ChecklistDefinition[]>;
  addToVisit(visitId: number, submission: ChecklistSubmission): Promise<void>;
  deleteFromVisit(checklistId: number): Promise<void>;
}
