import "server-only";

import { getPostgresPool } from "@/src/server/db/postgres";

export type RequestTaskMediaContent = {
  content: Uint8Array;
  fileName: string;
  mimeType: string;
};

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
