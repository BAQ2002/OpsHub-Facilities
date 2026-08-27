import "server-only";

import { mapRequestBoardDataToViewModel } from "@/src/mappers/request-board-mapper";
import type { RequestBoardPageViewModel } from "@/src/presentation/view-models/request-board-view-model";
import { getRequestBoardQuery } from "@/src/server/queries/request-board/request-board-query-provider";

export async function getRequestBoardPageData(): Promise<RequestBoardPageViewModel> {
  return mapRequestBoardDataToViewModel(await getRequestBoardQuery().findData());
}
