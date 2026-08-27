import type { RequestBoardData } from "@/src/domain/entities/request-board";

export interface RequestBoardQuery {
  findData(): Promise<RequestBoardData>;
}
