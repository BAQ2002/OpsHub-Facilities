import "server-only";

import type { RequestBoardData, RequestBoardItem, RequestBoardStatus } from "@/src/domain/entities/request-board";
import { getPostgresPool } from "@/src/server/db/postgres";
import type { RequestBoardQuery } from "@/src/server/queries/request-board/request-board-query";

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

type VisitRow = {
  id: string | number;
  request_id: string | number;
  start_datetime: Date | string | null;
  stop_datetime: Date | string | null;
  description: string | null;
  executors: { id: number; name: string }[] | null;
  photos: { id: number; fileName: string; mimeType: string }[] | null;
  checklists: import("@/src/domain/entities/checklist").VisitChecklist[] | null;
};

export const postgresRequestBoardQuery: RequestBoardQuery = {
  findData: findRequestBoardData,
};

export async function findRequestBoardData(): Promise<RequestBoardData> {
  const pool = await getPostgresPool();
  const [statusResult, requestResult, fieldResult, mediaResult, visitResult] = await Promise.all([
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
    pool.query<VisitRow>(
      `SELECT task.id, task.id_request AS request_id, task.start_datetime, task.stop_datetime, task.description,
          COALESCE((SELECT json_agg(json_build_object('id', member.id, 'name', member.name) ORDER BY member.name)
            FROM task_member_occurrence occurrence
            JOIN membership member ON member.id = occurrence.id_membership
            WHERE occurrence.id_task = task.id), '[]'::json) AS executors,
          COALESCE((SELECT json_agg(json_build_object(
              'id', media.id,
              'fileName', media.file_name,
              'mimeType', media.mime_type
            ) ORDER BY media.id)
            FROM request_task_media media WHERE media.id_request_task = task.id), '[]'::json) AS photos
          ,COALESCE((SELECT json_agg(json_build_object(
              'id', task_checklist.id,
              'checklistTypeId', checklist.id,
              'name', checklist.name,
              'description', COALESCE(checklist.description, ''),
              'version', checklist.version,
              'corporation', task_checklist.corporation,
              'equipmentTag', task_checklist.equipment_tag,
              'equipmentBrand', task_checklist.equipment_brand,
              'equipmentModel', task_checklist.equipment_model,
              'rentedEquipment', task_checklist.rented_equipment,
              'serialNumber', task_checklist.serial_number,
              'ptNumber', task_checklist.pt_number,
              'values', COALESCE((SELECT json_agg(json_build_object(
                'id', field_value.id,
                'fieldId', field.id,
                'name', field.name,
                'type', field.type,
                'value', field_value.value
              ) ORDER BY field.display_order, field.id)
                FROM checklist_field_value field_value
                JOIN checklist_field_type field ON field.id = field_value.id_checklist_field_type
                WHERE field_value.id_request_task_checklist = task_checklist.id), '[]'::json)
            ) ORDER BY task_checklist.id)
            FROM request_task_checklist task_checklist
            JOIN checklist_type checklist ON checklist.id = task_checklist.id_checklist_type
            WHERE task_checklist.id_request_task = task.id), '[]'::json) AS checklists
         FROM request_task task
        ORDER BY id_request, start_datetime DESC NULLS LAST, id DESC`,
    ),
  ]);

  const fieldValuesByRequest = groupByRequest(fieldResult.rows);
  const mediaByRequest = groupByRequest(mediaResult.rows);
  const visitsByRequest = groupByRequest(visitResult.rows);

  return {
    statuses: statusResult.rows.map(mapStatus),
    requests: requestResult.rows.map((row) =>
      mapRequest(
        row,
        fieldValuesByRequest.get(Number(row.id)) ?? [],
        mediaByRequest.get(Number(row.id)) ?? [],
        visitsByRequest.get(Number(row.id)) ?? [],
      ),
    ),
  };
}

function mapStatus(row: RequestStatusRow): RequestBoardStatus {
  return {
    id: Number(row.id),
    description: row.description ?? "Status sem descrição",
  };
}

function mapRequest(row: RequestBoardRow, fieldValues: FieldValueRow[], media: MediaRow[], visits: VisitRow[]): RequestBoardItem {
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
    visits: visits.map((visit) => ({
      id: Number(visit.id),
      startDate: formatVisitDate(visit.start_datetime),
      endDate: formatVisitDate(visit.stop_datetime),
      startDatetime: formatVisitInputDate(visit.start_datetime),
      endDatetime: formatVisitInputDate(visit.stop_datetime),
      description: visit.description ?? "Não informada",
      executors: visit.executors ?? [],
      photos: (visit.photos ?? []).map((photo) => ({
        ...photo,
        fileName: photo.fileName ?? "Anexo sem nome",
        mimeType: photo.mimeType ?? "application/octet-stream",
        url: `/api/request-task-media/${photo.id}`,
      })),
      checklists: visit.checklists ?? [],
    })),
  };
}

function formatVisitInputDate(value: Date | string | null): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function formatVisitDate(value: Date | string | null): string {
  if (!value) return "dd/mm/yyyy";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "dd/mm/yyyy";
  return new Intl.DateTimeFormat("pt-BR").format(date);
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
