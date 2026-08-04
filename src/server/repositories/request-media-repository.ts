import "server-only";

import { requestFastApi } from "@/src/server/api/fastapi";
import { getPostgresPool } from "@/src/server/db/postgres";

export type RequestMediaContent = {
  content: Uint8Array;
  fileName: string;
  mimeType: string;
};

export async function findRequestMediaById(id: number): Promise<RequestMediaContent | null> {
  if (process.env.DATA_SOURCE === "postgres") {
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

  if (process.env.DATA_SOURCE === "fastapi") {
    const media = await requestFastApi<{
      content: string;
      file_name?: string | null;
      mime_type: string;
    }>(`/service-field-media/${id}`);
    return {
      content: Uint8Array.from(Buffer.from(media.content, "base64")),
      fileName: media.file_name ?? `anexo-${id}`,
      mimeType: media.mime_type,
    };
  }

  if (id !== 1) return null;
  const illustration = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><rect width="960" height="540" fill="#e2e8f0"/><path d="M0 390 210 315l165 52 180-100 405 137v136H0z" fill="#94a3b8"/><path d="m298 327 96-112 76 90 67-54 109 131z" fill="#64748b"/><circle cx="730" cy="128" r="54" fill="#fbbf24"/><text x="48" y="70" fill="#334155" font-family="sans-serif" font-size="30" font-weight="700">Foto da ocorrência</text><text x="48" y="108" fill="#64748b" font-family="sans-serif" font-size="20">Demonstração do anexo salvo na request</text></svg>`;
  return {
    content: new TextEncoder().encode(illustration),
    fileName: "avaria-piso.svg",
    mimeType: "image/svg+xml",
  };
}
