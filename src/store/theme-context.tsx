"use client";

import type { ThemeMode } from "@/types/store";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import { createContext, useContext, useMemo } from "react";
import { STORAGE_KEYS } from "@/store/constants";

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
  const { resolvedTheme, setTheme } = useNextTheme();
  const theme: ThemeMode = resolvedTheme === "dark" ? "dark" : "light";

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: (mode: ThemeMode) => setTheme(mode),
      toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
    }),
    [theme, setTheme],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hydration-safe theme. next-themes owns the document class + persistence
 * (key theme-v1); SSR renders light and the client applies stored/system mode.
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
      defaultTheme="system"
      enableSystem
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
