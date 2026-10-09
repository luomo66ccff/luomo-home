import { readFileSync } from "node:fs";
import { EventEmitter } from "node:events";
import { runInNewContext } from "node:vm";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyCompanionCommands,
  applyCompanionExpression,
  applyCompanionMotion,
  type CompanionCommandState,
} from "../lib/live2d/live2dControls";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function commandModel() {
  return {
    destroyed: false,
    expression: vi.fn(async () => true),
    motion: vi.fn(async () => true),
    internalModel: {
      motionManager: {
        destroyed: false,
        definitions: { idle: [{}] },
        expressionManager: { definitions: [{ Name: "smile" }], destroyed: false },
      },
    },
  };
}

// Exercise the installed dependency's real async setExpression/destroy path,
// without booting Cubism/WebGL or replacing the buggy method in node_modules.
function actualExpressionManager() {
  const source = readFileSync(new URL("../node_modules/pixi-live2d-display/dist/cubism4.es.js", import.meta.url), "utf8");
  const asyncHelper = source.slice(source.indexOf("var __async ="), source.indexOf('\nimport '));
  const managerSource = source.slice(source.indexOf("class ExpressionManager extends EventEmitter"), source.indexOf("\nconst EPSILON"));
  const Manager = runInNewContext(`${asyncHelper}\n${managerSource}\nExpressionManager`, {
    EventEmitter, Promise, logger: { warn: vi.fn() },
  });
  const manager = new Manager({ name: "regression" });
  manager.definitions = [{ Name: "smile" }];
  manager.getExpressionIndex = () => 0;
  manager._setExpression = vi.fn();
  return manager;
}

afterEach(() => vi.restoreAllMocks());

