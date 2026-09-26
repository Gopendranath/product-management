"use client";

/**
 * Shadcn file-location convention for the theme provider.
 * Engine: blocking head script + context owning the .dark/theme-v1 contract
 * (see `@/store/theme-context`). Same DOM behavior the shadcn dark-mode docs
 * prescribe, without next-themes' in-tree script warning on Next 16.
 */
export {
  AppThemeProvider as ThemeProvider,
  useAppTheme,
} from "@/store/theme-context";
