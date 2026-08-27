import type { ChecklistSubmission } from "@/src/domain/entities/checklist";

export type VisitInput = {
  requestId: number;
  description: string;
  startDatetime: string;
  stopDatetime: string;
  memberIds: number[];
  photos: File[];
  checklists: ChecklistSubmission[];
};

export type UpdateVisitInput = Omit<VisitInput, "requestId"> & { visitId: number };

export interface RequestTaskRepository {
  createVisit(input: VisitInput): Promise<void>;
  updateVisit(input: UpdateVisitInput): Promise<void>;
}
