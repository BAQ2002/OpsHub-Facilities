import "server-only";

import type { RequestBoardData } from "@/src/domain/entities/request-board";
import { findRequestBoardData as findPostgresRequestBoardData } from "@/src/server/repositories/postgres/request-board-postgres-repository";

export async function findRequestBoardData(): Promise<RequestBoardData> {
  return findPostgresRequestBoardData();
}
