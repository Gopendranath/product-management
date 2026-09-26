"use client";

import { useSafeBack } from "@/hooks/use-safe-back";
import { ArrowLeft, Package } from "@phosphor-icons/react";
import Link from "next/link";

export default function NotFound(): React.JSX.Element {
  const goBack = useSafeBack();
  const handleBack = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    goBack();
  };
  return (
    <main className="container-app flex w-full flex-col items-center gap-3 px-4 py-16 text-center">
      <Package aria-hidden weight="fill" className="size-10 text-accent" />
      <h1 className="text-3xl tracking-tight">Page not found</h1>
      <p className="max-w-[65ch] text-base text-muted-foreground">
        This address has no page. Go back or browse the catalog.
      </p>
      <Link
        href="/"
        onClick={handleBack}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-sm px-2 text-sm font-medium"
      >
        <ArrowLeft aria-hidden />
        Back
      </Link>
    </main>
  );
}
