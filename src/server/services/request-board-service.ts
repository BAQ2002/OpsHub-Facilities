import "server-only";

import { mapRequestBoardDataToViewModel } from "@/src/mappers/request-board-mapper";
import type { RequestBoardPageViewModel } from "@/src/presentation/view-models/request-board-view-model";
import { getRequestBoardQuery } from "@/src/server/queries/request-board/request-board-query-provider";

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém request board page data para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona `mapRequestBoardDataToViewModel`, `findData`, `getRequestBoardQuery`.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function getRequestBoardPageData(): Promise<RequestBoardPageViewModel> {
  return mapRequestBoardDataToViewModel(await getRequestBoardQuery().findData());
}
