import "server-only";

import type { ActivityRecord, MapImage } from "@/src/domain/entities/activity";
import { findActivityRecords as findFastApiActivityRecords } from "@/src/server/repositories/fastapi/home-fastapi-repository";
import {
  findCategoryColorMap as findConfiguredCategoryColorMap,
  findMapImage as findConfiguredMapImage,
} from "@/src/server/repositories/config/home-config-repository";

export type HomeDateRange = {
  startDate: string;
  endDate: string;
  statuses?: string[];
  businessUnits?: number[];
};

export async function findActivityRecords(dateRange: HomeDateRange): Promise<ActivityRecord[]> {
  return findFastApiActivityRecords(dateRange);
}

export async function findCategoryColorMap() {
  return findConfiguredCategoryColorMap();
}

export async function findMapImage(): Promise<MapImage> {
  return findConfiguredMapImage();
}
