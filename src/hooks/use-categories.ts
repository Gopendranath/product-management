"use client";

import { FALLBACK_CATEGORIES, listCategories } from "@/services/client";
import { useEffect, useState } from "react";

/** Category slugs with static fallback. Cancel-safe for unmount races. */
export function useCategories(): string[] {
  const [categories, setCategories] = useState<string[]>([
    ...FALLBACK_CATEGORIES,
  ]);
  useEffect(() => {
    let cancelled = false;
    listCategories().then((slugs) => {
      if (!cancelled) setCategories(slugs);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return categories;
}
