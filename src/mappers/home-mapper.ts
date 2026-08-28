import type { ActivityRecord, EquipmentCard } from "@/src/domain/entities/activity";
import type { ActivityMarkerViewModel, PlannedRequestFilterViewModel, HandlingTimeClockViewModel } from "@/src/presentation/view-models/home-view-model";

/**
 * Acionada pela camada de serviço ao converter dados entre domínio e apresentação.
 *
 * Map activity record to marker para o formato esperado pelo fluxo.
 *
 * @param record Dados necessários para executar esta função.
 * @param categoryColorMap Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function mapActivityRecordToMarker(
  record: ActivityRecord,
  categoryColorMap: Record<string, string>,
): ActivityMarkerViewModel {
  return {
    id: record.id,
    label: `${record.id} · ${record.category} · ${record.location}`,
    color: categoryColorMap[String(record.categoryId)] ?? categoryColorMap.default,
    x: record.mapPosition.x,
    y: record.mapPosition.y,
  };
}

/**
 * Acionada pela camada de serviço ao converter dados entre domínio e apresentação.
 *
 * Map activities to business unit filters para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link from}, {@link map}, {@link filter}.
 *
 * @param records Dados necessários para executar esta função.
 * @param selectedBusiness Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function mapActivitiesToBusinessUnitFilters(
  records: ActivityRecord[],
  selectedBusiness = "all",
): PlannedRequestFilterViewModel[] {
  const businessUnits = Array.from(new Set(records.map((record) => record.businessUnit)));

  return [
    ...businessUnits.map((businessUnit) => ({
      value: businessUnit,
      label: businessUnit,
      count: records.filter((record) => record.businessUnit === businessUnit).length,
      isActive: selectedBusiness === businessUnit,
    })),
    {
      value: "all",
      label: "Todos",
      count: records.length,
      isActive: selectedBusiness === "all",
    },
  ];
}

/**
 * Acionada pela camada de serviço ao converter dados entre domínio e apresentação.
 *
 * Map equipment cards to totals para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link reduce}.
 *
 * @param equipmentCards Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function mapEquipmentCardsToTotals(equipmentCards: EquipmentCard[]) {
  return equipmentCards.reduce(
    (acc, card) => ({
      Planned: acc.Planned + card.Planned,
      InProgress: acc.InProgress + card.InProgress,
      Completed: acc.Completed + card.Completed,
    }),
    { Planned: 0, InProgress: 0, Completed: 0 },
  );
}

/**
 * Acionada pela camada de serviço ao converter dados entre domínio e apresentação.
 *
 * Map handling time samples to clock para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link round}, {@link reduce}, {@link floor}, {@link padStart}.
 *
 * @param samplesInMinutes Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export function mapHandlingTimeSamplesToClock(samplesInMinutes: number[]): HandlingTimeClockViewModel {
  const averageInMinutes = samplesInMinutes.length > 0
    ? Math.round(samplesInMinutes.reduce((acc, minutes) => acc + minutes, 0) / samplesInMinutes.length)
    : 0;

  const hours = Math.floor(averageInMinutes / 60);
  const minutes = averageInMinutes % 60;
  const display = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  return {
    display,
    caption: `${hours}h ${String(minutes).padStart(2, "0")}min`,
  };
}
