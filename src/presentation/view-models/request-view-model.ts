import type { RequestEntity } from "@/src/domain/entities/request";

export type RequestViewModel = RequestEntity;

export type MyRequestsPageViewModel = {
  openRequests: RequestViewModel[];
  closedRequests: RequestViewModel[];
};
