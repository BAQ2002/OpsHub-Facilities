"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";

type FacilitiesMapProps = {
  image: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
};

type MapView = {
  scale: number;
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  lastX: number;
  lastY: number;
};

const minZoom = 1;
const maxZoom = 2;
const zoomStep = 0.25;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampMapView(view: MapView, width: number, height: number): MapView {
  const minX = width * (1 - view.scale);
  const minY = height * (1 - view.scale);

  return {
    scale: view.scale,
    x: clamp(view.x, minX, 0),
    y: clamp(view.y, minY, 0),
  };
}

export default function FacilitiesMap({ image }: FacilitiesMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [view, setView] = useState<MapView>({ scale: minZoom, x: 0, y: 0 });

  const mapStyle = useMemo(
    () => ({
      transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
      transformOrigin: "top left",
    }),
    [view.scale, view.x, view.y],
  );

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const bounds = viewport.getBoundingClientRect();
    const cursorX = event.clientX - bounds.left;
    const cursorY = event.clientY - bounds.top;

    setView((current) => {
      const nextScale = clamp(
        current.scale + (event.deltaY < 0 ? zoomStep : -zoomStep),
        minZoom,
        maxZoom,
      );

      if (nextScale === current.scale) {
        return current;
      }

      const mapPointX = (cursorX - current.x) / current.scale;
      const mapPointY = (cursorY - current.y) / current.scale;

      return clampMapView(
        {
          scale: nextScale,
          x: cursorX - mapPointX * nextScale,
          y: cursorY - mapPointY * nextScale,
        },
        bounds.width,
        bounds.height,
      );
    });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    viewport.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
    };
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    const viewport = viewportRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId || !viewport) {
      return;
    }

    event.preventDefault();

    const deltaX = event.clientX - dragState.lastX;
    const deltaY = event.clientY - dragState.lastY;
    dragStateRef.current = {
      ...dragState,
      lastX: event.clientX,
      lastY: event.clientY,
    };

    const bounds = viewport.getBoundingClientRect();
    setView((current) =>
      clampMapView(
        {
          ...current,
          x: current.x + deltaX,
          y: current.y + deltaY,
        },
        bounds.width,
        bounds.height,
      ),
    );
  }, []);

  const stopDragging = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStateRef.current = null;
    setIsDragging(false);
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
        className={`relative overflow-hidden touch-none select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerCancel={stopDragging}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        style={{
          aspectRatio: `${image.width} / ${image.height}`,
          overscrollBehavior: "contain",
        }}
      >
        <div className="h-full w-full will-change-transform" style={mapStyle}>
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="h-full w-full object-contain"
            draggable={false}
            preload
            sizes="(min-width: 1680px) 1544px, calc(100vw - 96px)"
          />
        </div>
      </div>
    </div>
  );
}
