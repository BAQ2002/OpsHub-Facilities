"use server";

import type { ActivityTrackingFilters } from "@/src/domain/entities/dashboard";
import { getActivityTrackingPageData } from "@/src/server/services/activity-tracking-service";
import { validateDateRange } from "@/src/server/validation/date-range";

export async function filterActivityTracking(filters: ActivityTrackingFilters) {
  const range = validateDateRange(filters);
  return getActivityTrackingPageData({ ...filters, ...range });
}
