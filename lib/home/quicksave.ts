"use client";

import { SECTIONS } from "../../content/sections";
import { unlock } from "./achievements";
import { KEYS, readJson, toast, writeJson } from "./store";

type SaveSlot = { y: number; section: string; at: number; offset?: number };

function parseSlot(raw: string | null): SaveSlot | null {
  try {
    const data = raw ? JSON.parse(raw) : null;
    if (!data || typeof data.y !== "number" || !Number.isFinite(data.y) || typeof data.at !== "number" || !Number.isFinite(data.at) || typeof data.section !== "string") return null;
    const offset = typeof data.offset === "number" && Number.isFinite(data.offset) ? data.offset : undefined;
    return { y: Math.max(0, data.y), section: data.section, at: data.at, offset };
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
  const section = document.getElementById(slot.section);
  if (section) slot.offset = Math.round(-section.getBoundingClientRect().top);
  writeJson(KEYS.quickSave, slot);
  toast({ title: "快速存档完成", body: `${clock(slot.at)} · ${labelOf(slot.section)}` });
  unlock("save");
}

let releasePositioning: (() => void) | undefined;

/** Readback is rare: realize the full layout so old absolute saves also stay valid. */
function renderForPositioning() {
  releasePositioning?.();
  const root = document.documentElement;
  const previous = root.dataset.homePositioning;
  root.dataset.homePositioning = "true";
  const release = () => {
    window.clearTimeout(timeout);
    window.removeEventListener("scrollend", release);
    if (previous === undefined) delete root.dataset.homePositioning;
    else root.dataset.homePositioning = previous;
    if (releasePositioning === release) releasePositioning = undefined;
  };
  // Keep realized sizes through smooth scrolling, including browsers without scrollend.
  const timeout = window.setTimeout(release, 2500);
  window.addEventListener("scrollend", release, { once: true });
  releasePositioning = release;
}

export function quickLoad() {
  const slot = readJson(KEYS.quickSave, parseSlot);
  if (!slot) {
    toast({ title: "没有找到存档", body: "先按一下 Q.SAVE 吧。" });
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  if (mobile) renderForPositioning();
  const section = document.getElementById(slot.section);
  // New saves survive estimated heights, width changes and sections expanding above them.
  const rect = section?.getBoundingClientRect();
  const top = rect && slot.offset !== undefined ? window.scrollY + rect.top + slot.offset : slot.y;
  window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
  toast({ title: "读档完成", body: `${clock(slot.at)} 的存档 · ${labelOf(slot.section)}` });
}
