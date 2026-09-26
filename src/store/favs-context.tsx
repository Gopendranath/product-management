"use client";

import { STORAGE_KEYS } from "@/store/constants";
import { isNumberArray, loadJson, saveJson } from "@/store/storage";
import { useToasts } from "@/store/toast-context";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface FavsContextValue {
  favIds: number[];
  isFav: (id: number) => boolean;
  toggleFav: (id: number) => boolean;
}

const FavsContext = createContext<FavsContextValue | null>(null);

export function FavsProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { pushToast } = useToasts();
  // Deferred storage read: SSR + first client render use [], the stored
  // value loads post-mount so hydration matches.
  const [favIds, setFavIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFavIds(loadJson(STORAGE_KEYS.favs, [], isNumberArray));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const saved = saveJson(STORAGE_KEYS.favs, favIds);
    if (!saved) {
      pushToast(
        "favs-persist",
        "error",
        "Favourites kept for this session only.",
      );
    }
  }, [favIds, hydrated, pushToast]);

  const isFav = useCallback((id: number) => favIds.includes(id), [favIds]);

  const toggleFav = useCallback(
    (id: number): boolean => {
      const added = !favIds.includes(id);
      setFavIds((previous) =>
        previous.includes(id)
          ? previous.filter((favId) => favId !== id)
          : [...previous, id],
      );
      return added;
    },
    [favIds],
  );

  const value = useMemo(
    () => ({ favIds, isFav, toggleFav }),
    [favIds, isFav, toggleFav],
  );
  return <FavsContext.Provider value={value}>{children}</FavsContext.Provider>;
}

export function useFavs(): FavsContextValue {
  const context = useContext(FavsContext);
  if (!context) throw new Error("useFavs must be used within FavsProvider");
  return context;
}
