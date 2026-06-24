export const live2dConfig = {
  enabled: true,
  modelPath: "/live2d/atri/atri_8.model3.json",
  cubismCorePath: "/live2d/core/live2dcubismcore.min.js",
  fallbackEnabled: true,

  dock: {
    width: 360,
    height: 520,
    scale: 0.16,
    xRatio: 0.5,
    yRatio: 0.68,
  },

  test: {
    width: 420,
    height: 620,
    scale: 0.22,
    xRatio: 0.5,
    yRatio: 0.66,
  },

  mobile: {
    width: 180,
    height: 260,
    scale: 0.1,
    xRatio: 0.5,
    yRatio: 0.7,
  },
} as const;

export type Live2dVariant = "dock" | "test" | "mobile";
