"use client";

export type Live2DDebugEntry = {
  time: string;
  step: string;
  level: "info" | "success" | "warn" | "error";
  detail?: unknown;
};

const live2dDebugEntries: Live2DDebugEntry[] = [];

function sanitize(detail: unknown): unknown {
  if (!detail) return detail;
  if (detail instanceof Error) return { name: detail.name, message: detail.message };
  try {
    return JSON.parse(JSON.stringify(detail));
  } catch {
    return String(detail);
  }
}

export function pushLive2DDebug(
  level: Live2DDebugEntry["level"],
  step: string,
  detail?: unknown
) {
  const entry: Live2DDebugEntry = {
    time: new Date().toLocaleTimeString(),
    level,
    step,
    detail: sanitize(detail),
  };
  live2dDebugEntries.push(entry);
  if (live2dDebugEntries.length > 200) live2dDebugEntries.shift();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("atri:live2d-debug", { detail: entry }));
  }

  const consoleEnabled =
    level === "error" ||
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === "true";
  if (consoleEnabled) {
    const logger = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
    logger("[ATRI Live2D] " + step, detail ?? "");
  }
}

export function getLive2DDebugEntries() {
  return live2dDebugEntries;
}
