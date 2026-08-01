export type RequestBoardCardViewModel = {
  id: number;
  requesterName: string;
  locationName: string;
};

export type RequestBoardColumnViewModel = {
  id: number;
  title: string;
  requests: RequestBoardCardViewModel[];
};

export type RequestBoardPageViewModel = {
  columns: RequestBoardColumnViewModel[];
};
