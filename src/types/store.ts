/** Shared store shapes. */

/** Filter keys that reset page to 1 on change. */
export type FilterResetKey = "search" | "category" | "sortBy" | "order";
export type SortBy = "price" | "rating" | "id";
export type SortOrder = "asc" | "desc";
export type ViewMode = "cards" | "table";

export interface FilterState {
  search: string;
  category: string;
  sortBy: SortBy;
  order: SortOrder;
  page: number;
}

export type ThemeMode = "light" | "dark";

export type ToastKind = "success" | "error";

export interface ToastItem {
  id: string;
  actionKey: string;
  kind: ToastKind;
  message: string;
}
