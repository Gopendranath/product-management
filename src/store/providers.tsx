"use client";

import { FavsProvider } from "@/store/favs-context";
import { FilterProvider } from "@/store/filter-context";
import { LocalProductsProvider } from "@/store/local-products-context";
import { MockAuthProvider } from "@/store/mock-auth-context";
import { AppThemeProvider } from "@/store/theme-context";
import { ToastProvider } from "@/store/toast-context";

/**
 * Split providers; no mega-store. Toast sits outside Favs so quota-full
 * can toast while staying in memory.
 */
export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <AppThemeProvider>
      <ToastProvider>
        <FilterProvider>
          <FavsProvider>
            <LocalProductsProvider>
              <MockAuthProvider>{children}</MockAuthProvider>
            </LocalProductsProvider>
          </FavsProvider>
        </FilterProvider>
      </ToastProvider>
    </AppThemeProvider>
  );
}
