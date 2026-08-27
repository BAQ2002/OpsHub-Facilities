import "server-only";

import type { HomeDashboardQuery } from "@/src/server/queries/home-dashboard/home-dashboard-query";
import { postgresHomeDashboardQuery } from "@/src/server/queries/home-dashboard/postgres/home-dashboard-postgres-query";

export function getHomeDashboardQuery(): HomeDashboardQuery {
  return postgresHomeDashboardQuery;
}
