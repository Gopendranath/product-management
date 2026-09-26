"use client";

import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const LISTING_COLUMNS = [
  "Image",
  "Name",
  "Category",
  "Price",
  "Stock",
  "Rating",
  "Actions",
] as const;

/** Shared 7-column head for listing table + skeleton. Single source. */
export function ListingTableHead(): React.JSX.Element {
  return (
    <TableHeader>
      <TableRow>
        {LISTING_COLUMNS.map((column) => (
          <TableHead key={column} scope="col">
            {column}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
