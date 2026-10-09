"use client";

import { useEffect } from "react";
import { unlock } from "@/lib/home/achievements";
import { toast } from "@/lib/home/store";

const WORDS: { word: string; run: () => void }[] = [
  {
    word: "ciallo",
    run: () => {
      unlock("ciallo");
      toast({ title: "Ciallo～(∠・ω< )⌒★", body: "也向你问好！今天也要元气满满哦。", tone: "gold" });
      window.dispatchEvent(new CustomEvent("luomo:mood", { detail: { mood: "excited" } }));
    },
  },
  { word: "sakana", run: () => toast({ title: "ちんあなご～？", body: "要摆姿势的话，去终点站喫茶店的黑板那边吧。" }) },
  { word: "atri", run: () => toast({ title: "「我可是高性能的！」", body: "车厢尽头好像有人听见了。" }) },
];

function typingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export default function KeyListeners() {
  useEffect(() => {
    let buffer = "";
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || typingTarget(event.target)) return;
      if (event.key.length !== 1) return;
      buffer = (buffer + event.key.toLowerCase()).slice(-12);
      const match = WORDS.find(entry => buffer.endsWith(entry.word));
      if (match) { buffer = ""; match.run(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
