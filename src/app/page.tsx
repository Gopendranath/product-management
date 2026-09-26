"use client";

import { ListingEmpty, ListingError } from "@/components/listing-states";
import { ListingSkeletons } from "@/components/listing-skeletons";
import { ListingTableHead } from "@/components/listing-table-head";
import { ListingToolbar } from "@/components/listing-toolbar";
import { PaginationControls } from "@/components/pagination-controls";
import { ProductCard } from "@/components/product-card";
import { ProductRow } from "@/components/product-row";
import { ViewToggle } from "@/components/view-toggle";
import { Table, TableBody } from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useCategories } from "@/hooks/use-categories";
import { fetchProducts } from "@/services/client";
import { PAGE_SIZE } from "@/store/constants";
import { useFavs } from "@/store/favs-context";
import { useFilters } from "@/store/filter-context";
import { useLocalProducts } from "@/store/local-products-context";
import { useToasts } from "@/store/toast-context";
import { ApiError } from "@/types/api-error";
import type { Product } from "@/types/product";
import type { SortBy, SortOrder } from "@/types/store";
import { compareProducts, revealDelay } from "@/utils/format";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const { filters, setFilter, resetFilters, view, setView } = useFilters();
  const { isFav, toggleFav } = useFavs();
  const { localProducts } = useLocalProducts();
  const { pushToast } = useToasts();
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  const [items, setItems] = useState<Product[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const categories = useCategories();
  const [status, setStatus] = useState<Status>("loading");
  const [retryToken, setRetryToken] = useState(0);
  const requestRef = useRef(0);

  const defaultView = useMemo(
    () =>
      isDefaultView(
        debouncedSearch,
        filters.category,
        filters.sortBy,
        filters.order,
        filters.page,
      ),
    [
      debouncedSearch,
      filters.category,
      filters.sortBy,
      filters.order,
      filters.page,
    ],
  );

  const refetch = useCallback(() => {
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
        if (localProducts.length > 0 && defaultView) {
          combined = [...localProducts, ...combined];
        }
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
    defaultView,
    pushToast,
    setFilter,
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: retryToken intentionally retriggers refetch
  useEffect(() => {
    refetch();
  }, [refetch, retryToken]);

  const displayTotal = defaultView
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
      {status === "loading" && <ListingSkeletons view={view} />}
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
            <div className="flex items-center justify-between gap-3">
              <p aria-live="polite" className="text-sm text-muted-foreground">
                {displayTotal} {displayTotal === 1 ? "product" : "products"}
              </p>
              <ViewToggle view={view} onChange={setView} />
            </div>
            {view === "cards" ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((product, index) => (
                  <div
                    key={product.id}
                    className="reveal h-full"
                    style={
                      {
                        "--reveal-delay": revealDelay(index),
                      } as React.CSSProperties
                    }
                  >
                    <ProductCard
                      product={product}
                      isFav={isFav(product.id)}
                      onToggleFav={toggleFav}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <section
                className="overflow-x-auto rounded-lg border"
                // biome-ignore lint/a11y/noNoninteractiveTabindex: scroll region keyboard access
                tabIndex={0}
                aria-label="Products table"
              >
                <Table className="min-w-[720px]">
                  <ListingTableHead />
                  <TableBody>
                    {items.map((product, index) => (
                      <ProductRow
                        key={product.id}
                        index={index}
                        product={product}
                        isFav={isFav(product.id)}
                        onToggleFav={toggleFav}
                      />
                    ))}
                  </TableBody>
                </Table>
              </section>
            )}
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
