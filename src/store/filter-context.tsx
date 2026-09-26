"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { STORAGE_KEYS } from "@/store/constants";
import { loadJson, saveJson } from "@/store/storage";
import type {
  FilterResetKey,
  FilterState,
  SortBy,
  SortOrder,
  ViewMode,
} from "@/types/store";

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  category: "all",
  sortBy: "id",
  order: "asc",
  page: 1,
};

const RESET_KEYS: readonly FilterResetKey[] = [
  "search",
  "category",
  "sortBy",
  "order",
];

export function isSortBy(value: unknown): value is SortBy {
  return value === "price" || value === "rating" || value === "id";
}

export function isSortOrder(value: unknown): value is SortOrder {
  return value === "asc" || value === "desc";
}

export function isViewMode(value: unknown): value is ViewMode {
  return value === "cards" || value === "table";
}

/**
 * Pure filter transition. Returns the next state; invalid keys are ignored
 * (caller logs). Page resets to 1 when a filter key is present, unless an
 * explicit page is provided alongside it.
 */
export function reduceFilters(
  state: FilterState,
  partial: Partial<FilterState>,
): FilterState {
  const next: FilterState = { ...state };
  if (partial.search !== undefined) next.search = partial.search.trim();
  if (partial.category !== undefined && partial.category !== "")
    next.category = partial.category;
  if (partial.sortBy !== undefined) {
    if (isSortBy(partial.sortBy)) next.sortBy = partial.sortBy;
    else return state;
  }
  if (partial.order !== undefined) {
    if (isSortOrder(partial.order)) next.order = partial.order;
    else return state;
  }
  if (partial.page !== undefined) {
    if (!Number.isInteger(partial.page) || partial.page < 1) return state;
    next.page = partial.page;
  } else if (RESET_KEYS.some((key) => partial[key] !== undefined)) {
    next.page = 1;
  }
  return next;
}

interface FilterContextValue {
  filters: FilterState;
  setFilter: (partial: Partial<FilterState>) => void;
  resetFilters: () => void;
  view: ViewMode;
  setView: (view: ViewMode) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  // SSR + first client render use cards; stored choice loads post-mount.
  const [view, setViewState] = useState<ViewMode>("cards");
  const [viewHydrated, setViewHydrated] = useState(false);

  useEffect(() => {
    setViewState(loadJson(STORAGE_KEYS.view, "cards", isViewMode));
    setViewHydrated(true);
  }, []);

  useEffect(() => {
    if (viewHydrated) saveJson(STORAGE_KEYS.view, view);
  }, [view, viewHydrated]);

  const setView = useCallback((mode: ViewMode) => {
    if (isViewMode(mode)) setViewState(mode);
  }, []);

  const setFilter = useCallback((partial: Partial<FilterState>) => {
    setFilters((previous) => reduceFilters(previous, partial));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const value = useMemo(
    () => ({ filters, setFilter, resetFilters, view, setView }),
    [filters, setFilter, resetFilters, view, setView],
  );
  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context)
    throw new Error("useFilters must be used within FilterProvider");
  return context;
}
