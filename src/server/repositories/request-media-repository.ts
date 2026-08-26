import "server-only";

import { getPostgresPool } from "@/src/server/db/postgres";

export type RequestMediaContent = {
  content: Uint8Array;
  fileName: string;
  mimeType: string;
};

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
