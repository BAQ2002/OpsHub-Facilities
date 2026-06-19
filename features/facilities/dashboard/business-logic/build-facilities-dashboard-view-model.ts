import type { FacilitiesDashboardData } from "../model/domain";
import type { FacilitiesDashboardViewModel } from "../model/view-model";
import {
  buildActivityMarkers,
  buildBusinessUnitFilterOptions,
  calculateAverageSlaInMinutes,
  calculateDashboardTotals,
  formatClockDuration,
} from "./calculations";

export function buildFacilitiesDashboardViewModel(
  data: FacilitiesDashboardData,
): FacilitiesDashboardViewModel {
  const averageSlaInMinutes = calculateAverageSlaInMinutes(
    data.slaSamplesInMinutes,
  );

  return {
    activityMarkers: buildActivityMarkers(
      data.activityRecords,
      data.categoryColorMap,
    ),
    activityRecords: data.activityRecords,
    averageSlaClock: formatClockDuration(averageSlaInMinutes),
    categoryColorMap: data.categoryColorMap,
    equipmentCards: data.equipmentCards,
    mapImage: data.mapImage,
    plannedRequestFilterOptions: buildBusinessUnitFilterOptions(
      data.activityRecords,
      data.businessUnitFilters,
    ),
    totals: calculateDashboardTotals(data.equipmentCards),
  };
}
