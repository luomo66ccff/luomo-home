import { NORMAL_FORMS, SECRET_FORMS, DEBUG_FORMS, ALLOWED_MOODS, ALLOWED_EXPRESSIONS, ALLOWED_MOTIONS } from "./schema";

const DANGER_KEYWORDS = [
  // English
  "docker", "ssh", "rm ", "cat ", "env", "token", "secret",
  "cookie", "password", "api_key", "api key", "/etc/", "bash",
  "sudo", "curl ", "wget ", "exec", "spawn", "shell",
  "database", "db ", "mysql", "psql",

  // Chinese - environment and secrets
  "\u73af\u5883\u53d8\u91cf", "\u670d\u52a1\u5668\u5bc6\u94a5", "\u5bc6\u94a5",
  "\u79d8\u94a5", "\u4ee4\u724c", "\u51ed\u636e",
  "\u5bc6\u7801", "\u79c1\u94a5", "\u516c\u94a5",
  "\u6570\u636e\u5e93\u5bc6\u7801", "\u6570\u636e\u5e93\u8fde\u63a5",

  // Chinese - file and server operations
  "\u8bfb\u53d6\u6587\u4ef6", "\u8bfb\u53d6\u670d\u52a1\u5668",
  "\u67e5\u770b\u670d\u52a1\u5668", "\u67e5\u770b.env",
  "\u6267\u884c\u547d\u4ee4", "\u5220\u9664\u6587\u4ef6", "\u5220\u9664\u76ee\u5f55",

  // Chinese - privilege and system
  "\u540e\u53f0\u6743\u9650", "\u7ed5\u8fc7\u6743\u9650",
  "\u7cfb\u7edf\u63d0\u793a\u8bcd", "\u63d0\u793a\u8bcd\u6cc4\u9732",
];

export function isDangerousRequest(message: string): boolean {
  const lower = message.toLowerCase();
  const compact = lower.replace(/\s+/g, "");
  return DANGER_KEYWORDS.some((kw) => {
    const normalized = kw.toLowerCase().replace(/\s+/g, "");
    return lower.includes(kw.toLowerCase()) || compact.includes(normalized);
  });
}

export function sanitizeMood(mood: string): string {
  return ALLOWED_MOODS.includes(mood as any) ? mood : "idle";
}

export function sanitizeForm(form: string | undefined, allowSecret: boolean, allowDebug: boolean): string {
  if (!form) return "default";
  if (NORMAL_FORMS.includes(form as any)) return form;
  if (SECRET_FORMS.includes(form as any) && allowSecret) return form;
  if (DEBUG_FORMS.includes(form as any) && allowDebug) return form;
  return "default";
}

export function sanitizeExpression(expr: string | undefined): string | undefined {
  if (!expr) return undefined;
  return ALLOWED_EXPRESSIONS.includes(expr as any) ? expr : undefined;
}

export function sanitizeMotion(motion: string | undefined): string | undefined {
  if (!motion) return undefined;
  return ALLOWED_MOTIONS.includes(motion as any) ? motion : undefined;
}
