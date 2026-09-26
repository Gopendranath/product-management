"use client";

import { RouteError } from "@/components/route-error";

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return <RouteError message="The catalog failed to load." onRetry={reset} />;
}
