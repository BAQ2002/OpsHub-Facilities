import type { ActivityTrackingData } from "@/src/domain/entities/dashboard";

export type ActivityTrackingPageViewModel = ActivityTrackingData & {
  maxMonthlyValue: number;
};
