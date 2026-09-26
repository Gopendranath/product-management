"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

/** Back when history exists, else home. Single source for not-found/detail/add. */
export function useSafeBack(): () => void {
  const router = useRouter();
  return useCallback(() => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }, [router]);
}
