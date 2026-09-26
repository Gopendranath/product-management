"use client";

import { RouteError } from "@/components/route-error";

export default function DetailsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return <RouteError message="This product failed to load." onRetry={reset} />;
}
