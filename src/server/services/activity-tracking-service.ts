import "server-only";

import { mapActivityTrackingDataToViewModel } from "@/src/mappers/activity-tracking-mapper";
import type { ActivityTrackingPageViewModel } from "@/src/presentation/view-models/activity-tracking-view-model";
import { findActivityTrackingData } from "@/src/server/repositories/mock/activity-tracking-mock-repository";

export async function getActivityTrackingPageData(): Promise<ActivityTrackingPageViewModel> {
  return mapActivityTrackingDataToViewModel(await findActivityTrackingData());
}
