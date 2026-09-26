"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMockAuth } from "@/store/mock-auth-context";
import { useAppTheme } from "@/store/theme-context";
import { useToasts } from "@/store/toast-context";
import { cn } from "cn";
import {
  List,
  Moon,
  Package,
  Plus,
  SignIn,
  SignOut,
  SquaresFour,
  Sun,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Products", icon: SquaresFour },
  { href: "/products/new", label: "Add product", icon: Plus },
] as const;

function ThemeToggle(): React.JSX.Element {
  const { theme, toggleTheme } = useAppTheme();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      aria-pressed={theme === "dark"}
      onClick={toggleTheme}
      title="Theme persists across visits"
      className="min-h-[44px] min-w-[44px]"
    >
      {theme === "dark" ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </Button>
  );
}

function AuthButton({ onDone }: { onDone?: () => void }): React.JSX.Element {
  const { loggedIn, login, logout } = useMockAuth();
  const { pushToast } = useToasts();
  return (
    <Button
      type="button"
      variant={loggedIn ? "outline" : "default"}
      onClick={() => {
        if (loggedIn) {
          logout();
          pushToast("auth", "success", "Signed out of the demo account.");
        } else {
          login();
          pushToast("auth", "success", "Signed in with the demo account.");
        }
        onDone?.();
      }}
      title="Demo-only sign-in; gates the add form"
      className="min-h-[44px]"
    >
      {loggedIn ? (
        <SignOut data-icon="inline-start" aria-hidden />
      ) : (
        <SignIn data-icon="inline-start" aria-hidden />
      )}
      {loggedIn ? "Sign out" : "Sign in"}
    </Button>
  );
}

function MobileMenu({ pathname }: { pathname: string }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!open) {
      setRevealed(false);
      return;
    }
    const frame = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative min-h-[44px] min-w-[44px] lg:hidden"
      >
        <List
          aria-hidden
          className={cn(
            "absolute size-5 transition duration-200 ease-out",
            open ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
          )}
        />
        <X
          aria-hidden
          className={cn(
            "absolute size-5 transition duration-200 ease-out",
            open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0",
          )}
        />
      </Button>
      <SheetContent side="top" showCloseButton={false} aria-label="Menu">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <nav aria-label="Mobile" className="flex flex-col gap-1 p-4 pt-2">
          {NAV_LINKS.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={() => setOpen(false)}
                style={{
                  transitionDelay: revealed ? `${index * 60}ms` : "0ms",
                }}
                className={cn(
                  "inline-flex min-h-[44px] items-center gap-3 rounded-md px-3 text-base font-medium transition duration-200 ease-out",
                  revealed
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-2 opacity-0",
                  pathname === link.href
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Icon aria-hidden className="size-5" />
                {link.label}
              </Link>
            );
          })}
          <div
            style={{
              transitionDelay: revealed ? `${NAV_LINKS.length * 60}ms` : "0ms",
            }}
            className={cn(
              "pt-2 transition duration-200 ease-out",
              revealed
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0",
            )}
          >
            <AuthButton onDone={() => setOpen(false)} />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

/** 64px sticky translucent bar. Single-line desktop, hamburger below lg. */
export function SiteHeader(): React.JSX.Element {
  const pathname = usePathname();
  // Personalized controls render post-mount so the first client render
  // matches SSR (stored theme/auth would otherwise mismatch hydration).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between gap-4 px-4">
        <Link
          href="/"
          aria-label="Product Dashboard home"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-sm text-base font-semibold whitespace-nowrap"
        >
          <Package aria-hidden weight="fill" className="size-5 text-accent" />
          Product Dashboard
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "inline-flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors",
                pathname === link.href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          {mounted ? (
            <>
              <ThemeToggle />
              <div className="hidden lg:block">
                <AuthButton />
              </div>
            </>
          ) : (
            // Size-matched reserve: prevents header CLS between SSR and mount.
            <div aria-hidden className="flex items-center gap-1">
              <span className="min-h-[44px] min-w-[44px]" />
              <span className="hidden min-h-[44px] min-w-20 lg:block" />
            </div>
          )}
          <MobileMenu pathname={pathname} />
        </div>
      </div>
    </header>
  );
}
