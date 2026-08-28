import "server-only";

import type { ActivityRequestField, FormOption } from "@/src/domain/entities/activity-request-form";
import type {
  ActivityRequestFormData,
  ActivityRequestFormFilters,
  ServiceCatalogCategory,
  ServiceCatalogRepository,
} from "@/src/server/repositories/service-catalog/service-catalog-repository";
import { getPostgresPool } from "@/src/server/db/postgres";

type ServiceTypeRow = {
  id: number;
  name: string;
};

type ServiceCatalogRow = {
  service_category_id: number;
  service_category_name: string;
  service_type_id: number;
  service_type_name: string;
};

type ServiceFieldTypeRow = {
  id: number;
  service_category_name: string;
  service_type_name: string;
  name: string;
  type: string;
  options: unknown;
  required: boolean | null;
};

export const postgresServiceCatalogRepository: ServiceCatalogRepository = {
  findCatalog: getServiceCatalog,
  findRequestFormData: getActivityRequestFormData,
};

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém service catalog para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona `getPostgresPool`, `query`, `get`, `push` e outras rotinas auxiliares.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function getServiceCatalog(): Promise<ServiceCatalogCategory[]> {
  const pool = await getPostgresPool();
  const result = await pool.query<ServiceCatalogRow>(
    `SELECT
        sc.id AS service_category_id,
        sc.name AS service_category_name,
        st.id AS service_type_id,
        st.name AS service_type_name
       FROM service_category sc
       INNER JOIN service_type st ON st.id_service_category = sc.id
      WHERE sc.name IS NOT NULL
        AND st.name IS NOT NULL
      ORDER BY sc.name, sc.id, st.name, st.id`,
  );

  const categories = new Map<number, ServiceCatalogCategory>();

  for (const row of result.rows) {
    const category = categories.get(row.service_category_id);

    if (category) {
      category.serviceTypes.push({ id: row.service_type_id, name: row.service_type_name });
      continue;
    }

    categories.set(row.service_category_id, {
      id: row.service_category_id,
      name: row.service_category_name,
      serviceTypes: [{ id: row.service_type_id, name: row.service_type_name }],
    });
  }

  return [...categories.values()];
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém activity request form data para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona `getPostgresPool`, `query`, `map`, `find`.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function getActivityRequestFormData({
  serviceCategory,
  serviceType,
  serviceTypeId,
}: ActivityRequestFormFilters): Promise<ActivityRequestFormData> {
  const pool = await getPostgresPool();
  const serviceTypeResult = await pool.query<ServiceTypeRow>(
    `SELECT st.id, st.name
       FROM service_type st
       INNER JOIN service_category sc ON sc.id = st.id_service_category
      WHERE ($1::text IS NULL OR sc.name = $1)
        AND ($2::integer IS NULL OR st.id = $2)
      ORDER BY sc.name, st.name`,
    [serviceCategory ?? null, serviceTypeId ?? null],
  );
  const serviceTypeOptions = serviceTypeResult.rows.map((row) => ({ label: row.name, value: row.name }));
  const selectedServiceType = serviceTypeResult.rows.find((row) => row.id === serviceTypeId);
  const effectiveServiceType = selectedServiceType?.name ?? serviceType ?? serviceTypeOptions[0]?.value;

  if (!effectiveServiceType) {
    return { serviceCategoryName: serviceCategory, serviceTypeOptions, fields: [] };
  }

  const result = await pool.query<ServiceFieldTypeRow>(
    `SELECT
        sft.id,
        sc.name AS service_category_name,
        st.name AS service_type_name,
        sft.name,
        sft.type,
        sft.options,
        sft.required
       FROM service_field_type sft
       INNER JOIN service_type st ON st.id = sft.id_service_type
       INNER JOIN service_category sc ON sc.id = st.id_service_category
      WHERE sft.active IS TRUE
        AND st.name = $1
        AND ($2::text IS NULL OR sc.name = $2)
      ORDER BY sft.display_order NULLS LAST, sft.id`,
    [effectiveServiceType, serviceCategory ?? null],
  );

  return {
    serviceCategoryName: result.rows[0]?.service_category_name ?? serviceCategory,
    serviceTypeName: result.rows[0]?.service_type_name ?? effectiveServiceType,
    serviceTypeId: selectedServiceType?.id ?? serviceTypeResult.rows.find((row) => row.name === effectiveServiceType)?.id,
    serviceTypeOptions,
    fields: result.rows.map(mapServiceFieldTypeRowToField),
  };
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Map service field type row to field para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona `mapDatabaseFieldType`, `mapMediaOptions`, `mapOptions`.
 *
 * @param row Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function mapServiceFieldTypeRowToField(row: ServiceFieldTypeRow): ActivityRequestField {
  const type = mapDatabaseFieldType(row.type);
  const mediaOptions = type === "file" ? mapMediaOptions(row.options) : undefined;

  return {
    label: row.name,
    name: `service_field_${row.id}`,
    type,
    options: mapOptions(row.options),
    mediaOptions,
    required: row.required ?? false,
    fullWidth: type === "text" || type === "file",
  };
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Map database field type para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona `toUpperCase`.
 *
 * @param type Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function mapDatabaseFieldType(type: string): ActivityRequestField["type"] {
  const normalizedType = type.toUpperCase();

  if (normalizedType === "SINGLE_SELECT") return "select";
  if (normalizedType === "MULTI_SELECT") return "multi-select";
  if (normalizedType === "NUMBER") return "number";
  if (normalizedType === "DATE") return "date";
  if (normalizedType === "BOOL") return "checkbox";
  if (normalizedType === "MEDIA") return "file";

  return "text";
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Map media options para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona `parseJsonOptions`, `isArray`, `map`.
 *
 * @param options Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function mapMediaOptions(options: unknown): NonNullable<ActivityRequestField["mediaOptions"]> {
  const parsedOptions = typeof options === "string" ? parseJsonOptions(options) : options;

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
 * Map options para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona `parseJsonOptions`, `isArray`, `map`.
 *
 * @param options Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function mapOptions(options: unknown): FormOption[] | undefined {
  const parsedOptions = typeof options === "string" ? parseJsonOptions(options) : options;

  if (!Array.isArray(parsedOptions)) return undefined;

  return parsedOptions.map(String).map((value) => ({ label: value, value }));
}

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Parse json options para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona `parse`.
 *
 * @param options Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function parseJsonOptions(options: string): unknown {
  try {
    return JSON.parse(options);
  } catch {
    return undefined;
  }
}
