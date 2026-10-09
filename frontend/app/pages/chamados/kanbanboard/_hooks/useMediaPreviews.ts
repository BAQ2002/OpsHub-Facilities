"use client";
import { useEffect, useMemo } from "react";
import type { GalleryMedia } from "../_components/MediaGallery";

export function useMediaPreviews(files: File[]): GalleryMedia[] {
  const previews = useMemo(() => files.map((file, index) => ({
      id: `preview-${index}-${file.name}-${file.lastModified}`,
      fileName: file.name,
      mimeType: file.type,
      url: URL.createObjectURL(file),
    })), [files]);

  useEffect(() => {
    return () => previews.forEach((media) => URL.revokeObjectURL(media.url));
  }, [previews]);

  return previews;
}

