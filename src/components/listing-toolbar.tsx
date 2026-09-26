"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterState, SortBy, SortOrder } from "@/types/store";
import { isSortBy, isSortOrder } from "@/store/filter-context";
import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import Link from "next/link";

interface ListingToolbarProps {
  filters: FilterState;
  categories: string[];
  onSearch: (search: string) => void;
  onCategory: (category: string) => void;
  onSort: (sortBy: SortBy, order: SortOrder) => void;
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "id", label: "Default" },
  { value: "price", label: "Price" },
  { value: "rating", label: "Rating" },
];

/** Toolbar hero: title + search + category + sort + Add product. */
export function ListingToolbar({
  filters,
  categories,
  onSearch,
  onCategory,
  onSort,
}: ListingToolbarProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl tracking-tight md:text-4xl">Products</h1>
        <Button
          nativeButton={false}
          render={<Link href="/products/new" />}
          className="min-h-[44px] shrink-0"
        >
          <Plus data-icon="inline-start" />
          Add product
        </Button>
      </div>
      <p className="max-w-[65ch] text-base text-muted-foreground">
        Browse, search, and manage the catalog.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-6 lg:grid-cols-[1fr_200px_200px_140px]">
        <div className="relative sm:col-span-6 lg:col-span-1">
          <Label htmlFor="product-search" className="sr-only">
            Search products
          </Label>
          <MagnifyingGlass
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="product-search"
            type="search"
            placeholder="Search products"
            autoComplete="off"
            value={filters.search}
            onChange={(event) => onSearch(event.target.value)}
            className="min-h-[44px] pl-9"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <Label htmlFor="category-filter" className="sr-only">
            Filter by category
          </Label>
          <Select
            value={filters.category}
            onValueChange={(value) => {
              if (value) onCategory(value);
            }}
          >
            <SelectTrigger
              id="category-filter"
              aria-label="Filter by category"
              className="min-h-[44px] w-full"
            >
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <Label htmlFor="sort-filter" className="sr-only">
            Sort by
          </Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => {
              if (isSortBy(value)) onSort(value, filters.order);
            }}
          >
            <SelectTrigger
              id="sort-filter"
              aria-label="Sort by"
              className="min-h-[44px] w-full"
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <Label htmlFor="order-filter" className="sr-only">
            Sort order
          </Label>
          <Select
            value={filters.order}
            onValueChange={(value) => {
              if (isSortOrder(value)) onSort(filters.sortBy, value);
            }}
          >
            <SelectTrigger
              id="order-filter"
              aria-label="Sort order"
              className="min-h-[44px] w-full"
            >
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
