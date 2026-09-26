"use client";

import { fallbackSrc, shouldUnoptimize } from "@/utils/product-image";
import Image from "next/image";
import { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  seed: number | string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/** API image first; broken/empty falls back to picsum seed. User URLs unoptimized. */
export function ProductImage({
  src,
  alt,
  seed,
  sizes,
  priority,
  className,
}: ProductImageProps): React.JSX.Element {
  const [failed, setFailed] = useState(false);
  const resolved = failed || !src ? fallbackSrc(seed) : src;
  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={shouldUnoptimize(resolved)}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
