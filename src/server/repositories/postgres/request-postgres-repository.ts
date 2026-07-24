import "server-only";

import type { RequestEntity, RequestStatus } from "@/src/domain/entities/request";
import { getPostgresPool } from "@/src/server/db/postgres";

type RequestRow = {
  id: string | number;
  title: string | null;
  status: RequestStatus;
  has_unread_message: boolean;
  created_at: Date | string | null;
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

export async function findRequestsByCurrentUser(): Promise<RequestEntity[]> {
  const pool = await getPostgresPool();
  const requesterMemberId = process.env.CURRENT_MEMBER_ID ? Number(process.env.CURRENT_MEMBER_ID) : null;
  const result = await pool.query<RequestRow>(
    `SELECT
        r.id,
        COALESCE(st.name, rt.name, 'Solicitação') AS title,
        CASE
          WHEN rs.description IN ('Concluída', 'Cancelada') THEN 'Fechado'
          ELSE 'Aberto'
        END AS status,
        FALSE AS has_unread_message,
        r.created_date AS created_at
       FROM request r
       INNER JOIN request_status rs ON rs.id = r.id_request_status
       INNER JOIN request_type rt ON rt.id = r.id_request_type
       INNER JOIN service_type st ON st.id = r.id_service_type
      WHERE ($1::integer IS NULL OR r.id_member_requester = $1)
      ORDER BY r.created_date DESC NULLS LAST, r.id DESC`,
    [requesterMemberId],
  );

  return result.rows.map(mapRequestRowToEntity);
}

function mapRequestRowToEntity(row: RequestRow): RequestEntity {
  return {
    id: Number(row.id),
    title: row.title ?? "Solicitação",
    status: row.status,
    createdAt: formatDateTime(row.created_at),
    hasUnreadMessage: row.has_unread_message,
  };
}

function formatDateTime(value: Date | string | null) {
  if (!value) {
    return "Data não informada";
  }

  return dateTimeFormatter.format(new Date(value)).replace(",", "");
}
