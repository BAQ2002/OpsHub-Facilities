import "server-only";

import type { RequestEntity, RequestStatus } from "@/src/domain/entities/request";
import { getFastApiPath, requestFastApi } from "@/src/server/api/fastapi";

type FastApiRequest = {
  id: string | number;
  title?: string;
  titulo?: string;
  request_title?: string;
  status?: string;
  has_unread_message?: boolean;
  hasUnreadMessage?: boolean;
  created_at?: string;
  createdAt?: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Sao_Paulo",
});

export async function findRequestsByCurrentUser(): Promise<RequestEntity[]> {
  const path = getFastApiPath("FASTAPI_REQUESTS_PATH", "/activity-requests");
  const requests = await requestFastApi<FastApiRequest[]>(path);

  return requests.map(mapFastApiRequestToEntity);
}

export async function createActivityRequest(formData: FormData) {
  const path = getFastApiPath("FASTAPI_CREATE_REQUEST_PATH", "/activity-requests");

  return requestFastApi<unknown>(path, {
    method: "POST",
    body: formData,
  });
}

function mapFastApiRequestToEntity(request: FastApiRequest): RequestEntity {
  return {
    id: Number(request.id),
    title: request.title ?? request.titulo ?? request.request_title ?? "Solicitação sem título",
    createdAt: formatDateTime(request.created_at ?? request.createdAt),
    status: mapStatus(request.status),
    hasUnreadMessage: request.has_unread_message ?? request.hasUnreadMessage,
  };
}

function mapStatus(status: string | undefined): RequestStatus {
  if (status === "Fechado" || status === "closed" || status === "CLOSED") {
    return "Fechado";
  }

  return "Aberto";
}

function formatDateTime(value: string | undefined) {
  if (!value) {
    return "Data não informada";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateTimeFormatter.format(date).replace(",", "");
}
