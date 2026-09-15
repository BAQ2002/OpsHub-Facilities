import "server-only";

import type { ActivityTrackingPageViewModel } from "@/app/types/navigation_entities/activity-tracking";
import type { ActivityTrackingData, ActivityTrackingFilters } from "@/app/types/concrete_entity/dashboard";
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

  const data = await backendJson<ActivityTrackingData>(`/requests/activity-tracking?${query}`);
  return mapActivityTrackingDataToViewModel(data);
}

function mapActivityTrackingDataToViewModel(
  data: ActivityTrackingData,
): ActivityTrackingPageViewModel {
  return {
    ...data,
    maxMonthlyValue: Math.max(1,
      ...data.monthlyData.flatMap((item) => [item.open, item.closed]),
    ),
  };
}
