"use client";

import { ListingEmpty, ListingError } from "@/components/listing-states";
import { ListingSkeletons } from "@/components/listing-skeletons";
import { ListingToolbar } from "@/components/listing-toolbar";
import { PaginationControls } from "@/components/pagination-controls";
import { ProductCard } from "@/components/product-card";
import { ProductRow } from "@/components/product-row";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  FALLBACK_CATEGORIES,
  fetchProducts,
  listCategories,
} from "@/services/client";
import { PAGE_SIZE } from "@/store/constants";
import { useFavs } from "@/store/favs-context";
import { useFilters } from "@/store/filter-context";
import { useLocalProducts } from "@/store/local-products-context";
import { useToasts } from "@/store/toast-context";
import { ApiError } from "@/types/api-error";
import type { Product } from "@/types/product";
import type { SortBy, SortOrder } from "@/types/store";
import { compareProducts } from "@/utils/format";
import { useEffect, useRef, useState } from "react";

type Status = "loading" | "ready" | "error";

function isDefaultView(
  search: string,
  category: string,
  sortBy: SortBy,
  order: SortOrder,
  page: number,
): boolean {
  return (
    page === 1 &&
    sortBy === "id" &&
    order === "asc" &&
    search === "" &&
    category === "all"
  );
}

export default function ListingPage(): React.JSX.Element {
  const { filters, setFilter, resetFilters } = useFilters();
  const { favIds, toggleFav } = useFavs();
  const { localProducts } = useLocalProducts();
  const { pushToast } = useToasts();
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  const [items, setItems] = useState<Product[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([
    ...FALLBACK_CATEGORIES,
  ]);
  const [status, setStatus] = useState<Status>("loading");
  const [retryToken, setRetryToken] = useState(0);
  const requestRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    listCategories().then((list) => {
      if (!cancelled) setCategories(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: retryToken intentionally retriggers refetch
  useEffect(() => {
    requestRef.current += 1;
    const request = requestRef.current;
    setStatus("loading");
    const skip = (filters.page - 1) * PAGE_SIZE;
    fetchProducts({
      q: debouncedSearch,
      category: filters.category,
      limit: PAGE_SIZE,
      skip,
      sortBy: filters.sortBy,
      order: filters.order,
    })
      .then((page) => {
        if (requestRef.current !== request) return;
        let combined = [...page.products];
        // Single-axis fetch: apply the other axis within the returned page.
        if (debouncedSearch && filters.category !== "all") {
          const slug = filters.category.toLowerCase();
          combined = combined.filter(
            (product) => product.category.toLowerCase() === slug,
          );
        }
        combined.sort(compareProducts(filters.sortBy, filters.order));
        const qualifying =
          localProducts.length > 0 &&
          isDefaultView(
            debouncedSearch,
            filters.category,
            filters.sortBy,
            filters.order,
            filters.page,
          );
        if (qualifying) combined = [...localProducts, ...combined];
        setItems(combined);
        setServerTotal(page.total);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (requestRef.current !== request) return;
        if (
          error instanceof ApiError &&
          error.kind === "NOT_FOUND" &&
          filters.category !== "all"
        ) {
          pushToast(
            "listing-fetch",
            "error",
            `Unknown category "${filters.category}". Showing all products.`,
          );
          setFilter({ category: "all", page: 1 });
          return;
        }
        setStatus("error");
        pushToast("listing-fetch", "error", "Could not load products.");
      });
  }, [
    debouncedSearch,
    filters,
    localProducts,
    retryToken,
    pushToast,
    setFilter,
  ]);

  const qualifying = isDefaultView(
    debouncedSearch,
    filters.category,
    filters.sortBy,
    filters.order,
    filters.page,
  );
  const displayTotal = qualifying
    ? serverTotal + localProducts.length
    : serverTotal;
  const totalPages = Math.ceil(displayTotal / PAGE_SIZE);

  // Clamp page when the total shrinks beneath it.
  useEffect(() => {
    if (status !== "ready") return;
    if (displayTotal === 0) {
      if (filters.page !== 1) setFilter({ page: 1 });
      return;
    }
    if (filters.page > totalPages) setFilter({ page: totalPages });
  }, [status, displayTotal, totalPages, filters.page, setFilter]);

  return (
    <main className="container-app flex w-full flex-col gap-6 px-4 py-8">
      <ListingToolbar
        filters={filters}
        categories={categories}
        onSearch={(search) => setFilter({ search })}
        onCategory={(category) => setFilter({ category })}
        onSort={(sortBy, order) => setFilter({ sortBy, order })}
      />
      {status === "loading" && <ListingSkeletons />}
      {status === "error" && (
        <ListingError
          onRetry={() => {
            setStatus("loading");
            setRetryToken((token) => token + 1);
          }}
        />
      )}
      {status === "ready" &&
        (items.length === 0 ? (
          <ListingEmpty onClear={resetFilters} />
        ) : (
          <>
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {displayTotal} {displayTotal === 1 ? "product" : "products"}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:hidden">
              {items.map((product, index) => (
                <div
                  key={product.id}
                  className="reveal h-full"
                  style={
                    {
                      "--reveal-delay": `${Math.min(index * 60, 600)}ms`,
                    } as React.CSSProperties
                  }
                >
                  <ProductCard
                    product={product}
                    isFav={favIds.includes(product.id)}
                    onToggleFav={toggleFav}
                  />
                </div>
              ))}
            </div>
            <div className="hidden md:block">
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
                  {items.map((product, index) => (
                    <ProductRow
                      key={product.id}
                      index={index}
                      product={product}
                      isFav={favIds.includes(product.id)}
                      onToggleFav={toggleFav}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            <PaginationControls
              page={filters.page}
              totalPages={totalPages}
              onChange={(page) => setFilter({ page })}
            />
          </>
        ))}
    </main>
  );
}
