import "server-only";

import { activityCategories, type ActivityCategory, type MapImage } from "@/src/domain/entities/activity";

const categoryColors: Record<ActivityCategory, string> = {
  Artífice: "#0891b2",
  Civil: "#8b5cf6",
  "Copa e Café": "#ef4444",
  Elétrica: "#eab308",
  Hidráulica: "#3b82f6",
  Jardinagem: "#22c55e",
  Refrigeração: "#f97316",
  Limpeza: "#14b8a6",
};

export async function findCategoryColorMap(): Promise<Record<ActivityCategory, string>> {
  return Object.fromEntries(
    activityCategories.map((category) => [category, categoryColors[category]]),
  ) as Record<ActivityCategory, string>;
}

export async function findMapImage(): Promise<MapImage> {
  return {
    src: process.env.FACILITIES_MAP_SRC ?? "/facilities-map.png",
    width: Number(process.env.FACILITIES_MAP_WIDTH ?? 1544),
    height: Number(process.env.FACILITIES_MAP_HEIGHT ?? 908),
    alt: "Mapa AIS com posições atuais das atividades de facilities",
  };
}
