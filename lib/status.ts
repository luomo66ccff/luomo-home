import { SERVICES, type ServiceMeta } from "./services";
import { clampStatus, getTimeoutMs, isoNow, sanitizePublicPayload } from "./utils";

export type ServiceStatus = {
  id: string; code: string; name: string; worldName: string; description: string;
  url: string; statusUrl: string; status: "operational" | "degraded" | "down" | "unknown";
  latency_ms: number | null; checked_at: string; source: "public_status" | "health" | "fallback";
  tags: string[]; accent: ServiceMeta["accent"];
};
type Payload = { services: ServiceStatus[]; updated_at: string };
let cached: { value: Payload; expires: number } | null = null;
let pending: Promise<Payload> | null = null;
const ENV_KEYS: Record<string, string> = { ops: "LUOMO_OPS_URL", file: "LUOMO_FILE_URL", api: "LUOMO_API_URL", terminal: "LUOMO_TERMINAL_URL", atri: "LUOMO_ATRI_API_URL" };

async function fetchJson(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const response = await fetch(url, { signal: controller.signal, cache: "no-store", redirect: "error", headers: { accept: "application/json" } });
    if (!response.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      await response.body?.cancel();
      return { ok: response.ok, latency: Date.now() - started, data: {}, valid: false };
    }
    const reader = response.body?.getReader();
    if (!reader) return { ok: response.ok, latency: Date.now() - started, data: {}, valid: false };
    const decoder = new TextDecoder();
    let text = ""; let bytes = 0;
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        bytes += chunk.value.byteLength;
        if (bytes > 65536) { await reader.cancel(); throw new Error("Probe response too large"); }
        text += decoder.decode(chunk.value, { stream: true });
      }
      text += decoder.decode();
    } finally { reader.releaseLock(); }
    const data = JSON.parse(text);
    return { ok: response.ok, latency: Date.now() - started, data: sanitizePublicPayload(data), valid: !!data && typeof data === "object" && !Array.isArray(data) };
  } finally { clearTimeout(timeout); }
}

function publicMetadata(service: ServiceMeta) {
  // Probe addresses may point to private hosts; never serialize them in public DTOs.
  const publicService = SERVICES.find(s => s.id === service.id) ?? service;
  return { id: service.id, code: service.code, name: service.name, worldName: service.worldName,
    description: service.description, url: publicService.url, statusUrl: "/api/services",
    tags: service.tags, accent: service.accent };
}
export async function checkService(service: ServiceMeta): Promise<ServiceStatus> {
  const timeout = getTimeoutMs();
  const meta = publicMetadata(service);
  const result = (status: ServiceStatus["status"], latency_ms: number | null, source: ServiceStatus["source"]): ServiceStatus => ({ ...meta, status, latency_ms, source, checked_at: isoNow() });
  try {
    const response = await fetchJson(service.statusUrl, timeout);
    const state = clampStatus(response.data.status || response.data.service_status || response.data.overall_status);
    if (response.ok && response.valid && state !== "unknown") return result(state, response.latency, "public_status");
  } catch { /* Try the health endpoint without exposing transport details. */ }
  try {
    const response = await fetchJson(service.healthUrl, timeout);
    const state = clampStatus(response.data.status || response.data.service_status || response.data.overall_status);
    return result(response.ok ? state : "down", response.latency, "health");
  } catch { return result("down", null, "fallback"); }
}

function probeService(service: ServiceMeta): ServiceMeta {
  const configured = process.env[ENV_KEYS[service.id]];
  if (!configured) return service;
  try {
    const url = new URL(configured);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return service;
    url.search = ""; url.hash = "";
    const base = url.href.replace(/\/$/, "");
    return { ...service, statusUrl: base + "/api/public/status", healthUrl: base + "/health" };
  } catch { return service; }
}

export async function getServicesStatus(): Promise<Payload> {
  if (cached && Date.now() < cached.expires) return cached.value;
  if (pending) return pending;
  const raw = Number(process.env.STATUS_CACHE_SECONDS ?? 30);
  const ttl = Number.isFinite(raw) ? Math.max(0, Math.min(300, raw)) * 1000 : 30000;
  pending = (async () => {
    const services = await Promise.all(SERVICES.map(s => checkService(probeService(s))));
    const value = { services, updated_at: isoNow() };
    cached = { value, expires: Date.now() + ttl };
    return value;
  })();
  try { return await pending; } finally { pending = null; }
}
