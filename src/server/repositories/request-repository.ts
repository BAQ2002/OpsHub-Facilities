import "server-only";

import type { RequestEntity } from "@/src/domain/entities/request";
import { findRequestsByCurrentUser as findMockRequestsByCurrentUser } from "@/src/server/repositories/mock/request-mock-repository";
import { findRequestsByCurrentUser as findPostgresRequestsByCurrentUser } from "@/src/server/repositories/postgres/request-postgres-repository";

export async function findRequestsByCurrentUser(): Promise<RequestEntity[]> {
  if (process.env.DATA_SOURCE === "postgres") {
    return findPostgresRequestsByCurrentUser();
  }

  return findMockRequestsByCurrentUser();
}
