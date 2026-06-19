import type {
  ActivityRecord,
  CategoryColorMap,
  MapImage,
  ServiceCategorySummary,
} from "./domain";

export type DashboardTotalsViewModel = {
  Planned: number;
  InProgress: number;
};

export type ActivityMarkerViewModel = {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
};

export type PlannedRequestFilterOptionViewModel = {
  label: string;
  count: number;
  isActive: boolean;
};

export type ClockDurationViewModel = {
  display: string;
  caption: string;
};

export type FacilitiesDashboardViewModel = {
  activityMarkers: ActivityMarkerViewModel[];
  activityRecords: ActivityRecord[];
  averageSlaClock: ClockDurationViewModel;
  categoryColorMap: CategoryColorMap;
  equipmentCards: ServiceCategorySummary[];
  mapImage: MapImage;
  plannedRequestFilterOptions: PlannedRequestFilterOptionViewModel[];
  totals: DashboardTotalsViewModel;
};
