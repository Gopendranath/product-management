"use client";

import { Button } from "@/components/ui/button";

interface ListingEmptyProps {
  onClear: () => void;
}

export function ListingEmpty({
  onClear,
}: ListingEmptyProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
      <p className="text-lg font-medium">No products found</p>
      <p className="max-w-[65ch] text-sm text-muted-foreground">
        Try a different search term or category.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={onClear}
        className="min-h-[44px]"
      >
        Reset
      </Button>
    </div>
  );
}

interface ListingErrorProps {
  onRetry: () => void;
}

export function ListingError({
  onRetry,
}: ListingErrorProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border py-16 text-center">
      <p className="text-lg font-medium">Could not load products</p>
      <p className="max-w-[65ch] text-sm text-muted-foreground">
        Check your connection and try again. Filters are kept.
      </p>
      <Button type="button" onClick={onRetry} className="min-h-[44px]">
        Retry
      </Button>
    </div>
  );
}
