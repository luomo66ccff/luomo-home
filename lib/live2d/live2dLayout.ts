"use client";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getUnscaledModelSize(model: any) {
  const currentScaleX = Math.abs(model?.scale?.x || 1);
  const currentScaleY = Math.abs(model?.scale?.y || 1);

  try {
    const local = model.getLocalBounds?.();
    if (local && local.width > 1 && local.height > 1) {
      return { width: local.width, height: local.height, source: "localBounds", currentScaleX, currentScaleY };
    }
  } catch {}

  try {
    const global = model.getBounds?.();
    if (global && global.width > 1 && global.height > 1) {
      return {
        width: global.width / currentScaleX,
        height: global.height / currentScaleY,
        source: "globalBounds/scale",
        currentScaleX,
        currentScaleY,
      };
    }
  } catch {}

  return { width: 1, height: 1, source: "fallback", currentScaleX, currentScaleY };
}

export function applyCompanionModelLayout(
  model: any,
  options: { companionId?: string; app: any; layout?: { targetHeightRatio?: number; xRatio?: number; yRatio?: number; offsetX?: number; offsetY?: number; minScale?: number; maxScale?: number } }
) {
  const { app, companionId, layout } = options;
  const screenW = app.screen.width;
  const screenH = app.screen.height;

  const size = getUnscaledModelSize(model);
  const modelWidth = Math.max(size.width || 1, 1);
  const modelHeight = Math.max(size.height || 1, 1);

  const tHR = layout?.targetHeightRatio ?? 0.72;
  const xR = layout?.xRatio ?? 0.58;
  const yR = layout?.yRatio ?? 0.96;
  const oX = layout?.offsetX ?? 0;
  const oY = layout?.offsetY ?? 0;
  const minS = layout?.minScale ?? 0.05;
  const maxS = layout?.maxScale ?? 1.2;

  const rawScale = (screenH * tHR) / modelHeight;
  const scale = clamp(rawScale, minS, maxS);

  if (model.anchor?.set) model.anchor.set(0.5, 1);
  model.scale.set(scale);
  model.x = screenW * xR + oX;
  model.y = screenH * yR + oY;

  console.info("[Live2D] layout applied", {
    companionId,
    boundsSource: size.source,
    screenW, screenH, modelWidth, modelHeight,
    currentScaleX: size.currentScaleX, currentScaleY: size.currentScaleY,
    targetHeightRatio: tHR, rawScale, scale,
    x: model.x, y: model.y,
  });
}
