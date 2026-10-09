"use client";

import { KEYS, readJson, writeJson } from "./store";

export const ACHIEVEMENTS = [
  { id: "ticket", name: "检票上车", hint: "在月台上检一张票。" },
  { id: "save", name: "人生没有存档，但这里有", hint: "使用一次快速存档。" },
  { id: "gold", name: "出金了！", hint: "在祈愿中获得一件五星。" },
  { id: "lost", name: "小保底，歪了", hint: "体验一次不太妙的五五开。" },
  { id: "guitar", name: "吉他英雄", hint: "把六根弦都拨响一次。" },
  { id: "cg", name: "回想模式", hint: "看完 CG 鉴赏里的全部风景。" },
  { id: "sakana", name: "さかな～ちんあなご～", hint: "在喫茶店的黑板上摆个姿势。" },
  { id: "moon", name: "五个难题", hint: "对着月亮许五次愿。" },
  { id: "atri", name: "高性能", hint: "和伙伴说一句话。" },
  { id: "omikuji", name: "神明在看着你", hint: "抽到一支大吉。" },
  { id: "ciallo", name: "Ciallo～", hint: "在键盘上打个招呼。" },
  { id: "butterfly", name: "指尖的夏天", hint: "碰一碰发光的蝴蝶。" },
  { id: "affection", name: "好感度 MAX", hint: "让一位伙伴的好感度涨满。" },
  { id: "terminus", name: "终点站", hint: "一路坐到最后一站。" },
] as const;

export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];

const VALID = new Set<string>(ACHIEVEMENTS.map(entry => entry.id));

export function parseAchievements(raw: string | null): string[] {
  try {
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data.filter((id): id is string => typeof id === "string" && VALID.has(id)) : [];
  } catch {
    return [];
  }
}

export function getUnlocked(): string[] {
  return readJson(KEYS.achievements, parseAchievements);
}

export function unlock(id: AchievementId) {
  const unlocked = getUnlocked();
  if (unlocked.includes(id)) return false;
  writeJson(KEYS.achievements, [...unlocked, id]);
  const meta = ACHIEVEMENTS.find(entry => entry.id === id);
  window.dispatchEvent(new CustomEvent("luomo:achievement", { detail: meta }));
  return true;
}
