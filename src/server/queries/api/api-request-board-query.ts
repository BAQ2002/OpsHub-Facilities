import "server-only";
import type { RequestBoardQuery } from "@/src/server/queries/request-board/request-board-query";
import { backendJson } from "@/src/server/api-client";
export const apiRequestBoardQuery:RequestBoardQuery={findData(filters){const q=new URLSearchParams({start_date:filters.startDate,end_date:filters.endDate});return backendJson(`/requests/board?${q}`)}};
