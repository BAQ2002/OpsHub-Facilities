export type RequestBoardItem = {
  id: number;
  statusId: number;
  serviceTypeName: string;
  requesterName: string;
  locationName: string;
  details: RequestBoardDetail[];
  media: RequestBoardMedia[];
};

export type RequestBoardDetail = {
  id: string;
  label: string;
  value: string;
};

export type RequestBoardMedia = {
  id: number;
  fieldLabel: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  url: string;
};

export type RequestBoardStatus = {
  id: number;
  description: string;
};

export type RequestBoardData = {
  statuses: RequestBoardStatus[];
  requests: RequestBoardItem[];
};
