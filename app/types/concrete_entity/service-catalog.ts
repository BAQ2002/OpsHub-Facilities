import type { ActivityRequestField } from "@/app/types/concrete_entity/activity-request-form";

export type ActivityRequestFormFilters = {
  serviceTypeId: number;
};

export type ActivityRequestFormData = {
  serviceCategoryName?: string;
  serviceTypeId?: number;
  serviceTypeName?: string;
  fields: ActivityRequestField[];
};

export type ServiceCatalogCategory = {
  id: number;
  name: string;
  serviceTypes: { id: number; name: string }[];
};
