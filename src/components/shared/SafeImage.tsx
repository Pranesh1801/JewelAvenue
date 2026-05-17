"use client";

import { SyntheticEvent, useEffect, useState } from "react";
import Image, { ImageProps } from "next/image";

const DEFAULT_FALLBACK = "/placeholder.svg";

type SafeImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
  alt?: string;
  fallbackSrc?: string;
};

function normalizeSrc(src?: string | null): string | undefined {
  if (!src || typeof src !== "string") return undefined;
  const value = src.trim();
  return value.length > 0 ? value : undefined;
}

export default function SafeImage({
  src,
  alt = "",
  fallbackSrc = DEFAULT_FALLBACK,
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(() => normalizeSrc(src) ?? fallbackSrc);

  useEffect(() => {
    setCurrentSrc(normalizeSrc(src) ?? fallbackSrc);
  }, [src, fallbackSrc]);

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    if (currentSrc !== fallbackSrc) {
      console.error(`[SafeImage] broken src: ${String(src)} -> fallback ${fallbackSrc}`);
      setCurrentSrc(fallbackSrc);
    }
    if (typeof props.onError === "function") {
      props.onError(event as any);
    }
  };

  return <Image {...props} src={currentSrc} alt={alt} onError={handleError} />;
}
