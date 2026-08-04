import "server-only";

import type { RequestBoardData, RequestBoardItem, RequestBoardStatus } from "@/src/domain/entities/request-board";
import { getPostgresPool } from "@/src/server/db/postgres";

type RequestBoardRow = {
  id: string | number;
  status_id: string | number;
  requester_name: string | null;
  location_name: string | null;
  service_type_name: string | null;
  business_name: string | null;
  region_name: string | null;
  description: string | null;
  created_date: Date | string | null;
};

type FieldValueRow = {
  request_id: string | number;
  field_id: string | number;
  field_name: string | null;
  value: unknown;
};

type MediaRow = {
  id: string | number;
  request_id: string | number;
  field_name: string | null;
  file_name: string | null;
  mime_type: string;
  file_size: string | number | null;
};

type RequestStatusRow = {
  id: string | number;
  description: string | null;
};

export async function findRequestBoardData(): Promise<RequestBoardData> {
  const pool = await getPostgresPool();
  const [statusResult, requestResult, fieldResult, mediaResult] = await Promise.all([
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
          location.name AS location_name,
          service_type.name AS service_type_name,
          business.name AS business_name,
          region.name AS region_name,
          r.description,
          r.created_date
         FROM request r
         LEFT JOIN membership requester ON requester.id = r.id_member_requester
         LEFT JOIN location ON location.id = r.id_location
         LEFT JOIN region ON region.id = location.id_region
         LEFT JOIN business ON business.id = region.id_business
         LEFT JOIN service_type ON service_type.id = r.id_service_type
        ORDER BY r.id`,
    ),
    pool.query<FieldValueRow>(
      `SELECT
          value.id_request AS request_id,
          field.id AS field_id,
          field.name AS field_name,
          value.value
         FROM service_field_value value
         INNER JOIN service_field_type field ON field.id = value.id_service_field_type
        ORDER BY value.id_request, field.display_order NULLS LAST, field.id`,
    ),
    pool.query<MediaRow>(
      `SELECT
          media.id,
          media.id_request AS request_id,
          field.name AS field_name,
          media.file_name,
          media.mime_type,
          media.file_size
         FROM service_field_media media
         INNER JOIN service_field_type field ON field.id = media.id_service_field_type
        ORDER BY media.id_request, field.display_order NULLS LAST, media.id`,
    ),
  ]);

  const fieldValuesByRequest = groupByRequest(fieldResult.rows);
  const mediaByRequest = groupByRequest(mediaResult.rows);

  return {
    statuses: statusResult.rows.map(mapStatus),
    requests: requestResult.rows.map((row) =>
      mapRequest(row, fieldValuesByRequest.get(Number(row.id)) ?? [], mediaByRequest.get(Number(row.id)) ?? []),
    ),
  };
}

function mapStatus(row: RequestStatusRow): RequestBoardStatus {
  return {
    id: Number(row.id),
    description: row.description ?? "Status sem descrição",
  };
}

function mapRequest(row: RequestBoardRow, fieldValues: FieldValueRow[], media: MediaRow[]): RequestBoardItem {
  return {
    id: Number(row.id),
    statusId: Number(row.status_id),
    serviceTypeName: row.service_type_name ?? "Tipo de serviço não informado",
    requesterName: row.requester_name ?? "Solicitante não informado",
    locationName: row.location_name ?? "Local não informado",
    details: [
      { id: "business", label: "Unidade de Negócio", value: row.business_name ?? "Não informado" },
      { id: "region", label: "Região", value: row.region_name ?? "Não informado" },
      { id: "location", label: "Localização", value: row.location_name ?? "Não informado" },
      { id: "service-type", label: "Tipo de serviço", value: row.service_type_name ?? "Não informado" },
      { id: "requester", label: "Solicitante", value: row.requester_name ?? "Não informado" },
      { id: "created-at", label: "Data de abertura", value: formatDate(row.created_date) },
      { id: "description", label: "Descrição", value: row.description ?? "Não informado" },
      ...fieldValues.map((field) => ({
        id: `field-${field.field_id}`,
        label: field.field_name ?? "Campo adicional",
        value: formatFieldValue(field.value),
      })),
    ],
    media: media.map((item) => ({
      id: Number(item.id),
      fieldLabel: item.field_name ?? "Anexo",
      fileName: item.file_name ?? "Anexo sem nome",
      mimeType: item.mime_type,
      fileSize: item.file_size == null ? undefined : Number(item.file_size),
      url: `/api/request-media/${item.id}`,
    })),
  };
}

function formatFieldValue(value: unknown): string {
  if (value == null || value === "") return "Não informado";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatDate(value: Date | string | null): string {
  if (!value) return "Não informada";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function groupByRequest<T extends { request_id: string | number }>(rows: T[]): Map<number, T[]> {
  const grouped = new Map<number, T[]>();
  for (const row of rows) {
    const requestId = Number(row.request_id);
    grouped.set(requestId, [...(grouped.get(requestId) ?? []), row]);
  }
  return grouped;
}
