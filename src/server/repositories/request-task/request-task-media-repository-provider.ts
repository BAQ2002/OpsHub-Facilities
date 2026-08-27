import "server-only";

import type { RequestTaskMediaRepository } from "@/src/server/repositories/request-task/request-task-media-repository";
import { postgresRequestTaskMediaRepository } from "@/src/server/repositories/request-task/postgres/request-task-media-postgres-repository";

export function getRequestTaskMediaRepository(): RequestTaskMediaRepository {
  return postgresRequestTaskMediaRepository;
}
