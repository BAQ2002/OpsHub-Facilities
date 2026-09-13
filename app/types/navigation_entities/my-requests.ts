import type { RequestEntity } from "@/app/types/concrete_entity/request";

export type MyRequestsPageViewModel = {
  openRequests: RequestEntity[];
  closedRequests: RequestEntity[];
};
