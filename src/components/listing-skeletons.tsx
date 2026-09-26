"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PAGE_SIZE } from "@/store/constants";

const SKELETON_KEYS = Array.from(
  { length: PAGE_SIZE },
  (_, index) => `skeleton-${index}`,
);
const SKELETON_COLUMNS = [
  "image",
  "name",
  "category",
  "price",
  "stock",
  "rating",
  "actions",
];

/** Layout-matching skeletons: cards <md, table rows >=md. */
export function ListingSkeletons(): React.JSX.Element {
  return (
    <>
      <div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:hidden"
        aria-hidden
      >
        {SKELETON_KEYS.map((key) => (
          <Card key={key} className="overflow-hidden">
            <Skeleton className="skeleton aspect-[4/3] w-full rounded-none" />
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="skeleton h-5 w-3/4" />
              <Skeleton className="skeleton h-4 w-1/2" />
              <Skeleton className="skeleton h-4 w-1/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="skeleton h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="hidden md:block" aria-hidden>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Image</TableHead>
              <TableHead scope="col">Name</TableHead>
              <TableHead scope="col">Category</TableHead>
              <TableHead scope="col">Price</TableHead>
              <TableHead scope="col">Stock</TableHead>
              <TableHead scope="col">Rating</TableHead>
              <TableHead scope="col">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SKELETON_KEYS.map((key) => (
              <TableRow key={key}>
                {SKELETON_COLUMNS.map((column) => (
                  <TableCell key={`${key}-cell-${column}`}>
                    <Skeleton className="skeleton h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
