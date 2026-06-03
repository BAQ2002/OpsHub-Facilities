"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type FacilitiesMapProps = {
  image: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
};

const zoomLevels = [100, 125, 150, 175, 200];

export default function FacilitiesMap({ image }: FacilitiesMapProps) {
  const [zoomIndex, setZoomIndex] = useState(0);
  const zoom = zoomLevels[zoomIndex];
  const canZoomOut = zoomIndex > 0;
  const canZoomIn = zoomIndex < zoomLevels.length - 1;

  const imageStyle = useMemo(
    () => ({ width: `${zoom}%`, maxWidth: "none" }),
    [zoom],
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-sky-50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2">
        <p className="text-xs font-medium text-slate-500">
          Zoom do mapa: <span className="text-slate-950">{zoom}%</span>
        </p>

        <div className="flex items-center gap-2" aria-label="Controles de zoom do mapa">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-base font-bold text-slate-700 shadow-[0_1px_1px_rgba(15,23,42,0.04)] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            aria-label="Reduzir zoom do mapa"
            onClick={() => setZoomIndex((current) => Math.max(current - 1, 0))}
            disabled={!canZoomOut}
          >
            −
          </button>
          <button
            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-[0_1px_1px_rgba(15,23,42,0.04)] transition hover:bg-slate-50"
            type="button"
            onClick={() => setZoomIndex(0)}
          >
            Ajustar
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-base font-bold text-slate-700 shadow-[0_1px_1px_rgba(15,23,42,0.04)] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            aria-label="Ampliar zoom do mapa"
            onClick={() =>
              setZoomIndex((current) =>
                Math.min(current + 1, zoomLevels.length - 1),
              )
            }
            disabled={!canZoomIn}
          >
            +
          </button>
        </div>
      </div>

      <div
        className="overflow-auto"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="h-auto object-contain transition-[width] duration-200 ease-out"
          style={imageStyle}
          preload
          sizes="(min-width: 1680px) 1544px, calc(100vw - 96px)"
        />
      </div>
    </div>
  );
}
