export type RequestBoardCardViewModel = {
  id: number;
  serviceTypeName: string;
  requesterName: string;
  locationName: string;
  details: { id: string; label: string; value: string }[];
  media: {
    id: number;
    fieldLabel: string;
    fileName: string;
    mimeType: string;
    fileSize?: number;
    url: string;
  }[];
  visits: {
    id: number;
    startDate: string;
    endDate: string;
    description: string;
  }[];
};

export type RequestBoardColumnViewModel = {
  id: number;
  title: string;
  requests: RequestBoardCardViewModel[];
};

export type RequestBoardPageViewModel = {
  columns: RequestBoardColumnViewModel[];
};
