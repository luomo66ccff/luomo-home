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

const BLOCKED_PUBLIC_FIELD = /(secret|token|cookie|authorization|private[_-]?key|ssh[_-]?key|password|r2[_-]?key|cos[_-]?key|smtp|traceback|internal path)/i;
const MAX_PUBLIC_DEPTH = 4;
const MAX_PUBLIC_ITEMS = 50;

type PublicValue = string | number | boolean | null | PublicValue[] | { [key: string]: PublicValue };

function sanitizePublicValue(
  value: unknown,
  depth: number,
  seen: WeakSet<object>
): PublicValue | undefined {
  if (depth > MAX_PUBLIC_DEPTH) return undefined;
  if (value === null) return null;
  if (typeof value === "string") {
    return BLOCKED_PUBLIC_FIELD.test(value) ? undefined : value;
  }
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean") return value;
  if (typeof value !== "object" || seen.has(value)) return undefined;

  seen.add(value);
  if (Array.isArray(value)) {
    const output: PublicValue[] = [];
    for (const item of value.slice(0, MAX_PUBLIC_ITEMS)) {
      const sanitized = sanitizePublicValue(item, depth + 1, seen);
      if (sanitized !== undefined) output.push(sanitized);
    }
    return output;
  }

  const output: Record<string, PublicValue> = {};
  for (const [key, item] of Object.entries(value).slice(0, MAX_PUBLIC_ITEMS)) {
    if (BLOCKED_PUBLIC_FIELD.test(key)) continue;
    const sanitized = sanitizePublicValue(item, depth + 1, seen);
    if (sanitized !== undefined) output[key] = sanitized;
  }
  return output;
}

export function sanitizePublicPayload(input: unknown): Record<string, PublicValue> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const sanitized = sanitizePublicValue(input, 0, new WeakSet());
  return sanitized && !Array.isArray(sanitized) && typeof sanitized === "object"
    ? sanitized
    : {};
}

export function getTimeoutMs() {
  const seconds = Number(process.env.STATUS_FETCH_TIMEOUT_SECONDS || "5");
  return Math.max(1000, Math.min(15000, seconds * 1000));
}
