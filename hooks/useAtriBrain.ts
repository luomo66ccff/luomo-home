"use client";
import { useState, useCallback, useRef } from "react";
import type { AtriBrainResponse } from "@/lib/atri-brain/types";

export function useAtriBrain() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AtriBrainResponse | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const askAtri = useCallback(async (message: string, context?: any) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/atri/brain", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context }), signal: ctrl.signal,
      });
      const data = await res.json();
      setLastResponse(data);
      return data;
    } catch (e: any) {
      if (e.name !== "AbortError") { setError(e.message); }
      return { ok: false, source: "fallback", text: "ATRI 暂时无法回应。", mood: "idle" };
    } finally {
      setLoading(false);
    }
  }, []);

  return { askAtri, loading, error, lastResponse };
}
