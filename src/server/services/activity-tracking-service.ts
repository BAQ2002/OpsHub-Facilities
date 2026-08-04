import "server-only";

import { mapActivityTrackingDataToViewModel } from "@/src/mappers/activity-tracking-mapper";
import type { ActivityTrackingPageViewModel } from "@/src/presentation/view-models/activity-tracking-view-model";
import type { ActivityTrackingFilters } from "@/src/domain/entities/dashboard";
import { findActivityTrackingData } from "@/src/server/repositories/activity-tracking-repository";

export async function getActivityTrackingPageData(filters: ActivityTrackingFilters): Promise<ActivityTrackingPageViewModel> {
  return mapActivityTrackingDataToViewModel(await findActivityTrackingData(filters));
}
