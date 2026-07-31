import type { ActivityCategory, ActivityRecord, EquipmentCard } from "@/src/domain/entities/activity";
import type { ActivityMarkerViewModel, PlannedRequestFilterViewModel, SlaClockViewModel } from "@/src/presentation/view-models/home-view-model";

export function mapActivityRecordToMarker(
  record: ActivityRecord,
  categoryColorMap: Record<ActivityCategory, string>,
): ActivityMarkerViewModel {
  return {
    id: record.id,
    label: `${record.id} · ${record.category} · ${record.location}`,
    color: categoryColorMap[record.category],
    x: record.mapPosition.x,
    y: record.mapPosition.y,
  };
}

export function mapActivitiesToBusinessUnitFilters(
  records: ActivityRecord[],
  selectedBusiness = "all",
): PlannedRequestFilterViewModel[] {
  const businessUnits = Array.from(new Set(records.map((record) => record.businessUnit)));

  const businessLabels: Record<string, string> = {
    TECON: "TECON Salvador",
    CLS: "Centro Logístico Salvador",
  };

  return [
    ...businessUnits.map((businessUnit) => ({
      value: businessUnit,
      label: businessLabels[businessUnit] ?? businessUnit,
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

export function mapSlaSamplesToClock(samplesInMinutes: number[]): SlaClockViewModel {
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
