import "server-only";

import type { HomeDashboardQuery } from "@/src/server/queries/home-dashboard/home-dashboard-query";
import { apiHomeDashboardQuery } from "@/src/server/queries/api/api-home-dashboard-query";

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém home dashboard query para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getHomeDashboardQuery(): HomeDashboardQuery {
  return apiHomeDashboardQuery;
}
