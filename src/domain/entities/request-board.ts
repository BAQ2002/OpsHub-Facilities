export type RequestBoardItem = {
  id: number;
  statusId: number;
  requesterName: string;
  locationName: string;
};

export type RequestBoardStatus = {
  id: number;
  description: string;
};

export type RequestBoardData = {
  statuses: RequestBoardStatus[];
  requests: RequestBoardItem[];
};
