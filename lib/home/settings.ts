"use client";

import { useCallback, useEffect, useState } from "react";
import { KEYS, readJson, writeJson } from "./store";

export type VnSettings = { textSpeed: 0 | 1 | 2 | 3; autoDelay: number; sound: boolean; volume: number };

export const DEFAULT_VN: VnSettings = { textSpeed: 1, autoDelay: 2.5, sound: false, volume: 0.6 };

/** Milliseconds per character for each text-speed step; 0 means instant. */
export const TEXT_SPEED_MS = [70, 38, 18, 0] as const;
export const TEXT_SPEED_LABELS = ["慢", "普通", "快", "瞬间"] as const;

export function parseVnSettings(raw: string | null): VnSettings {
  try {
    const data = raw ? JSON.parse(raw) : {};
    if (!data || typeof data !== "object") return DEFAULT_VN;
    const speed = [0, 1, 2, 3].includes(data.textSpeed) ? data.textSpeed : DEFAULT_VN.textSpeed;
    const autoDelay = typeof data.autoDelay === "number" && data.autoDelay >= 1 && data.autoDelay <= 6 ? data.autoDelay : DEFAULT_VN.autoDelay;
    const volume = typeof data.volume === "number" && data.volume >= 0 && data.volume <= 1 ? data.volume : DEFAULT_VN.volume;
    return { textSpeed: speed, autoDelay, sound: data.sound === true, volume };
  } catch {
    return DEFAULT_VN;
  }
}

const EVENT = "luomo:vn-settings";

export function getVnSettings(): VnSettings {
  return readJson(KEYS.settings, parseVnSettings);
}

export function useVnSettings() {
  const [settings, setSettings] = useState<VnSettings>(DEFAULT_VN);
  useEffect(() => {
    setSettings(getVnSettings());
    const sync = () => setSettings(getVnSettings());
    const onStorage = (event: StorageEvent) => { if (event.key === KEYS.settings || event.key === null) sync(); };
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener("storage", onStorage); };
  }, []);
  const update = useCallback((patch: Partial<VnSettings>) => {
    const next = { ...getVnSettings(), ...patch };
    writeJson(KEYS.settings, next);
    setSettings(next);
    window.dispatchEvent(new CustomEvent(EVENT));
  }, []);
  return { settings, update };
}
