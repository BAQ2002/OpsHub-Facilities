import "server-only";
import type { ActivityTrackingQuery } from "@/src/server/queries/activity-tracking/activity-tracking-query";
import { backendJson } from "@/src/server/api-client";
export const apiActivityTrackingQuery:ActivityTrackingQuery={findData(filters){const q=new URLSearchParams({start_date:filters.startDate,end_date:filters.endDate});if(filters.businessId)q.set("business_id",String(filters.businessId));if(filters.serviceCategoryId)q.set("service_category_id",String(filters.serviceCategoryId));return backendJson(`/requests/activity-tracking?${q}`)}};
