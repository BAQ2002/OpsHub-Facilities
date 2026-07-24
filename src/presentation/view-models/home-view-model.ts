import type { ActivityCategory, ActivityRecord, EquipmentCard, MapImage } from "@/src/domain/entities/activity";

export type ActivityMarkerViewModel = {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
};

export type PlannedRequestFilterViewModel = {
  label: string;
  count: number;
  isActive: boolean;
};

export type SlaClockViewModel = {
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
  averageSlaClock: SlaClockViewModel;
  activityRecords: ActivityRecord[];
  categoryColorMap: Record<ActivityCategory, string>;
};
