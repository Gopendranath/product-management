"use client";

import { Button } from "@/components/ui/button";

interface RouteErrorProps {
  message: string;
  onRetry: () => void;
}

/** Shared route error boundary body. Retry re-renders the segment. */
export function RouteError({
  message,
  onRetry,
}: RouteErrorProps): React.JSX.Element {
  return (
    <main className="container-app flex w-full flex-col items-center gap-3 px-4 py-16 text-center">
      <p className="text-lg font-medium">Something went wrong</p>
      <p className="max-w-[65ch] text-sm text-muted-foreground">{message}</p>
      <Button type="button" onClick={onRetry} className="min-h-[44px]">
        Retry
      </Button>
    </main>
  );
}
