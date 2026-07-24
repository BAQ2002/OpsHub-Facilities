import "server-only";

import type { ActivityRequestField, FormOption } from "@/src/domain/entities/activity-request-form";
import type { ActivityRequestFormData, ActivityRequestFormFilters } from "@/src/server/repositories/activity-request-form-repository";
import { getPostgresPool } from "@/src/server/db/postgres";

const booleanOptions: FormOption[] = [
  { label: "Sim", value: "true" },
  { label: "Não", value: "false" },
];

type ServiceTypeRow = {
  name: string;
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

export async function getActivityRequestFormData({
  serviceCategory,
  serviceType,
}: ActivityRequestFormFilters): Promise<ActivityRequestFormData> {
  const pool = await getPostgresPool();
  const serviceTypeResult = await pool.query<ServiceTypeRow>(
    `SELECT st.name
       FROM service_type st
       INNER JOIN service_category sc ON sc.id = st.id_service_category
      WHERE ($1::text IS NULL OR sc.name = $1)
      ORDER BY sc.name, st.name`,
    [serviceCategory ?? null],
  );
  const serviceTypeOptions = serviceTypeResult.rows.map((row) => ({ label: row.name, value: row.name }));
  const effectiveServiceType = serviceType ?? serviceTypeOptions[0]?.value;

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
    serviceTypeOptions,
    fields: result.rows.map(mapServiceFieldTypeRowToField),
  };
}

function mapServiceFieldTypeRowToField(row: ServiceFieldTypeRow): ActivityRequestField {
  const type = mapDatabaseFieldType(row.type);

  return {
    label: row.name,
    name: `service_field_${row.id}`,
    type,
    options: row.type.toUpperCase() === "BOOL" ? booleanOptions : mapOptions(row.options),
    required: row.required ?? false,
    fullWidth: type === "text",
  };
}

function mapDatabaseFieldType(type: string): ActivityRequestField["type"] {
  const normalizedType = type.toUpperCase();

  if (normalizedType === "SINGLE_SELECT") return "select";
  if (normalizedType === "MULTI_SELECT") return "multi-select";
  if (normalizedType === "NUMBER") return "number";
  if (normalizedType === "DATE") return "date";
  if (normalizedType === "BOOL") return "select";

  return "text";
}

function mapOptions(options: unknown): FormOption[] | undefined {
  if (!Array.isArray(options)) return undefined;

  return options.map(String).map((value) => ({ label: value, value }));
}
