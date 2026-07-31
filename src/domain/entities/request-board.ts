export type RequestBoardItem = {
  id: number;
  serviceTypeName: string;
  statusId: number;
};

export type RequestBoardStatus = {
  id: number;
  description: string;
};

export type RequestBoardData = {
  statuses: RequestBoardStatus[];
  requests: RequestBoardItem[];
};
