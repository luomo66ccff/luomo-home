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

function isDisposed(model: any, manager: any): boolean {
  return Boolean(model?.destroyed || model?._destroyed || manager?.destroyed || !model?.internalModel);
}

export async function applyCompanionExpression(model: any, companionId: string, expression?: string) {
  if (!expression) { const r = { ok: false, companionId, reason: "empty expression" }; log("warn","expression skip",r); return r; }
  const manager = getExpressionManager(model);
  const cancelled = () => ({ ok: false, companionId, expression, cancelled: true, reason: "model disposed" });
  if (isDisposed(model, manager)) return cancelled();
  try {
    if (!hasExpressionCapability(model, expression)) throw new Error("expression manager or definition missing");
    // The SDK loads expressions asynchronously. Destroying a model aborts its
    // requests, but SDK 0.4 can still reject after clearing the expression array.
    const result = await model.expression(expression);
    if (isDisposed(model, manager)) return cancelled();
    if (result === false) {
      const r = { ok: false, companionId, expression, reason: "expression manager rejected expression" };
      log("warn", "expression skipped", r); return r;
    }
    const r = { ok: true, companionId, expression, api: "model.expression(name)" };
    log("info","expression apply",r); return r;
  } catch (error) {
    if (isDisposed(model, manager)) return cancelled();
    const r = { ok: false, companionId, reason: error instanceof Error ? error.message : String(error), expression };
    log("error","expression error",r); return r;
  }
}

export async function applyCompanionMotion(model: any, companionId: string, motion?: string) {
  if (!motion) { const r = { ok: false, companionId, reason: "empty motion" }; log("warn","motion skip",r); return r; }
  const manager = getMotionManager(model);
  const cancelled = () => ({ ok: false, companionId, motion, cancelled: true, reason: "model disposed" });
  if (isDisposed(model, manager)) return cancelled();
  try {
    if (!hasMotionCapability(model, motion)) throw new Error("motion manager or group missing");
    const result = await model.motion(motion, 0);
    if (isDisposed(model, manager)) return cancelled();
    if (result === false) {
      const r = { ok: false, companionId, motion, reason: "motion manager rejected motion" };
      log("warn", "motion skipped", r); return r;
    }
    const r = { ok: true, companionId, motion, api: "model.motion(group,0)" };
    log("info","motion apply",r); return r;
  } catch (error) {
    if (isDisposed(model, manager)) return cancelled();
    const r = { ok: false, companionId, reason: error instanceof Error ? error.message : String(error), motion };
    log("error","motion error",r); return r;
  }
}
