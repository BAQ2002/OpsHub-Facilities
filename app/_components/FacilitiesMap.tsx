"use client";

import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import type { WheelEvent } from "react";

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
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoomIndex, setZoomIndex] = useState(0);
  const zoom = zoomLevels[zoomIndex];

  const imageStyle = useMemo(
    () => ({ width: `${zoom}%`, maxWidth: "none" }),
    [zoom],
  );

  const handleWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const bounds = viewport.getBoundingClientRect();
    const cursorX = event.clientX - bounds.left;
    const cursorY = event.clientY - bounds.top;
    const scrollRatioX = (viewport.scrollLeft + cursorX) / viewport.scrollWidth;
    const scrollRatioY = (viewport.scrollTop + cursorY) / viewport.scrollHeight;

    setZoomIndex((current) => {
      const next = event.deltaY < 0 ? current + 1 : current - 1;
      const nextIndex = Math.min(Math.max(next, 0), zoomLevels.length - 1);

      if (nextIndex === current) {
        return current;
      }

      requestAnimationFrame(() => {
        viewport.scrollLeft = scrollRatioX * viewport.scrollWidth - cursorX;
        viewport.scrollTop = scrollRatioY * viewport.scrollHeight - cursorY;
      });

      return nextIndex;
    });
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-sky-50">
      <div
        className="pointer-events-none absolute left-3 top-3 z-10 overflow-hidden rounded border border-slate-300 bg-white text-slate-950 shadow-[0_1px_4px_rgba(15,23,42,0.20)]"
        aria-hidden="true"
      >
        <div className="flex h-8 w-8 items-center justify-center border-b border-slate-300 text-2xl font-semibold leading-none">
          +
        </div>
        <div className="flex h-8 w-8 items-center justify-center text-2xl font-light leading-none">
          −
        </div>
      </div>

      <div
        ref={viewportRef}
        className="overflow-auto"
        onWheel={handleWheel}
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
