import "server-only";

import { getPostgresPool } from "@/src/server/db/postgres";
import type { MembershipOption, MembershipRepository } from "@/src/server/repositories/membership/membership-repository";

export const postgresMembershipRepository: MembershipRepository = {
  findExecutorOptions,
};

async function findExecutorOptions(): Promise<MembershipOption[]> {
  const pool = await getPostgresPool();
  const result = await pool.query<MembershipOption>(
    `SELECT id, name FROM membership WHERE name IS NOT NULL ORDER BY name, id`,
  );
  return result.rows;
}
