import type { RequestMediaContent } from "@/app/types/concrete_entity/request-service-media";

export interface RequestServiceMediaRepository {
  findById(id: number): Promise<RequestMediaContent | null>;
}
