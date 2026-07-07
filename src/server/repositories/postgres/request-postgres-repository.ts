import "server-only";

import type { RequestEntity, RequestStatus } from "@/src/domain/entities/request";
import { getPostgresPool } from "@/src/server/db/postgres";

type RequestRow = {
  id: string | number;
  title: string;
  status: RequestStatus;
  has_unread_message: boolean;
  created_at: Date | string;
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
  const result = await pool.query<RequestRow>(
    `SELECT id, title, status, has_unread_message, created_at
       FROM activity_requests
      ORDER BY created_at DESC, id DESC`,
  );

  return result.rows.map(mapRequestRowToEntity);
}

function mapRequestRowToEntity(row: RequestRow): RequestEntity {
  return {
    id: Number(row.id),
    title: row.title,
    status: row.status,
    createdAt: formatDateTime(row.created_at),
    hasUnreadMessage: row.has_unread_message,
  };
}

function formatDateTime(value: Date | string) {
  return dateTimeFormatter.format(new Date(value)).replace(",", "");
}
