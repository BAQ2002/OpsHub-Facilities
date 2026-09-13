import type { ActivityTrackingData } from "@/app/types/concrete_entity/dashboard";

export type ActivityTrackingPageViewModel = ActivityTrackingData & {
  maxMonthlyValue: number;
};
