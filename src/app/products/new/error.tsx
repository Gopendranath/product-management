"use client";

import { RouteError } from "@/components/route-error";

export default function AddError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return <RouteError message="The form failed to load." onRetry={reset} />;
}
