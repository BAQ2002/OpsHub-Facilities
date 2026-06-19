import type { FacilitiesDashboardData } from "../model/domain";
import type { FacilitiesDashboardRepository } from "./facilities-dashboard-repository";
import {
  activityRecords,
  businessUnitFilters,
  categoryColorMap,
  equipmentCards,
  mapImage,
  slaSamplesInMinutes,
} from "./mock-facilities-dashboard-data";

export class MockFacilitiesDashboardRepository
  implements FacilitiesDashboardRepository
{
  async getDashboardData(): Promise<FacilitiesDashboardData> {
    return {
      activityRecords,
      businessUnitFilters,
      categoryColorMap,
      equipmentCards,
      mapImage,
      slaSamplesInMinutes,
    };
  }
}
