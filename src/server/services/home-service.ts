import "server-only";

import {
  findActivityRecords,
  findCategoryColorMap,
  findMapImage,
  type HomeDateRange,
} from "@/src/server/repositories/home-repository";
import {
  mapActivitiesToBusinessUnitFilters,
  mapActivityRecordToMarker,
  mapEquipmentCardsToTotals,
  mapSlaSamplesToClock,
} from "@/src/mappers/home-mapper";
import type { HomePageViewModel } from "@/src/presentation/view-models/home-view-model";
import type { ActivityCategory, ActivityRecord, EquipmentCard } from "@/src/domain/entities/activity";

export async function getHomePageData(dateRange: HomeDateRange): Promise<HomePageViewModel> {
  const [activityRecords, categoryColorMap, mapImage] = await Promise.all([
    findActivityRecords(dateRange),
    findCategoryColorMap(),
    findMapImage(),
  ]);
  const equipmentCards = buildEquipmentCards(activityRecords);

  return {
    equipmentCards,
    totals: mapEquipmentCardsToTotals(equipmentCards),
    mapImage,
    activityMarkers: activityRecords.map((record) => mapActivityRecordToMarker(record, categoryColorMap)),
    plannedRequestFilterOptions: mapActivitiesToBusinessUnitFilters(activityRecords),
    averageSlaClock: mapSlaSamplesToClock(
      activityRecords.flatMap((record) => record.durationMinutes === undefined ? [] : [record.durationMinutes]),
    ),
    activityRecords,
    categoryColorMap,
  };
}

const categoryStyles: Record<ActivityCategory, Pick<EquipmentCard, "accent" | "iconBg">> = {
  Artífice: { accent: "text-cyan-600", iconBg: "bg-cyan-50" },
  Civil: { accent: "text-violet-500", iconBg: "bg-violet-50" },
  "Copa e Café": { accent: "text-red-500", iconBg: "bg-red-50" },
  Elétrica: { accent: "text-yellow-500", iconBg: "bg-yellow-50" },
  Hidráulica: { accent: "text-blue-500", iconBg: "bg-blue-50" },
  Jardinagem: { accent: "text-green-500", iconBg: "bg-green-50" },
  Refrigeração: { accent: "text-orange-500", iconBg: "bg-orange-50" },
  Limpeza: { accent: "text-teal-500", iconBg: "bg-teal-50" },
};

function buildEquipmentCards(records: ActivityRecord[]): EquipmentCard[] {
  return Object.entries(categoryStyles).map(([category, style]) => {
    const categoryRecords = records.filter((record) => record.category === category);
    return {
      title: category,
      ...style,
      Planned: categoryRecords.filter((record) => record.status === "Programada").length,
      InProgress: categoryRecords.filter((record) => record.status === "Em andamento").length,
      Completed: categoryRecords.filter((record) => record.status === "Concluída").length,
      total: categoryRecords.length,
    };
  });
}
