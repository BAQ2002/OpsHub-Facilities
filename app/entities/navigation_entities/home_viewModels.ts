// Modelos e configurações de apresentação da página inicial.
export type ActivityCategory = string;

// Correlação da Home: cards, indicadores da tabela e marcadores do mapa.
export {
  defaultServiceCategoryStyle as defaultActivityCategoryStyle,
  serviceCategoryStylesById as activityCategoryStylesById,
  getServiceCategoryStyle as getActivityCategoryStyle,
} from "./service_category_styles";
import type { ServiceCategoryStyle } from "./service_category_styles";
export type ActivityCategoryStyle = ServiceCategoryStyle;

export type ActivityType = "Atividade no Pátio" | "Chamado";

export const activityStatuses = [
  "Programada",
  "Em andamento",
  "Concluída",
  "Cancelada",
] as const;

export type ActivityStatus = (typeof activityStatuses)[number];

export type EquipmentCard = {
  title: string;
  categoryStyle: ActivityCategoryStyle;
  Planned: number;
  InProgress: number;
  Completed: number;
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
  businessUnit: string;
  categoryId: number | null;
  category: ActivityCategory;
  serviceType: string;
  location: string;
  status: ActivityStatus;
  statusDate: string;
  plannedAt: string;
  mapPosition: {
    x: number;
    y: number;
  };
};

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
  categoryStyleMap: Record<string, ActivityCategoryStyle>;
};

export type HomeMetrics = {
  equipment: Array<{
    categoryId: number;
    categoryName: string;
    planned: number;
    inProgress: number;
    completed: number;
  }>;
  handlingMinutes: number[];
};
