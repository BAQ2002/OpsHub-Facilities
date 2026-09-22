import "server-only";

import type { MyRequestsPageViewModel } from "@/app/entities/navigation_entities/minhas_solicitacoes_viewModels";

import type { RequestEntity } from "@/app/entities/concrete_entity";
import type { RequestContext } from "@/app/entities/api/entity-responses";
import { mapRequestCard } from "./mappers/entity-view-models";
import { backendJson, jsonRequest, serializeFile } from "@/src/server/api-client";
import type { CreateRequestInput, RequestFieldValue } from "@/app/entities/navigation_entities/solicitar_atividade_viewModels";

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém my requests page data para uso pelo fluxo solicitante.
 * Durante o fluxo, consulta as solicitações pela implementação HTTP e as transforma para apresentação.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function getMyRequestsPageData(): Promise<MyRequestsPageViewModel> {
  const requests = (await backendJson<RequestContext[]>("/requests/mine")).map(mapRequestCard);

  return {
    openRequests: requests.filter((request) => request.status === "Aberto"),
    closedRequests: requests.filter((request) => request.status === "Fechado"),
  };
}

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Executa a operação de create activity request e preserva as validações do domínio.
 * Durante o fluxo, valida os dados recebidos e cria a solicitação pela implementação HTTP.
 *
 * @param formData Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function createActivityRequest(formData: FormData) {
  return createRequest(parseCreateRequestInput(formData));
}

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Executa a operação de create chamado request e preserva as validações do domínio.
 * Durante o fluxo, valida os dados recebidos e cria a solicitação pela implementação HTTP.
 *
 * @param formData Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function createChamadoRequest(formData: FormData) {
  return createRequest(parseCreateRequestInput(formData));
}

async function createRequest(input: CreateRequestInput): Promise<number> {
  const additionalFields = await Promise.all(
    Object.entries(input.additionalFields).map(async ([name, items]) => ({
      name,
      values: await Promise.all(items.map((value) => (typeof value === "string" ? value : serializeFile(value)))),
    })),
  );
  const result = await backendJson<Pick<RequestEntity, "id">>(
    "/requests",
    jsonRequest({ ...input, additionalFields }),
  );
  return result.id;
}

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Parse create request input para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link entries}, {@link startsWith}, {@link getPositiveInteger}, {@link trim} e outras rotinas auxiliares.
 *
 * @param formData Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function parseCreateRequestInput(formData: FormData): CreateRequestInput {
  const additionalFields: Record<string, RequestFieldValue[]> = {};
  for (const [name, value] of formData.entries()) {
    if (!name.startsWith("service_field_")) continue;
    additionalFields[name] = [...(additionalFields[name] ?? []), value];
  }

  return {
    businessId: getPositiveInteger(formData, "business_id"),
    regionId: getPositiveInteger(formData, "region_id"),
    locationId: getPositiveInteger(formData, "location_id"),
    serviceTypeId: getPositiveInteger(formData, "service_type_id"),
    description: getRequiredString(formData, "description").trim(),
    additionalFields,
  };
}

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém positive integer para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona {@link getRequiredString}, {@link isInteger}.
 *
 * @param formData Dados necessários para executar esta função.
 * @param name Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function getPositiveInteger(formData: FormData, name: string): number {
  const value = Number(getRequiredString(formData, name));
  if (!Number.isInteger(value) || value <= 0) throw new Error(`O campo ${name} é inválido.`);
  return value;
}

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém required string para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona {@link get}.
 *
 * @param formData Dados necessários para executar esta função.
 * @param name Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function getRequiredString(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string") throw new Error(`O campo ${name} é obrigatório.`);
  return value;
}
