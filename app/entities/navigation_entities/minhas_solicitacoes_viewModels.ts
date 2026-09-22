export type RequestStatus = "Aberto" | "Fechado";

export type RequestCardViewModel = {
  id: number;
  title: string;
  createdAt: string;
  status: RequestStatus;
  hasUnreadMessage?: boolean;
};

export type MyRequestsPageViewModel = {
  openRequests: RequestCardViewModel[];
  closedRequests: RequestCardViewModel[];
};
