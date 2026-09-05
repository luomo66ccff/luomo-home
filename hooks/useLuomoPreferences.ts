"use client";
import { useState, useEffect, useCallback } from "react";
export type ThemeMode = "dark" | "light" | "system";
export interface LuomoPreferences { theme: ThemeMode; particlesEnabled: boolean; luomoChanCollapsed: boolean; lastVisitedSection: string }
const STORAGE_KEY = "luomo_prefs_v4";
const defaults: LuomoPreferences = { theme: "dark", particlesEnabled: false, luomoChanCollapsed: true, lastVisitedSection: "hero" };
export function parsePreferences(raw: string | null): LuomoPreferences {
  try {
    const data = raw ? JSON.parse(raw) : {};
    if (!data || typeof data !== "object") return defaults;
    return {
      theme: ["dark", "light", "system"].includes(data.theme) ? data.theme : defaults.theme,
      particlesEnabled: typeof data.particlesEnabled === "boolean" ? data.particlesEnabled : defaults.particlesEnabled,
      luomoChanCollapsed: typeof data.luomoChanCollapsed === "boolean" ? data.luomoChanCollapsed : defaults.luomoChanCollapsed,
      lastVisitedSection: typeof data.lastVisitedSection === "string" ? data.lastVisitedSection : defaults.lastVisitedSection,
    };
  } catch { return defaults; }
}
export function useLuomoPreferences() {
  const [prefs, setPrefs] = useState<LuomoPreferences>(defaults);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setPrefs(parsePreferences(localStorage.getItem(STORAGE_KEY))); } catch {}
    setReady(true);
    const sync = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) setPrefs(parsePreferences(event.newValue)); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const apply = () => { document.documentElement.dataset.theme = prefs.theme === "system" ? media.matches ? "light" : "dark" : prefs.theme; };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [prefs.theme, ready]);
  const save = useCallback((patch: Partial<LuomoPreferences> | ((previous: LuomoPreferences) => Partial<LuomoPreferences>)) => {
    setPrefs(previous => {
      const next = { ...previous, ...(typeof patch === "function" ? patch(previous) : patch) };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  const setTheme = useCallback((theme: ThemeMode) => save({ theme }), [save]);
  const toggleParticles = useCallback(() => save(previous => ({ particlesEnabled: !previous.particlesEnabled })), [save]);
  const setLuomoChanCollapsed = useCallback((value: boolean) => save({ luomoChanCollapsed: value }), [save]);
  const setLastVisitedSection = useCallback((value: string) => save({ lastVisitedSection: value }), [save]);
  return { prefs, setTheme, toggleParticles, setLuomoChanCollapsed, setLastVisitedSection };
}
