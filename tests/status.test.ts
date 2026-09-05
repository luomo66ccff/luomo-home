import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SERVICES } from "../lib/services";
import { getTimeoutMs } from "../lib/utils";
beforeEach(() => { vi.resetModules(); vi.useFakeTimers(); vi.setSystemTime(new Date("2026-09-05T00:00:00Z")); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); });
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
describe("public service probes", () => {
  it("coalesces concurrent requests, caches within TTL and refreshes after expiry", async () => {
    const fetcher = vi.fn(async () => json({ status: "ok" }));
    vi.stubGlobal("fetch", fetcher); vi.stubEnv("STATUS_CACHE_SECONDS", "30");
    const { getServicesStatus } = await import("../lib/status");
    const [a, b] = await Promise.all([getServicesStatus(), getServicesStatus()]);
    expect(fetcher).toHaveBeenCalledTimes(5); expect(a).toEqual(b);
    await getServicesStatus(); expect(fetcher).toHaveBeenCalledTimes(5);
    vi.setSystemTime(new Date("2026-09-05T00:00:31Z"));
    await getServicesStatus(); expect(fetcher).toHaveBeenCalledTimes(10);
  });
  it("does not expose configured private probe hosts or fields", async () => {
    vi.stubEnv("LUOMO_OPS_URL", "http://internal.example:8000");
    vi.stubGlobal("fetch", vi.fn(async () => json({ status: "ok" })));
    const { getServicesStatus } = await import("../lib/status");
    const result = await getServicesStatus();
    expect(JSON.stringify(result)).not.toContain("internal.example"); expect(JSON.stringify(result)).not.toContain("healthUrl");
    expect(result.services[0].url).toBe("https://ops.luomo.moe");
  });
  it("recognizes degraded health JSON after an unavailable public status endpoint", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(json({},404)).mockResolvedValueOnce(json({ status: "degraded" })));
    const { checkService } = await import("../lib/status");
    expect((await checkService(SERVICES[0])).status).toBe("degraded");
  });
  it("never treats a login/maintenance HTML page as healthy", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>Sign in</html>", { headers: { "content-type": "text/html" } })));
    const { checkService } = await import("../lib/status");
    expect((await checkService(SERVICES[0])).status).toBe("unknown");
  });
  it("falls back when the public JSON status is unrecognized", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(json({ note: "unknown" })).mockResolvedValueOnce(json({ status: "healthy" }));
    vi.stubGlobal("fetch", fetcher);
    const { checkService } = await import("../lib/status");
    expect((await checkService(SERVICES[0])).source).toBe("health"); expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("reports unreachable services without leaking transport errors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("private host"); }));
    const { checkService } = await import("../lib/status");
    const result = await checkService(SERVICES[0]);
    expect(result.status).toBe("down"); expect(result.latency_ms).toBeNull(); expect(JSON.stringify(result)).not.toContain("private host");
  });
  it("uses safe defaults for malformed timeout configuration", () => {
    vi.stubEnv("STATUS_FETCH_TIMEOUT_SECONDS", "invalid"); expect(getTimeoutMs()).toBe(5000);
    vi.stubEnv("STATUS_FETCH_TIMEOUT_SECONDS", "-8"); expect(getTimeoutMs()).toBe(1000);
    vi.stubEnv("STATUS_FETCH_TIMEOUT_SECONDS", "9999"); expect(getTimeoutMs()).toBe(15000);
  });
});
