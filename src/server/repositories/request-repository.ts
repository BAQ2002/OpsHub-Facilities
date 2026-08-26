import "server-only";

import type { RequestEntity } from "@/src/domain/entities/request";
import { findRequestsByCurrentUser as findPostgresRequestsByCurrentUser } from "@/src/server/repositories/postgres/request-postgres-repository";

export async function findRequestsByCurrentUser(): Promise<RequestEntity[]> {
  return findPostgresRequestsByCurrentUser();
}
