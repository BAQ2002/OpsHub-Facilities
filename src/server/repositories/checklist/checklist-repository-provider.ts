import "server-only";

import type { ChecklistRepository } from "@/src/server/repositories/checklist/checklist-repository";
import { postgresChecklistRepository } from "@/src/server/repositories/checklist/postgres/checklist-postgres-repository";

export function getChecklistRepository(): ChecklistRepository {
  return postgresChecklistRepository;
}
