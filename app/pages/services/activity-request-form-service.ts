import "server-only";

import type { ActivityRequestFormPageData } from "@/app/types/navigation_entities/activity-request-form";
import { backendJson } from "@/src/server/api-client";
import type { LocationHierarchy } from "@/app/types/concrete_entity/activity-request-form";
import type { ActivityRequestFormData, ServiceCatalogCategory } from "@/app/types/concrete_entity/service-catalog";

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém service catalog page data para uso pelo fluxo solicitante.
 * Durante o fluxo, consulta o catálogo pela implementação HTTP configurada.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function getServiceCatalogPageData(): Promise<ServiceCatalogCategory[]> {
  return backendJson<ServiceCatalogCategory[]>("/service-catalog");
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
  serviceTypeId: number;
}): Promise<ActivityRequestFormPageData> {
  const query = new URLSearchParams({ service_type_id: String(params.serviceTypeId) });
  const [dynamicData, locationHierarchy] = await Promise.all([
    backendJson<ActivityRequestFormData>(`/service-catalog/request-form?${query}`),
    backendJson<LocationHierarchy>("/organization/locations"),
  ]);

  return {
    title: dynamicData.serviceTypeName ? `Nova request: ${dynamicData.serviceTypeName}` : "Nova request: Chamado",
    subtitle: ["request_type Chamado", dynamicData.serviceCategoryName, dynamicData.serviceTypeName]
      .filter(Boolean)
      .join(" · "),
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
