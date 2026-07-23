import "server-only";

import { mapRequestEntityToViewModel } from "@/src/mappers/request-mapper";
import type { MyRequestsPageViewModel } from "@/src/presentation/view-models/request-view-model";
import { createActivityRequest as createFastApiActivityRequest } from "@/src/server/repositories/fastapi/request-fastapi-repository";
import { findRequestsByCurrentUser } from "@/src/server/repositories/request-repository";

export async function getMyRequestsPageData(): Promise<MyRequestsPageViewModel> {
  const requests = (await findRequestsByCurrentUser()).map(mapRequestEntityToViewModel);

  return {
    openRequests: requests.filter((request) => request.status === "Aberto"),
    closedRequests: requests.filter((request) => request.status === "Fechado"),
  };
}

export async function createActivityRequest(formData: FormData) {
  if (process.env.DATA_SOURCE === "fastapi") {
    return createFastApiActivityRequest(formData);
  }

  const payload = Object.fromEntries(formData.entries());

  return {
    ok: true,
    payload,
  };
}
