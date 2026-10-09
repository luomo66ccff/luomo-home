"use client";

import { SECTIONS } from "@/content/sections";
import { unlock } from "./achievements";
import { KEYS, readJson, toast, writeJson } from "./store";

type SaveSlot = { y: number; section: string; at: number };

function parseSlot(raw: string | null): SaveSlot | null {
  try {
    const data = raw ? JSON.parse(raw) : null;
    if (!data || typeof data.y !== "number" || typeof data.at !== "number" || typeof data.section !== "string") return null;
    return { y: Math.max(0, data.y), section: data.section, at: data.at };
  } catch {
    return null;
  }
}

export function currentSectionId(): string {
  let best: string = SECTIONS[0].id;
  let distance = Infinity;
  for (const section of SECTIONS) {
    const el = document.getElementById(section.id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const d = rect.top <= window.innerHeight * 0.4 && rect.bottom > window.innerHeight * 0.4 ? 0 : Math.abs(rect.top - window.innerHeight * 0.4);
    if (d < distance) { distance = d; best = section.id; }
  }
  return best;
}

function labelOf(id: string) {
  return SECTIONS.find(section => section.id === id)?.label ?? id;
}

function clock(at: number) {
  return new Date(at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

export function quickSave() {
  const slot: SaveSlot = { y: Math.round(window.scrollY), section: currentSectionId(), at: Date.now() };
  writeJson(KEYS.quickSave, slot);
  toast({ title: "快速存档完成", body: `${clock(slot.at)} · ${labelOf(slot.section)}` });
  unlock("save");
}

export function quickLoad() {
  const slot = readJson(KEYS.quickSave, parseSlot);
  if (!slot) {
    toast({ title: "没有找到存档", body: "先按一下 Q.SAVE 吧。" });
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: slot.y, behavior: reduce ? "auto" : "smooth" });
  toast({ title: "读档完成", body: `${clock(slot.at)} 的存档 · ${labelOf(slot.section)}` });
}
