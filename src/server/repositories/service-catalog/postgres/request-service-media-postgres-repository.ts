import "server-only";

import { getPostgresPool } from "@/src/server/db/postgres";

import type { RequestMediaContent, RequestServiceMediaRepository } from "@/src/server/repositories/service-catalog/request-service-media-repository";

export const postgresRequestServiceMediaRepository: RequestServiceMediaRepository = {
  findById: findRequestMediaById,
};

/**
 * Acionada pela camada de serviço, consulta ou repositório que depende desta operação.
 *
 * Obtém request media by id para uso pelo fluxo solicitante.
 * Durante o fluxo, aciona `getPostgresPool`, `query`.
 *
 * @param id Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
export async function findRequestMediaById(id: number): Promise<RequestMediaContent | null> {
  const pool = await getPostgresPool();
  const result = await pool.query<{
    content: Buffer;
    file_name: string | null;
    mime_type: string;
  }>(
    `SELECT content, file_name, mime_type
       FROM service_field_media
      WHERE id = $1`,
    [id],
  );
  const media = result.rows[0];
  if (!media) return null;
  return {
    content: media.content,
    fileName: media.file_name ?? `anexo-${id}`,
    mimeType: media.mime_type,
  };
}
