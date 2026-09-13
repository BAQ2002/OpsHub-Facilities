import type { RequestTaskMediaContent } from "@/app/types/concrete_entity/request-task-media";

export interface RequestTaskMediaRepository {
  findById(id: number): Promise<RequestTaskMediaContent | null>;
}
