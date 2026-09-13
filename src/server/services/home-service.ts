import "server-only";

import facilitiesMap from "@/app/assets/facilities-map.png";
import type { ActivityRecord, ActivityStatus, ActivityType, EquipmentCard } from "@/app/types/concrete_entity/activity";
import { activityCategoryStylesById, defaultActivityCategoryStyle, getActivityCategoryStyle } from "@/app/types/concrete_entity/activity";
import { backendJson } from "@/src/server/api-client";
import type {
  ActivityMarkerViewModel,
  HandlingTimeClockViewModel,
  HomePageViewModel,
  PlannedRequestFilterViewModel,
} from "@/app/types/navigation_entities/home";

type HomeDateRange = {
  startDate: string;
  endDate: string;
  statuses?: string[];
  businessUnits?: number[];
};

type RawActivity = {
  id: number;
  request_type: string | null;
  business_unit: string | null;
  category_id: number | null;
  category: string | null;
  service: string | null;
  location: string | null;
  status: string;
  status_date: string | null;
  agreed_date: string | null;
  map_x: number | null;
  map_y: number | null;
};

type HomeMetrics = {
  equipment: Array<{
    categoryId: number;
    categoryName: string;
    planned: number;
    inProgress: number;
    completed: number;
  }>;
  handlingMinutes: number[];
};

const activityDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Sao_Paulo",
});

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém home page data para uso pelo fluxo solicitante.
 * Durante o fluxo, consulta o backend e compõe os indicadores da página.
 *
 * @param dateRange Dados necessários para executar esta função.
 * @param selectedBusiness Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function getHomePageData(
  dateRange: HomeDateRange,
  selectedBusiness = "all",
): Promise<HomePageViewModel> {
  const [metrics, activityRecords] = await Promise.all([
    getHomeMetrics(dateRange),
    getActivityRecords(dateRange),
  ]);
  const equipmentCards = mapMetricsToEquipmentCards(metrics);
  const categoryColorMap = Object.fromEntries([
    ...Object.entries(activityCategoryStylesById).map(([id, style]) => [id, style.color]),
    ["default", defaultActivityCategoryStyle.color],
  ]);
  const mapImage = {
    src: process.env.FACILITIES_MAP_SRC ?? facilitiesMap.src,
    width: Number(process.env.FACILITIES_MAP_WIDTH ?? facilitiesMap.width),
    height: Number(process.env.FACILITIES_MAP_HEIGHT ?? facilitiesMap.height),
    alt: "Mapa AIS com posições atuais das atividades de facilities",
  };

  return {
    equipmentCards,
    totals: mapEquipmentCardsToTotals(equipmentCards),
    mapImage,
    activityMarkers: activityRecords.map((record) => mapActivityRecordToMarker(record, categoryColorMap)),
    plannedRequestFilterOptions: mapActivitiesToBusinessUnitFilters(activityRecords, selectedBusiness),
    averageHandlingTimeClock: mapHandlingTimeSamplesToClock(metrics.handlingMinutes),
    activityRecords,
    categoryColorMap,
  };
}

function homeDateRangeQuery(dateRange: HomeDateRange): URLSearchParams {
  const query = new URLSearchParams({ start_date: dateRange.startDate, end_date: dateRange.endDate });
  dateRange.statuses?.forEach((status) => query.append("status", status));
  dateRange.businessUnits?.forEach((businessUnit) => query.append("business_unit", String(businessUnit)));
  return query;
}

async function getActivityRecords(dateRange: HomeDateRange): Promise<ActivityRecord[]> {
  const records = await backendJson<RawActivity[]>(`/requests/activities?${homeDateRangeQuery(dateRange)}`);
  return records.map((record) => ({
    id: String(record.id),
    activityType: (record.request_type === "Atividade no Pátio" ? "Atividade no Pátio" : "Chamado") as ActivityType,
    businessUnit: record.business_unit ?? "Não informado",
    categoryId: record.category_id,
    category: record.category ?? "Não informado",
    serviceType: record.service ?? "Não informado",
    location: record.location ?? "Não informado",
    status: (record.status === "Concluida" ? "Concluída" : record.status) as ActivityStatus,
    statusDate: record.status_date ? activityDateFormatter.format(new Date(record.status_date)) : "Não informado",
    plannedAt: record.agreed_date ? activityDateFormatter.format(new Date(record.agreed_date)) : "Não informado",
    mapPosition: { x: Number(record.map_x ?? 0), y: Number(record.map_y ?? 0) },
  }));
}

function getHomeMetrics(dateRange: HomeDateRange): Promise<HomeMetrics> {
  const query = new URLSearchParams({ start_date: dateRange.startDate, end_date: dateRange.endDate });
  return backendJson<HomeMetrics>(`/requests/home-metrics?${query}`);
}

function mapMetricsToEquipmentCards(metrics: HomeMetrics): EquipmentCard[] {
  return metrics.equipment.map((equipment) => {
    const style = getActivityCategoryStyle(equipment.categoryId);
    return {
      title: equipment.categoryName,
      accent: style.accent,
      iconBg: style.iconBg,
      Planned: equipment.planned,
      InProgress: equipment.inProgress,
      Completed: equipment.completed,
      total: equipment.planned + equipment.inProgress + equipment.completed,
    };
  });
}

function mapActivityRecordToMarker(
  record: ActivityRecord,
  categoryColorMap: Record<string, string>,
): ActivityMarkerViewModel {
  return {
    id: record.id,
    label: `${record.id} · ${record.category} · ${record.location}`,
    color: categoryColorMap[String(record.categoryId)] ?? categoryColorMap.default,
    x: record.mapPosition.x,
    y: record.mapPosition.y,
  };
}

function mapActivitiesToBusinessUnitFilters(
  records: ActivityRecord[],
  selectedBusiness = "all",
): PlannedRequestFilterViewModel[] {
  const businessUnits = Array.from(new Set(records.map((record) => record.businessUnit)));

  return [
    ...businessUnits.map((businessUnit) => ({
      value: businessUnit,
      label: businessUnit,
      count: records.filter((record) => record.businessUnit === businessUnit).length,
      isActive: selectedBusiness === businessUnit,
    })),
    {
      value: "all",
      label: "Todos",
      count: records.length,
      isActive: selectedBusiness === "all",
    },
  ];
}

function mapEquipmentCardsToTotals(equipmentCards: EquipmentCard[]) {
  return equipmentCards.reduce(
    (acc, card) => ({
      Planned: acc.Planned + card.Planned,
      InProgress: acc.InProgress + card.InProgress,
      Completed: acc.Completed + card.Completed,
    }),
    { Planned: 0, InProgress: 0, Completed: 0 },
  );
}

function mapHandlingTimeSamplesToClock(samplesInMinutes: number[]): HandlingTimeClockViewModel {
  const averageInMinutes = samplesInMinutes.length > 0
    ? Math.round(samplesInMinutes.reduce((acc, minutes) => acc + minutes, 0) / samplesInMinutes.length)
    : 0;

  const hours = Math.floor(averageInMinutes / 60);
  const minutes = averageInMinutes % 60;
  const display = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  return {
    display,
    caption: `${hours}h ${String(minutes).padStart(2, "0")}min`,
  };
}
