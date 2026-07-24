import "server-only";

import type { ActivityRequestField } from "@/src/domain/entities/activity-request-form";
import { getActivityRequestFormData as getMockActivityRequestFormData } from "@/src/server/repositories/mock/activity-request-form-mock-repository";
import { getActivityRequestFormData as getPostgresActivityRequestFormData } from "@/src/server/repositories/postgres/activity-request-form-postgres-repository";

export type ActivityRequestFormFilters = {
  serviceCategory?: string;
  serviceType?: string;
};

export type ActivityRequestFormData = {
  serviceCategoryName?: string;
  serviceTypeName?: string;
  fields: ActivityRequestField[];
};

export async function getActivityRequestFormData(
  filters: ActivityRequestFormFilters,
): Promise<ActivityRequestFormData> {
  if (process.env.DATA_SOURCE === "postgres") {
    return getPostgresActivityRequestFormData(filters);
  }

  return getMockActivityRequestFormData(filters);
}
