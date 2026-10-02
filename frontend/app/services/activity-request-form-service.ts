import "server-only";

import type { CatalogEntities, RequestFormEntities, OrganizationEntities, MemberSummary } from "@/app/entities/api/entity-responses";
import { mapCatalog, mapOrganization, mapServiceField } from "./mappers/entity-view-models";

import type { ActivityRequestFormPageData } from "@/app/entities/navigation_entities/solicitar_atividade_chamado_viewModels";
import { backendJson } from "@/app/services/api-client";
import type { ServiceCatalogCategory } from "@/app/entities/navigation_entities/solicitar_atividade_viewModels";

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém service catalog page data para uso pelo fluxo solicitante.
 * Durante o fluxo, consulta o catálogo pela implementação HTTP configurada.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function getServiceCatalogPageData(): Promise<ServiceCatalogCategory[]> {
  return mapCatalog(await backendJson<CatalogEntities>("/service-catalog"));
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
  const [dynamicData, locationHierarchy, requesters] = await Promise.all([
    backendJson<RequestFormEntities>(`/service-catalog/request-form?${query}`),
    backendJson<OrganizationEntities>("/organization/locations"),
    backendJson<MemberSummary[]>("/memberships/requesters"),
  ]);

  return {
    title: dynamicData.serviceType?.name ? `Nova solicitação: ${dynamicData.serviceType?.name}` : "Nova solicitação: Chamado",
    subtitle: ["Tipo de solicitação: Chamado", dynamicData.category?.name, dynamicData.serviceType?.name]
      .filter(Boolean)
      .join(" · "),
    serviceTypeId: dynamicData.serviceType?.id,
    locationHierarchy: mapOrganization(locationHierarchy),
    fields: [
      {
        label: "Solicitante",
        name: "requester_id",
        type: "select",
        placeholder: "Selecione o solicitante",
        required: true,
        fullWidth: true,
        options: requesters.map((member) => ({ label: member.name ?? "Sem nome", value: String(member.id) })),
      },
      {
        label: "Descrição",
        name: "description",
        type: "textarea",
        placeholder: "Descreva a necessidade",
        fullWidth: true,
        required: true,
      },
      ...dynamicData.fields.map(mapServiceField),
    ],
  };
}
