import "server-only";

import type { ActivityTrackingQuery } from "@/src/server/queries/activity-tracking/activity-tracking-query";
import { postgresActivityTrackingQuery } from "@/src/server/queries/activity-tracking/postgres/activity-tracking-postgres-query";

export function getActivityTrackingQuery(): ActivityTrackingQuery {
  return postgresActivityTrackingQuery;
}
