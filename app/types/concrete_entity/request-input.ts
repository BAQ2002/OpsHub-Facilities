export type RequestFieldValue = string | File;

export type CreateRequestInput = {
  businessId: number;
  regionId: number;
  locationId: number;
  serviceTypeId: number;
  description: string;
  additionalFields: Readonly<Record<string, RequestFieldValue[]>>;
};
