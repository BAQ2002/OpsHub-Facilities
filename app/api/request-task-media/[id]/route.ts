import { getRequestTaskMediaRepository } from "@/src/server/repositories/repositories";

export const dynamic = "force-dynamic";

/**
 * Acionada pelo Next.js ao receber uma requisição HTTP GET nesta rota.
 *
 * Valida o identificador, consulta a mídia solicitada e monta a resposta HTTP correspondente.
 * Durante o fluxo, aciona `isSafeInteger`, `findById`, `getRequestTaskMediaRepository`.
 *
 * @param _request Dados necessários para executar esta função.
 * @param context Dados necessários para executar esta função.
 * @returns A resposta HTTP com a mídia encontrada ou com o erro aplicável.
 */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return new Response("Identificador de mídia inválido.", { status: 400 });
  }

  const media = await getRequestTaskMediaRepository().findById(id);
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
