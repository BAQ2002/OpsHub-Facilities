import type { ChecklistSubmission } from "@/app/types/concrete_entity/checklist";

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
