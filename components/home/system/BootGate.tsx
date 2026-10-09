"use client";

import { useCallback, useEffect, useState } from "react";
import { Glyph, LogoMark } from "../art/Icons";
import { BOARDED_KEY } from "@/lib/home/store";
import s from "./system.module.css";

const TIPS = [
  "提示：抽卡不花钱，星琼由洛墨请客。",
  "提示：月亮是可以点的。点够五次的话……",
  "提示：试着在键盘上打一声招呼。",
  "提示：按 Ctrl + K，可以使用传送锚点。",
  "提示：黑板上的鱼和花园鳗，好像想一起做点什么。",
  "提示：发光的蝴蝶，是可以碰一碰的。",
  "提示：多和乘务员说说话，好感度会悄悄上升。",
  "提示：收集齐全部的旅途记忆，终点站的结局会改变。",
];

export default function BootGate() {
  const [phase, setPhase] = useState<"idle" | "run" | "out">("idle");
  const [tip, setTip] = useState(TIPS[0]);

  const finish = useCallback(() => {
    try { sessionStorage.setItem(BOARDED_KEY, "1"); } catch {}
    delete document.documentElement.dataset.boot;
    setPhase("idle");
  }, []);

  useEffect(() => {
    if (document.documentElement.dataset.boot !== "1") return;
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    setPhase("run");
    const out = window.setTimeout(() => setPhase("out"), 2300);
    const done = window.setTimeout(finish, 2850);
    const skip = () => finish();
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      window.clearTimeout(out);
      window.clearTimeout(done);
      window.removeEventListener("keydown", skip);
    };
  }, [finish]);

  return (
    <div className={s.boot} data-phase={phase} onClick={finish} aria-hidden="true">
      <div className={s.bootRing}>
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className={s.bootGlyph} style={{ ["--i" as string]: i }}><Glyph index={i} size={22} /></span>
        ))}
        <span className={s.bootLogo}><LogoMark size={64} /></span>
      </div>
      <p className={s.bootText}>正在接入夜行线<span className={s.bootDots}>…</span></p>
      <div className={s.bootBar}><span /></div>
      <p className={s.bootTip}>{tip}</p>
    </div>
  );
}
