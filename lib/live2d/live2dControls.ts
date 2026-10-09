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

const protectedExpressionManagers = new WeakSet<object>();

// pixi-live2d-display 0.4.0 clears expressions in destroy(), but its
// loadExpression() writes to that array after awaiting an asset request.
// Protect only this manager instance; leave the dependency/prototype untouched.
export function protectCompanionExpressionLifecycle(model: any): void {
  const manager = getExpressionManager(model);
  if (!manager || protectedExpressionManagers.has(manager)
    || typeof manager.loadExpression !== "function" || typeof manager._loadExpression !== "function") return;

  manager.loadExpression = async (index: number) => {
    const expressions = manager.expressions;
    if (manager.destroyed || !manager.definitions?.[index] || !expressions || expressions[index] === null) return undefined;
    const expression = await (expressions[index] || manager._loadExpression(index));
    if (manager.destroyed || manager.expressions !== expressions) return undefined;
    expressions[index] = expression;
    return expression;
  };
  if (typeof manager.destroy === "function") {
    const destroy = manager.destroy;
    manager.destroy = (...args: unknown[]) => {
      // Also invalidate setExpression() continuations whose cached load has
      // already resolved but whose await has not resumed yet.
      manager.reserveExpressionIndex = -1;
      return destroy.apply(manager, args);
    };
  }
  protectedExpressionManagers.add(manager);
}

function isDisposed(model: any, manager: any, currentManager: any): boolean {
  return Boolean(model?.destroyed || manager?.destroyed || manager !== currentManager);
}

export type CompanionControlResult = {
  ok: boolean;
  companionId: string;
  expression?: string;
  motion?: string;
  api?: string;
  reason?: string;
};

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

export async function applyCompanionExpression(model: any, companionId: string, expression?: string): Promise<CompanionControlResult> {
  if (!expression) { const r = { ok: false, companionId, reason: "empty expression" }; log("warn","expression skip",r); return r; }
  const manager = getExpressionManager(model);
  try {
    if (isDisposed(model, manager, getExpressionManager(model))) return { ok: false, companionId, expression, reason: "model disposed" };
    if (!hasExpressionCapability(model, expression)) throw new Error("expression manager or definition missing");
    protectCompanionExpressionLifecycle(model);
    const result = await model.expression(expression);
    if (isDisposed(model, manager, getExpressionManager(model))) return { ok: false, companionId, expression, reason: "model disposed" };
    if (result === false) {
      const r = { ok: false, companionId, expression, reason: "expression manager rejected expression" };
      log("warn", "expression skip", r); return r;
    }
    const r = { ok: true, companionId, expression, api: "model.expression(name)" };
    log("info","expression apply",r); return r;
  } catch (error) {
    if (isDisposed(model, manager, getExpressionManager(model))) return { ok: false, companionId, expression, reason: "model disposed" };
    const r = { ok: false, companionId, reason: error instanceof Error ? error.message : String(error), expression };
    log("error","expression error",r); return r;
  }
}

export async function applyCompanionMotion(model: any, companionId: string, motion?: string): Promise<CompanionControlResult> {
  if (!motion) { const r = { ok: false, companionId, reason: "empty motion" }; log("warn","motion skip",r); return r; }
  const manager = getMotionManager(model);
  try {
    if (isDisposed(model, manager, getMotionManager(model))) return { ok: false, companionId, motion, reason: "model disposed" };
    if (!hasMotionCapability(model, motion)) throw new Error("motion manager or group missing");
    const result = await model.motion(motion, 0);
    if (isDisposed(model, manager, getMotionManager(model))) return { ok: false, companionId, motion, reason: "model disposed" };
    if (result === false) {
      const r = { ok: false, companionId, motion, reason: "motion manager rejected motion" };
      log("warn", "motion skip", r); return r;
    }
    const r = { ok: true, companionId, motion, api: "model.motion(group,0)" };
    log("info","motion apply",r); return r;
  } catch (error) {
    if (isDisposed(model, manager, getMotionManager(model))) return { ok: false, companionId, motion, reason: "model disposed" };
    const r = { ok: false, companionId, reason: error instanceof Error ? error.message : String(error), motion };
    log("error","motion error",r); return r;
  }
}

type CommandKind = "expression" | "motion";
type PendingCommand = { key: string; promise: Promise<CompanionControlResult> };
export type CompanionCommandState = {
  expression?: string;
  motion?: string;
  pending?: Partial<Record<CommandKind, PendingCommand>>;
};

export async function applyCompanionCommands(
  model: any,
  companionId: string,
  commands: { expression?: string; motion?: string; expressionCommandId?: number; motionCommandId?: number },
  state: CompanionCommandState,
  isCurrent: () => boolean,
): Promise<CompanionControlResult[]> {
  const results = await Promise.all((["expression", "motion"] as const).map(async kind => {
    const name = commands[kind];
    if (!name || !isCurrent()) return undefined;
    const key = JSON.stringify([name, commands[`${kind}CommandId`] ?? null]);
    if (state[kind] === key) return undefined;

    const pending = state.pending ??= {};
    let task = pending[kind];
    if (task?.key !== key) {
      task = { key, promise: kind === "expression"
        ? applyCompanionExpression(model, companionId, name)
        : applyCompanionMotion(model, companionId, name) };
      pending[kind] = task;
    }
    const result = await task.promise;
    if (!isCurrent() || pending[kind] !== task) return undefined;
    delete pending[kind];
    if (result.ok) state[kind] = key;
    return result;
  }));
  return results.filter((result): result is CompanionControlResult => Boolean(result));
}
