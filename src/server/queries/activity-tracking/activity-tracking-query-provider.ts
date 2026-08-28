import "server-only";

import type { ActivityTrackingQuery } from "@/src/server/queries/activity-tracking/activity-tracking-query";
import { postgresActivityTrackingQuery } from "@/src/server/queries/activity-tracking/postgres/activity-tracking-postgres-query";

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém activity tracking query para uso pelo fluxo solicitante.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function getActivityTrackingQuery(): ActivityTrackingQuery {
  return postgresActivityTrackingQuery;
}
