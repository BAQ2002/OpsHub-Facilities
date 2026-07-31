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
  id_service_type: string | number;
};

type FastApiServiceType = {
  id: string | number;
  name?: string | null;
};

export async function findRequestBoardData(): Promise<RequestBoardData> {
  const [statuses, requests, serviceTypes] = await Promise.all([
    requestFastApi<FastApiStatus[]>("/request-statuses?limit=500"),
    requestFastApi<FastApiRequest[]>("/requests?limit=500"),
    requestFastApi<FastApiServiceType[]>("/service-types?limit=500"),
  ]);
  const serviceTypeNames = new Map(serviceTypes.map((serviceType) => [Number(serviceType.id), serviceType.name]));

  return {
    statuses: statuses.map((status) => ({
      id: Number(status.id),
      description: status.description ?? "Status sem descrição",
    })),
    requests: requests.map((request) => ({
      id: Number(request.id),
      statusId: Number(request.id_request_status),
      serviceTypeName: serviceTypeNames.get(Number(request.id_service_type)) ?? "Serviço não informado",
    })),
  };
}
