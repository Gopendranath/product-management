"use client";

import { STORAGE_KEYS } from "@/store/constants";
import { isBoolean, loadJson, saveJson } from "@/store/storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface MockAuthContextValue {
  /** Demo-only flag. Trivially bypassable; gates /products/new only. */
  loggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const MockAuthContext = createContext<MockAuthContextValue | null>(null);

export function MockAuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  // Deferred storage read: SSR + first client render use false so hydration matches.
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    setLoggedIn(loadJson(STORAGE_KEYS.auth, false, isBoolean));
  }, []);

  const persist = useCallback((value: boolean) => {
    setLoggedIn(value);
    saveJson(STORAGE_KEYS.auth, value);
  }, []);

  const login = useCallback(() => persist(true), [persist]);
  const logout = useCallback(() => persist(false), [persist]);

  const value = useMemo(
    () => ({ loggedIn, login, logout }),
    [loggedIn, login, logout],
  );
  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth(): MockAuthContextValue {
  const context = useContext(MockAuthContext);
  if (!context)
    throw new Error("useMockAuth must be used within MockAuthProvider");
  return context;
}
