import "server-only";

import type { ActivityRequestField, FormOption, LocationHierarchy } from "@/src/domain/entities/activity-request-form";
import type {
  ActivityRequestFormData,
  ActivityRequestFormFilters,
  ServiceCatalogCategory,
} from "@/src/server/repositories/activity-request-form-repository";
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

export async function getLocationHierarchy(): Promise<LocationHierarchy> {
  const pool = await getPostgresPool();
  const [businesses, regions, locations] = await Promise.all([
    pool.query<{ id: number; name: string }>(
      `SELECT id, name FROM business WHERE name IS NOT NULL ORDER BY name, id`,
    ),
    pool.query<{ id: number; business_id: number; name: string }>(
      `SELECT id, id_business AS business_id, name
         FROM region
        WHERE id_business IS NOT NULL AND name IS NOT NULL
        ORDER BY name, id`,
    ),
    pool.query<{ id: number; region_id: number; name: string }>(
      `SELECT id, id_region AS region_id, name
         FROM location
        WHERE id_region IS NOT NULL AND name IS NOT NULL
        ORDER BY name, id`,
    ),
  ]);

  return {
    businesses: businesses.rows,
    regions: regions.rows.map((row) => ({ id: row.id, businessId: row.business_id, name: row.name })),
    locations: locations.rows.map((row) => ({ id: row.id, regionId: row.region_id, name: row.name })),
  };
}

export async function getActivityRequestFormData({
  serviceCategory,
  serviceType,
}: ActivityRequestFormFilters): Promise<ActivityRequestFormData> {
  const pool = await getPostgresPool();
  const serviceTypeResult = await pool.query<ServiceTypeRow>(
    `SELECT st.id, st.name
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
    serviceTypeId: serviceTypeResult.rows.find((row) => row.name === effectiveServiceType)?.id,
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
    options: mapOptions(row.options),
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
  if (normalizedType === "BOOL") return "checkbox";

  return "text";
}

function mapOptions(options: unknown): FormOption[] | undefined {
  const parsedOptions = typeof options === "string" ? parseJsonOptions(options) : options;

  if (!Array.isArray(parsedOptions)) return undefined;

  return parsedOptions.map(String).map((value) => ({ label: value, value }));
}

function parseJsonOptions(options: string): unknown {
  try {
    return JSON.parse(options);
  } catch {
    return undefined;
  }
}