describe("Live2D asynchronous runtime", () => {
  it("waits for real expression/motion results and catches rejections", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const model = commandModel();
    const expression = deferred<boolean>();
    const motion = deferred<boolean>();
    model.expression.mockReturnValueOnce(expression.promise);
    model.motion.mockReturnValueOnce(motion.promise);
    const expressionResult = applyCompanionExpression(model, "atri", "smile");
    const motionResult = applyCompanionMotion(model, "atri", "idle");
    expression.resolve(false);
    motion.reject(new Error("delayed network failure"));
    await expect(expressionResult).resolves.toMatchObject({ ok: false, reason: "expression manager rejected expression" });
    await expect(motionResult).resolves.toMatchObject({ ok: false, reason: "delayed network failure" });
  });

  it.each(["close", "switch"])("discards a delayed real expression after %s", async action => {
    const manager = actualExpressionManager();
    const loaded = deferred<object>();
    manager._loadExpression = vi.fn(() => loaded.promise);
    const model = commandModel();
    model.internalModel.motionManager.expressionManager = manager;
    model.expression.mockImplementation(name => manager.setExpression(name));
    const state: CompanionCommandState = {};
    let current: typeof model | null = model;
    const task = applyCompanionCommands(model, "atri", { expression: "smile" }, state, () => current === model && !model.destroyed);
    expect(manager._loadExpression).toHaveBeenCalledTimes(1);

    current = action === "switch" ? commandModel() : null;
    model.destroyed = true;
    manager.destroy();
    loaded.resolve({ loaded: true });

    await expect(task).resolves.toEqual([]);
    expect(manager.expressions).toBeUndefined();
    expect(manager._setExpression).not.toHaveBeenCalled();
    expect(state.expression).toBeUndefined();
    if (current) {
      await expect(applyCompanionExpression(current, "murasame", "smile")).resolves.toMatchObject({ ok: true });
    }
  });

  it("caches a live expression without changing other manager instances", async () => {
    const manager = actualExpressionManager();
    const untouched = actualExpressionManager();
    const originalLoad = untouched.loadExpression;
    manager._loadExpression = vi.fn(async () => ({ loaded: true }));
    const model = commandModel();
    model.internalModel.motionManager.expressionManager = manager;
    model.expression.mockImplementation(name => manager.setExpression(name));
    await expect(applyCompanionExpression(model, "atri", "smile")).resolves.toMatchObject({ ok: true });
    expect(manager.expressions[0]).toEqual({ loaded: true });
    expect(manager._loadExpression).toHaveBeenCalledTimes(1);
    expect(untouched.loadExpression).toBe(originalLoad);
    expect(Object.hasOwn(untouched, "loadExpression")).toBe(false);
  });

  it("invalidates a cached expression continuation before destroy", async () => {
    const manager = actualExpressionManager();
    manager.expressions[0] = { loaded: true };
    const model = commandModel();
    model.internalModel.motionManager.expressionManager = manager;
    model.expression.mockImplementation(name => manager.setExpression(name));
    const task = applyCompanionExpression(model, "atri", "smile");
    // Let loadExpression resolve its cached asset, then destroy before the
    // original manager's setExpression continuation resumes.
    await Promise.resolve();
    manager.destroy();
    await expect(task).resolves.toMatchObject({ ok: false, reason: "model disposed" });
    expect(manager._setExpression).not.toHaveBeenCalled();
    expect(manager.expressions).toBeUndefined();
  });

  it("does not report success when a manager is replaced during a command", async () => {
    const model = commandModel();
    const loaded = deferred<boolean>();
    model.motion.mockReturnValueOnce(loaded.promise);
    const task = applyCompanionMotion(model, "atri", "idle");
    model.internalModel.motionManager = commandModel().internalModel.motionManager;
    loaded.resolve(true);
    await expect(task).resolves.toMatchObject({ ok: false, reason: "model disposed" });
  });

  it("deduplicates moods and replays explicit commands with new ids", async () => {
    const model = commandModel();
    const moodState: CompanionCommandState = {};
    await applyCompanionCommands(model, "atri", { motion: "idle" }, moodState, () => true);
    await applyCompanionCommands(model, "atri", { motion: "idle" }, moodState, () => true);
    expect(model.motion).toHaveBeenCalledTimes(1);

    const clickState: CompanionCommandState = {};
    await applyCompanionCommands(model, "atri", { motion: "idle", motionCommandId: 1 }, clickState, () => true);
    await applyCompanionCommands(model, "atri", { motion: "idle", motionCommandId: 1 }, clickState, () => true);
    await applyCompanionCommands(model, "atri", { motion: "idle", motionCommandId: 2 }, clickState, () => true);
    expect(model.motion).toHaveBeenCalledTimes(3);
  });

  it("shares an in-flight command across rerenders and records only its successful completion", async () => {
    const model = commandModel();
    const loaded = deferred<boolean>();
    model.motion.mockReturnValueOnce(loaded.promise);
    const state: CompanionCommandState = {};
    let firstCurrent = true;
    const first = applyCompanionCommands(model, "atri", { motion: "idle" }, state, () => firstCurrent);
    firstCurrent = false;
    const second = applyCompanionCommands(model, "atri", { motion: "idle" }, state, () => true);
    expect(state.motion).toBeUndefined();
    expect(model.motion).toHaveBeenCalledTimes(1);
    loaded.resolve(true);
    await expect(first).resolves.toEqual([]);
    await expect(second).resolves.toMatchObject([{ ok: true }]);
    expect(state.motion).toBeDefined();
  });

  it("allows failed commands to retry", async () => {
    const model = commandModel();
    const state: CompanionCommandState = {};
    model.motion.mockResolvedValueOnce(false);
    await applyCompanionCommands(model, "atri", { motion: "idle" }, state, () => true);
    expect(state.motion).toBeUndefined();
    await applyCompanionCommands(model, "atri", { motion: "idle" }, state, () => true);
    expect(model.motion).toHaveBeenCalledTimes(2);
    expect(state.motion).toBeDefined();
  });
});
