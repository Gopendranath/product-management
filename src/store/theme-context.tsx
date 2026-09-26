"use client";

import { STORAGE_KEYS } from "@/store/constants";
import { isThemeMode, saveJson } from "@/store/storage";
import type { ThemeMode } from "@/types/store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface ThemeContextValue {
  /** Resolved mode. SSR + first paint fall back to light, then stored/system. */
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyMode(mode: ThemeMode): void {
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.documentElement.style.colorScheme = mode;
}

function readStoredTheme(): ThemeMode | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STORAGE_KEYS.theme);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return isThemeMode(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Hydration-safe theme. State starts light (matching SSR); stored or system
 * mode applies post-mount. A blocking head script in the root layout paints
 * the right mode even earlier. Class strategy, key theme-v1.
 */
export function AppThemeProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    const stored = readStoredTheme();
    const initial =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setThemeState(initial);
    applyMode(initial);
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    applyMode(mode);
    saveJson(STORAGE_KEYS.theme, mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useAppTheme must be used within AppThemeProvider");
  return context;
}
