"use client";

import { ArrowLeft, Package } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound(): React.JSX.Element {
  const router = useRouter();
  const handleBack = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    if (window.history.length > 1) router.back();
    else router.push("/");
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
