export type RequestBoardCardViewModel = {
  id: number;
  label: string;
};

export type RequestBoardColumnViewModel = {
  id: number;
  title: string;
  requests: RequestBoardCardViewModel[];
};

export type RequestBoardPageViewModel = {
  columns: RequestBoardColumnViewModel[];
};
