import "server-only";

import type { RequestBoardData, RequestBoardItem, RequestBoardStatus } from "@/src/domain/entities/request-board";
import { getPostgresPool } from "@/src/server/db/postgres";

type RequestBoardRow = {
  id: string | number;
  status_id: string | number;
  requester_name: string | null;
  location_name: string | null;
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
          requester.name AS requester_name,
          location.name AS location_name
         FROM request r
         LEFT JOIN membership requester ON requester.id = r.id_member_requester
         LEFT JOIN location ON location.id = r.id_location
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
    requesterName: row.requester_name ?? "Solicitante não informado",
    locationName: row.location_name ?? "Local não informado",
  };
}
