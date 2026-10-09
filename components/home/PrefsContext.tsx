"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useLuomoPreferences } from "@/hooks/useLuomoPreferences";

type PrefsHandle = ReturnType<typeof useLuomoPreferences>;

const Context = createContext<PrefsHandle | null>(null);

/** One preferences owner per page, so a stale copy can never overwrite another field. */
export function PrefsProvider({ children }: { children: ReactNode }) {
  const handle = useLuomoPreferences();
  return <Context.Provider value={handle}>{children}</Context.Provider>;
}

export function usePrefs() {
  const handle = useContext(Context);
  if (!handle) throw new Error("usePrefs requires PrefsProvider");
  return handle;
}
