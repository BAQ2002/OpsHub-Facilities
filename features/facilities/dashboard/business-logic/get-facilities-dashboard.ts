import { makeFacilitiesDashboardRepository } from "../data-access/make-facilities-dashboard-repository";
import type { FacilitiesDashboardViewModel } from "../model/view-model";
import { buildFacilitiesDashboardViewModel } from "./build-facilities-dashboard-view-model";

export async function getFacilitiesDashboard(): Promise<FacilitiesDashboardViewModel> {
  const repository = makeFacilitiesDashboardRepository();
  const data = await repository.getDashboardData();

  return buildFacilitiesDashboardViewModel(data);
}
