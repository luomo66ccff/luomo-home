"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AtriBrainRequest, AtriBrainResponse } from "@/lib/atri-brain/types";
import { acquireModelChatLock, releaseModelChatLock, type ModelChatLockToken } from "@/lib/modelChatLock";

export const ATRI_BRAIN_TIMEOUT_MS = 20_000;

export type AtriBrainHandle = {
  askAtri: (
    message: string,
    context?: AtriBrainRequest["context"]
  ) => Promise<AtriBrainResponse>;
  loading: boolean;
  error: string | null;
  lastResponse: AtriBrainResponse | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAtriBrainResponse(value: unknown): value is AtriBrainResponse {
  const validMoods = ["idle", "welcome", "curious", "focused", "excited", "sleepy", "secret", "system", "warning", "greeting"];
  return isRecord(value)
    && typeof value.ok === "boolean"
    && (value.source === "scripted" || value.source === "fallback" || value.source === "ai")
    && typeof value.text === "string" && value.text.trim().length > 0
    && typeof value.mood === "string"
    && validMoods.includes(value.mood);
}

function errorMessage(caught: unknown, timedOut: boolean): string {
  if (timedOut) return "ATRI 请求超时（20 秒），请稍后重试。";
  if (caught instanceof Error && caught.message) return caught.message;
  return "ATRI 请求失败，请稍后重试。";
}

function isAbortError(caught: unknown): boolean {
  return typeof DOMException !== "undefined" && caught instanceof DOMException && caught.name === "AbortError";
}

function fallbackResponse(text: string): AtriBrainResponse {
  return { ok: false, source: "fallback", text, mood: "warning" };
}

export function useAtriBrain(): AtriBrainHandle {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AtriBrainResponse | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lockTokenRef = useRef<ModelChatLockToken | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      abortRef.current = null;
      const token = lockTokenRef.current;
      lockTokenRef.current = null;
      if (token) releaseModelChatLock(token);
    };
  }, []);

  const askAtri = useCallback(async (
    message: string,
    context?: AtriBrainRequest["context"]
  ): Promise<AtriBrainResponse> => {
    if (!mountedRef.current) return fallbackResponse("对话已关闭。");
    const normalizedMessage = message.trim();
    if (!normalizedMessage) {
      const response = fallbackResponse("请输入想对 ATRI 说的话。");
      if (mountedRef.current) setError("请输入想对 ATRI 说的话。");
      return response;
    }

    const lockToken = acquireModelChatLock();
    if (!lockToken) {
      const response = fallbackResponse("ATRI 正在回复，请稍候再试。");
      if (mountedRef.current) setError("ATRI 正在回复，请稍候再试。");
      return response;
    }

    const controller = new AbortController();
    let timedOut = false;
    abortRef.current = controller;
    lockTokenRef.current = lockToken;
    const isCurrent = () => mountedRef.current && abortRef.current === controller;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, ATRI_BRAIN_TIMEOUT_MS);

    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await fetch("/api/atri/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: normalizedMessage, context }),
        signal: controller.signal,
      });

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new Error("ATRI 返回了无效 JSON。");
      }

      if (!response.ok) {
        const serverMessage = isRecord(payload) && typeof payload.text === "string"
          ? payload.text
          : `ATRI 请求失败（HTTP ${response.status}）。`;
        throw new Error(serverMessage);
      }

      if (!isAtriBrainResponse(payload)) {
        throw new Error("ATRI 返回数据格式无效。");
      }

      if (isCurrent()) {
        setLastResponse(payload);
        setError(null);
      }
      return payload;
    } catch (caught: unknown) {
      // An unmount abort is intentionally silent. The lock is still released
      // in finally so a later mounted panel can send normally.
      if (!(isAbortError(caught) && !timedOut) && isCurrent()) {
        setError(errorMessage(caught, timedOut));
      }
      return fallbackResponse(
        timedOut ? "ATRI 请求超时，请稍后重试。" : "ATRI 暂时无法回应，请稍后重试。"
      );
    } finally {
      clearTimeout(timeoutId);
      if (isCurrent()) setLoading(false);
      if (abortRef.current === controller) abortRef.current = null;
      if (lockTokenRef.current === lockToken) lockTokenRef.current = null;
      // releaseModelChatLock is idempotent; this also covers an abort race
      // between unmount cleanup and the request's finally block.
      releaseModelChatLock(lockToken);
    }
  }, []);

  return { askAtri, loading, error, lastResponse };
}
