"use client";

import type { AddProductPayload, Product } from "@/types/product";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

/** Pure temp-id assignment. Decrements on same-ms collision. */
export function nextTempId(existing: readonly number[]): number {
  let id = -Date.now();
  const taken = new Set(existing);
  while (taken.has(id)) id -= 1;
  return id;
}

interface LocalProductsContextValue {
  localProducts: Product[];
  addLocal: (data: AddProductPayload) => number;
}

const LocalProductsContext = createContext<LocalProductsContextValue | null>(
  null,
);

export function LocalProductsProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  // Monotonic guard: same-tick double adds must not share an id.
  const lastIdRef = useRef(0);
  const idsRef = useRef<Set<number>>(new Set());
  idsRef.current = new Set(localProducts.map((product) => product.id));

  const addLocal = useCallback((data: AddProductPayload): number => {
    const candidate = nextTempId([...idsRef.current]);
    const assigned =
      lastIdRef.current === 0
        ? candidate
        : Math.min(candidate, lastIdRef.current - 1);
    lastIdRef.current = assigned;
    idsRef.current.add(assigned);
    const thumbnail =
      data.thumbnail ??
      `https://picsum.photos/seed/product-${assigned}/600/450`;
    const product: Product = {
      ...data,
      id: assigned,
      rating: 0,
      discountPercentage: 0,
      thumbnail,
      images: [thumbnail],
    };
    setLocalProducts((previous) =>
      previous.some((item) => item.id === assigned)
        ? previous
        : [product, ...previous],
    );
    return assigned;
  }, []);

  const value = useMemo(
    () => ({ localProducts, addLocal }),
    [localProducts, addLocal],
  );
  return (
    <LocalProductsContext.Provider value={value}>
      {children}
    </LocalProductsContext.Provider>
  );
}

export function useLocalProducts(): LocalProductsContextValue {
  const context = useContext(LocalProductsContext);
  if (!context)
    throw new Error(
      "useLocalProducts must be used within LocalProductsProvider",
    );
  return context;
}
