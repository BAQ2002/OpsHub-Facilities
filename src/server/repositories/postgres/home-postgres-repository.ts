import "server-only";

import facilitiesMap from "@/public_resources/facilities-map.png";
import type { ActivityRecord, ActivityStatus, ActivityType, EquipmentCard, MapImage } from "@/src/domain/entities/activity";
import { activityCategoryStylesById, defaultActivityCategoryStyle, getActivityCategoryStyle } from "@/src/domain/entities/activity";
import type { HomeDateRange } from "@/src/server/repositories/home-repository";
import { getPostgresPool } from "@/src/server/db/postgres";

const trackedStatusDescriptions = ["Concluída", "Concluida", "Programada", "Em andamento", "Em aberto"] as const;

type CategoryCountRow = {
  category_id: string | number;
  category_name: string | null;
  planned: string | number;
  in_progress: string | number;
  completed: string | number;
};

type ActivityRecordRow = {
  id: string | number;
  request_type_name: string | null;
  business_name: string | null;
  service_category_id: string | number | null;
  service_category_name: string | null;
  service_type_name: string | null;
  location_name: string | null;
  status_description: string;
  status_date: Date | string | null;
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
        sc.id AS category_id,
        sc.name AS category_name,
        COUNT(r.id) FILTER (
          WHERE r.id_request_status = 2
            AND r.agreed_date >= $1::date
            AND r.agreed_date < ($2::date + INTERVAL '1 day')
        ) AS planned,
        COUNT(r.id) FILTER (
          WHERE r.id_request_status = 3
            AND r.started_date >= $1::date
            AND r.started_date < ($2::date + INTERVAL '1 day')
        ) AS in_progress,
        COUNT(r.id) FILTER (
          WHERE r.id_request_status = 4
            AND r.finished_date >= $1::date
            AND r.finished_date < ($2::date + INTERVAL '1 day')
        ) AS completed
       FROM service_category sc
       INNER JOIN service_type st ON st.id_service_category = sc.id
       LEFT JOIN request r ON r.id_service_type = st.id
      GROUP BY sc.id, sc.name
      ORDER BY sc.name`,
    [dateRange.startDate, dateRange.endDate],
  );

  return result.rows.map(mapCategoryCountRowToEquipmentCard);
}

export async function findActivityRecords(dateRange: HomeDateRange): Promise<ActivityRecord[]> {
  const pool = await getPostgresPool();
  const selectedStatuses = dateRange.statuses?.length
    ? dateRange.statuses
    : ["Programada", "Em andamento", "Concluída", "Cancelada"];
  const databaseStatuses = selectedStatuses.flatMap((status) =>
    status === "Concluída" ? [status, "Concluida"] : [status],
  );
  const result = await pool.query<ActivityRecordRow>(
    `SELECT
        r.id,
        rt.name AS request_type_name,
        b.name AS business_name,
        sc.id AS service_category_id,
        sc.name AS service_category_name,
        st.name AS service_type_name,
        l.name AS location_name,
        rs.description AS status_description,
        CASE
          WHEN rs.description = 'Programada' THEN r.agreed_date
          WHEN rs.description = 'Em andamento' THEN r.started_date
          WHEN rs.description IN ('Concluída', 'Concluida') THEN r.finished_date
          WHEN rs.description = 'Cancelada' THEN r.canceled_date
        END AS status_date,
        r.agreed_date,
        r.description,
        l.location_x AS map_x,
        l.location_y AS map_y
       FROM request r
       INNER JOIN request_status rs ON rs.id = r.id_request_status
       LEFT JOIN request_type rt ON rt.id = r.id_request_type
       LEFT JOIN service_type st ON st.id = r.id_service_type
       LEFT JOIN service_category sc ON sc.id = st.id_service_category
       LEFT JOIN location l ON l.id = r.id_location
       LEFT JOIN region rg ON rg.id = l.id_region
       LEFT JOIN business b ON b.id = rg.id_business
      WHERE rs.description = ANY($1)
        AND CASE
          WHEN rs.description = 'Programada' THEN r.agreed_date
          WHEN rs.description = 'Em andamento' THEN r.started_date
          WHEN rs.description IN ('Concluída', 'Concluida') THEN r.finished_date
          WHEN rs.description = 'Cancelada' THEN r.canceled_date
        END >= $2::date
        AND CASE
          WHEN rs.description = 'Programada' THEN r.agreed_date
          WHEN rs.description = 'Em andamento' THEN r.started_date
          WHEN rs.description IN ('Concluída', 'Concluida') THEN r.finished_date
          WHEN rs.description = 'Cancelada' THEN r.canceled_date
        END < ($3::date + INTERVAL '1 day')
        AND (COALESCE(array_length($4::integer[], 1), 0) = 0 OR b.id = ANY($4::integer[]))
      ORDER BY status_date ASC, r.id ASC`,
    [databaseStatuses, dateRange.startDate, dateRange.endDate, dateRange.businessUnits ?? []],
  );

  return result.rows.map(mapActivityRecordRowToEntity);
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

export async function findSlaSamplesInMinutes(dateRange: HomeDateRange): Promise<number[]> {
  const pool = await getPostgresPool();
  const result = await pool.query<SlaSampleRow>(
    `SELECT EXTRACT(EPOCH FROM (COALESCE(r.finished_date, NOW()) - r.created_date)) / 60 AS minutes
       FROM request r
       INNER JOIN request_status rs ON rs.id = r.id_request_status
      WHERE rs.description = ANY($1)
        AND r.agreed_date >= $2::date
        AND r.agreed_date < ($3::date + INTERVAL '1 day')
        AND r.created_date IS NOT NULL`,
    [trackedStatusDescriptions, dateRange.startDate, dateRange.endDate],
  );

  const samples = result.rows
    .map((row) => Number(row.minutes ?? 0))
    .filter((minutes) => Number.isFinite(minutes) && minutes > 0);

  return samples.length > 0 ? samples : [0];
}

function mapCategoryCountRowToEquipmentCard(row: CategoryCountRow): EquipmentCard {
  const categoryId = Number(row.category_id);
  const style = getActivityCategoryStyle(Number.isFinite(categoryId) ? categoryId : null);
  const Planned = Number(row.planned);
  const InProgress = Number(row.in_progress);
  const Completed = Number(row.completed);

  return {
    title: row.category_name ?? "Não informado",
    accent: style.accent,
    iconBg: style.iconBg,
    Planned,
    InProgress,
    Completed,
    total: Planned + InProgress + Completed,
  };
}

function mapActivityRecordRowToEntity(row: ActivityRecordRow): ActivityRecord {
  const status = normalizeActivityStatus(row.status_description);
  return {
    id: String(row.id),
    activityType: normalizeActivityType(row.request_type_name),
    businessUnit: row.business_name ?? "Não informado",
    categoryId: toNullableNumber(row.service_category_id),
    category: row.service_category_name ?? "Não informado",
    serviceType: row.service_type_name ?? "Não informado",
    location: row.location_name ?? "Não informado",
    status,
    statusDate: formatDateTime(row.status_date),
    plannedAt: formatDateTime(row.status_date),
    description: row.description ?? "Sem descrição",
    mapPosition: {
      x: Number(row.map_x ?? 50),
      y: Number(row.map_y ?? 50),
    },
  };
}

function normalizeActivityStatus(value: string): ActivityStatus {
  if (value === "Em andamento" || value === "Cancelada" || value === "Programada") return value;
  return "Concluída";
}

function toNullableNumber(value: string | number | null): number | null {
  if (value === null) return null;
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
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
