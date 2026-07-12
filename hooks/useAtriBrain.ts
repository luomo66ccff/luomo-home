"use client";

import { useCallback, useRef, useState } from "react";
import type { AtriBrainRequest, AtriBrainResponse } from "@/lib/atri-brain/types";
import { releaseModelChatLock, tryAcquireModelChatLock } from "@/lib/modelChatLock";

export function useAtriBrain() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AtriBrainResponse | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const askAtri = useCallback(async (
    message: string,
    context?: AtriBrainRequest["context"]
  ): Promise<AtriBrainResponse> => {
    if (!tryAcquireModelChatLock()) {
      return {
        ok: false,
        source: "fallback",
        text: "ATRI is already responding. Please wait a moment.",
        mood: "focused",
      };
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/atri/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context }),
        signal: controller.signal,
      });
      const data = (await response.json()) as AtriBrainResponse;
      setLastResponse(data);
      return data;
    } catch (caught: unknown) {
      if (!(caught instanceof DOMException && caught.name === "AbortError")) {
        setError(caught instanceof Error ? caught.message : "Unknown request error");
      }
      return {
        ok: false,
        source: "fallback",
        text: "ATRI is temporarily unavailable. Please try again later.",
        mood: "idle",
      };
    } finally {
      setLoading(false);
      if (abortRef.current === controller) abortRef.current = null;
      releaseModelChatLock();
    }
  }, []);

  return { askAtri, loading, error, lastResponse };
}
