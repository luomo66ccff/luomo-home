"use client";
import { useState, useCallback, useRef } from "react";
import type { AtriBrainResponse } from "@/lib/atri-brain/types";
import { releaseModelChatLock, tryAcquireModelChatLock } from "@/lib/modelChatLock";

export function useAtriBrain() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AtriBrainResponse | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const askAtri = useCallback(async (message: string, context?: any) => {
    if (!tryAcquireModelChatLock()) {
      return { ok: false, source: "client-locked", text: "ATRI 正在回复中，请稍等一下。", mood: "focused" };
    }

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
      return { ok: false, source: "fallback", text: "模型暂时没有回应，请稍后再试。", mood: "idle" };
    } finally {
      setLoading(false);
      if (abortRef.current === ctrl) abortRef.current = null;
      releaseModelChatLock();
    }
  }, []);

  return { askAtri, loading, error, lastResponse };
}
