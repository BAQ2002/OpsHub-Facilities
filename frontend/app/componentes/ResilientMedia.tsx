"use client";

import { useState } from "react";
import { httpFailure, connectionFailure, type ApiFailure } from "@/app/entities/api/api-result";
import { DataUnavailable } from "./DataUnavailable";

/** Media elements do not expose HTTP status; inspect a failed same-origin URL only. */
export function ResilientMedia({ src, alt, className, video = false }: {
  src: string; alt: string; className?: string; video?: boolean;
}) {
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [attempt, setAttempt] = useState(0);
  async function failed() {
    setFailure({ kind: "invalid-response", message: "Não foi possível carregar este anexo." });
    const url = new URL(src, window.location.href);
    if (url.origin !== window.location.origin) return;
    try {
      const response = await fetch(url, { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(10_000) });
      if (!response.ok) setFailure(httpFailure(response.status));
    } catch { setFailure(connectionFailure); }
  }
  if (failure) return <DataUnavailable error={failure} retry={() => { setFailure(null); setAttempt((value) => value + 1); }} />;
  if (video) return <video key={`${src}:${attempt}`} className={className} src={src} controls playsInline preload="metadata" onError={() => void failed()} aria-label={alt} />;
  // eslint-disable-next-line @next/next/no-img-element -- Same-origin binary media with unknown dimensions.
  return <img key={`${src}:${attempt}`} className={className} src={src} alt={alt} onError={() => void failed()} />;
}
