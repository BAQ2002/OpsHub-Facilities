import "server-only";

import type { BoardEntities, BoardColumnEntities, LegacyBoardEntities, RequestDetailsEntities } from "@/app/entities/api/entity-responses";
import { BackendError } from "@/app/entities/api/api-result";
import { mapRequestDetails } from "./mappers/entity-view-models";

import type { RequestBoardPageViewModel, RequestBoardWorkspaceData } from "@/app/entities/navigation_entities/chamados_kanbanboard_viewModels";

import { backendJson, jsonRequest } from "@/app/services/api-client";

export async function updateRequestStatus(requestId: number, statusId: number): Promise<void> {
  if (!Number.isSafeInteger(requestId) || requestId <= 0 || !Number.isSafeInteger(statusId) || statusId <= 0) {
    throw new Error("Solicitação ou status inválido.");
  }
  await backendJson<void>(`/requests/${requestId}/status`, jsonRequest({ statusId }, "PATCH"));
}

export type RequestBoardSort = "recent";
export type RequestBoardFilters = { startDate: string; endDate: string; search?: string; businessId?: number; serviceCategoryIds?: number[]; sort?: RequestBoardSort };
export const REQUEST_BOARD_PAGE_SIZE = 10;

export async function getRequestBoardFilterOptions() {
  return backendJson<RequestBoardWorkspaceData["filterOptions"]>("/requests/filter-options");
}

export async function getRequestDetails(requestId: number, filters?: RequestBoardFilters) {
  try {
    return mapRequestDetails(await backendJson<RequestDetailsEntities>(`/requests/${requestId}/details`));
  } catch (error) {
    if (!(error instanceof BackendError) || error.failure.status !== 404) throw error;
    const legacy = await getLegacyRequestDetails(requestId, filters);
    if (!legacy) throw error;
    return mapRequestDetails({ ...legacy, visits: legacy.visits.map((visit) => visit.task) });
  }
}

/** Transitional lookup for backends without detail routes. Never falls back to a different ID. */
export async function getLegacyRequestDetails(requestId: number, filters?: RequestBoardFilters) {
  const query = boardQuery({ startDate: "1900-01-01", endDate: "9999-12-30", ...filters, search: String(requestId) });
  const data = await backendJson<BoardEntities | LegacyBoardEntities>(`/requests/board?${query}`);
  for (const item of data.requests) {
    if ("request" in item && item.request.id === requestId) return item;
  }
  return null;
}

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém request board page data para uso pelo fluxo solicitante.
 * Durante o fluxo, consulta o backend e transforma os dados no view model da página.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function boardQuery(filters: RequestBoardFilters) {
  const query = new URLSearchParams({
    start_date: filters.startDate,
    end_date: filters.endDate,
  });
  if (filters.businessId) query.set("business_id", String(filters.businessId));
  filters.serviceCategoryIds?.forEach((id) => query.append("service_category_ids", String(id)));
  const search = filters.search?.trim();
  if (search) query.set("search", search);
  query.set("sort", filters.sort ?? "recent");
  query.set("page_size", String(REQUEST_BOARD_PAGE_SIZE));
  return query;
}

export async function getRequestBoardPageData(filters: RequestBoardFilters): Promise<RequestBoardPageViewModel> {
  const query = boardQuery(filters);
  const data = await backendJson<BoardEntities | LegacyBoardEntities>(`/requests/board?${query}`);
  return mapBoardEntitiesToViewModel(data);
}

function mapCard(item: BoardEntities["requests"][number]) {
  return { id: item.id, serviceTypeName: item.serviceTypeName || "Não informado",
    requesterName: item.requesterName || "Não informado", locationName: item.locationName || "Não informado" };
}

export async function getRequestBoardColumnData(filters: RequestBoardFilters, statusId: number, offset: number) {
  const query = boardQuery(filters);
  query.set("offset", String(offset));
  try {
    const data = await backendJson<BoardColumnEntities>(`/requests/board/columns/${statusId}?${query}`);
    return { id: data.statusId, requests: data.requests.map(mapCard), total: data.total,
      offset: data.offset, pageSize: data.pageSize };
  } catch (error) {
    // Compatibility for the backend currently running locally. Real SQL pagination requires the new backend.
    if (!(error instanceof BackendError) || error.failure.status !== 404) throw error;
    const data = await backendJson<BoardEntities | LegacyBoardEntities>(`/requests/board?${boardQuery(filters)}`);
    const cards = normalizedCards(data).filter((item) => item.statusId === statusId);
    const start = Math.min(offset, Math.max(0, cards.length - REQUEST_BOARD_PAGE_SIZE));
    return { id: statusId, requests: cards.slice(start, start + REQUEST_BOARD_PAGE_SIZE).map(mapCard),
      total: cards.length, offset: start, pageSize: REQUEST_BOARD_PAGE_SIZE };
  }
}

function normalizedCards(data: BoardEntities | LegacyBoardEntities) {
  const requests = [...data.requests];
  if (requests.length && "request" in requests[0]) requests.sort((a, b) => {
    if (!("request" in a) || !("request" in b)) return 0;
    return (b.request.createdDate ?? "").localeCompare(a.request.createdDate ?? "") || b.request.id - a.request.id;
  });
  return requests.map((item) => "request" in item ? {
    id: item.request.id, statusId: item.request.idRequestStatus,
    serviceTypeName: item.serviceType?.name ?? null, requesterName: item.requester?.name ?? null,
    locationName: item.location?.name ?? null,
  } : item);
}

function mapBoardEntitiesToViewModel(data: BoardEntities | LegacyBoardEntities): RequestBoardPageViewModel {
  // Frontend and backend may restart independently. Normalize both contracts before grouping.
  const cards = normalizedCards(data);
  const counts = "counts" in data ? data.counts : undefined;
  return {
    columns: data.statuses.map((status) => ({
      id: status.id, title: status.description ?? "Não informado",
      requests: cards.filter((item) => item.statusId === status.id).slice(0, REQUEST_BOARD_PAGE_SIZE).map(mapCard),
      total: counts?.[status.id] ?? cards.filter((item) => item.statusId === status.id).length,
      offset: 0,
      pageSize: REQUEST_BOARD_PAGE_SIZE,
    })),
  };
}
