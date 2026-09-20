import type { ChecklistDefinition } from "@/app/types/concrete_entity/checklist";
import type { MembershipOption } from "@/app/types/concrete_entity/membership";

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
    startDatetime: string;
    endDatetime: string;
    description: string;
    executors: { id: number; name: string }[];
    photos: { id: number; fileName: string; mimeType: string; url: string }[];
    checklists: import("@/app/types/concrete_entity/checklist").VisitChecklist[];
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

export type RequestBoardWorkspaceData = {
  initialData: RequestBoardPageViewModel;
  executors: MembershipOption[];
  checklistDefinitions: ChecklistDefinition[];
};
