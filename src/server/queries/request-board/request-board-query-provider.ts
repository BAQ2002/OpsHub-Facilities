import "server-only";

import type { RequestBoardQuery } from "@/src/server/queries/request-board/request-board-query";
import { postgresRequestBoardQuery } from "@/src/server/queries/request-board/postgres/request-board-postgres-query";

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém request board query para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getRequestBoardQuery(): RequestBoardQuery {
  return postgresRequestBoardQuery;
}
