"use server";

import type { ActivityTrackingFilters } from "@/app/types/navigation_entities/chamados_dashboard_viewModels";
import { getActivityTrackingPageData } from "@/app/pages/services/activity-tracking-service";
import { validateDateRange } from "@/src/server/validation/date-range";

export async function filterActivityTracking(filters: ActivityTrackingFilters) {
  const range = validateDateRange(filters);
  return getActivityTrackingPageData({ ...filters, ...range });
}
