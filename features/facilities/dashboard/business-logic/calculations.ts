import type {
  ActivityRecord,
  BusinessUnit,
  CategoryColorMap,
  ServiceCategorySummary,
} from "../model/domain";
import type {
  ActivityMarkerViewModel,
  ClockDurationViewModel,
  DashboardTotalsViewModel,
  PlannedRequestFilterOptionViewModel,
} from "../model/view-model";

const fallbackMarkerColor = "#64748b";

export function calculateDashboardTotals(
  cards: ServiceCategorySummary[],
): DashboardTotalsViewModel {
  return cards.reduce(
    (acc, card) => ({
      Planned: acc.Planned + card.Planned,
      InProgress: acc.InProgress + card.InProgress,
    }),
    { Planned: 0, InProgress: 0 },
  );
}

export function buildActivityMarkers(
  records: ActivityRecord[],
  categoryColorMap: CategoryColorMap,
): ActivityMarkerViewModel[] {
  return records.map((record) => ({
    id: record.id,
    label: `${record.id} · ${record.category} · ${record.location}`,
    color: categoryColorMap[record.category] ?? fallbackMarkerColor,
    x: record.mapPosition.x,
    y: record.mapPosition.y,
  }));
}

export function buildBusinessUnitFilterOptions(
  records: ActivityRecord[],
  businessUnitFilters: readonly BusinessUnit[],
): PlannedRequestFilterOptionViewModel[] {
  return [
    ...businessUnitFilters.map((businessUnit) => ({
      label: businessUnit,
      count: records.filter((record) => record.businessUnit === businessUnit)
        .length,
      isActive: false,
    })),
    {
      label: "Todos",
      count: records.length,
      isActive: true,
    },
  ];
}

export function calculateAverageSlaInMinutes(samples: number[]): number {
  if (samples.length === 0) {
    return 0;
  }

  return Math.round(
    samples.reduce((acc, minutes) => acc + minutes, 0) / samples.length,
  );
}

export function formatClockDuration(
  totalMinutes: number,
): ClockDurationViewModel {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");

  return {
    display: `${hours}:${minutes}`,
    caption: `${hours}h${minutes}min`,
  };
}
