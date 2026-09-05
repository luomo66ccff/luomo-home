export type SignalState = "operational" | "degraded" | "down" | "unknown";
export type ServiceSignal = { id: string; name: string; status: SignalState; latency_ms: number | null; checked_at?: string };
export type SignalsPayload = { services: ServiceSignal[]; updated_at: string };

export const SIGNAL_LABELS: Record<SignalState, string> = {
  operational: "运行正常", degraded: "部分异常", down: "暂不可达", unknown: "尚未确认",
};

export function parseSignals(value: unknown): SignalsPayload {
  if (!value || typeof value !== "object") throw new Error("Invalid status response");
  const data = value as Record<string, unknown>;
  if (!Array.isArray(data.services) || !data.services.length || typeof data.updated_at !== "string" || !Number.isFinite(Date.parse(data.updated_at))) throw new Error("Invalid status response");
  const ids = new Set<string>();
  const services = data.services.map((entry): ServiceSignal => {
    if (!entry || typeof entry !== "object") throw new Error("Invalid service");
    const s = entry as Record<string, unknown>;
    if (typeof s.id !== "string" || !s.id || ids.has(s.id) || typeof s.name !== "string" || typeof s.status !== "string" || !Object.prototype.hasOwnProperty.call(SIGNAL_LABELS, s.status)) throw new Error("Invalid service");
    if (s.latency_ms !== null && (typeof s.latency_ms !== "number" || !Number.isFinite(s.latency_ms) || s.latency_ms < 0)) throw new Error("Invalid latency");
    ids.add(s.id);
    return { id: s.id, name: s.name, status: s.status as SignalState, latency_ms: s.latency_ms as number | null, checked_at: typeof s.checked_at === "string" ? s.checked_at : undefined };
  });
  return { services, updated_at: data.updated_at };
}

export function signalMetrics(services: ServiceSignal[]) {
  const latencies = services.filter(s => s.status === "operational" && s.latency_ms !== null).map(s => s.latency_ms!).sort((a, b) => a - b);
  const middle = Math.floor(latencies.length / 2);
  return {
    operational: services.filter(s => s.status === "operational").length,
    attention: services.filter(s => s.status === "down" || s.status === "degraded").length,
    median: latencies.length ? (latencies.length % 2 ? latencies[middle] : Math.round((latencies[middle - 1] + latencies[middle]) / 2)) : null,
  };
}
