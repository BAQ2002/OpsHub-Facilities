import type { ActivityRecord, EquipmentCard, MapImage } from "@/src/domain/entities/activity";

export type HomeDateRange = {
  startDate: string;
  endDate: string;
  statuses?: string[];
  businessUnits?: number[];
};

export interface HomeDashboardQuery {
  findEquipmentCards(dateRange: HomeDateRange): Promise<EquipmentCard[]>;
  findActivityRecords(dateRange: HomeDateRange): Promise<ActivityRecord[]>;
  findCategoryColorMap(): Promise<Record<string, string>>;
  findMapImage(): Promise<MapImage>;
  findHandlingTimeSamplesInMinutes(dateRange: HomeDateRange): Promise<number[]>;
}
