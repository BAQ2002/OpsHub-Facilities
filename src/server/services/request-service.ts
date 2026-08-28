import "server-only";

import { mapRequestEntityToViewModel } from "@/src/mappers/request-mapper";
import type { MyRequestsPageViewModel } from "@/src/presentation/view-models/request-view-model";
import { getRequestRepository } from "@/src/server/repositories/repositories";
import type { CreateRequestInput, RequestFieldValue } from "@/src/server/repositories/request/request-repository";

export async function getMyRequestsPageData(): Promise<MyRequestsPageViewModel> {
  const requests = (await getRequestRepository().findByCurrentUser()).map(mapRequestEntityToViewModel);

  return {
    openRequests: requests.filter((request) => request.status === "Aberto"),
    closedRequests: requests.filter((request) => request.status === "Fechado"),
  };
}

export async function createActivityRequest(formData: FormData) {
  return getRequestRepository().create(parseCreateRequestInput(formData));
}

export async function createChamadoRequest(formData: FormData) {
  return getRequestRepository().create(parseCreateRequestInput(formData));
}

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

function getPositiveInteger(formData: FormData, name: string): number {
  const value = Number(getRequiredString(formData, name));
  if (!Number.isInteger(value) || value <= 0) throw new Error(`O campo ${name} é inválido.`);
  return value;
}

function getRequiredString(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string") throw new Error(`O campo ${name} é obrigatório.`);
  return value;
}
