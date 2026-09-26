"use client";

import { ProductAddForm } from "@/components/product-add-form";
import { Skeleton } from "@/components/ui/skeleton";
import { FALLBACK_CATEGORIES, listCategories } from "@/services/client";
import { useMockAuth } from "@/store/mock-auth-context";
import { useToasts } from "@/store/toast-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Gated add route. Logged-out visits redirect to the listing with a demo-gate
 * toast; no draft is kept. Mount gate avoids SSR/client auth mismatch.
 */
export default function ProductAddPage(): React.JSX.Element {
  const router = useRouter();
  const { loggedIn } = useMockAuth();
  const { pushToast } = useToasts();
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<string[]>([
    ...FALLBACK_CATEGORIES,
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    listCategories().then((list) => {
      if (!cancelled) setCategories(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mounted && !loggedIn) {
      pushToast("auth-gate", "error", "Demo sign-in required to add products.");
      router.replace("/");
    }
  }, [mounted, loggedIn, pushToast, router]);

  if (!mounted || !loggedIn) {
    return (
      <main className="container-app flex w-full flex-col gap-5 px-4 py-8">
        <Skeleton className="skeleton h-9 w-48" />
        <Skeleton className="skeleton h-4 w-72" />
        <Skeleton className="skeleton h-11 w-full" />
        <Skeleton className="skeleton h-24 w-full" />
        <Skeleton className="skeleton h-11 w-full" />
      </main>
    );
  }

  return (
    <main className="container-app flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-3xl tracking-tight md:text-4xl">Add product</h1>
        <p className="mt-1 max-w-[65ch] text-base text-muted-foreground">
          Create a catalog entry. Stored locally for this session.
        </p>
      </div>
      <ProductAddForm categories={categories} />
    </main>
  );
}
