import { SERVICES, type ServiceMeta } from "./services";
import { clampStatus, getTimeoutMs, isoNow, sanitizePublicPayload } from "./utils";

export type ServiceStatus = {
  id: string;
  code: string;
  name: string;
  worldName: string;
  description: string;
  url: string;
  statusUrl: string;
  status: "operational" | "degraded" | "down" | "unknown";
  latency_ms: number | null;
  checked_at: string;
  source: "public_status" | "health" | "fallback";
  tags: string[];
  accent: ServiceMeta["accent"];
};

async function fetchJson(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        accept: "application/json"
      }
    });
    const latency = Date.now() - startedAt;
    const contentType = response.headers.get("content-type") || "";
    let data: unknown = {};
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { status: response.ok ? "ok" : "down", text: text.slice(0, 64) };
    }
    return { ok: response.ok, latency, data: sanitizePublicPayload(data) };
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkService(service: ServiceMeta): Promise<ServiceStatus> {
  const timeoutMs = getTimeoutMs();
  const checked_at = isoNow();

  try {
    const result = await fetchJson(service.statusUrl, timeoutMs);
    if (result.ok) {
      const status = clampStatus(result.data.status || result.data.service_status || result.data.overall_status);
      return {
        ...service,
        status,
        latency_ms: result.latency,
        checked_at,
        source: "public_status"
      };
    }
  } catch {
    // Fall through to /health without leaking transport details.
  }

  try {
    const result = await fetchJson(service.healthUrl, timeoutMs);
    return {
      ...service,
      status: result.ok ? "operational" : "down",
      latency_ms: result.latency,
      checked_at,
      source: "health"
    };
  } catch {
    return {
      ...service,
      status: "down",
      latency_ms: null,
      checked_at,
      source: "fallback"
    };
  }
}

export async function getServicesStatus() {
  const statuses = await Promise.all(SERVICES.map((service) => checkService(service)));
  return {
    services: statuses,
    updated_at: isoNow()
  };
}
