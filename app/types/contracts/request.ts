import type { CreateRequestInput } from "@/app/types/concrete_entity/request-input";
import type { RequestEntity } from "@/app/types/concrete_entity/request";

export interface RequestRepository {
  findByCurrentUser(): Promise<RequestEntity[]>;
  create(input: CreateRequestInput): Promise<number>;
}
