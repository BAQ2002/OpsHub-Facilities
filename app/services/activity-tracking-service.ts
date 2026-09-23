import "server-only";

import type { ActivityTrackingResponse } from "@/app/entities/api/entity-responses";

import type { ActivityTrackingPageViewModel, ActivityTrackingFilters } from "@/app/entities/navigation_entities/chamados_dashboard_viewModels";
import { mapCategoryChartItem } from "@/app/entities/navigation_entities/chamados_dashboard_viewModels";

import { backendJson } from "@/src/server/api-client";

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém activity tracking page data para uso pelo fluxo solicitante.
 * Durante o fluxo, consulta o backend e transforma os dados no view model da página.
 *
 * @param filters Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function getActivityTrackingPageData(filters: ActivityTrackingFilters): Promise<ActivityTrackingPageViewModel> {
  const query = new URLSearchParams({
    start_date: filters.startDate,
    end_date: filters.endDate,
  });
  if (filters.businessId) query.set("business_id", String(filters.businessId));
  if (filters.serviceCategoryId) query.set("service_category_id", String(filters.serviceCategoryId));

  const data = await backendJson<ActivityTrackingResponse>(`/requests/activity-tracking?${query}`);
  return mapActivityTrackingResponseToViewModel(data);
}

function mapActivityTrackingResponseToViewModel(
  data: ActivityTrackingResponse,
): ActivityTrackingPageViewModel {
  return {
    ...data,
    categoryData: data.categoryData.map(mapCategoryChartItem),
    filterOptions: {
      businesses: data.filterOptions.businesses.map((item) => ({ id: item.id, name: item.name || "Não informado" })),
      serviceCategories: data.filterOptions.serviceCategories.map((item) => ({ id: item.id, name: item.name || "Não informado" })),
    },
    maxMonthlyValue: Math.max(1,
      ...data.monthlyData.flatMap((item) => [item.open, item.closed]),
    ),
  };
}
