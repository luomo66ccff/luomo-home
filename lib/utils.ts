export function isoNow() {
  return new Date().toISOString();
}

export function clampStatus(value: unknown) {
  const status = String(value || "").toLowerCase();
  if (["operational", "ok", "healthy", "up"].includes(status)) return "operational";
  if (["degraded", "warning", "partial"].includes(status)) return "degraded";
  if (["down", "error", "failed", "offline"].includes(status)) return "down";
  return "unknown";
}

export function sanitizePublicPayload(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object") return {};
  const blocked = /(secret|token|cookie|authorization|private[_-]?key|ssh[_-]?key|password|r2[_-]?key|cos[_-]?key|smtp|traceback|internal path)/i;
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (blocked.test(key)) continue;
    if (typeof value === "string" && blocked.test(value)) continue;
    if (["string", "number", "boolean"].includes(typeof value) || value === null) {
      output[key] = value;
    }
  }
  return output;
}

export function getTimeoutMs() {
  const seconds = Number(process.env.STATUS_FETCH_TIMEOUT_SECONDS || "5");
  return Math.max(1000, Math.min(15000, seconds * 1000));
}
