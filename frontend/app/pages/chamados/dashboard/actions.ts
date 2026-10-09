"use server";

import { apiResult } from "@/app/entities/api/api-result";
import type { ActivityTrackingFilters } from "@/app/entities/navigation_entities/chamados_dashboard_viewModels";
import { getActivityTrackingPageData } from "@/app/services/activity-tracking-service";
import { validateDateRange } from "@/app/validation/date-range";

export async function filterActivityTracking(filters: ActivityTrackingFilters) {
  return apiResult(() => getActivityTrackingPageData({ ...filters, ...validateDateRange(filters) }));
}
