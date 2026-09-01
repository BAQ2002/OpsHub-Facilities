import type { ActivityTrackingData, ActivityTrackingFilters } from "@/src/domain/entities/dashboard";

export interface ActivityTrackingQuery {
  findData(filters: ActivityTrackingFilters): Promise<ActivityTrackingData>;
}
