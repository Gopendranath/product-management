"use client";

import { cn } from "cn";
import { SquaresFour, Table } from "@phosphor-icons/react";
import type { ViewMode } from "@/types/store";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

/** Listing density switch. Segmented pair, pill-active like primary nav. */
export function ViewToggle({
  view,
  onChange,
}: ViewToggleProps): React.JSX.Element {
  return (
    <fieldset className="inline-flex items-center gap-0.5 rounded-md border bg-surface p-0.5">
      <legend className="sr-only">Change layout</legend>
      <button
        type="button"
        aria-pressed={view === "cards"}
        aria-label="Card view"
        title="Card view"
        onClick={() => onChange("cards")}
        className={cn(
          "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm px-2 transition-colors",
          view === "cards"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <SquaresFour aria-hidden className="size-4" />
      </button>
      <button
        type="button"
        aria-pressed={view === "table"}
        aria-label="Table view"
        title="Table view"
        onClick={() => onChange("table")}
        className={cn(
          "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm px-2 transition-colors",
          view === "table"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Table aria-hidden className="size-4" />
      </button>
    </fieldset>
  );
}
