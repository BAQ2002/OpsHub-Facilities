import "server-only";

import type { RequestBoardData, RequestBoardItem, RequestBoardStatus } from "@/src/domain/entities/request-board";
import { getPostgresPool } from "@/src/server/db/postgres";

type RequestBoardRow = {
  id: string | number;
  service_type_name: string | null;
  status_id: string | number;
};

type RequestStatusRow = {
  id: string | number;
  description: string | null;
};

export async function findRequestBoardData(): Promise<RequestBoardData> {
  const pool = await getPostgresPool();
  const [statusResult, requestResult] = await Promise.all([
    pool.query<RequestStatusRow>(
      `SELECT id, description
         FROM request_status
        ORDER BY id`,
    ),
    pool.query<RequestBoardRow>(
      `SELECT
          r.id,
          r.id_request_status AS status_id,
          st.name AS service_type_name
         FROM request r
         INNER JOIN service_type st ON st.id = r.id_service_type
        ORDER BY r.id`,
    ),
  ]);

  return {
    statuses: statusResult.rows.map(mapStatus),
    requests: requestResult.rows.map(mapRequest),
  };
}

function mapStatus(row: RequestStatusRow): RequestBoardStatus {
  return {
    id: Number(row.id),
    description: row.description ?? "Status sem descrição",
  };
}

function mapRequest(row: RequestBoardRow): RequestBoardItem {
  return {
    id: Number(row.id),
    statusId: Number(row.status_id),
    serviceTypeName: row.service_type_name ?? "Serviço não informado",
  };
}
