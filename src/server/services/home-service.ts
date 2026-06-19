import "server-only";

import {
  findActivityRecords,
  findCategoryColorMap,
  findEquipmentCards,
  findMapImage,
  findSlaSamplesInMinutes,
} from "@/src/server/repositories/mock/home-mock-repository";
import {
  mapActivitiesToBusinessUnitFilters,
  mapActivityRecordToMarker,
  mapEquipmentCardsToTotals,
  mapSlaSamplesToClock,
} from "@/src/mappers/home-mapper";
import type { HomePageViewModel } from "@/src/presentation/view-models/home-view-model";

export async function getHomePageData(): Promise<HomePageViewModel> {
  const [equipmentCards, activityRecords, categoryColorMap, mapImage, slaSamples] = await Promise.all([
    findEquipmentCards(),
    findActivityRecords(),
    findCategoryColorMap(),
    findMapImage(),
    findSlaSamplesInMinutes(),
  ]);

  return {
    equipmentCards,
    totals: mapEquipmentCardsToTotals(equipmentCards),
    mapImage,
    activityMarkers: activityRecords.map((record) => mapActivityRecordToMarker(record, categoryColorMap)),
    plannedRequestFilterOptions: mapActivitiesToBusinessUnitFilters(activityRecords),
    averageSlaClock: mapSlaSamplesToClock(slaSamples),
    activityRecords,
    categoryColorMap,
  };
}
