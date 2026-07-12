type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_BUCKETS = 4096;
const rateLimitBuckets = new Map<string, RateLimitBucket>();

function configuredRateLimit(): number {
  const value = Number(process.env.ATRI_RATE_LIMIT_PER_MINUTE || "20");
  return Math.max(1, Math.min(120, Number.isFinite(value) ? Math.floor(value) : 20));
}

function cleanupExpiredBuckets(now: number) {
  for (const [key, bucket] of rateLimitBuckets) {
    if (bucket.resetAt <= now) rateLimitBuckets.delete(key);
  }
  while (rateLimitBuckets.size >= MAX_BUCKETS) {
    const oldestKey = rateLimitBuckets.keys().next().value;
    if (oldestKey === undefined) break;
    rateLimitBuckets.delete(oldestKey);
  }
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    forwarded ||
    "unknown"
  ).slice(0, 128);
}

export function consumeAtriRateLimit(identifier: string, now = Date.now()) {
  if (rateLimitBuckets.size >= MAX_BUCKETS) cleanupExpiredBuckets(now);

  const limit = configuredRateLimit();
  const current = rateLimitBuckets.get(identifier);
  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, remaining: limit - current.count, retryAfterSeconds: 0 };
}

export function isAllowedAtriOrigin(request: Request): boolean {
  const rawOrigin = request.headers.get("origin");
  if (!rawOrigin) return true;

  let origin: URL;
  try {
    origin = new URL(rawOrigin);
  } catch {
    return false;
  }

  if (!/^https?:$/.test(origin.protocol)) return false;

  const requestHost = (
    request.headers.get("x-forwarded-host") || request.headers.get("host") || ""
  ).split(",")[0].trim().toLowerCase();
  if (requestHost && origin.host.toLowerCase() === requestHost) return true;

  const configured = [
    process.env.NEXT_PUBLIC_SITE_URL,
    ...(process.env.ATRI_ALLOWED_ORIGINS || "").split(","),
  ];
  return configured.some((value) => {
    if (!value?.trim()) return false;
    try {
      return new URL(value.trim()).origin === origin.origin;
    } catch {
      return false;
    }
  });
}

export function clearAtriRateLimitsForTests() {
  rateLimitBuckets.clear();
}
