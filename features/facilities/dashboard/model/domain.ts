export type ActivityCategory = string;

export type ActivityType = "Atividade no Pátio" | "Chamado" | string;

export type BusinessUnit = string;

export type ServiceCategorySummary = {
  title: ActivityCategory;
  accent: string;
  iconBg: string;
  Planned: number;
  InProgress: number;
  total?: number;
};

export type MapImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type ActivityRecord = {
  id: string;
  activityType: ActivityType;
  businessUnit: BusinessUnit;
  category: ActivityCategory;
  serviceType: string;
  location: string;
  plannedAt: string;
  description: string;
  mapPosition: {
    x: number;
    y: number;
  };
};

export type CategoryColorMap = Record<ActivityCategory, string>;

export type FacilitiesDashboardData = {
  activityRecords: ActivityRecord[];
  businessUnitFilters: readonly BusinessUnit[];
  categoryColorMap: CategoryColorMap;
  equipmentCards: ServiceCategorySummary[];
  mapImage: MapImage;
  slaSamplesInMinutes: number[];
};
