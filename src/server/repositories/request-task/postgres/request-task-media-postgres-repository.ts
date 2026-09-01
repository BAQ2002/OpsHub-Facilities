import "server-only";

import { getPostgresPool } from "@/src/server/db/postgres";

import type { RequestTaskMediaContent, RequestTaskMediaRepository } from "@/src/server/repositories/request-task/request-task-media-repository";

export const postgresRequestTaskMediaRepository: RequestTaskMediaRepository = {
  findById: findRequestTaskMediaById,
};

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém request task media by id para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona {@link getPostgresPool}, {@link query}.
 *
 * @param id Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function findRequestTaskMediaById(id: number): Promise<RequestTaskMediaContent | null> {
  const pool = await getPostgresPool();
  const result = await pool.query<{ content: Buffer; file_name: string | null; mime_type: string | null }>(
    `SELECT content, file_name, mime_type
       FROM request_task_media
      WHERE id = $1`,
    [id],
  );
  const media = result.rows[0];
  if (!media) return null;
  return {
    content: media.content,
    fileName: media.file_name ?? `registro-visita-${id}`,
    mimeType: media.mime_type ?? "application/octet-stream",
  };
}
