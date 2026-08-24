import "server-only";

import { getPostgresPool } from "@/src/server/db/postgres";

export type RequestTaskMediaContent = {
  content: Uint8Array;
  fileName: string;
  mimeType: string;
};

export async function findRequestTaskMediaById(id: number): Promise<RequestTaskMediaContent | null> {
  if (process.env.DATA_SOURCE === "postgres") {
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

  if (process.env.DATA_SOURCE === "fastapi") return null;
  if (id !== 1 && id !== 2) return null;
  const title = id === 1 ? "Inspeção elétrica" : "Validação do serviço";
  const illustration = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><rect width="960" height="540" fill="#dbeafe"/><rect x="110" y="90" width="740" height="360" rx="28" fill="#fff"/><circle cx="480" cy="235" r="80" fill="#fbbf24"/><path d="M450 170h60l-22 55h45l-83 105 20-75h-42z" fill="#1d4ed8"/><text x="480" y="395" text-anchor="middle" fill="#334155" font-family="sans-serif" font-size="30" font-weight="700">${title}</text></svg>`;
  return { content: new TextEncoder().encode(illustration), fileName: `registro-${id}.svg`, mimeType: "image/svg+xml" };
}
