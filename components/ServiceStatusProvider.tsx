"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { parseSignals, signalMetrics, type SignalsPayload } from "@/lib/service-signals";

type StatusContext = { data: SignalsPayload | null; loading: boolean; error: string | null; refresh: () => Promise<void>; metrics: ReturnType<typeof signalMetrics> };
const Context = createContext<StatusContext | null>(null);

export function ServiceStatusProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SignalsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort("timeout"), 35000);
    setLoading(true);
    try {
      const response = await fetch("/api/services", { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("Status unavailable");
      const next = parseSignals(await response.json());
      if (!controller.signal.aborted) { setData(next); setError(null); }
    } catch {
      if (controller.signal.reason !== "unmount") setError("暂时无法获取状态，请稍后重试。");
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null;
        if (controller.signal.reason !== "unmount") setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => { if (!document.hidden) void refresh(); }, 60000);
    const onVisibility = () => { if (!document.hidden) void refresh(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      request.current?.abort("unmount");
      request.current = null;
    };
  }, [refresh]);
  const metrics = useMemo(() => signalMetrics(data?.services ?? []), [data]);
  return <Context.Provider value={{ data, loading, error, refresh, metrics }}>{children}</Context.Provider>;
}

export function useServiceStatus() {
  const context = useContext(Context);
  if (!context) throw new Error("useServiceStatus requires ServiceStatusProvider");
  return context;
}
