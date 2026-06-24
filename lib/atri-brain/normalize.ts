import type { AtriBrainResponse } from "./types";
import { sanitizeMood, sanitizeForm, sanitizeExpression, sanitizeMotion, isDangerousRequest } from "./safety";

export function normalizeBrainOutput(raw: any, allowSecret: boolean, allowDebug: boolean): AtriBrainResponse {
  if (isDangerousRequest(raw?.originalMessage || "")) {
    return { ok: false, source: "fallback", text: "这类操作需要主人亲自确认。ATRI 只能守望云端状态，不能替你执行危险命令。", mood: "warning", form: "default", expression: "surprised", motion: "alert", refusal: "unsafe_request" };
  }
  if (!raw || typeof raw !== "object") {
    return { ok: false, source: "fallback", text: "ATRI 暂时无法解析这个请求。云端航路保持稳定。", mood: "system", form: "default" };
  }
  return {
    ok: true,
    source: raw.source || "scripted",
    text: String(raw.text || "").slice(0, 200),
    mood: sanitizeMood(raw.mood) as any,
    form: sanitizeForm(raw.form, allowSecret, allowDebug),
    expression: sanitizeExpression(raw.expression),
    motion: sanitizeMotion(raw.motion),
    emotionStrength: Math.min(1, Math.max(0, Number(raw.emotionStrength) || 0)),
  };
}
