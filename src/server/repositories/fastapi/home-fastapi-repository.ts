import "server-only";

import facilitiesMap from "@/public_resources/facilities-map.png";
import {
  activityCategoryStylesById,
  activityStatuses,
  defaultActivityCategoryStyle,
  getActivityCategoryStyle,
  type ActivityRecord,
  type ActivityStatus,
  type ActivityType,
  type EquipmentCard,
  type MapImage,
} from "@/src/domain/entities/activity";
import { getFastApiPath, requestFastApi } from "@/src/server/api/fastapi";
import type { HomeDateRange } from "@/src/server/repositories/home-repository";

type FastApiActivity = Record<string, unknown>;

export async function findActivityRecords(filters: HomeDateRange): Promise<ActivityRecord[]> {
  const rows = await fetchActivities(filters);
  return rows.map(mapFastApiActivity);
}

export async function findEquipmentCards(filters: HomeDateRange): Promise<EquipmentCard[]> {
  const activities = await findActivityRecords(filters);
  const categories = new Map<string, Pick<ActivityRecord, "categoryId" | "category">>();
  activities.forEach((activity) => {
    const key = activity.categoryId === null ? `name:${activity.category}` : `id:${activity.categoryId}`;
    categories.set(key, activity);
  });

  return [...categories.values()].map(({ categoryId, category }) => {
    const categoryActivities = activities.filter((activity) =>
      categoryId === null ? activity.categoryId === null && activity.category === category : activity.categoryId === categoryId,
    );
    const Planned = categoryActivities.filter((activity) => activity.status === "Programada").length;
    const InProgress = categoryActivities.filter((activity) => activity.status === "Em andamento").length;
    const Completed = categoryActivities.filter((activity) => activity.status === "Concluída").length;
    return { title: category, ...getActivityCategoryStyle(categoryId), Planned, InProgress, Completed, total: categoryActivities.length };
  });
}

export async function findCategoryColorMap(): Promise<Record<string, string>> {
  return Object.fromEntries([
    ...Object.entries(activityCategoryStylesById).map(([id, style]) => [id, style.color]),
    ["default", defaultActivityCategoryStyle.color],
  ]);
}

export async function findMapImage(): Promise<MapImage> {
  return {
    src: process.env.FACILITIES_MAP_SRC ?? facilitiesMap.src,
    width: Number(process.env.FACILITIES_MAP_WIDTH ?? facilitiesMap.width),
    height: Number(process.env.FACILITIES_MAP_HEIGHT ?? facilitiesMap.height),
    alt: "Mapa AIS com posições atuais das atividades de facilities",
  };
}

export async function findHandlingTimeSamplesInMinutes(filters: HomeDateRange): Promise<number[]> {
  const rows = await fetchActivities(
    { startDate: filters.startDate, endDate: filters.endDate },
    "finished",
  );
  const samples = rows.map((row) => {
    const startedAt = readString(row, "started_date", "started_at");
    const finishedAt = readString(row, "finished_date", "finished_at");
    if (!startedAt || !finishedAt) return 0;
    return (new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 60_000;
  }).filter((minutes) => Number.isFinite(minutes) && minutes > 0);
  return samples.length ? samples : [0];
}

async function fetchActivities(filters: HomeDateRange, dateField?: "finished"): Promise<FastApiActivity[]> {
  const path = getFastApiPath("FASTAPI_ACTIVITIES_PATH", "/activities");
  const params = new URLSearchParams({
    start_date: filters.startDate,
    end_date: filters.endDate,
  });

  if (dateField) params.set("date_field", dateField);

  filters.statuses?.forEach((status) => params.append("status", status));
  filters.businessUnits?.forEach((unit) => params.append("business_unit", String(unit)));

  const response = await requestFastApi<FastApiActivity[] | { items: FastApiActivity[] }>(
    `${path}?${params.toString()}`,
  );
  const rows = Array.isArray(response) ? response : response.items;

  return rows;
}

function mapFastApiActivity(row: FastApiActivity): ActivityRecord {
  const status = normalizeStatus(readString(row, "status", "Status", "status_description"));
  const statusDate = selectStatusDate(row, status);

  return {
    id: readString(row, "id", "numero", "Numero") ?? "Não informado",
    activityType: normalizeActivityType(readString(row, "request_type", "tipo_de_solicitacao", "Tipo_de_solicitacao")),
    businessUnit: readString(row, "business_unit", "unidade_de_negocio", "Unidade_de_negocio") ?? "Não informado",
    categoryId: readNumber(row, "service_category_id", "category_id", "categoria_id") ?? null,
    category: readString(row, "service_category_name", "category", "categoria", "Categoria") ?? "Não informado",
    serviceType: readString(row, "service", "servico", "Servico") ?? "Não informado",
    location: readString(row, "location", "localizacao", "Localizacao") ?? "Não informado",
    status,
    statusDate: formatDateTime(statusDate),
    plannedAt: formatDateTime(statusDate),
    mapPosition: {
      x: readNumber(row, "map_x", "location_x") ?? 50,
      y: readNumber(row, "map_y", "location_y") ?? 50,
    },
  };
}

function selectStatusDate(row: FastApiActivity, status: ActivityStatus) {
  const keys: Record<ActivityStatus, string[]> = {
    Programada: ["agreed_date", "data_programada", "Data_Programada"],
    "Em andamento": ["started_date", "data_de_inicio", "Data_de_inicio"],
    Concluída: ["finished_date", "data_de_encerramento", "Data_de_encerramento"],
    Cancelada: ["canceled_date", "data_de_cancelamento", "Data_de_cancelamento"],
  };

  return readString(row, ...keys[status]);
}

function readString(row: FastApiActivity, ...keys: string[]) {
  const value = keys.map((key) => row[key]).find((item) => item !== undefined && item !== null);
  return value === undefined ? undefined : String(value);
}

function readNumber(row: FastApiActivity, ...keys: string[]) {
  const value = Number(readString(row, ...keys));
  return Number.isFinite(value) ? value : undefined;
}

function normalizeStatus(value?: string): ActivityStatus {
  const normalized = value?.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return activityStatuses.find((status) => status.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalized) ?? "Programada";
}

function normalizeActivityType(value?: string): ActivityType {
  return value === "Atividade no Pátio" ? value : "Chamado";
}

function formatDateTime(value?: string) {
  if (!value) return "Não informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}
