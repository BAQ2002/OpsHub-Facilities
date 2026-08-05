import "server-only";

import type { ActivityRecord, EquipmentCard, MapImage } from "@/src/domain/entities/activity";
import {
  findActivityRecords as findPostgresActivityRecords,
  findCategoryColorMap as findPostgresCategoryColorMap,
  findEquipmentCards as findPostgresEquipmentCards,
  findMapImage as findPostgresMapImage,
  findHandlingTimeSamplesInMinutes as findPostgresHandlingTimeSamplesInMinutes,
} from "@/src/server/repositories/postgres/home-postgres-repository";
import {
  findActivityRecords as findFastApiActivityRecords,
  findCategoryColorMap as findFastApiCategoryColorMap,
  findEquipmentCards as findFastApiEquipmentCards,
  findMapImage as findFastApiMapImage,
  findHandlingTimeSamplesInMinutes as findFastApiHandlingTimeSamplesInMinutes,
} from "@/src/server/repositories/fastapi/home-fastapi-repository";

export type HomeDateRange = {
  startDate: string;
  endDate: string;
  statuses?: string[];
  businessUnits?: number[];
};

export async function findEquipmentCards(dateRange: HomeDateRange): Promise<EquipmentCard[]> {
  if (process.env.DATA_SOURCE === "postgres") {
    return findPostgresEquipmentCards(dateRange);
  }

  return findFastApiEquipmentCards(dateRange);
}

export async function findActivityRecords(dateRange: HomeDateRange): Promise<ActivityRecord[]> {
  if (process.env.DATA_SOURCE === "fastapi") {
    return findFastApiActivityRecords(dateRange);
  }

  if (process.env.DATA_SOURCE === "postgres") {
    return findPostgresActivityRecords(dateRange);
  }

  return findFastApiActivityRecords(dateRange);
}

export async function findCategoryColorMap() {
  if (process.env.DATA_SOURCE === "postgres") {
    return findPostgresCategoryColorMap();
  }

  return findFastApiCategoryColorMap();
}

export async function findMapImage(): Promise<MapImage> {
  if (process.env.DATA_SOURCE === "postgres") {
    return findPostgresMapImage();
  }

  return findFastApiMapImage();
}

export async function findHandlingTimeSamplesInMinutes(dateRange: HomeDateRange): Promise<number[]> {
  if (process.env.DATA_SOURCE === "postgres") {
    return findPostgresHandlingTimeSamplesInMinutes(dateRange);
  }

  return findFastApiHandlingTimeSamplesInMinutes(dateRange);
}
