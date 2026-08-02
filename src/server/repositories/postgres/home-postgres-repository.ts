import "server-only";

import facilitiesMap from "@/public_resources/facilities-map.png";
import type { ActivityCategory, ActivityRecord, ActivityStatus, ActivityType, EquipmentCard, MapImage } from "@/src/domain/entities/activity";
import { activityCategories, activityCategoryByServiceCategoryId } from "@/src/domain/entities/activity";
import type { HomeDateRange } from "@/src/server/repositories/home-repository";
import { getPostgresPool } from "@/src/server/db/postgres";

const trackedStatusDescriptions = ["Concluída", "Concluida", "Programada", "Em andamento", "Em aberto"] as const;

const categoryStyleMap: Record<ActivityCategory, Pick<EquipmentCard, "accent" | "iconBg"> & { color: string }> = {
  "ARTÍFICE": { accent: "text-cyan-600", iconBg: "bg-cyan-50", color: "#0891b2" },
  "CLIMATIZAÇÃO E REFRIGERAÇÃO": { accent: "text-orange-500", iconBg: "bg-orange-50", color: "#f97316" },
  "COPA": { accent: "text-red-500", iconBg: "bg-red-50", color: "#ef4444" },
  "INSTALAÇÕES ELÉTRICAS": { accent: "text-yellow-500", iconBg: "bg-yellow-50", color: "#eab308" },
  "INSTALAÇÕES HIDRÁULICAS": { accent: "text-blue-500", iconBg: "bg-blue-50", color: "#3b82f6" },
  "JARDINAGEM": { accent: "text-green-500", iconBg: "bg-green-50", color: "#22c55e" },
  "MANUTENÇÃO CIVIL": { accent: "text-violet-500", iconBg: "bg-violet-50", color: "#8b5cf6" },
  "NOVOS PROJETOS": { accent: "text-indigo-500", iconBg: "bg-indigo-50", color: "#6366f1" },
  "PINTURA DE SINALIZAÇÃO DE SEGURANÇA/OPERACIONAL/PREDIAL/METÁLICA": { accent: "text-rose-500", iconBg: "bg-rose-50", color: "#f43f5e" },
  "PMOC": { accent: "text-teal-500", iconBg: "bg-teal-50", color: "#14b8a6" },
};

type CategoryCountRow = {
  category_id: string | number;
  category_name: string;
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

export async function findCategoryColorMap(): Promise<Record<ActivityCategory, string>> {
  return Object.fromEntries(
    activityCategories.map((category) => [category, categoryStyleMap[category].color]),
  ) as Record<ActivityCategory, string>;
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
  const category = findActivityCategoryByServiceCategoryId(row.category_id, row.category_name);
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
  const status = normalizeActivityStatus(row.status_description);
  return {
    id: String(row.id),
    activityType: normalizeActivityType(row.request_type_name),
    businessUnit: row.business_name ?? "Não informado",
    category: findActivityCategoryByServiceCategoryId(row.service_category_id, row.service_category_name),
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

function findActivityCategoryByServiceCategoryId(
  serviceCategoryId: string | number | null,
  serviceCategoryName: string | null,
): ActivityCategory {
  const category = activityCategoryByServiceCategoryId[
    Number(serviceCategoryId) as keyof typeof activityCategoryByServiceCategoryId
  ];

  if (!category) {
    throw new Error(
      `ID de categoria de serviço desconhecido: ${serviceCategoryId ?? "não informado"} (${serviceCategoryName ?? "nome não informado"})`,
    );
  }

  return category;
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
