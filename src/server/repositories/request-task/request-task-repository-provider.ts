import "server-only";

import type { RequestTaskRepository } from "@/src/server/repositories/request-task/request-task-repository";
import { postgresRequestTaskRepository } from "@/src/server/repositories/request-task/postgres/request-task-postgres-repository";

export function getRequestTaskRepository(): RequestTaskRepository {
  return postgresRequestTaskRepository;
}
