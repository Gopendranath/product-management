"use client";

import { Button } from "@/components/ui/button";
import { useToasts } from "@/store/toast-context";
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
          role="status"
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-surface px-4 py-3 text-ink shadow-lg"
        >
          {toast.kind === "success" ? (
            <CheckCircle
              aria-hidden
              weight="fill"
              className="mt-0.5 size-5 shrink-0 text-success-text"
            />
          ) : (
            <WarningCircle
              aria-hidden
              weight="fill"
              className="mt-0.5 size-5 shrink-0 text-error-text"
            />
          )}
          <p className="min-h-[44px] flex-1 text-sm leading-snug">
            {toast.message}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(toast.id)}
            className="min-h-[44px] min-w-[44px] shrink-0"
          >
            <X aria-hidden />
          </Button>
        </div>
      ))}
    </div>
  );
}
