import "server-only";

import {
  findActivityRecords,
  findCategoryColorMap,
  findEquipmentCards,
  findMapImage,
  findHandlingTimeSamplesInMinutes,
  type HomeDateRange,
} from "@/src/server/repositories/home-repository";
import {
  mapActivitiesToBusinessUnitFilters,
  mapActivityRecordToMarker,
  mapEquipmentCardsToTotals,
  mapHandlingTimeSamplesToClock,
} from "@/src/mappers/home-mapper";
import type { HomePageViewModel } from "@/src/presentation/view-models/home-view-model";

export async function getHomePageData(
  dateRange: HomeDateRange,
  selectedBusiness = "all",
): Promise<HomePageViewModel> {
  const [equipmentCards, activityRecords, categoryColorMap, mapImage, handlingTimeSamples] = await Promise.all([
    findEquipmentCards(dateRange),
    findActivityRecords(dateRange),
    findCategoryColorMap(),
    findMapImage(),
    findHandlingTimeSamplesInMinutes(dateRange),
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
