import "server-only";

import type { RequestServiceMediaRepository } from "@/src/server/repositories/service-catalog/request-service-media-repository";
import { postgresRequestServiceMediaRepository } from "@/src/server/repositories/service-catalog/postgres/request-service-media-postgres-repository";

export function getRequestServiceMediaRepository(): RequestServiceMediaRepository {
  return postgresRequestServiceMediaRepository;
}
