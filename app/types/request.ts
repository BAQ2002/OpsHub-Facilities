import type { RequestEntity } from "@/src/domain/entities/request";

export type RequestFieldValue = string | File;

export type CreateRequestInput = {
  businessId: number;
  regionId: number;
  locationId: number;
  serviceTypeId: number;
  description: string;
  additionalFields: Readonly<Record<string, RequestFieldValue[]>>;
};

export interface RequestRepository {
  findByCurrentUser(): Promise<RequestEntity[]>;
  create(input: CreateRequestInput): Promise<number>;
}
