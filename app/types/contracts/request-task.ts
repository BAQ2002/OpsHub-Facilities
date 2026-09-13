import type { UpdateVisitInput, VisitInput } from "@/app/types/concrete_entity/request-task";

export interface RequestTaskRepository {
  createVisit(input: VisitInput): Promise<void>;
  updateVisit(input: UpdateVisitInput): Promise<void>;
}
