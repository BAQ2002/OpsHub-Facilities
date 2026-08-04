import "server-only";

import type { RequestBoardData } from "@/src/domain/entities/request-board";
import { findRequestBoardData as findFastApiRequestBoardData } from "@/src/server/repositories/fastapi/request-board-fastapi-repository";
import { findRequestBoardData as findMockRequestBoardData } from "@/src/server/repositories/mock/request-board-mock-repository";
import { findRequestBoardData as findPostgresRequestBoardData } from "@/src/server/repositories/postgres/request-board-postgres-repository";

export async function findRequestBoardData(): Promise<RequestBoardData> {
  if (process.env.DATA_SOURCE === "postgres") {
    return findPostgresRequestBoardData();
  }

  if (process.env.DATA_SOURCE === "fastapi") {
    return findFastApiRequestBoardData();
  }

  return findMockRequestBoardData();
}
