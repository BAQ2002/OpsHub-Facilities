import type { ActivityRequestField } from "@/src/domain/entities/activity-request-form";

export type ActivityRequestFormFilters = {
  serviceCategory?: string;
  serviceType?: string;
  serviceTypeId?: number;
};

export type ActivityRequestFormData = {
  serviceCategoryName?: string;
  serviceTypeId?: number;
  serviceTypeName?: string;
  serviceTypeOptions: { label: string; value: string }[];
  fields: ActivityRequestField[];
};

export type ServiceCatalogCategory = {
  id: number;
  name: string;
  serviceTypes: { id: number; name: string }[];
};

export interface ServiceCatalogRepository {
  findCatalog(): Promise<ServiceCatalogCategory[]>;
  findRequestFormData(filters: ActivityRequestFormFilters): Promise<ActivityRequestFormData>;
}
