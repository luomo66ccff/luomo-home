const baseUrl = process.env.BASE_URL || "http://127.0.0.1:7891";
const rawTimeout = Number(process.env.SMOKE_TIMEOUT_MS || 35000);
const timeoutMs = Number.isFinite(rawTimeout) ? Math.max(1000, Math.min(60000, rawTimeout)) : 35000;
const forbidden = [/secret/i, /token/i, /cookie/i, /private_key/i, /password/i, /ssh_key/i, /authorization/i];

function getOrigin(value) {
  let origin;
  try {
    origin = new URL(value);
  } catch {
    throw new Error(`BASE_URL is not a valid URL: ${value}`);
  }
  if (!/^https?:$/.test(origin.protocol)) {
    throw new Error(`BASE_URL must use http or https: ${value}`);
  }
  return origin;
}

let origin;

async function get(path) {
  let response;
  try {
    response = await fetch(new URL(path, origin), {
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`${path} request failed at ${origin.origin}: ${reason}`);
  }

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status} at ${origin.origin}`);
  }
  for (const pattern of forbidden) {
    if (pattern.test(text)) {
      throw new Error(`${path} leaked forbidden marker ${pattern}`);
    }
  }
  return text;
}

function parseJson(path, text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${path} did not return valid JSON`);
  }
}

async function main() {
  origin = getOrigin(baseUrl);
  const health = parseJson("/health", await get("/health"));
  if (health.status !== "ok") {
    throw new Error("/health did not return status=ok");
  }

  const status = parseJson("/api/status", await get("/api/status"));
  if (status.service !== "LuomoHome") {
    throw new Error("/api/status did not return service=LuomoHome");
  }

  const services = parseJson("/api/services", await get("/api/services"));
  if (!Array.isArray(services.services) || services.services.length === 0) {
    throw new Error("/api/services did not return a non-empty services array");
  }
  const expectedIds = ["api", "atri", "file", "ops", "terminal"];
  if (JSON.stringify(services.services.map(s => s.id).sort()) !== JSON.stringify(expectedIds)) throw new Error("Unexpected service IDs");
  for (const service of services.services) {
    if ("healthUrl" in service) throw new Error("Private probe address leaked");
    if (!["operational","degraded","down","unknown"].includes(service.status)) throw new Error("Invalid service state");
    if (!Number.isFinite(Date.parse(service.checked_at))) throw new Error("Invalid probe timestamp");
  }
  const serviceNames = services.services.map((service) => service?.name).filter(Boolean);
  if (serviceNames.length !== services.services.length) {
    throw new Error("/api/services returned a service without a name");
  }

  const home = await get("/");
  const homepageMarkers = ["在云端", 'id="services"', 'id="operations"', ...serviceNames];
  for (const marker of homepageMarkers) {
    if (!home.includes(marker)) {
      throw new Error(`homepage missing ${marker}`);
    }
  }

  console.log(`LuomoHome smoke test passed at ${origin.origin}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Smoke test failed: ${message}`);
  process.exitCode = 1;
});
