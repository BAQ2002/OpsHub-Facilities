import "server-only";

import type { ActivityRecord, EquipmentCard } from "@/src/domain/entities/activity";
import { getHomeDashboardQuery } from "@/src/server/queries/home-dashboard/home-dashboard-query-provider";
import type { HomeDateRange } from "@/src/server/queries/home-dashboard/home-dashboard-query";
import type {
  ActivityMarkerViewModel,
  HandlingTimeClockViewModel,
  HomePageViewModel,
  PlannedRequestFilterViewModel,
} from "@/src/presentation/view-models/home-view-model";

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém home page data para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona {@link getHomeDashboardQuery}, {@link all}, {@link findEquipmentCards}, {@link findActivityRecords} e outras rotinas auxiliares.
 *
 * @param dateRange Dados necessários para executar esta função.
 * @param selectedBusiness Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function getHomePageData(
  dateRange: HomeDateRange,
  selectedBusiness = "all",
): Promise<HomePageViewModel> {
  const query = getHomeDashboardQuery();
  const [equipmentCards, activityRecords, categoryColorMap, mapImage, handlingTimeSamples] = await Promise.all([
    query.findEquipmentCards(dateRange),
    query.findActivityRecords(dateRange),
    query.findCategoryColorMap(),
    query.findMapImage(),
    query.findHandlingTimeSamplesInMinutes(dateRange),
  ]);

  return {
    equipmentCards,
    totals: mapEquipmentCardsToTotals(equipmentCards),
    mapImage,
    activityMarkers: activityRecords.map((record) => mapActivityRecordToMarker(record, categoryColorMap)),
    plannedRequestFilterOptions: mapActivitiesToBusinessUnitFilters(activityRecords, selectedBusiness),
    averageHandlingTimeClock: mapHandlingTimeSamplesToClock(handlingTimeSamples),
    activityRecords,
    categoryColorMap,
  };
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
