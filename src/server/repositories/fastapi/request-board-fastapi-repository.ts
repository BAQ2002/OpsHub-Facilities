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
  id_service_type: string | number;
  description?: string | null;
  created_date?: string | null;
};

type FastApiNamedEntity = {
  id: string | number;
  name?: string | null;
};

type FastApiRequestTask = {
  id: string | number;
  id_request: string | number;
  start_datetime?: string | null;
  stop_datetime?: string | null;
  description?: string | null;
};

export async function findRequestBoardData(): Promise<RequestBoardData> {
  const [statuses, requests, memberships, locations, serviceTypes, requestTasks] = await Promise.all([
    requestFastApi<FastApiStatus[]>("/request-statuses?limit=500"),
    requestFastApi<FastApiRequest[]>("/requests?limit=500"),
    requestFastApi<FastApiNamedEntity[]>("/memberships?limit=500"),
    requestFastApi<FastApiNamedEntity[]>("/locations?limit=500"),
    requestFastApi<FastApiNamedEntity[]>("/service-types?limit=500"),
    requestFastApi<FastApiRequestTask[]>("/request-tasks?limit=500"),
  ]);
  const membershipNames = new Map(memberships.map((membership) => [Number(membership.id), membership.name]));
  const locationNames = new Map(locations.map((location) => [Number(location.id), location.name]));
  const serviceTypeNames = new Map(serviceTypes.map((serviceType) => [Number(serviceType.id), serviceType.name]));
  const tasksByRequest = new Map<number, FastApiRequestTask[]>();
  for (const task of requestTasks) {
    const requestId = Number(task.id_request);
    tasksByRequest.set(requestId, [...(tasksByRequest.get(requestId) ?? []), task]);
  }

  return {
    statuses: statuses.map((status) => ({
      id: Number(status.id),
      description: status.description ?? "Status sem descrição",
    })),
    requests: requests.map((request) => ({
      id: Number(request.id),
      statusId: Number(request.id_request_status),
      serviceTypeName: serviceTypeNames.get(Number(request.id_service_type)) ?? "Tipo de serviço não informado",
      requesterName: membershipNames.get(Number(request.id_member_requester)) ?? "Solicitante não informado",
      locationName: locationNames.get(Number(request.id_location)) ?? "Local não informado",
      details: [
        {
          id: "location",
          label: "Localização",
          value: locationNames.get(Number(request.id_location)) ?? "Não informado",
        },
        {
          id: "service-type",
          label: "Tipo de serviço",
          value: serviceTypeNames.get(Number(request.id_service_type)) ?? "Não informado",
        },
        { id: "description", label: "Descrição", value: request.description ?? "Não informado" },
        { id: "created-at", label: "Data de abertura", value: request.created_date ?? "Não informada" },
      ],
      media: [],
      visits: (tasksByRequest.get(Number(request.id)) ?? []).map((task) => ({
        id: Number(task.id),
        startDate: formatVisitDate(task.start_datetime),
        endDate: formatVisitDate(task.stop_datetime),
        startDatetime: formatVisitInputDate(task.start_datetime),
        endDatetime: formatVisitInputDate(task.stop_datetime),
        description: task.description ?? "Não informada",
        executors: [],
        photos: [],
      })),
    })),
  };
}

function formatVisitInputDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
}

function formatVisitDate(value?: string | null): string {
  if (!value) return "dd/mm/yyyy";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "dd/mm/yyyy";
  return new Intl.DateTimeFormat("pt-BR").format(date);
}
