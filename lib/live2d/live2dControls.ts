export function normalizeMotionRef(motion?: string): { group?: string; index: number } {
  if (!motion) return { group: undefined, index: 0 };
  return { group: motion, index: 0 };
}

function log(level: string, msg: string, data: any) {
  if (level === "error") console.error("[Live2D] " + msg, data);
  else if (level === "warn") console.warn("[Live2D] " + msg, data);
  else console.info("[Live2D] " + msg, data);
}

export function applyCompanionExpression(model: any, companionId: string, expression?: string) {
  if (!expression) { const r = { ok: false, companionId, reason: "empty expression" }; log("warn","expression skip",r); return r; }
  try {
    if (typeof model.expression !== "function") throw new Error("expression API missing");
    model.expression(expression);
    const r = { ok: true, companionId, expression, api: "model.expression(name)" };
    log("info","expression apply",r); return r;
  } catch (error) {
    const r = { ok: false, companionId, reason: error instanceof Error ? error.message : String(error), expression };
    log("error","expression error",r); return r;
  }
}

export function applyCompanionMotion(model: any, companionId: string, motion?: string) {
  if (!motion) { const r = { ok: false, companionId, reason: "empty motion" }; log("warn","motion skip",r); return r; }
  try {
    if (typeof model.motion !== "function") throw new Error("motion API missing");
    model.motion(motion, 0);
    const r = { ok: true, companionId, motion, api: "model.motion(group,0)" };
    log("info","motion apply",r); return r;
  } catch (error) {
    const r = { ok: false, companionId, reason: error instanceof Error ? error.message : String(error), motion };
    log("error","motion error",r); return r;
  }
}