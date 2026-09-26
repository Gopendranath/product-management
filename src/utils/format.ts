/** Listing view-model helpers. Pure. */
import type { SortBy, SortOrder } from "@/types/store";

export type StockStatus = "in-stock" | "low" | "out";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(price: number): string {
  return priceFormatter.format(price);
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out";
  if (stock <= 5) return "low";
  return "in-stock";
}

export const STOCK_LABEL: Record<StockStatus, string> = {
  "in-stock": "In stock",
  low: "Low stock",
  out: "Out of stock",
};

export const STOCK_BADGE_CLASS: Record<StockStatus, string> = {
  "in-stock": "bg-success text-success-text",
  low: "bg-warn text-warn-text",
  out: "bg-error text-error-text",
};

export function revealDelay(index: number): string {
  return `${Math.min(index * 60, 600)}ms`;
}

export function compareProducts(
  sortBy: SortBy,
  order: SortOrder,
): (
  a: { price: number; rating: number; id: number },
  b: { price: number; rating: number; id: number },
) => number {
  const direction = order === "asc" ? 1 : -1;
  return (a, b) => (a[sortBy] - b[sortBy]) * direction;
}
