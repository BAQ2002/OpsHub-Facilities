import "server-only";

import type { ActivityRequestField, LocationHierarchy } from "@/src/domain/entities/activity-request-form";
import { apiOrganizationRepository, apiServiceCatalogRepository } from "@/src/server/repositories/api/api-repositories";
import type { ServiceCatalogCategory } from "@/src/server/repositories/service-catalog/service-catalog-repository";

export type ActivityRequestFormPageData = {
  title: string;
  subtitle: string;
  serviceTypeId?: number;
  fields: ActivityRequestField[];
  locationHierarchy: LocationHierarchy;
};

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém service catalog page data para uso pelo fluxo solicitante.
 * Durante o fluxo, consulta o catálogo pela implementação HTTP configurada.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function getServiceCatalogPageData(): Promise<ServiceCatalogCategory[]> {
  return apiServiceCatalogRepository.findCatalog();
}

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém chamado request form page data para uso pelo fluxo solicitante.
 * Durante o fluxo, consulta em paralelo os campos do formulário e a hierarquia de localizações.
 *
 * @param params Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function getChamadoRequestFormPageData(params: {
  serviceCategory?: string;
  serviceType?: string;
  serviceTypeId?: number;
}): Promise<ActivityRequestFormPageData> {
  const [dynamicData, locationHierarchy] = await Promise.all([
    apiServiceCatalogRepository.findRequestFormData(params),
    apiOrganizationRepository.findLocationHierarchy(),
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
