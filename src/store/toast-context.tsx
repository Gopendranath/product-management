"use client";

import { TOAST_DURATION_MS, TOAST_MAX_COUNT } from "@/store/constants";
import type { ToastItem, ToastKind } from "@/types/store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Pure queue transition. Same actionKey replaces the existing toast;
 * otherwise appends and evicts oldest beyond the max.
 */
export function enqueueToast(
  queue: ToastItem[],
  toast: ToastItem,
): ToastItem[] {
  const rest = queue.filter((item) => item.actionKey !== toast.actionKey);
  return [...rest, toast].slice(-TOAST_MAX_COUNT);
}

interface ToastContextValue {
  toasts: ToastItem[];
  pushToast: (
    actionKey: string,
    kind: ToastKind,
    message: string,
  ) => string | null;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) clearTimeout(timer);
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (actionKey: string, kind: ToastKind, message: string): string | null => {
      if (!message) return null;
      counter.current += 1;
      const toast: ToastItem = {
        id: `toast-${counter.current}`,
        actionKey,
        kind,
        message,
      };
      setToasts((previous) => enqueueToast(previous, toast));
      const timer = setTimeout(() => dismissToast(toast.id), TOAST_DURATION_MS);
      timers.current.push(timer);
      return toast.id;
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({ toasts, pushToast, dismissToast }),
    [toasts, pushToast, dismissToast],
  );
  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToasts(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToasts must be used within ToastProvider");
  return context;
}
