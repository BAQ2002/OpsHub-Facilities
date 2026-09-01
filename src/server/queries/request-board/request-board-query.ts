import type { RequestBoardData } from "@/src/domain/entities/request-board";

export type RequestBoardFilters = { startDate: string; endDate: string };

export interface RequestBoardQuery {
  findData(filters: RequestBoardFilters): Promise<RequestBoardData>;
}
