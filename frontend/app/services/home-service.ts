import "server-only";

import facilitiesMap from "@/app/assets/facilities-map.png";
import type { HomeMetrics, ActivityMapRecord, EquipmentCard, ActivityMarkerViewModel, ActivityCategoryStyle, HandlingTimeClockViewModel, HomePageViewModel, PlannedRequestFilterViewModel } from "@/app/entities/navigation_entities/home_viewModels";

import { activityCategoryStylesById, defaultActivityCategoryStyle, getActivityCategoryStyle } from "@/app/entities/navigation_entities/home_viewModels";
import { backendJson } from "@/app/services/api-client";

type HomeDateRange = {
  startDate: string;
  endDate: string;
  statuses?: string[];
  businessUnits?: number[];
};

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
  const [metrics, mapRecords, businessCounts] = await Promise.all([
    getHomeMetrics(dateRange),
    backendJson<ActivityMapRecord[]>(`/requests/activities/map?${homeDateRangeQuery(dateRange)}`),
    backendJson<{ name: string; count: number }[]>(`/requests/activities/business-counts?${homeDateRangeQuery(dateRange)}`),
  ]);
  const equipmentCards = mapMetricsToEquipmentCards(metrics);
  const categoryStyleMap = Object.fromEntries([
    ...Object.entries(activityCategoryStylesById),
    ["default", defaultActivityCategoryStyle],
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
    activityMarkers: mapRecords.map((record) => mapActivityRecordToMarker(record, categoryStyleMap)),
    plannedRequestFilterOptions: mapActivitiesToBusinessUnitFilters(businessCounts, selectedBusiness),
    averageHandlingTimeClock: mapHandlingTimeSamplesToClock(metrics.handlingMinutes),
    categoryStyleMap,
  };
}

function homeDateRangeQuery(dateRange: HomeDateRange): URLSearchParams {
  const query = new URLSearchParams({ start_date: dateRange.startDate, end_date: dateRange.endDate });
  dateRange.statuses?.forEach((status) => query.append("status", status));
  dateRange.businessUnits?.forEach((businessUnit) => query.append("business_unit", String(businessUnit)));
  return query;
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
      categoryStyle: style,
      Planned: equipment.planned,
      InProgress: equipment.inProgress,
      Completed: equipment.completed,
      total: equipment.planned + equipment.inProgress + equipment.completed,
    };
  });
}

function mapActivityRecordToMarker(
  record: ActivityMapRecord,
  categoryStyleMap: Record<string, ActivityCategoryStyle>,
): ActivityMarkerViewModel {
  return {
    id: record.id,
    label: `${record.id} · ${record.category} · ${record.location}`,
    color: (categoryStyleMap[String(record.categoryId)] ?? categoryStyleMap.default).color,
    x: record.x,
    y: record.y,
  };
}

function mapActivitiesToBusinessUnitFilters(
  counts: { name: string; count: number }[],
  selectedBusiness = "all",
): PlannedRequestFilterViewModel[] {
  return [
    ...counts.map(({ name, count }) => ({
      value: name, label: name, count, isActive: selectedBusiness === name,
    })),
    {
      value: "all", label: "Todos",
      count: counts.reduce((sum, item) => sum + item.count, 0),
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
