import type { AtriFormId, AtriFormConfig, AtriActiveForms } from "./atriForms";
import { atriForms } from "./atriForms";

export type { AtriFormId, AtriFormConfig, AtriActiveForms };

export const knownAtriParameterIds = [
  "Param17", "Param18", "Param9", "Param19", "Param20",
  "Param21", "Param22", "Param31", "Param36",
  "Param37", "Param38", "Param39", "Param10",
];

let baselineParams: Record<string, number> | null = null;

export function getLive2DParameter(model: any, id: string): number | undefined {
  try {
    const core = model?.internalModel?.coreModel;
    if (!core) return undefined;
    if (typeof core.getParameterValueById === "function") return core.getParameterValueById(id);
    if (typeof core.getParameterIndex === "function") {
      const index = core.getParameterIndex(id);
      const values = core.parameters?.values;
      if (typeof index === "number" && index >= 0 && values) return values[index];
    }
    return undefined;
  } catch { return undefined; }
}

export function setLive2DParameter(model: any, id: string, value: number): boolean {
  try {
    const core = model?.internalModel?.coreModel;
    if (!core) return false;
    if (typeof core.setParameterValueById === "function") { core.setParameterValueById(id, value); return true; }
    if (typeof core.getParameterIndex === "function") {
      const idx = core.getParameterIndex(id);
      if (typeof idx === "number" && idx >= 0) {
        if (typeof core.setParameterValueByIndex === "function") { core.setParameterValueByIndex(idx, value); return true; }
        const vals = core._parameterValues || core.parameters?.values;
        if (vals && vals[idx] !== undefined) { vals[idx] = value; return true; }
      }
    }
    return false;
  } catch { return false; }
}

export function trySetLive2DParam(model: any, id: string, value: number): boolean {
  return setLive2DParameter(model, id, value);
}

export function captureAtriBaseline(model: any) {
  const coreModel = model?.internalModel?.coreModel;
  if (!coreModel) return { ok: false, reason: "core model missing" };

  const result: Record<string, number> = {};
  for (const paramId of knownAtriParameterIds) {
    const value = getLive2DParameter(model, paramId);
    if (typeof value === "number") result[paramId] = value;
  }

  baselineParams = result;
  return { ok: true, baseline: result };
}

export function resetAtriFormsToBaseline(model: any) {
  if (!baselineParams) return { ok: false, reason: "baseline not captured" };
  for (const [id, value] of Object.entries(baselineParams)) {
    setLive2DParameter(model, id, value);
  }
  return { ok: true, reset: "baseline" };
}

export function applyAtriActiveFormsToModel(
  model: any,
  activeForms: AtriActiveForms,
  options: { allowSecret?: boolean; allowDebug?: boolean } = {}
) {
  // First reset to baseline
  const resetResult = resetAtriFormsToBaseline(model);
  if (!resetResult.ok) return resetResult;

  const applied: string[] = [];
  for (const formId of Object.values(activeForms)) {
    if (!formId) continue;
    const form = (atriForms as Record<string, any>)[formId];
    if (!form) continue;
    if (form.safety === "secret" && !options.allowSecret && !options.allowDebug) continue;
    if (form.safety === "debug" && !options.allowDebug) continue;
    for (const [param, value] of Object.entries(form.params || {})) {
      if (typeof value === "number") { setLive2DParameter(model, param, value); }
    }
    applied.push(formId);
  }

  return { ok: true, applied };
}

// Legacy - kept for backward compatibility
export const ALL_RESET_PARAMS = ["Param17","Param18","Param9","Param19","Param20","Param21","Param22","Param31","Param36","Param37","Param38","Param39","Param10"];
export const SAFE_RESET_PARAMS = ["Param17","Param18","Param9","Param19","Param20","Param37","Param38","Param39"];

export function applyAtriForm(model: any, formId: string, allowSecret = false, allowDebug = false, options?: { reset?: boolean }) {
  const formConfig = (atriForms as Record<string, any>)[formId];
  if (!formConfig) return { ok: false, reason: "Unknown form: " + formId };
  const form = formConfig;
  if (form.safety === "secret" && !allowSecret && !allowDebug) return { ok: false, reason: "secret forms locked" };
  if (form.safety === "debug" && !allowDebug) return { ok: false, reason: "debug forms locked" };

  const failed: string[] = [];
  const resetParams = (options?.reset !== false) ? SAFE_RESET_PARAMS : [];
  for (const pid of resetParams) { if (!trySetLive2DParam(model, pid, 0)) failed.push("reset:" + pid); }
  for (const [pid, val] of Object.entries(form.params || {})) { if (typeof val === "number" && !trySetLive2DParam(model, pid, val)) failed.push("set:" + pid); }
  return { ok: failed.length === 0, form: form.label, failed };
}
