import "server-only";

import type { RequestRepository } from "@/src/server/repositories/request/request-repository";
import { postgresRequestRepository } from "@/src/server/repositories/request/postgres/request-postgres-repository";

export function getRequestRepository(): RequestRepository {
  return postgresRequestRepository;
}
