import "server-only";

import { mapRequestEntityToViewModel } from "@/src/mappers/request-mapper";
import type { MyRequestsPageViewModel } from "@/src/presentation/view-models/request-view-model";
import { findRequestsByCurrentUser } from "@/src/server/repositories/request-repository";
import { insertActivityRequest } from "@/src/server/repositories/postgres/activity-request-postgres-repository";

export async function getMyRequestsPageData(): Promise<MyRequestsPageViewModel> {
  const requests = (await findRequestsByCurrentUser()).map(mapRequestEntityToViewModel);

  return {
    openRequests: requests.filter((request) => request.status === "Aberto"),
    closedRequests: requests.filter((request) => request.status === "Fechado"),
  };
}

export async function createActivityRequest(formData: FormData) {
  return insertActivityRequest(formData);
}

export async function createChamadoRequest(formData: FormData) {
  return insertActivityRequest(formData);
}
