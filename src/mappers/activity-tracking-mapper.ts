import type { ActivityTrackingData } from "@/src/domain/entities/dashboard";
import type { ActivityTrackingPageViewModel } from "@/src/presentation/view-models/activity-tracking-view-model";

export function mapActivityTrackingDataToViewModel(
  data: ActivityTrackingData,
): ActivityTrackingPageViewModel {
  return {
    ...data,
    maxMonthlyValue: Math.max(
      ...data.monthlyData.flatMap((item) => [item.open, item.closed]),
    ),
  };
}
