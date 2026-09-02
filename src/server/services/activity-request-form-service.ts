import "server-only";

import type { ActivityRequestField, LocationHierarchy } from "@/src/domain/entities/activity-request-form";
import { getOrganizationRepository, getServiceCatalogRepository } from "@/src/server/repositories/repositories";
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
 * Durante o fluxo, aciona {@link findCatalog}, {@link getServiceCatalogRepository}.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function getServiceCatalogPageData(): Promise<ServiceCatalogCategory[]> {
  return getServiceCatalogRepository().findCatalog();
}

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém chamado request form page data para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona {@link all}, {@link findRequestFormData}, {@link getServiceCatalogRepository}, {@link findLocationHierarchy} e outras rotinas auxiliares.
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
    getServiceCatalogRepository().findRequestFormData(params),
    getOrganizationRepository().findLocationHierarchy(),
  ]);
  const serviceTypeName = dynamicData.serviceTypeName ?? params.serviceType;
  const serviceCategoryName = dynamicData.serviceCategoryName ?? params.serviceCategory;

  return {
    title: serviceTypeName ? `Novo chamado: ${serviceTypeName}` : "Novo chamado: Chamado",
    subtitle: ["Tipo de chamado: Chamado", serviceCategoryName, serviceTypeName].filter(Boolean).join(" · "),
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
