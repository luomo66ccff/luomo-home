import { describe, expect, it } from "vitest";
import { parseSignals, signalMetrics } from "../lib/service-signals";
import { parsePreferences } from "../hooks/useLuomoPreferences";
const base = { id: "ops", name: "LuomoOps", status: "operational", latency_ms: 12 };
const time = "2026-09-05T00:00:00Z";
describe("client data resilience", () => {
  it("keeps a valid all-down snapshot instead of showing a loading state", () => { expect(parseSignals({ services: [{ ...base, status: "down", latency_ms: null }], updated_at: time }).services[0].status).toBe("down"); });
  it.each([[], [{ ...base, status: "invented" }], [{ ...base, latency_ms: -1 }], [base,base]])("rejects malformed or duplicate service rows", services => { expect(() => parseSignals({ services, updated_at: time })).toThrow(); });
  it("calculates median using healthy responses only", () => {
    expect(signalMetrics([{ id: "a", name: "a", status: "operational", latency_ms: 10 }, { id: "b", name: "b", status: "operational", latency_ms: 20 }, { id: "c", name: "c", status: "down", latency_ms: 5000 }])).toEqual({ operational: 2, attention: 1, median: 15 });
  });
  it.each(["{", "null", "[]", '{"theme":"other","particlesEnabled":"false","luomoChanCollapsed":null}'])("uses safe preferences for corrupt storage %s", raw => {
    expect(parsePreferences(raw)).toMatchObject({ theme: "dark", particlesEnabled: false, luomoChanCollapsed: true });
  });
  it("restores validated user preferences", () => { expect(parsePreferences('{"theme":"light","particlesEnabled":true,"luomoChanCollapsed":false}')).toMatchObject({ theme: "light", particlesEnabled: true, luomoChanCollapsed: false }); });
});
