import "server-only";

import type { ActivityTrackingData, ActivityTrackingFilters, ChartItem } from "@/src/domain/entities/dashboard";
import { getPostgresPool } from "@/src/server/db/postgres";
import type { ActivityTrackingQuery } from "@/src/server/queries/activity-tracking/activity-tracking-query";

type CountRow = { label: string | null; value: string | number };
type SummaryRow = { total: string | number; in_progress: string | number; average_minutes: string | number | null; critical: string | number };
type MonthRow = { month_start: Date | string; open: string | number; closed: string | number };
type OptionRow = { id: string | number; name: string | null };

const categoryColors = ["#14b8a6", "#38bdf8", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"];
const statusColors = ["#f97316", "#0ea5e9", "#84cc16", "#8b5cf6", "#64748b"];
const closedStatuses = ["Concluída", "Concluida", "Cancelada"];
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" });

export const postgresActivityTrackingQuery: ActivityTrackingQuery = {
  findData: findActivityTrackingData,
};

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém activity tracking data para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona {@link getPostgresPool}, {@link all}, {@link query}, {@link mapChartRows} e outras rotinas auxiliares.
 *
 * @param filters Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function findActivityTrackingData(filters: ActivityTrackingFilters): Promise<ActivityTrackingData> {
  const pool = await getPostgresPool();
  const params = [filters.startDate, filters.endDate, filters.businessId ?? null, filters.serviceCategoryId ?? null];
  const joins = `FROM request r
    INNER JOIN request_status rs ON rs.id = r.id_request_status
    INNER JOIN service_type st ON st.id = r.id_service_type
    INNER JOIN service_category sc ON sc.id = st.id_service_category
    LEFT JOIN location l ON l.id = r.id_location
    LEFT JOIN region rg ON rg.id = l.id_region`;
  const where = `WHERE r.created_date >= $1::date AND r.created_date < ($2::date + INTERVAL '1 day')
    AND ($3::integer IS NULL OR rg.id_business = $3)
    AND ($4::integer IS NULL OR sc.id = $4)`;

  const [summary, categories, statuses, months, businesses, serviceCategories] = await Promise.all([
    pool.query<SummaryRow>(`SELECT COUNT(*) AS total,
      COUNT(*) FILTER (WHERE rs.description = 'Em andamento') AS in_progress,
      ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(r.finished_date, r.canceled_date, NOW()) - r.created_date)) / 60))::integer AS average_minutes,
      COUNT(*) FILTER (WHERE rs.description <> ALL($5::text[]) AND r.agreed_date IS NOT NULL AND r.agreed_date < NOW()) AS critical
      ${joins} ${where}`, [...params, closedStatuses]),
    pool.query<CountRow>(`SELECT sc.name AS label, COUNT(*) AS value ${joins} ${where} GROUP BY sc.id, sc.name ORDER BY value DESC, sc.name`, params),
    pool.query<CountRow>(`SELECT rs.description AS label, COUNT(*) AS value ${joins} ${where} GROUP BY rs.id, rs.description ORDER BY rs.id`, params),
    pool.query<MonthRow>(`SELECT date_trunc('month', r.created_date) AS month_start,
      COUNT(*) FILTER (WHERE rs.description <> ALL($5::text[])) AS open,
      COUNT(*) FILTER (WHERE rs.description = ANY($5::text[])) AS closed
      ${joins} ${where} GROUP BY month_start ORDER BY month_start`, [...params, closedStatuses]),
    pool.query<OptionRow>("SELECT id, name FROM business ORDER BY name"),
    pool.query<OptionRow>("SELECT id, name FROM service_category ORDER BY name"),
  ]);

  const totals = summary.rows[0] ?? { total: 0, in_progress: 0, average_minutes: null, critical: 0 };
  return {
    categoryData: mapChartRows(categories.rows, categoryColors),
    statusData: mapChartRows(statuses.rows, statusColors),
    monthlyData: months.rows.map((row) => ({
      month: capitalize(monthFormatter.format(new Date(row.month_start)).replace(".", "")),
      open: Number(row.open), closed: Number(row.closed),
    })),
    summaryCards: [
      { label: "Chamados no período", value: String(totals.total), detail: "Criados no intervalo selecionado", color: "text-teal-600", bg: "bg-teal-50" },
      { label: "Em atendimento", value: String(totals.in_progress), detail: "Equipes acionadas", color: "text-sky-600", bg: "bg-sky-50" },
      { label: "Tempo médio", value: formatMinutes(totals.average_minutes), detail: "Da abertura à finalização ou agora", color: "text-violet-600", bg: "bg-violet-50" },
      { label: "Pendentes críticos", value: String(totals.critical), detail: "Prazo acordado vencido", color: "text-orange-600", bg: "bg-orange-50" },
    ],
    filterOptions: {
      businesses: businesses.rows.map(mapOption),
      serviceCategories: serviceCategories.rows.map(mapOption),
    },
  };
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Map chart rows para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link map}.
 *
 * @param rows Dados necessários para executar esta função.
 * @param colors Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function mapChartRows(rows: CountRow[], colors: string[]): ChartItem[] {
  return rows.map((row, index) => ({ label: row.label ?? "Não informado", value: Number(row.value), color: colors[index % colors.length] }));
}
/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Map option para o formato esperado pelo fluxo.
 *
 * @param row Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function mapOption(row: OptionRow) { return { id: Number(row.id), name: row.name ?? "Não informado" }; }
/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Capitalize para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link toUpperCase}, {@link charAt}, {@link slice}.
 *
 * @param value Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Format minutes para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link max}, {@link round}, {@link floor}, {@link padStart}.
 *
 * @param value Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function formatMinutes(value: string | number | null) {
  const minutes = Math.max(0, Math.round(Number(value ?? 0)));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}min`;
}
