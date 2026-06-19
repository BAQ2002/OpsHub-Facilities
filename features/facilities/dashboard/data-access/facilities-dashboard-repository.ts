import type { FacilitiesDashboardData } from "../model/domain";

export interface FacilitiesDashboardRepository {
  getDashboardData(): Promise<FacilitiesDashboardData>;
}
