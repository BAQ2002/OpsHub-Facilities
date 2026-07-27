import "server-only";

import {
  activityCategories,
  activityStatuses,
  type ActivityCategory,
  type ActivityRecord,
  type ActivityStatus,
  type ActivityType,
} from "@/src/domain/entities/activity";
import { getFastApiPath, requestFastApi } from "@/src/server/api/fastapi";
import type { HomeDateRange } from "@/src/server/repositories/home-repository";

type FastApiActivity = Record<string, unknown>;

export async function findActivityRecords(filters: HomeDateRange): Promise<ActivityRecord[]> {
  const path = getFastApiPath("FASTAPI_ACTIVITIES_PATH", "/activities");
  const params = new URLSearchParams({
    start_date: filters.startDate,
    end_date: filters.endDate,
  });

  filters.statuses?.forEach((status) => params.append("status", status));
  filters.businessUnits?.forEach((unit) => params.append("business_unit", String(unit)));

  const response = await requestFastApi<FastApiActivity[] | { items: FastApiActivity[] }>(
    `${path}?${params.toString()}`,
  );
  const rows = Array.isArray(response) ? response : response.items;

  return rows.map(mapFastApiActivity);
}

function mapFastApiActivity(row: FastApiActivity): ActivityRecord {
  const status = normalizeStatus(readString(row, "status", "Status", "status_description"));
  const statusDate = selectStatusDate(row, status);
  const createdDate = readString(row, "created_date", "data_de_solicitacao", "Data_de_solicitacao");

  return {
    id: readString(row, "id", "numero", "Numero") ?? "Não informado",
    activityType: normalizeActivityType(readString(row, "request_type", "tipo_de_solicitacao", "Tipo_de_solicitacao")),
    businessUnit: readString(row, "business_unit", "unidade_de_negocio", "Unidade_de_negocio") ?? "Não informado",
    category: normalizeCategory(readString(row, "category", "categoria", "Categoria")),
    serviceType: readString(row, "service", "servico", "Servico") ?? "Não informado",
    location: readString(row, "location", "localizacao", "Localizacao") ?? "Não informado",
    status,
    statusDate: formatDateTime(statusDate),
    durationMinutes: calculateDurationMinutes(createdDate, statusDate),
    plannedAt: formatDateTime(statusDate),
    description: readString(row, "description", "descricao", "Descricao") ?? "Sem descrição",
    mapPosition: {
      x: readNumber(row, "map_x", "location_x") ?? 50,
      y: readNumber(row, "map_y", "location_y") ?? 50,
    },
  };
}

function calculateDurationMinutes(start?: string, end?: string) {
  if (!start || !end) return undefined;
  const duration = (new Date(end).getTime() - new Date(start).getTime()) / 60_000;
  return Number.isFinite(duration) && duration >= 0 ? duration : undefined;
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

function normalizeCategory(value?: string): ActivityCategory {
  return activityCategories.find((category) => category.toLocaleLowerCase("pt-BR") === value?.toLocaleLowerCase("pt-BR")) ?? "Artífice";
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
