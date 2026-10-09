export type ChecklistFieldType = "TEXT" | "NUMBER" | "DATE" | "BOOL" | "SINGLE_SELECT" | "MULTI_SELECT";

export type ChecklistOption = { label: string; value: string };

export type ChecklistFieldDefinition = {
  id: number;
  name: string;
  type: ChecklistFieldType;
  options: ChecklistOption[];
  required: boolean;
};

export type ChecklistDefinition = {
  id: number;
  name: string;
  description: string;
  version: string;
  fields: ChecklistFieldDefinition[];
};

export type ChecklistSubmission = {
  checklistTypeId: number;
  corporation: string | null;
  equipmentTag: string | null;
  equipmentBrand: string | null;
  equipmentModel: string | null;
  rentedEquipment: boolean | null;
  serialNumber: string | null;
  ptNumber: string | null;
  values: { fieldId: number; value: unknown }[];
};

export type VisitChecklist = {
  id: number;
  checklistTypeId: number;
  name: string;
  description: string;
  version: string;
  corporation: string | null;
  equipmentTag: string | null;
  equipmentBrand: string | null;
  equipmentModel: string | null;
  rentedEquipment: boolean | null;
  serialNumber: string | null;
  ptNumber: string | null;
  values: { id: number; fieldId: number; name: string; type: string; value: unknown }[];
};

export type MembershipOption = { id: number; name: string };

export type VisitInput = {
  requestId: number;
  description: string;
  startDatetime: string;
  stopDatetime: string;
  memberIds: number[];
  photos: File[];
  checklists: ChecklistSubmission[];
};

export type UpdateVisitInput = Omit<VisitInput, "requestId"> & { visitId: number };

export type RequestBoardVisit = {
  id: number;
  startDate: string;
  endDate: string;
  startDatetime: string;
  endDatetime: string;
  description: string;
  executors: { id: number; name: string }[];
  photos: RequestBoardVisitMedia[];
  checklists: VisitChecklist[];
};

export type RequestBoardVisitMedia = {
  id: number;
  fileName: string;
  mimeType: string;
  url: string;
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



export type RequestBoardCardViewModel = {
  id: number;
  serviceTypeName: string;
  requesterName: string;
  locationName: string;
};

export type RequestVisitSummary = Pick<RequestBoardVisit, "id" | "startDate" | "endDate" | "description">;
export type RequestDetailsViewModel = RequestBoardCardViewModel & {
  details: RequestBoardDetail[];
  media: RequestBoardMedia[];
  visits: RequestVisitSummary[];
};

export type VisitCatalogs = { executors: MembershipOption[]; checklistDefinitions: ChecklistDefinition[] };

export type RequestBoardColumnViewModel = {
  id: number;
  title: string;
  requests: RequestBoardCardViewModel[];
  total: number;
  offset: number;
  pageSize: number;
};

export type RequestBoardPageViewModel = {
  columns: RequestBoardColumnViewModel[];
};

export type RequestBoardWorkspaceData = {
  filterOptions: { businesses: MembershipOption[]; serviceCategories: MembershipOption[] };
  initialData: RequestBoardPageViewModel;
  executors: MembershipOption[];
  checklistDefinitions: ChecklistDefinition[];
};
