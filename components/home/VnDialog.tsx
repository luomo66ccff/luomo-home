"use client";

import { useCallback, useEffect, useState } from "react";
import { TEXT_SPEED_MS, useVnSettings } from "@/lib/home/settings";
import { openConfig, scrollToSection } from "@/lib/home/store";
import { quickLoad, quickSave } from "@/lib/home/quicksave";
import { blip } from "@/lib/home/sound";
import { useReducedMotion } from "@/lib/home/hooks";
import s from "./vn.module.css";

export type VnChoice = { label: string; onSelect: () => void };

type Props = {
  speaker: string;
  lines: readonly string[];
  choices?: readonly VnChoice[];
  className?: string;
  system?: boolean;
};

export default function VnDialog({ speaker, lines, choices, className, system = true }: Props) {
  const { settings } = useVnSettings();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [auto, setAuto] = useState(false);
  const signature = lines.join("\n");
  const line = lines[index] ?? "";
  const typed = count >= line.length;
  const finished = typed && index >= lines.length - 1;
  const speed = TEXT_SPEED_MS[settings.textSpeed] ?? 38;

  useEffect(() => { setIndex(0); setCount(0); }, [signature]);

  useEffect(() => {
    if (typed) return;
    if (speed === 0 || reduce) { setCount(line.length); return; }
    const timer = window.setTimeout(() => {
      setCount(value => value + 1);
      if (count % 3 === 0) blip();
    }, speed);
    return () => window.clearTimeout(timer);
  }, [count, line, typed, speed, reduce]);

  const advance = useCallback(() => {
    if (!typed) { setCount(line.length); return; }
    if (index < lines.length - 1) { setIndex(value => value + 1); setCount(0); }
  }, [typed, line.length, index, lines.length]);

  useEffect(() => {
    if (!auto || !typed || finished) return;
    const timer = window.setTimeout(advance, settings.autoDelay * 1000);
    return () => window.clearTimeout(timer);
  }, [auto, typed, finished, advance, settings.autoDelay]);

  const skip = () => { const last = lines.length - 1; setIndex(last); setCount(lines[last]?.length ?? 0); };

  return (
    <div className={`vn ${s.box} ${className ?? ""}`}>
      <span className="vn-name">{speaker}</span>
      <button type="button" className={s.advance} onClick={advance} aria-label={finished ? "对话已结束" : "下一句"} data-finished={finished}>
        <span className="vn-text" aria-hidden="true">
          {line.slice(0, count)}
          {!finished && typed && <span className="vn-cursor">▼</span>}
        </span>
      </button>
      <p className="visually-hidden">{speaker}：{lines.join("")}</p>
      {choices && choices.length > 0 && (
        <div className={s.choices} data-ready={finished}>
          {choices.map(choice => (
            <button key={choice.label} type="button" className={s.choice} onClick={choice.onSelect}>
              <span aria-hidden="true">✦</span>{choice.label}
            </button>
          ))}
        </div>
      )}
      {system && (
        <div className={`vn-sys ${s.sys}`}>
          <span className={s.page} aria-hidden="true">{index + 1}/{lines.length}</span>
          <button type="button" aria-pressed={auto} onClick={() => setAuto(value => !value)}>AUTO</button>
          <button type="button" onClick={skip}>SKIP</button>
          <button type="button" onClick={() => scrollToSection("log")}>LOG</button>
          <button type="button" onClick={quickSave}>Q.SAVE</button>
          <button type="button" onClick={quickLoad}>Q.LOAD</button>
          <button type="button" onClick={openConfig}>CONFIG</button>
        </div>
      )}
    </div>
  );
}
