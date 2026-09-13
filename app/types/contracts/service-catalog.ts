import type {
  ActivityRequestFormData,
  ActivityRequestFormFilters,
  ServiceCatalogCategory,
} from "@/app/types/concrete_entity/service-catalog";

export interface ServiceCatalogRepository {
  findCatalog(): Promise<ServiceCatalogCategory[]>;
  findRequestFormData(filters: ActivityRequestFormFilters): Promise<ActivityRequestFormData>;
}
