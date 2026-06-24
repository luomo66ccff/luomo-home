"use client";

import { useState, useEffect, useCallback } from "react";

export type ThemeMode = "dark" | "light" | "system";

export interface LuomoPreferences {
  theme: ThemeMode;
  particlesEnabled: boolean;
  luomoChanCollapsed: boolean;
  lastVisitedSection: string;
}

const STORAGE_KEY = "luomo_prefs_v4";

function loadPrefs(): LuomoPreferences {
  if (typeof window === "undefined") return { theme: "dark", particlesEnabled: true, luomoChanCollapsed: true, lastVisitedSection: "hero" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...loadPrefsDefault(), ...JSON.parse(raw) };
  } catch {}
  return loadPrefsDefault();
}

function loadPrefsDefault(): LuomoPreferences {
  return { theme: "dark", particlesEnabled: true, luomoChanCollapsed: true, lastVisitedSection: "hero" };
}

export function useLuomoPreferences() {
  const [prefs, setPrefs] = useState<LuomoPreferences>(loadPrefsDefault);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const save = useCallback((patch: Partial<LuomoPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => save({ theme }), [save]);
  const toggleParticles = useCallback(() => save({ particlesEnabled: !prefs.particlesEnabled }), [prefs.particlesEnabled, save]);
  const setLuomoChanCollapsed = useCallback((v: boolean) => save({ luomoChanCollapsed: v }), [save]);
  const setLastVisitedSection = useCallback((section: string) => save({ lastVisitedSection: section }), [save]);

  return { prefs, setTheme, toggleParticles, setLuomoChanCollapsed, setLastVisitedSection };
}