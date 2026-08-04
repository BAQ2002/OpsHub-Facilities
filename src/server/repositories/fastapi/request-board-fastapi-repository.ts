import "server-only";

import type { RequestBoardData } from "@/src/domain/entities/request-board";
import { requestFastApi } from "@/src/server/api/fastapi";

type FastApiStatus = {
  id: string | number;
  description?: string | null;
};

type FastApiRequest = {
  id: string | number;
  id_request_status: string | number;
  id_member_requester: string | number;
  id_location: string | number;
};

type FastApiNamedEntity = {
  id: string | number;
  name?: string | null;
};

export async function findRequestBoardData(): Promise<RequestBoardData> {
  const [statuses, requests, memberships, locations] = await Promise.all([
    requestFastApi<FastApiStatus[]>("/request-statuses?limit=500"),
    requestFastApi<FastApiRequest[]>("/requests?limit=500"),
    requestFastApi<FastApiNamedEntity[]>("/memberships?limit=500"),
    requestFastApi<FastApiNamedEntity[]>("/locations?limit=500"),
  ]);
  const membershipNames = new Map(memberships.map((membership) => [Number(membership.id), membership.name]));
  const locationNames = new Map(locations.map((location) => [Number(location.id), location.name]));

  return {
    statuses: statuses.map((status) => ({
      id: Number(status.id),
      description: status.description ?? "Status sem descrição",
    })),
    requests: requests.map((request) => ({
      id: Number(request.id),
      statusId: Number(request.id_request_status),
      requesterName: membershipNames.get(Number(request.id_member_requester)) ?? "Solicitante não informado",
      locationName: locationNames.get(Number(request.id_location)) ?? "Local não informado",
    })),
  };
}
