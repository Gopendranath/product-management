"use client";

import { Button } from "@/components/ui/button";
import { useToasts } from "@/store/toast-context";
import { cn } from "cn";
import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react";

/** Live-region toast stack. Queue rules (dedupe, max 3, dismiss) live in context. */
export function Toaster(): React.JSX.Element {
  const { toasts, dismissToast } = useToasts();
  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-0 top-4 z-40 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border border-transparent px-4 py-2 shadow-lg",
            toast.kind === "success"
              ? "bg-success text-success-text"
              : "bg-error text-error-text",
          )}
        >
          {toast.kind === "success" ? (
            <CheckCircle
              aria-hidden
              weight="fill"
              className="size-5 shrink-0"
            />
          ) : (
            <WarningCircle
              aria-hidden
              weight="fill"
              className="size-5 shrink-0"
            />
          )}
          <p className="flex-1 text-sm leading-snug">{toast.message}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(toast.id)}
            className="-mr-2 min-h-[44px] min-w-[44px] shrink-0 opacity-70 hover:opacity-100"
          >
            <X aria-hidden />
          </Button>
        </div>
      ))}
    </div>
  );
}
