import type { ActivityTrackingData } from "@/src/domain/entities/dashboard";
import type { ActivityTrackingPageViewModel } from "@/src/presentation/view-models/activity-tracking-view-model";

/**
 * Acionada pela camada de serviço ao converter dados entre domínio e apresentação.
 *
 * Map activity tracking data to view model para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link max}, {@link flatMap}.
 *
 * @param data Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function mapActivityTrackingDataToViewModel(
  data: ActivityTrackingData,
): ActivityTrackingPageViewModel {
  return {
    ...data,
    maxMonthlyValue: Math.max(1,
      ...data.monthlyData.flatMap((item) => [item.open, item.closed]),
    ),
  };
}
