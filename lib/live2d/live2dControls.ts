export function normalizeMotionRef(motion?: string): { group?: string; index: number } {
  if (!motion) return { group: undefined, index: 0 };
  return { group: motion, index: 0 };
}

function log(level: string, msg: string, data: unknown) {
  if (level === "error") console.error("[Live2D] " + msg, data);
  else if (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === "true") {
    if (level === "warn") console.warn("[Live2D] " + msg, data);
    else console.info("[Live2D] " + msg, data);
  }
}

function getMotionManager(model: any): any {
  return model?.internalModel?.motionManager ?? null;
}

function getExpressionManager(model: any): any {
  return getMotionManager(model)?.expressionManager ?? model?.internalModel?.expressionManager ?? null;
}

function hasExpressionCapability(model: any, expression: string): boolean {
  if (typeof model?.expression !== "function") return false;
  const manager = getExpressionManager(model);
  if (!manager) return false;

  const definitions = manager.definitions;
  if (Array.isArray(definitions)) {
    if (typeof manager.getExpressionIndex === "function") {
      try { return manager.getExpressionIndex(expression) >= 0; } catch { /* use definitions below */ }
    }
    return definitions.some((definition: any) => definition?.Name === expression || definition?.name === expression);
  }

  return typeof manager.setExpression === "function" || typeof manager.startExpression === "function";
}

function hasMotionCapability(model: any, motion: string): boolean {
  if (typeof model?.motion !== "function") return false;
  const manager = getMotionManager(model);
  if (!manager) return false;

  const definitions = manager.definitions;
  if (definitions && typeof definitions === "object") {
    const group = definitions[motion];
    return Array.isArray(group) && group.length > 0;
  }

  return typeof manager.startMotion === "function" || typeof manager.startRandomMotion === "function";
}

export function applyCompanionExpression(model: any, companionId: string, expression?: string) {
  if (!expression) { const r = { ok: false, companionId, reason: "empty expression" }; log("warn","expression skip",r); return r; }
  try {
    if (!hasExpressionCapability(model, expression)) throw new Error("expression manager or definition missing");
    const result = model.expression(expression);
    if (result === false) throw new Error("expression manager rejected expression");
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
    if (!hasMotionCapability(model, motion)) throw new Error("motion manager or group missing");
    const result = model.motion(motion, 0);
    if (result === false) throw new Error("motion manager rejected motion");
    const r = { ok: true, companionId, motion, api: "model.motion(group,0)" };
    log("info","motion apply",r); return r;
  } catch (error) {
    const r = { ok: false, companionId, reason: error instanceof Error ? error.message : String(error), motion };
    log("error","motion error",r); return r;
  }
}
