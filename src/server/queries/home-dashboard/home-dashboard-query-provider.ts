import "server-only";

import type { HomeDashboardQuery } from "@/src/server/queries/home-dashboard/home-dashboard-query";
import { postgresHomeDashboardQuery } from "@/src/server/queries/home-dashboard/postgres/home-dashboard-postgres-query";

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém home dashboard query para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getHomeDashboardQuery(): HomeDashboardQuery {
  return postgresHomeDashboardQuery;
}
