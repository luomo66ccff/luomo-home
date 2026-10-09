"use client";

export const KEYS = {
  wish: "luomo:wish:v1",
  achievements: "luomo:achv:v1",
  cg: "luomo:cg:v1",
  quickSave: "luomo:qsave:v1",
  settings: "luomo:vn:v1",
  ticket: "luomo:ticket:v1",
  omikuji: "luomo:omikuji:v1",
  affection: "luomo:affection:v1",
} as const;

export const BOARDED_KEY = "luomo:boarded";

export function readJson<T>(key: string, parse: (raw: string | null) => T): T {
  try {
    return parse(localStorage.getItem(key));
  } catch {
    return parse(null);
  }
}

export function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable in private mode */
  }
}

export function clearLocalProgress() {
  for (const key of Object.values(KEYS)) {
    if (key === KEYS.settings) continue;
    try { localStorage.removeItem(key); } catch {}
  }
  window.dispatchEvent(new CustomEvent("luomo:progress-reset"));
}

export type Toast = { title: string; body?: string; tone?: "info" | "gold" };

export function toast(detail: Toast) {
  window.dispatchEvent(new CustomEvent<Toast>("luomo:toast", { detail }));
}

export function openConfig() {
  window.dispatchEvent(new CustomEvent("luomo:config"));
}

export function openCommand() {
  window.dispatchEvent(new CustomEvent("luomo:command"));
}

export function openCompanion(message?: string) {
  window.dispatchEvent(new CustomEvent<{ message?: string }>("luomo:companion-open", { detail: { message } }));
}

export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}
