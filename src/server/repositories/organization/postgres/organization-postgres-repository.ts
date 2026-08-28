import "server-only";

import type { LocationHierarchy } from "@/src/domain/entities/activity-request-form";
import { getPostgresPool } from "@/src/server/db/postgres";
import type { OrganizationRepository } from "@/src/server/repositories/organization/organization-repository";

export const postgresOrganizationRepository: OrganizationRepository = {
  findLocationHierarchy,
};

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém location hierarchy para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona `getPostgresPool`, `all`, `query`, `map`.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
async function findLocationHierarchy(): Promise<LocationHierarchy> {
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
