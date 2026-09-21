export type RequestStatus = "Aberto" | "Fechado";

export type RequestEntity = {
  id: number;
  title: string;
  createdAt: string;
  status: RequestStatus;
  hasUnreadMessage?: boolean;
};

export type MyRequestsPageViewModel = {
  openRequests: RequestEntity[];
  closedRequests: RequestEntity[];
};
