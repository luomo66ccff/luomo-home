import type { AtriBrainRequest, AtriBrainResponse } from "./types";
import { scriptedBrain } from "./scriptedBrain";
import { normalizeBrainOutput } from "./normalize";
import { isDangerousRequest } from "./safety";
import { callAtriApiProvider } from "./providers/atriApiProvider";

export async function runAtriBrain(
  request: AtriBrainRequest,
  options: {
    allowSecretForms?: boolean;
    allowDebugForms?: boolean;
  } = {}
): Promise<AtriBrainResponse> {
  const message = request.message || "";

  // Safety first - check dangerous requests
  if (isDangerousRequest(message)) {
    return {
      ok: false,
      source: "fallback",
      text: "?????????????ATRI ????????????????????",
      mood: "warning",
      form: "default",
      expression: "surprised",
      motion: "alert",
      refusal: "unsafe_request",
      debug: { reason: "dangerous_request" },
    };
  }

  const provider = process.env.ATRI_BRAIN_PROVIDER;

  // Try external provider if configured
  if (provider === "atri-api") {
    try {
      const raw = await callAtriApiProvider(request);
      const result = normalizeBrainOutput(
        {
          ...raw,
          source: "ai",
          originalMessage: message,
        },
        Boolean(options.allowSecretForms),
        Boolean(options.allowDebugForms)
      );
      // Ensure source is "ai" after normalization
      (result as any).source = "ai";
      return result;
    } catch (error) {
      console.warn("[ATRI Brain] atri-api provider fallback", {
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Fallback to scripted brain
  const raw = scriptedBrain(message);
  return normalizeBrainOutput(
    {
      ...raw,
      originalMessage: message,
    },
    Boolean(options.allowSecretForms),
    Boolean(options.allowDebugForms)
  );
}
