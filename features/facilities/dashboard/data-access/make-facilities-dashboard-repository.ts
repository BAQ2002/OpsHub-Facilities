import type { FacilitiesDashboardRepository } from "./facilities-dashboard-repository";
import { MockFacilitiesDashboardRepository } from "./mock-facilities-dashboard-repository";

export function makeFacilitiesDashboardRepository(): FacilitiesDashboardRepository {
  return new MockFacilitiesDashboardRepository();
}
