import type { AtriBrainRequest, AtriBrainResponse } from "../types";

export async function callAtriApiProvider(
  request: AtriBrainRequest
): Promise<Partial<AtriBrainResponse>> {
  const baseUrl = process.env.ATRI_API_BASE_URL;
  const token = process.env.ATRI_API_TOKEN;
  const brainPath = process.env.ATRI_API_BRAIN_PATH || "/coze/atri/chat";
  const timeoutMs = Number(process.env.ATRI_API_TIMEOUT_MS || 8000);

  if (!baseUrl) {
    throw new Error("ATRI_API_BASE_URL is not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}${brainPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "X-Bridge-Token": token } : {}),
      },
      body: JSON.stringify({
        message: request.message,
        username: "luomo-home",
        session_id: null,
      }),
      signal: controller.signal,
    });

    if (response.status === 401) {
      throw new Error("ATRI API authentication failed");
    }
    if (!response.ok) {
      throw new Error(`ATRI API returned ${response.status}`);
    }

    const data = await response.json();
    if (!data || typeof data !== "object") {
      throw new Error("ATRI API returned non-object response");
    }

    return {
      ok: Boolean(data.ok ?? true),
      source: "ai",
      text: String(data.answer || data.text || data.response || data.message || data.content || ""),
      mood: (String(data.mood || "system") as any),
      form: data.form ? String(data.form) : undefined,
      expression: data.expression ? String(data.expression) : undefined,
      motion: data.motion ? String(data.motion) : undefined,
      emotionStrength: data.emotionStrength !== undefined ? Number(data.emotionStrength) : undefined,
    };
  } finally {
    clearTimeout(timeout);
  }
}
