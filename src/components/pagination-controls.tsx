"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onChange: (page: number) => void;
}

/** Numbered window with prev/next. Buttons guard double-click via disabled. */
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

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(event) => {
              event.preventDefault();
              go(page - 1);
            }}
            aria-disabled={disabled ?? page <= 1}
            className={
              (disabled ?? page <= 1)
                ? "pointer-events-none opacity-50"
                : undefined
            }
          />
        </PaginationItem>
        {window.map((entry) =>
          typeof entry !== "number" ? (
            <PaginationItem key={entry}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <PaginationLink
                href="#"
                isActive={entry === page}
                onClick={(event) => {
                  event.preventDefault();
                  go(entry);
                }}
                aria-disabled={disabled}
                className={
                  disabled ? "pointer-events-none opacity-50" : undefined
                }
              >
                {entry}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(event) => {
              event.preventDefault();
              go(page + 1);
            }}
            aria-disabled={disabled ?? page >= totalPages}
            className={
              (disabled ?? page >= totalPages)
                ? "pointer-events-none opacity-50"
                : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
