"use client";
import { ResilientMedia } from "@/app/componentes/ResilientMedia";
import { useEffect, useState } from "react";
export type GalleryMedia = {
  id: number | string;
  fileName: string;
  mimeType: string;
  url: string;
};

export function VisitMediaField({ media, input }: { media: GalleryMedia[]; input?: React.ReactNode }) {
  return (
    <section aria-labelledby="visit-media-label">
      <h3 className="text-sm font-semibold text-slate-700" id="visit-media-label">Registros fotográficos</h3>
      <div className="mt-2">
        <MediaGallery media={media} />
      </div>
      {input}
    </section>
  );
}

export function MediaGallery({ media, emptyMessage = "Nenhum registro fotográfico." }: { media: GalleryMedia[]; emptyMessage?: string }) {
  const [mode, setMode] = useState<"carousel" | "grid">("carousel");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex < media.length) return;
    const timer = window.setTimeout(() => setActiveIndex(Math.max(0, media.length - 1)), 0);
    return () => window.clearTimeout(timer);
  }, [activeIndex, media.length]);

  if (!media.length) {
    return <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">{emptyMessage}</div>;
  }

  const activeMedia = media[activeIndex] ?? media[0];
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">{media.length} {media.length === 1 ? "anexo" : "anexos"}</p>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1" aria-label="Modo de visualização" role="group">
          <GalleryModeButton active={mode === "carousel"} onClick={() => setMode("carousel")}>Carrossel</GalleryModeButton>
          <GalleryModeButton active={mode === "grid"} onClick={() => setMode("grid")}>Grid</GalleryModeButton>
        </div>
      </div>

      {mode === "carousel" ? (
        <div>
          <MediaItem media={activeMedia} featured />
          <div className="mt-3 flex items-center justify-between gap-3">
            <button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={media.length < 2} onClick={() => setActiveIndex((index) => (index - 1 + media.length) % media.length)} aria-label="Exibir anexo anterior">‹ Anterior</button>
            <span className="text-xs font-semibold tabular-nums text-slate-500" aria-live="polite">{activeIndex + 1} de {media.length}</span>
            <button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={media.length < 2} onClick={() => setActiveIndex((index) => (index + 1) % media.length)} aria-label="Exibir próximo anexo">Próximo ›</button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => <MediaItem key={item.id} media={item} />)}
        </div>
      )}
    </div>
  );
}

function GalleryModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`} type="button" aria-pressed={active} onClick={onClick}>{children}</button>;
}

function MediaItem({ media, featured = false }: { media: GalleryMedia; featured?: boolean }) {
  const mediaClass = featured ? "h-[min(52vh,30rem)] w-full" : "aspect-video w-full";
  return (
    <figure className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <ResilientMedia src={media.url} alt={`Registro fotográfico: ${media.fileName}`} video={media.mimeType.startsWith("video/")} className={`${mediaClass} bg-slate-100 object-contain`} />
      <figcaption className="truncate border-t border-slate-200 px-3 py-2 text-xs font-medium text-slate-600" title={media.fileName}>{media.fileName}</figcaption>
    </figure>
  );
}
