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
  try {
    if (typeof model.expression === "function") {
      model.expression(expression);
      return { ok: true, expression };
    }
    return { ok: false, reason: "model.expression not available" };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

export function applyAtriMotion(model: any, motion?: string) {
  if (!motion) return { ok: true, skipped: true };
  try {
    if (typeof model.motion === "function") {
      model.motion(motion);
      return { ok: true, motion };
    }
    return { ok: false, reason: "model.motion not available" };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}
