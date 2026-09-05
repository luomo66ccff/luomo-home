import { describe, expect, it, vi } from "vitest";
import {
  applyAtriActiveFormsToModel,
  applyAtriForm,
  captureAtriBaseline,
  resetAtriFormsToBaseline,
} from "../lib/live2d/atriFormController";
import { applyCompanionExpression, applyCompanionMotion } from "../lib/live2d/live2dControls";

function parameterModel(values: Record<string, number>) {
  const coreModel = {
    getParameterValueById: (id: string) => values[id],
    setParameterValueById: (id: string, value: number) => { values[id] = value; },
  };
  return { internalModel: { coreModel } };
}

describe("ATRI Live2D controls", () => {
  it("keeps a separate baseline for each model instance", () => {
    const firstValues = { Param17: 4 };
    const secondValues = { Param17: 9 };
    const first = parameterModel(firstValues);
    const second = parameterModel(secondValues);

    expect(captureAtriBaseline(first).ok).toBe(true);
    expect(captureAtriBaseline(second).ok).toBe(true);
    firstValues.Param17 = 30;
    secondValues.Param17 = 40;

    expect(resetAtriFormsToBaseline(first).ok).toBe(true);
    expect(resetAtriFormsToBaseline(second).ok).toBe(true);
    expect(firstValues.Param17).toBe(4);
    expect(secondValues.Param17).toBe(9);
  });

  it("keeps secret and debug form permissions separate", () => {
    const values = { Param17: 4, Param22: 8 };
    const model = parameterModel(values);
    captureAtriBaseline(model);

    const applied = applyAtriActiveFormsToModel(
      model,
      { outfit: "bikini", debug: "secretWhiteEyes" },
      { allowSecret: false, allowDebug: true },
    );
    expect(applied).toMatchObject({ ok: true, applied: ["secretWhiteEyes"] });
    expect(values.Param17).toBe(4);
    expect(values.Param22).toBe(30);
    expect(applyAtriForm(model, "bikini", false, true).ok).toBe(false);
  });

  it("only sends commands when the model exposes the matching managers", () => {
    const expression = vi.fn(() => true);
    const motion = vi.fn(() => true);
    const model = {
      expression,
      motion,
      internalModel: {
        motionManager: {
          definitions: { model: [{}] },
          expressionManager: { definitions: [{ Name: "expression1" }] },
        },
      },
    };

    expect(applyCompanionExpression(model, "atri", "expression1").ok).toBe(true);
    expect(applyCompanionMotion(model, "atri", "model").ok).toBe(true);
    expect(applyCompanionExpression(model, "atri", "missing").ok).toBe(false);
    expect(applyCompanionMotion(model, "atri", "missing").ok).toBe(false);
    expect(expression).toHaveBeenCalledTimes(1);
    expect(motion).toHaveBeenCalledTimes(1);

    const incomplete = { expression, motion, internalModel: { motionManager: { definitions: {} } } };
    expect(applyCompanionExpression(incomplete, "atri", "expression1").ok).toBe(false);
    expect(applyCompanionMotion(incomplete, "atri", "model").ok).toBe(false);
  });
});
