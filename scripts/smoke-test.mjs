const baseUrl = process.env.BASE_URL || "http://127.0.0.1:7891";
const forbidden = [/secret/i, /token/i, /cookie/i, /private_key/i, /password/i, /ssh_key/i, /authorization/i];

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}`);
  }
  for (const pattern of forbidden) {
    if (pattern.test(text)) {
      throw new Error(`${path} leaked forbidden marker ${pattern}`);
    }
  }
  return { response, text };
}

const health = await get("/health");
if (JSON.parse(health.text).status !== "ok") {
  throw new Error("/health did not return ok");
}

const status = await get("/api/status");
if (JSON.parse(status.text).service !== "LuomoHome") {
  throw new Error("/api/status did not return service=LuomoHome");
}

const services = await get("/api/services");
const servicesJson = JSON.parse(services.text);
if (!Array.isArray(servicesJson.services)) {
  throw new Error("/api/services did not return services array");
}

const home = await get("/");
for (const marker of ["Luomo Cloud", "LuomoOps", "LuomoFile", "LuomoAPI", "LuomoTerminal", "LuomoBrowse", "AstrBot API"]) {
  if (!home.text.includes(marker)) {
    throw new Error(`homepage missing ${marker}`);
  }
}

console.log("LuomoHome smoke test passed");
