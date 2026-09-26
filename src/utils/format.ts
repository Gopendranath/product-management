/** Listing view-model helpers. Pure. */

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

export function compareProducts(
  sortBy: "price" | "rating" | "id",
  order: "asc" | "desc",
): (
  a: { price: number; rating: number; id: number },
  b: { price: number; rating: number; id: number },
) => number {
  const direction = order === "asc" ? 1 : -1;
  return (a, b) => (a[sortBy] - b[sortBy]) * direction;
}
