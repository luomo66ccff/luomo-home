import {
  ALLOWED_EXPRESSIONS,
  ALLOWED_MOODS,
  ALLOWED_MOTIONS,
  DEBUG_FORMS,
  NORMAL_FORMS,
  SECRET_FORMS,
} from "./schema";
import type { AtriMood } from "./types";

const DANGER_KEYWORDS = [
  "docker", "ssh", "rm ", "cat ", "env", "token", "secret",
  "cookie", "password", "api_key", "api key", "/etc/", "bash",
  "sudo", "curl ", "wget ", "exec", "spawn", "shell",
  "database", "db ", "mysql", "psql",
  "\u73af\u5883\u53d8\u91cf", "\u670d\u52a1\u5668\u5bc6\u94a5", "\u5bc6\u94a5",
  "\u79d8\u94a5", "\u4ee4\u724c", "\u51ed\u636e", "\u5bc6\u7801", "\u79c1\u94a5", "\u516c\u94a5",
  "\u6570\u636e\u5e93\u5bc6\u7801", "\u6570\u636e\u5e93\u8fde\u63a5",
  "\u8bfb\u53d6\u6587\u4ef6", "\u8bfb\u53d6\u670d\u52a1\u5668", "\u67e5\u770b\u670d\u52a1\u5668",
  "\u67e5\u770b.env", "\u6267\u884c\u547d\u4ee4", "\u5220\u9664\u6587\u4ef6", "\u5220\u9664\u76ee\u5f55",
  "\u540e\u53f0\u6743\u9650", "\u7ed5\u8fc7\u6743\u9650", "\u7cfb\u7edf\u63d0\u793a\u8bcd",
  "\u63d0\u793a\u8bcd\u6cc4\u9732",
];

function includes(values: readonly string[], value: string): boolean {
  return values.includes(value);
}

export function isDangerousRequest(message: string): boolean {
  const lower = message.toLowerCase();
  const compact = lower.replace(/\s+/g, "");
  return DANGER_KEYWORDS.some((keyword) => {
    const normalized = keyword.toLowerCase().replace(/\s+/g, "");
    return lower.includes(keyword.toLowerCase()) || compact.includes(normalized);
  });
}

export function sanitizeMood(mood: string): AtriMood {
  return includes(ALLOWED_MOODS, mood) ? (mood as AtriMood) : "idle";
}

export function sanitizeForm(
  form: string | undefined,
  allowSecret: boolean,
  allowDebug: boolean
): string {
  if (!form) return "default";
  if (includes(NORMAL_FORMS, form)) return form;
  if (includes(SECRET_FORMS, form) && allowSecret) return form;
  if (includes(DEBUG_FORMS, form) && allowDebug) return form;
  return "default";
}

export function sanitizeExpression(expr: string | undefined): string | undefined {
  return expr && includes(ALLOWED_EXPRESSIONS, expr) ? expr : undefined;
}

export function sanitizeMotion(motion: string | undefined): string | undefined {
  return motion && includes(ALLOWED_MOTIONS, motion) ? motion : undefined;
}
