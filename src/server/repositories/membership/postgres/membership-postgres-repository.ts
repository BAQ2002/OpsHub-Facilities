import "server-only";

import { getPostgresPool } from "@/src/server/db/postgres";
import type { MembershipOption, MembershipRepository } from "@/src/server/repositories/membership/membership-repository";

export const postgresMembershipRepository: MembershipRepository = {
  findExecutorOptions,
};

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém executor options para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona `getPostgresPool`, `query`.
 *
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
async function findExecutorOptions(): Promise<MembershipOption[]> {
  const pool = await getPostgresPool();
  const result = await pool.query<MembershipOption>(
    `SELECT id, name FROM membership WHERE name IS NOT NULL ORDER BY name, id`,
  );
  return result.rows;
}
