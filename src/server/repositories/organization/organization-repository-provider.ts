import "server-only";

import type { OrganizationRepository } from "@/src/server/repositories/organization/organization-repository";
import { postgresOrganizationRepository } from "@/src/server/repositories/organization/postgres/organization-postgres-repository";

export function getOrganizationRepository(): OrganizationRepository {
  return postgresOrganizationRepository;
}
