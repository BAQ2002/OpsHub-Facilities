import "server-only";

import type { ActivityRecord, EquipmentCard, MapImage } from "@/src/domain/entities/activity";
import {
  findActivityRecords as findPostgresActivityRecords,
  findCategoryColorMap as findPostgresCategoryColorMap,
  findEquipmentCards as findPostgresEquipmentCards,
  findMapImage as findPostgresMapImage,
  findHandlingTimeSamplesInMinutes as findPostgresHandlingTimeSamplesInMinutes,
} from "@/src/server/repositories/postgres/home-postgres-repository";

export type HomeDateRange = {
  startDate: string;
  endDate: string;
  statuses?: string[];
  businessUnits?: number[];
};

export async function findEquipmentCards(dateRange: HomeDateRange): Promise<EquipmentCard[]> {
  return findPostgresEquipmentCards(dateRange);
}

export async function findActivityRecords(dateRange: HomeDateRange): Promise<ActivityRecord[]> {
  return findPostgresActivityRecords(dateRange);
}

export async function findCategoryColorMap() {
  return findPostgresCategoryColorMap();
}

export async function findMapImage(): Promise<MapImage> {
  return findPostgresMapImage();
}

export async function findHandlingTimeSamplesInMinutes(dateRange: HomeDateRange): Promise<number[]> {
  return findPostgresHandlingTimeSamplesInMinutes(dateRange);
}
