import "server-only";

import { getHomeDashboardQuery } from "@/src/server/queries/home-dashboard/home-dashboard-query-provider";
import type { HomeDateRange } from "@/src/server/queries/home-dashboard/home-dashboard-query";
import {
  mapActivitiesToBusinessUnitFilters,
  mapActivityRecordToMarker,
  mapEquipmentCardsToTotals,
  mapHandlingTimeSamplesToClock,
} from "@/src/mappers/home-mapper";
import type { HomePageViewModel } from "@/src/presentation/view-models/home-view-model";

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém home page data para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona `getHomeDashboardQuery`, `all`, `findEquipmentCards`, `findActivityRecords` e outras rotinas auxiliares.
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
