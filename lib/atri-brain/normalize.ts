import type { AtriBrainResponse } from "./types";
import {
  isDangerousRequest,
  sanitizeExpression,
  sanitizeForm,
  sanitizeMood,
  sanitizeMotion,
} from "./safety";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function normalizeBrainOutput(
  input: unknown,
  allowSecret: boolean,
  allowDebug: boolean
): AtriBrainResponse {
  const raw = record(input);
  if (isDangerousRequest(String(raw.originalMessage || ""))) {
    return {
      ok: false,
      source: "fallback",
      text: "This request requires owner confirmation. ATRI cannot perform privileged operations.",
      mood: "warning",
      form: "default",
      expression: "surprised",
      motion: "alert",
      refusal: "unsafe_request",
    };
  }
  if (!Object.keys(raw).length) {
    return {
      ok: false,
      source: "fallback",
      text: "ATRI could not parse that response. The local fallback remains available.",
      mood: "system",
      form: "default",
    };
  }

  const rawSource = String(raw.source || "scripted");
  const source: AtriBrainResponse["source"] =
    rawSource === "ai" || rawSource === "fallback" ? rawSource : "scripted";
  return {
    ok: true,
    source,
    text: String(raw.text || "").slice(0, 200),
    mood: sanitizeMood(String(raw.mood || "idle")),
    form: sanitizeForm(raw.form ? String(raw.form) : undefined, allowSecret, allowDebug),
    expression: sanitizeExpression(raw.expression ? String(raw.expression) : undefined),
    motion: sanitizeMotion(raw.motion ? String(raw.motion) : undefined),
    emotionStrength: Math.min(1, Math.max(0, Number(raw.emotionStrength) || 0)),
  };
}
