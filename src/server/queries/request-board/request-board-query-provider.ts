import "server-only";

import type { RequestBoardQuery } from "@/src/server/queries/request-board/request-board-query";
import { postgresRequestBoardQuery } from "@/src/server/queries/request-board/postgres/request-board-postgres-query";

export function getRequestBoardQuery(): RequestBoardQuery {
  return postgresRequestBoardQuery;
}
