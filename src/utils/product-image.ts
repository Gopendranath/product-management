/** Image helpers. API-first, picsum fallback, user URLs unoptimized. */

export function fallbackSrc(id: number | string): string {
  return `https://picsum.photos/seed/product-${id}/600/450`;
}

/** Only DummyJSON CDN + picsum go through the optimizer; arbitrary user URLs do not. */
export function shouldUnoptimize(src: string): boolean {
  return !src.includes("cdn.dummyjson.com") && !src.includes("picsum.photos");
}
