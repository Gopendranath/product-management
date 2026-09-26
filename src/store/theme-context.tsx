"use client";

import type { ThemeMode } from "@/types/store";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import { STORAGE_KEYS } from "@/store/constants";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";

interface ThemeContextValue {
  /** Resolved mode. SSR + first paint fall back to light, then system. */
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function ThemeBridge({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { theme, setTheme } = useNextTheme();
  const resolved: ThemeMode = theme === "dark" ? "dark" : "light";
  const appliedSystem = useRef(false);

  // LLD rule: SSR + first paint are light; the client applies the system
  // preference only when nothing is stored. Stored values win untouched.
  useEffect(() => {
    if (appliedSystem.current) return;
    appliedSystem.current = true;
    try {
      if (
        window.localStorage.getItem(STORAGE_KEYS.theme) === null &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        setTheme("dark");
      }
    } catch {
      // Storage or matchMedia unavailable: stay light.
    }
  }, [setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: resolved,
      setTheme: (mode: ThemeMode) => setTheme(mode),
      toggleTheme: () => setTheme(resolved === "dark" ? "light" : "dark"),
    }),
    [resolved, setTheme],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hydration-safe theme. next-themes owns the document class + persistence
 * (key theme-v1) with an explicit light default; the bridge applies the
 * system preference once when nothing is stored.
 */
export function AppThemeProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <NextThemesProvider
      attribute="class"
      storageKey={STORAGE_KEYS.theme}
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <ThemeBridge>{children}</ThemeBridge>
    </NextThemesProvider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useAppTheme must be used within AppThemeProvider");
  return context;
}
