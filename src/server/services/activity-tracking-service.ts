import "server-only";

import { mapActivityTrackingDataToViewModel } from "@/src/mappers/activity-tracking-mapper";
import type { ActivityTrackingPageViewModel } from "@/src/presentation/view-models/activity-tracking-view-model";
import type { ActivityTrackingFilters } from "@/src/domain/entities/dashboard";
import { getActivityTrackingQuery } from "@/src/server/queries/activity-tracking/activity-tracking-query-provider";

/**
 * Acionada pela página ou Server Action que solicita este caso de uso.
 *
 * Obtém activity tracking page data para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona {@link mapActivityTrackingDataToViewModel}, {@link findData}, {@link getActivityTrackingQuery}.
 *
 * @param filters Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function getActivityTrackingPageData(filters: ActivityTrackingFilters): Promise<ActivityTrackingPageViewModel> {
  return mapActivityTrackingDataToViewModel(await getActivityTrackingQuery().findData(filters));
}
