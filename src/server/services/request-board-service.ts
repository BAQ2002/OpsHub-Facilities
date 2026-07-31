import "server-only";

import { mapRequestBoardDataToViewModel } from "@/src/mappers/request-board-mapper";
import type { RequestBoardPageViewModel } from "@/src/presentation/view-models/request-board-view-model";
import { findRequestBoardData } from "@/src/server/repositories/request-board-repository";

export async function getRequestBoardPageData(): Promise<RequestBoardPageViewModel> {
  return mapRequestBoardDataToViewModel(await findRequestBoardData());
}
