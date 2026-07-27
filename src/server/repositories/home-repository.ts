import "server-only";

import type { ActivityRecord, EquipmentCard, MapImage } from "@/src/domain/entities/activity";
import {
  findActivityRecords as findMockActivityRecords,
  findCategoryColorMap as findMockCategoryColorMap,
  findEquipmentCards as findMockEquipmentCards,
  findMapImage as findMockMapImage,
  findSlaSamplesInMinutes as findMockSlaSamplesInMinutes,
} from "@/src/server/repositories/mock/home-mock-repository";
import {
  findActivityRecords as findPostgresActivityRecords,
  findCategoryColorMap as findPostgresCategoryColorMap,
  findEquipmentCards as findPostgresEquipmentCards,
  findMapImage as findPostgresMapImage,
  findSlaSamplesInMinutes as findPostgresSlaSamplesInMinutes,
} from "@/src/server/repositories/postgres/home-postgres-repository";
import { findActivityRecords as findFastApiActivityRecords } from "@/src/server/repositories/fastapi/home-fastapi-repository";

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

  return findMockEquipmentCards();
}

export async function findActivityRecords(dateRange: HomeDateRange): Promise<ActivityRecord[]> {
  if (process.env.DATA_SOURCE === "fastapi") {
    return findFastApiActivityRecords(dateRange);
  }

  if (process.env.DATA_SOURCE === "postgres") {
    return findPostgresActivityRecords(dateRange);
  }

  return findMockActivityRecords();
}

export async function findCategoryColorMap() {
  if (process.env.DATA_SOURCE === "postgres") {
    return findPostgresCategoryColorMap();
  }

  return findMockCategoryColorMap();
}

export async function findMapImage(): Promise<MapImage> {
  if (process.env.DATA_SOURCE === "postgres") {
    return findPostgresMapImage();
  }

  return findMockMapImage();
}

export async function findSlaSamplesInMinutes(dateRange: HomeDateRange): Promise<number[]> {
  if (process.env.DATA_SOURCE === "postgres") {
    return findPostgresSlaSamplesInMinutes(dateRange);
  }

  return findMockSlaSamplesInMinutes();
}
