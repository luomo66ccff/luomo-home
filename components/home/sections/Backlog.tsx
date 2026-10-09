"use client";

import SectionHead from "../SectionHead";
import { BACKLOG } from "@/content/backlog";
import { getVnSettings } from "@/lib/home/settings";
import { toast } from "@/lib/home/store";
import s from "./backlog.module.css";

function replay(line: string) {
  const settings = getVnSettings();
  if (!settings.sound || typeof window === "undefined" || !("speechSynthesis" in window)) {
    toast({ title: "这一句没有收录语音", body: "……其实是请不起声优。可以在 CONFIG 里打开声音试试。" });
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(line);
  utterance.lang = "zh-CN";
  utterance.volume = settings.volume;
  window.speechSynthesis.speak(utterance);
}

export default function Backlog() {
  return (
    <section id="log" className="section" aria-labelledby="log-title">
      <div className="wrap">
        <SectionHead index="06" kicker="Backlog · 已读记录" title="往回翻一翻" id="log-title">
          这座车站是一点一点长大的。按下 LOG，就能看见它说过的每一句话。
        </SectionHead>

        <div className={s.window}>
          <div className={s.top} aria-hidden="true"><span>BACKLOG</span><span>{BACKLOG.length} 条已读</span></div>
          <ol className={s.list}>
            {BACKLOG.map(entry => (
              <li key={entry.chapter} className={s.entry}>
                <p className={s.chapter}>{entry.chapter}</p>
                <div className={s.body}>
                  <p className={s.speaker}>{entry.speaker}</p>
                  <p className={s.line}>「{entry.line}」</p>
                  <p className={s.note}>{entry.note}</p>
                </div>
                <button type="button" className={s.voice} onClick={() => replay(entry.line)} aria-label={`播放语音：${entry.line}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9Z" fill="currentColor" /><path d="M16 9c1.5 1.5 1.5 4.5 0 6M18.5 6.5c3 3 3 8 0 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
