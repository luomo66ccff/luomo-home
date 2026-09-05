import { applyCompanionExpression, applyCompanionMotion } from "./live2dControls";

export const live2dMoodMap: Record<string, { expression: string; motion: string; lineGroup: string }> = {
  idle:      { expression: "expression1", motion: "model", lineGroup: "idle" },
  welcome:   { expression: "expression2", motion: "model", lineGroup: "welcome" },
  curious:   { expression: "expression3", motion: "dec-l", lineGroup: "curious" },
  focused:   { expression: "expression4", motion: "model", lineGroup: "focused" },
  excited:   { expression: "expression5", motion: "model", lineGroup: "excited" },
  secret:    { expression: "expression8", motion: "dec-l", lineGroup: "secret" },
  system:    { expression: "expression1", motion: "model", lineGroup: "system" },
  greeting:  { expression: "expression2", motion: "model", lineGroup: "greeting" },
  sleepy:    { expression: "expression6", motion: "model", lineGroup: "sleepy" },
  warning:   { expression: "expression7", motion: "dec-r", lineGroup: "warning" },
} as const;


export function applyAtriExpression(model: any, expression?: string) {
  if (!expression) return { ok: true, skipped: true };
  return applyCompanionExpression(model, "atri", expression);
}

export function applyAtriMotion(model: any, motion?: string) {
  if (!motion) return { ok: true, skipped: true };
  return applyCompanionMotion(model, "atri", motion);
}
