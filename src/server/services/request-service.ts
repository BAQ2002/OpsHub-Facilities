import "server-only";

import type { RequestEntity } from "@/src/domain/entities/request";
import type { MyRequestsPageViewModel } from "@/src/presentation/view-models/request-view-model";
import type { RequestViewModel } from "@/src/presentation/view-models/request-view-model";
import { getRequestRepository } from "@/src/server/repositories/repositories";
import type { CreateRequestInput, RequestFieldValue } from "@/src/server/repositories/request/request-repository";

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém my requests page data para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona {@link map}, {@link findByCurrentUser}, {@link getRequestRepository}, {@link filter}.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function getMyRequestsPageData(): Promise<MyRequestsPageViewModel> {
  const requests = (await getRequestRepository().findByCurrentUser()).map(mapRequestEntityToViewModel);

  return {
    openRequests: requests.filter((request) => request.status === "Aberto"),
    closedRequests: requests.filter((request) => request.status === "Fechado"),
  };
}

function mapRequestEntityToViewModel(request: RequestEntity): RequestViewModel {
  return {
    id: request.id,
    title: request.title,
    createdAt: request.createdAt,
    status: request.status,
    hasUnreadMessage: request.hasUnreadMessage,
  };
}

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Executa a operação de create activity request e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link create}, {@link getRequestRepository}, {@link parseCreateRequestInput}.
 *
 * @param formData Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function createActivityRequest(formData: FormData) {
  return getRequestRepository().create(parseCreateRequestInput(formData));
}

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Executa a operação de create chamado request e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link create}, {@link getRequestRepository}, {@link parseCreateRequestInput}.
 *
 * @param formData Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function createChamadoRequest(formData: FormData) {
  return getRequestRepository().create(parseCreateRequestInput(formData));
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
