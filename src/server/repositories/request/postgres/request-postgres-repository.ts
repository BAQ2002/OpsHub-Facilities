import "server-only";

import type { RequestEntity, RequestStatus } from "@/src/domain/entities/request";
import { getPostgresPool, type PgClient } from "@/src/server/db/postgres";
import type { CreateRequestInput, RequestFieldValue, RequestRepository } from "@/src/server/repositories/request/request-repository";

type ServiceFieldDefinition = {
  id: number;
  type: string;
  options: unknown;
  required: boolean | null;
};

type MediaFile = {
  fieldId: number;
  content: Buffer;
  fileName: string;
  mimeType: string;
  fileSize: number;
};

const REQUEST_TYPE_ID = 1;
const REQUESTER_MEMBER_ID = 8;
const OPEN_REQUEST_STATUS_ID = 1;
const MAX_MEDIA_FILES_PER_FIELD = 5;
const MAX_MEDIA_FILE_SIZE = 10 * 1024 * 1024;
const MAX_MEDIA_TOTAL_SIZE = 25 * 1024 * 1024;

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

export const postgresRequestRepository: RequestRepository = {
  findByCurrentUser: findRequestsByCurrentUser,
  create: insertActivityRequest,
};

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém requests by current user para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona {@link getPostgresPool}, {@link query}, {@link map}.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
async function findRequestsByCurrentUser(): Promise<RequestEntity[]> {
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

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Map request row to entity para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link formatDateTime}.
 *
 * @param row Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function mapRequestRowToEntity(row: RequestRow): RequestEntity {
  return {
    id: Number(row.id),
    title: row.title ?? "Solicitação",
    status: row.status,
    createdAt: formatDateTime(row.created_at),
    hasUnreadMessage: row.has_unread_message,
  };
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Format date time para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link replace}, {@link format}.
 *
 * @param value Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function formatDateTime(value: Date | string | null) {
  if (!value) return "Data não informada";
  return dateTimeFormatter.format(new Date(value)).replace(",", "");
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Executa a operação de insert activity request e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link validateRequestInput}, {@link getPostgresPool}, {@link connect}, {@link query} e outras rotinas auxiliares.
 *
 * @param input Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function insertActivityRequest(input: CreateRequestInput) {
  validateRequestInput(input);
  const pool = await getPostgresPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await validateLocationHierarchy(client, input);
    const fieldDefinitions = await getFieldDefinitions(client, input.serviceTypeId);
    const values = fieldDefinitions
      .filter((field) => field.type.toUpperCase() !== "MEDIA")
      .flatMap((field) => parseFieldValue(field, input.additionalFields));
    const mediaFiles = await parseMediaFiles(fieldDefinitions, input.additionalFields);
    await synchronizeRequestIdSequence(client);

    const requestResult = await client.query<{ id: number }>(
      `INSERT INTO request (
         id_request_type,
         id_member_requester,
         id_location,
         id_service_type,
         id_request_status,
         created_date,
         description
       ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
       RETURNING id`,
      [
        REQUEST_TYPE_ID,
        REQUESTER_MEMBER_ID,
        input.locationId,
        input.serviceTypeId,
        OPEN_REQUEST_STATUS_ID,
        input.description,
      ],
    );
    const requestId = requestResult.rows[0]?.id;

    if (!requestId) {
      throw new Error("Não foi possível obter o ID da solicitação criada.");
    }

    for (const field of values) {
      await client.query(
        `INSERT INTO service_field_value (id_service_field_type, id_request, value)
         VALUES ($1, $2, $3::jsonb)`,
        [field.fieldId, requestId, JSON.stringify(field.value)],
      );
    }

    for (const media of mediaFiles) {
      await client.query(
        `INSERT INTO service_field_media (
           id_service_field_type,
           id_request,
           content,
           file_name,
           mime_type,
           file_size
         ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [media.fieldId, requestId, media.content, media.fileName, media.mimeType, media.fileSize],
      );
    }

    await client.query("COMMIT");
    return requestId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Parse media files para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link filter}, {@link toUpperCase}, {@link getAll}, {@link parseMediaOptions} e outras rotinas auxiliares.
 *
 * @param fieldDefinitions Dados necessários para executar esta função.
 * @param additionalFields Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
async function parseMediaFiles(
  fieldDefinitions: ServiceFieldDefinition[],
  additionalFields: CreateRequestInput["additionalFields"],
): Promise<MediaFile[]> {
  const mediaFiles: MediaFile[] = [];
  let totalSize = 0;

  for (const field of fieldDefinitions.filter((definition) => definition.type.toUpperCase() === "MEDIA")) {
    const fieldName = `service_field_${field.id}`;
    const entries = getAll(additionalFields, fieldName);
    const files = entries.filter((entry): entry is File => typeof entry !== "string" && entry.size > 0);
    const options = parseMediaOptions(field.options);

    if (entries.some((entry) => typeof entry === "string" && entry.length > 0)) {
      throw new Error(`O campo de anexo ${field.id} contém um valor inválido.`);
    }
    if (field.required && files.length === 0) {
      throw new Error(`O campo de anexo ${field.id} é obrigatório.`);
    }
    if (!options.multiple && files.length > 1) {
      throw new Error(`O campo de anexo ${field.id} aceita apenas um arquivo.`);
    }
    if (files.length > MAX_MEDIA_FILES_PER_FIELD) {
      throw new Error(`O campo de anexo ${field.id} aceita no máximo ${MAX_MEDIA_FILES_PER_FIELD} arquivos.`);
    }

    for (const file of files) {
      validateMediaFile(field.id, file, options.accept);
      totalSize += file.size;
      if (totalSize > MAX_MEDIA_TOTAL_SIZE) {
        throw new Error("Os anexos da solicitação excedem o limite total de 25 MB.");
      }

      mediaFiles.push({
        fieldId: field.id,
        content: Buffer.from(await file.arrayBuffer()),
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });
    }
  }

  return mediaFiles;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Executa a operação de validate media file e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link matchesAcceptedType}.
 *
 * @param fieldId Dados necessários para executar esta função.
 * @param file Dados necessários para executar esta função.
 * @param acceptedTypes Dados necessários para executar esta função.
 * @returns Não retorna valor.
 */
function validateMediaFile(fieldId: number, file: File, acceptedTypes: string[]) {
  if (!file.name || file.name.length > 255) {
    throw new Error(`Um arquivo do campo ${fieldId} possui nome inválido.`);
  }
  if (!file.type || file.type.length > 100 || !matchesAcceptedType(file.type, acceptedTypes)) {
    throw new Error(`O arquivo ${file.name} possui um tipo não permitido.`);
  }
  if (file.size > MAX_MEDIA_FILE_SIZE) {
    throw new Error(`O arquivo ${file.name} excede o limite de 10 MB.`);
  }
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Executa matches accepted type no fluxo atual.
 * Durante o fluxo, aciona {@link some}, {@link toLowerCase}, {@link trim}, {@link endsWith} e outras rotinas auxiliares.
 *
 * @param mimeType Dados necessários para executar esta função.
 * @param acceptedTypes Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function matchesAcceptedType(mimeType: string, acceptedTypes: string[]) {
  if (acceptedTypes.length === 0) return false;
  return acceptedTypes.some((acceptedType) => {
    const normalizedType = acceptedType.trim().toLowerCase();
    if (normalizedType.endsWith("/*")) return mimeType.toLowerCase().startsWith(normalizedType.slice(0, -1));
    return mimeType.toLowerCase() === normalizedType;
  });
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Parse media options para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link parseJson}, {@link isArray}, {@link map}.
 *
 * @param options Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function parseMediaOptions(options: unknown): { accept: string[]; multiple: boolean } {
  const parsedOptions = typeof options === "string" ? parseJson(options) : options;
  if (!parsedOptions || typeof parsedOptions !== "object" || Array.isArray(parsedOptions)) {
    return { accept: [], multiple: false };
  }

  const config = parsedOptions as { accept?: unknown; multiple?: unknown };
  return {
    accept: Array.isArray(config.accept) ? config.accept.map(String) : [],
    multiple: config.multiple === true,
  };
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Parse json para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link parse}.
 *
 * @param value Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Executa a operação de synchronize request id sequence e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link query}.
 *
 * @param client Dados necessários para executar esta função.
 * @returns Não retorna valor.
 */
async function synchronizeRequestIdSequence(client: PgClient) {
  // The legacy import populates REQUEST.ID explicitly, which does not advance the
  // identity sequence. Locking prevents two request creations from repairing and
  // consuming the same sequence value concurrently.
  await client.query("LOCK TABLE request IN SHARE ROW EXCLUSIVE MODE");
  await client.query(
    `SELECT setval(
       pg_get_serial_sequence('request', 'id'),
       COALESCE(MAX(id), 1),
       MAX(id) IS NOT NULL
     )
       FROM request`,
  );
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Executa a operação de validate request input e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link isInteger}.
 *
 * @param input Dados necessários para executar esta função.
 * @returns Não retorna valor.
 */
function validateRequestInput(input: CreateRequestInput) {
  if (!input.description || input.description.length > 300) {
    throw new Error("A descrição deve possuir entre 1 e 300 caracteres.");
  }
  for (const [name, value] of [
    ["business_id", input.businessId],
    ["region_id", input.regionId],
    ["location_id", input.locationId],
    ["service_type_id", input.serviceTypeId],
  ] as const) {
    if (!Number.isInteger(value) || value <= 0) throw new Error(`O campo ${name} é inválido.`);
  }
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Executa a operação de validate location hierarchy e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link query}.
 *
 * @param client Dados necessários para executar esta função.
 * @param input Dados necessários para executar esta função.
 * @returns Não retorna valor.
 */
async function validateLocationHierarchy(client: PgClient, input: CreateRequestInput) {
  const result = await client.query<{ valid: boolean }>(
    `SELECT TRUE AS valid
       FROM business b
       INNER JOIN region r ON r.id_business = b.id
       INNER JOIN location l ON l.id_region = r.id
      WHERE b.id = $1 AND r.id = $2 AND l.id = $3`,
    [input.businessId, input.regionId, input.locationId],
  );

  if (!result.rows[0]?.valid) {
    throw new Error("A unidade de negócio, a região e a localização selecionadas não são compatíveis.");
  }
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém field definitions para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona {@link query}.
 *
 * @param client Dados necessários para executar esta função.
 * @param serviceTypeId Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
async function getFieldDefinitions(client: PgClient, serviceTypeId: number) {
  const serviceType = await client.query<{ id: number }>(
    `SELECT id FROM service_type WHERE id = $1`,
    [serviceTypeId],
  );

  if (!serviceType.rows[0]) {
    throw new Error("O tipo de serviço selecionado não existe.");
  }

  const result = await client.query<ServiceFieldDefinition>(
    `SELECT id, type, options, required
       FROM service_field_type
      WHERE id_service_type = $1 AND active IS TRUE
      ORDER BY display_order NULLS LAST, id`,
    [serviceTypeId],
  );

  return result.rows;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Parse field value para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link getAll}, {@link some}, {@link filter}, {@link toUpperCase} e outras rotinas auxiliares.
 *
 * @param field Dados necessários para executar esta função.
 * @param additionalFields Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function parseFieldValue(field: ServiceFieldDefinition, additionalFields: CreateRequestInput["additionalFields"]) {
  const name = `service_field_${field.id}`;
  const entries = getAll(additionalFields, name);
  if (entries.some((entry) => typeof entry !== "string")) {
    throw new Error(`O campo adicional ${field.id} não aceita arquivos.`);
  }
  const rawValues = entries.filter((value): value is string => typeof value === "string");
  const type = field.type.toUpperCase();
  let value: string | number | boolean | string[] | undefined;

  if (type === "MULTI_SELECT") {
    const selected = [...new Set(rawValues.filter(Boolean))];
    value = selected.length > 0 ? selected : undefined;
  } else if (type === "BOOL") {
    value = rawValues.includes("true");
  } else {
    const rawValue = rawValues.at(-1)?.trim();
    if (rawValue) value = type === "NUMBER" ? parseNumber(rawValue, name) : rawValue;
  }

  if (field.required && (value === undefined || value === false || (Array.isArray(value) && value.length === 0))) {
    throw new Error(`O campo adicional ${field.id} é obrigatório.`);
  }

  if (value === undefined) return [];

  validateFieldValue(field, value);
  return [{ fieldId: field.id, value }];
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Executa a operação de validate field value e preserva as validações do domínio.
 * Durante o fluxo, aciona {@link toUpperCase}, {@link parseOptions}, {@link test}, {@link isArray} e outras rotinas auxiliares.
 *
 * @param field Dados necessários para executar esta função.
 * @param value Dados necessários para executar esta função.
 * @returns Não retorna valor.
 */
function validateFieldValue(field: ServiceFieldDefinition, value: string | number | boolean | string[]) {
  const type = field.type.toUpperCase();
  const options = parseOptions(field.options);

  if (type === "DATE" && (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))) {
    throw new Error(`O campo adicional ${field.id} deve conter uma data válida.`);
  }

  if ((type === "SINGLE_SELECT" || type === "MULTI_SELECT") && options.length > 0) {
    const selected = Array.isArray(value) ? value : [String(value)];
    if (selected.some((item) => !options.includes(item))) {
      throw new Error(`O campo adicional ${field.id} contém uma opção inválida.`);
    }
  }
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Parse options para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link isArray}, {@link map}, {@link parse}.
 *
 * @param options Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function parseOptions(options: unknown): string[] {
  if (Array.isArray(options)) return options.map(String);
  if (typeof options !== "string") return [];

  try {
    const parsed = JSON.parse(options);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Parse number para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona {@link isFinite}.
 *
 * @param value Dados necessários para executar esta função.
 * @param fieldName Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function parseNumber(value: string, fieldName: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`O campo ${fieldName} deve conter um número válido.`);
  return parsed;
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém all para uso pelo fluxo solicitante.
 *
 * @param fields Dados necessários para executar esta função.
 * @param name Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function getAll(fields: CreateRequestInput["additionalFields"], name: string): RequestFieldValue[] {
  return fields[name] ?? [];
}
