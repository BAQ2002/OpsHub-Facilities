import "server-only";

import type { ActivityCategory, ActivityRecord, ActivityType, EquipmentCard, MapImage } from "@/src/domain/entities/activity";
import { activityCategories } from "@/src/domain/entities/activity";
import type { HomeDateRange } from "@/src/server/repositories/home-repository";
import { getPostgresPool } from "@/src/server/db/postgres";

const trackedStatusNames = ["Concluída", "Programada", "Em andamento"] as const;

const categoryStyleMap: Record<ActivityCategory, Pick<EquipmentCard, "accent" | "iconBg"> & { color: string }> = {
  Artífice: { accent: "text-cyan-600", iconBg: "bg-cyan-50", color: "#0891b2" },
  Civil: { accent: "text-violet-500", iconBg: "bg-violet-50", color: "#8b5cf6" },
  "Copa e Café": { accent: "text-red-500", iconBg: "bg-red-50", color: "#ef4444" },
  Elétrica: { accent: "text-yellow-500", iconBg: "bg-yellow-50", color: "#eab308" },
  Hidráulica: { accent: "text-blue-500", iconBg: "bg-blue-50", color: "#3b82f6" },
  Jardinagem: { accent: "text-green-500", iconBg: "bg-green-50", color: "#22c55e" },
  Refrigeração: { accent: "text-orange-500", iconBg: "bg-orange-50", color: "#f97316" },
  Limpeza: { accent: "text-teal-500", iconBg: "bg-teal-50", color: "#14b8a6" },
};

type CategoryCountRow = {
  category_name: string;
  planned: string | number;
  in_progress: string | number;
  completed: string | number;
};

type ActivityRecordRow = {
  id: string | number;
  request_type_name: string | null;
  business_name: string | null;
  service_category_name: string | null;
  service_type_name: string | null;
  location_name: string | null;
  agreed_date: Date | string | null;
  description: string | null;
  map_x: string | number | null;
  map_y: string | number | null;
};

type SlaSampleRow = {
  minutes: string | number | null;
};

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Sao_Paulo",
});

export async function findEquipmentCards(dateRange: HomeDateRange): Promise<EquipmentCard[]> {
  const pool = await getPostgresPool();
  const result = await pool.query<CategoryCountRow>(
    `SELECT
        sc.name AS category_name,
        COUNT(*) FILTER (WHERE rs.name = 'Programada') AS planned,
        COUNT(*) FILTER (WHERE rs.name = 'Em andamento') AS in_progress,
        COUNT(*) FILTER (WHERE rs.name = 'Concluída') AS completed
       FROM request r
       INNER JOIN request_status rs ON rs.id = r.request_status_id
       INNER JOIN service_category sc ON sc.id = r.service_category_id
      WHERE rs.name = ANY($1)
        AND r.agreed_date >= $2::date
        AND r.agreed_date < ($3::date + INTERVAL '1 day')
      GROUP BY sc.name
      ORDER BY sc.name`,
    [trackedStatusNames, dateRange.startDate, dateRange.endDate],
  );

  return result.rows.map(mapCategoryCountRowToEquipmentCard);
}

export async function findActivityRecords(dateRange: HomeDateRange): Promise<ActivityRecord[]> {
  const pool = await getPostgresPool();
  const result = await pool.query<ActivityRecordRow>(
    `SELECT
        r.id,
        rt.name AS request_type_name,
        b.name AS business_name,
        sc.name AS service_category_name,
        st.name AS service_type_name,
        l.name AS location_name,
        r.agreed_date,
        r.description,
        COALESCE(r.map_x, l.map_x) AS map_x,
        COALESCE(r.map_y, l.map_y) AS map_y
       FROM request r
       INNER JOIN request_status rs ON rs.id = r.request_status_id
       LEFT JOIN business b ON b.id = r.business_id
       LEFT JOIN request_type rt ON rt.id = r.request_type_id
       LEFT JOIN service_category sc ON sc.id = r.service_category_id
       LEFT JOIN service_type st ON st.id = r.service_type_id
       LEFT JOIN location l ON l.id = r.location_id
      WHERE rs.name = ANY($1)
        AND r.agreed_date >= $2::date
        AND r.agreed_date < ($3::date + INTERVAL '1 day')
      ORDER BY r.agreed_date ASC, r.id ASC`,
    [trackedStatusNames, dateRange.startDate, dateRange.endDate],
  );

  return result.rows.map(mapActivityRecordRowToEntity);
}

export async function findCategoryColorMap(): Promise<Record<ActivityCategory, string>> {
  return Object.fromEntries(
    activityCategories.map((category) => [category, categoryStyleMap[category].color]),
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

export async function findSlaSamplesInMinutes(dateRange: HomeDateRange): Promise<number[]> {
  const pool = await getPostgresPool();
  const result = await pool.query<SlaSampleRow>(
    `SELECT EXTRACT(EPOCH FROM (COALESCE(r.finished_at, NOW()) - r.created_at)) / 60 AS minutes
       FROM request r
       INNER JOIN request_status rs ON rs.id = r.request_status_id
      WHERE rs.name = ANY($1)
        AND r.agreed_date >= $2::date
        AND r.agreed_date < ($3::date + INTERVAL '1 day')
        AND r.created_at IS NOT NULL`,
    [trackedStatusNames, dateRange.startDate, dateRange.endDate],
  );

  const samples = result.rows
    .map((row) => Number(row.minutes ?? 0))
    .filter((minutes) => Number.isFinite(minutes) && minutes > 0);

  return samples.length > 0 ? samples : [0];
}

function mapCategoryCountRowToEquipmentCard(row: CategoryCountRow): EquipmentCard {
  const category = normalizeActivityCategory(row.category_name);
  const style = categoryStyleMap[category];
  const Planned = Number(row.planned);
  const InProgress = Number(row.in_progress);
  const Completed = Number(row.completed);

  return {
    title: category,
    accent: style.accent,
    iconBg: style.iconBg,
    Planned,
    InProgress,
    Completed,
    total: Planned + InProgress + Completed,
  };
}

function mapActivityRecordRowToEntity(row: ActivityRecordRow): ActivityRecord {
  return {
    id: String(row.id),
    activityType: normalizeActivityType(row.request_type_name),
    businessUnit: row.business_name ?? "Não informado",
    category: normalizeActivityCategory(row.service_category_name),
    serviceType: row.service_type_name ?? "Não informado",
    location: row.location_name ?? "Não informado",
    plannedAt: formatDateTime(row.agreed_date),
    description: row.description ?? "Sem descrição",
    mapPosition: {
      x: Number(row.map_x ?? 50),
      y: Number(row.map_y ?? 50),
    },
  };
}

function normalizeActivityCategory(value: string | null): ActivityCategory {
  const category = activityCategories.find((item) => item.toLowerCase() === value?.toLowerCase());

  return category ?? "Artífice";
}

function normalizeActivityType(value: string | null): ActivityType {
  return value === "Atividade no Pátio" ? "Atividade no Pátio" : "Chamado";
}

function formatDateTime(value: Date | string | null) {
  if (!value) {
    return "Não informado";
  }

  return dateTimeFormatter.format(new Date(value)).replace(",", "");
}
