import "server-only";

import type { ActivityRequestField } from "@/src/domain/entities/activity-request-form";
import { getActivityRequestFormData as getRepositoryActivityRequestFormData } from "@/src/server/repositories/activity-request-form-repository";
import {
  getLocationHierarchy,
  getServiceCatalog as getRepositoryServiceCatalog,
  type ServiceCatalogCategory,
} from "@/src/server/repositories/activity-request-form-repository";

export type ActivityRequestFormPageData = {
  title: string;
  subtitle: string;
  serviceTypeId?: number;
  fields: ActivityRequestField[];
  locationHierarchy: Awaited<ReturnType<typeof getLocationHierarchy>>;
};

export async function getServiceCatalogPageData(): Promise<ServiceCatalogCategory[]> {
  return getRepositoryServiceCatalog();
}

export async function getChamadoRequestFormPageData(params: {
  serviceCategory?: string;
  serviceType?: string;
}): Promise<ActivityRequestFormPageData> {
  const [dynamicData, locationHierarchy] = await Promise.all([
    getRepositoryActivityRequestFormData(params),
    getLocationHierarchy(),
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
