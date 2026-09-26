"use client";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onChange: (page: number) => void;
}

/** Numbered window with prev/next. Real buttons with disabled guards. */
export function PaginationControls({
  page,
  totalPages,
  disabled,
  onChange,
}: PaginationControlsProps): React.JSX.Element | null {
  if (totalPages <= 1) return null;

  const window: (number | "gap-start" | "gap-end")[] = [];
  if (totalPages <= 7) {
    for (let p = 1; p <= totalPages; p += 1) window.push(p);
  } else {
    window.push(1);
    if (page > 3) window.push("gap-start");
    for (
      let p = Math.max(2, page - 1);
      p <= Math.min(totalPages - 1, page + 1);
      p += 1
    ) {
      window.push(p);
    }
    if (page < totalPages - 2) window.push("gap-end");
    window.push(totalPages);
  }

  const go = (target: number): void => {
    if (target >= 1 && target <= totalPages && target !== page)
      onChange(target);
  };

  const navDisabled = (atEdge: boolean): boolean => Boolean(disabled) || atEdge;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <Button
            type="button"
            variant="ghost"
            onClick={() => go(page - 1)}
            disabled={navDisabled(page <= 1)}
            aria-label="Go to previous page"
            className="min-h-[44px] pl-1.5!"
          >
            <CaretLeft data-icon="inline-start" />
            <span className="hidden sm:block">Previous</span>
          </Button>
        </PaginationItem>
        {window.map((entry) =>
          typeof entry !== "number" ? (
            <PaginationItem key={entry}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <Button
                type="button"
                variant={entry === page ? "outline" : "ghost"}
                size="icon"
                onClick={() => go(entry)}
                disabled={disabled}
                aria-current={entry === page ? "page" : undefined}
                aria-label={`Go to page ${entry}`}
                className="min-h-[44px] min-w-[44px]"
              >
                {entry}
              </Button>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <Button
            type="button"
            variant="ghost"
            onClick={() => go(page + 1)}
            disabled={navDisabled(page >= totalPages)}
            aria-label="Go to next page"
            className="min-h-[44px] pr-1.5!"
          >
            <span className="hidden sm:block">Next</span>
            <CaretRight data-icon="inline-end" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
