import { atriForms } from "@/lib/live2d/atriForms";

export function normalizeAtriBrainResponse(input: any) {
  if (!input || typeof input !== "object") return null;
  const formId: string | undefined = input.form;
  if (formId && (atriForms as Record<string, any>)[formId]) {
    const f = (atriForms as Record<string, any>)[formId];
    if (f.safety !== "normal" && !input.allowSecretForms && !input.allowDebugForms) {
      console.warn("[ATRI·Brain] form rejected:", formId);
      input.form = "default";
    }
  }
  return {
    text: String(input.text || ""),
    mood: input.mood || "idle",
    form: input.form || "default",
    expression: input.expression,
    motion: input.motion,
  };
}
