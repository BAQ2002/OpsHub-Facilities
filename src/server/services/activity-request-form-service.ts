import "server-only";

import type { ActivityRequestField, LocationHierarchy } from "@/src/domain/entities/activity-request-form";
import { getOrganizationRepository } from "@/src/server/repositories/organization/organization-repository-provider";
import { getServiceCatalogRepository } from "@/src/server/repositories/service-catalog/service-catalog-repository-provider";
import type { ServiceCatalogCategory } from "@/src/server/repositories/service-catalog/service-catalog-repository";

export type ActivityRequestFormPageData = {
  title: string;
  subtitle: string;
  serviceTypeId?: number;
  fields: ActivityRequestField[];
  locationHierarchy: LocationHierarchy;
};

export async function getServiceCatalogPageData(): Promise<ServiceCatalogCategory[]> {
  return getServiceCatalogRepository().findCatalog();
}

export async function getChamadoRequestFormPageData(params: {
  serviceCategory?: string;
  serviceType?: string;
  serviceTypeId?: number;
}): Promise<ActivityRequestFormPageData> {
  const [dynamicData, locationHierarchy] = await Promise.all([
    getServiceCatalogRepository().findRequestFormData(params),
    getOrganizationRepository().findLocationHierarchy(),
  ]);
  const serviceTypeName = dynamicData.serviceTypeName ?? params.serviceType;
  const serviceCategoryName = dynamicData.serviceCategoryName ?? params.serviceCategory;

  return {
    title: serviceTypeName ? `Nova request: ${serviceTypeName}` : "Nova request: Chamado",
    subtitle: ["request_type Chamado", serviceCategoryName, serviceTypeName].filter(Boolean).join(" · "),
    serviceTypeId: dynamicData.serviceTypeId,
    locationHierarchy,
    fields: [
      {
        label: "Descrição",
        name: "description",
        type: "textarea",
        placeholder: "Descreva a necessidade",
        fullWidth: true,
        required: true,
      },
      ...dynamicData.fields,
    ],
  };
}
