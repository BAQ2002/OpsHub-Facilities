import type { ActivityRecord, EquipmentCard, MapImage } from "@/app/types/concrete_entity/activity";

export type ActivityMarkerViewModel = {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
};

export type PlannedRequestFilterViewModel = {
  value: string;
  label: string;
  count: number;
  isActive: boolean;
};

export type HandlingTimeClockViewModel = {
  display: string;
  caption: string;
};

export type HomePageViewModel = {
  equipmentCards: EquipmentCard[];
  totals: {
    Planned: number;
    InProgress: number;
    Completed: number;
  };
  mapImage: MapImage;
  activityMarkers: ActivityMarkerViewModel[];
  plannedRequestFilterOptions: PlannedRequestFilterViewModel[];
  averageHandlingTimeClock: HandlingTimeClockViewModel;
  activityRecords: ActivityRecord[];
  categoryColorMap: Record<string, string>;
};
