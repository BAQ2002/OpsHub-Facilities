import "server-only";

import type { ServiceCatalogRepository } from "@/src/server/repositories/service-catalog/service-catalog-repository";
import { postgresServiceCatalogRepository } from "@/src/server/repositories/service-catalog/postgres/service-catalog-postgres-repository";

export function getServiceCatalogRepository(): ServiceCatalogRepository {
  return postgresServiceCatalogRepository;
}
