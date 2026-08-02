import "server-only";

import type { ActivityTrackingData, ActivityTrackingFilters } from "@/src/domain/entities/dashboard";
import { findActivityTrackingData as findPostgresActivityTrackingData } from "@/src/server/repositories/postgres/activity-tracking-postgres-repository";

export function findActivityTrackingData(filters: ActivityTrackingFilters): Promise<ActivityTrackingData> {
  return findPostgresActivityTrackingData(filters);
}
