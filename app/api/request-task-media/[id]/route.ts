import { findRequestTaskMediaById } from "@/src/server/repositories/request-task-media-repository";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return new Response("Identificador de mídia inválido.", { status: 400 });
  }

  const media = await findRequestTaskMediaById(id);
  if (!media) return new Response("Mídia não encontrada.", { status: 404 });

  return new Response(media.content as BodyInit, {
    headers: {
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(media.fileName)}`,
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Content-Type": media.mimeType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
