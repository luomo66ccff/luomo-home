"use client";

import { useEffect, useRef, useState } from "react";
import SectionHead from "../SectionHead";
import { Fish, GardenEel, LogoMark, Spark } from "../art/Icons";
import { dayKey, drawFortune, type Fortune } from "@/lib/home/omikuji";
import { moonLitPath, moonPhase } from "@/lib/home/moon";
import { ACHIEVEMENTS, getUnlocked, unlock } from "@/lib/home/achievements";
import { chime } from "@/lib/home/sound";
import { KEYS, readJson, scrollToSection, toast, writeJson } from "@/lib/home/store";
import { useClock } from "@/lib/home/hooks";
import s from "./cafe.module.css";

const MENU = [
  { name: "星光特调咖啡", price: "¥0", note: "续杯自由；有蝴蝶飞进店里的日子，半价" },
  { name: "柚子茶", price: "¥0", note: "本店四大招牌之一" },
  { name: "三色团子", price: "¥0", note: "店长手作" },
  { name: "鲷鱼烧", price: "¥0", note: "刚出炉，小心烫——「うぐぅ」" },
  { name: "岛上的波子汽水", price: "限定", note: "夏天才有" },
  { name: "完熟芒果布丁", price: "售罄", note: "纸箱已回收" },
  { name: "应急食品", price: "不供应", note: "「才不是！」" },
];

type Slip = { seed: string; day: string };

function parseSlip(raw: string | null): Slip | null {
  try {
    const data = raw ? JSON.parse(raw) : null;
    return data && typeof data.seed === "string" && typeof data.day === "string" ? { seed: data.seed.slice(0, 32), day: data.day.slice(0, 10) } : null;
  } catch {
    return null;
  }
}

function Chalkboard() {
  const [said, setSaid] = useState<{ fish: number; eel: number }>({ fish: 0, eel: 0 });

  const pose = (part: "fish" | "eel") => {
    const now = Date.now();
    setSaid(current => {
      const next = { ...current, [part]: now };
      if (next.fish && next.eel && Math.abs(next.fish - next.eel) < 4000 && unlock("sakana")) {
        toast({ title: "さかな～　ちんあなご～", body: "姿势很标准。店里的两位店员好像很满意。", tone: "gold" });
      }
      return next;
    });
  };

  return (
    <article className={s.board} aria-labelledby="cafe-menu-title">
      <header className={s.boardHead}>
        <p>Café · Terminus</p>
        <h3 id="cafe-menu-title">今日推荐</h3>
      </header>
      <ul className={s.menu}>
        {MENU.map(item => (
          <li key={item.name}>
            <span className={s.menuName}>{item.name}</span>
            <span className={s.menuDots} aria-hidden="true" />
            <span className={s.menuPrice}>{item.price}</span>
            <small>{item.note}</small>
          </li>
        ))}
      </ul>
      <p className={s.request}>✎ 委托受理中：找猫 · 修电脑 · 教吉他 · 陪聊天</p>
      <div className={s.doodles}>
        <button type="button" className={s.doodle} onClick={() => pose("fish")} data-said={said.fish > 0} aria-label="黑板上的鱼">
          <Fish size={64} />
          <span className={s.bubble} key={said.fish}>さかな～</span>
        </button>
        <button type="button" className={`${s.doodle} ${s.eel}`} onClick={() => pose("eel")} data-said={said.eel > 0} aria-label="黑板上的花园鳗">
          <GardenEel size={54} />
          <span className={s.bubble} key={said.eel}>ちんあなご～</span>
        </button>
      </div>
    </article>
  );
}

function Omikuji() {
  const now = useClock(60_000);
  const [slip, setSlip] = useState<Slip | null>(null);
  const [shaking, setShaking] = useState(false);
  const today = now ? dayKey(now) : null;

  useEffect(() => {
    const sync = () => setSlip(readJson(KEYS.omikuji, parseSlip));
    sync();
    window.addEventListener("luomo:progress-reset", sync);
    return () => window.removeEventListener("luomo:progress-reset", sync);
  }, []);

  const drawnToday = !!slip && slip.day === today;
  const fortune: Fortune | null = drawnToday && slip ? drawFortune(`${slip.seed}:${slip.day}`) : null;

  const draw = () => {
    if (!today || drawnToday) return;
    setShaking(true);
    window.setTimeout(() => {
      const seed = slip?.seed ?? Math.random().toString(36).slice(2, 12);
      const next = { seed, day: today };
      writeJson(KEYS.omikuji, next);
      setSlip(next);
      setShaking(false);
      const result = drawFortune(`${seed}:${today}`);
      chime(result.rank === "大吉" ? 5 : 4);
      if (result.rank === "大吉") {
        unlock("omikuji");
        toast({ title: "大吉！", body: "神明在看着你。今天要做的事，大概都会顺利。", tone: "gold" });
      }
    }, 900);
  };

  return (
    <article className={s.omikuji} aria-labelledby="omikuji-title" aria-live="polite">
      <header className={s.cardHead}>
        <svg className={s.torii} width="26" height="22" viewBox="0 0 26 22" aria-hidden="true" focusable="false">
          <path d="M1 3C8 5 18 5 25 3V6.5C18 8 8 8 1 6.5Z" fill="currentColor" />
          <path d="M4 10H22V12.5H4Z" fill="currentColor" />
          <path d="M6.5 6.5H9V22H6.5ZM17 6.5H19.5V22H17ZM12 7.5H14V10H12Z" fill="currentColor" />
        </svg>
        <h3 id="omikuji-title">温泉街神社 · 御神签</h3>
      </header>
      {fortune ? (
        <div className={s.slip}>
          <p className={s.slipNo}>第 {fortune.number} 番</p>
          <p className={s.rank} data-rank={fortune.rank}>{fortune.rank}</p>
          <p className={s.message}>{fortune.message}</p>
          <dl className={s.yiji}>
            <div><dt>宜</dt><dd>{fortune.good}</dd></div>
            <div><dt>忌</dt><dd>{fortune.bad}</dd></div>
          </dl>
          <p className={s.tomorrow}>一天只能抽一次哦，明天再来吧。</p>
        </div>
      ) : (
        <div className={s.draw}>
          <div className={`${s.box} ${shaking ? s.shake : ""}`} aria-hidden="true">
            <span className={s.stick} />
            <span>御</span><span>神</span><span>签</span>
          </div>
          <button type="button" className="btn btn--gold" onClick={draw} disabled={!today || shaking}>{shaking ? "摇签中……" : "求一支签"}</button>
          <p className={s.hint}>据说这座神社的神明，偶尔会附在刀上。</p>
        </div>
      )}
    </article>
  );
}

function MoonCard() {
  const now = useClock(600_000);
  const phase = now ? moonPhase(now) : null;
  const full = phase && (phase.daysToFull < 0.75 || phase.daysToFull > 29.53 - 0.75);
  return (
    <article className={s.moonCard} aria-labelledby="moon-title">
      <svg className={s.moon} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <circle cx="60" cy="60" r="60" fill="var(--moon-dark)" />
        {phase && <path d={moonLitPath(phase.fraction, 60)} fill="#f6ecd2" />}
        <circle cx="60" cy="60" r="59.5" fill="none" stroke="rgba(255, 240, 200, 0.3)" />
      </svg>
      <div>
        <h3 id="moon-title" className={s.moonTitle} suppressHydrationWarning>今晚的月亮：{phase ? phase.name : "……"}</h3>
        <p className={s.moonMeta} suppressHydrationWarning>{phase ? `被照亮了 ${Math.round(phase.illumination * 100)}% · 月龄 ${phase.age.toFixed(1)} 天` : "正在抬头看天"}</p>
        <p className={s.moonLine} suppressHydrationWarning>
          {!phase ? "" : full ? "今晚是满月。月亮那边，好像有人要来接谁了。" : `距离下一次满月，还有 ${Math.ceil(phase.daysToFull)} 天。`}
        </p>
      </div>
    </article>
  );
}

export default function CafeTerminus() {
  const terminus = useRef<HTMLDivElement>(null);
  const [collected, setCollected] = useState<number | null>(null);
  const total = ACHIEVEMENTS.length;
  const trueEnd = collected === total;

  useEffect(() => {
    const sync = () => setCollected(new Set(getUnlocked()).size);
    sync();
    window.addEventListener("luomo:achievement", sync);
    window.addEventListener("luomo:progress-reset", sync);
    return () => {
      window.removeEventListener("luomo:achievement", sync);
      window.removeEventListener("luomo:progress-reset", sync);
    };
  }, []);

  useEffect(() => {
    const el = terminus.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (unlock("terminus")) toast({ title: "终点站到了", body: "感谢乘坐夜行线。下一班车，开往有你的明天。" });
        observer.disconnect();
      }
    }, { threshold: 0.6 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="enter" className="section" aria-labelledby="enter-title">
      <div className="wrap">
        <SectionHead index="07" kicker="Terminus · 终点站" title="终点站 · 喫茶" id="enter-title">
          到站了。要不要坐下来喝一杯？这家店的咖啡续杯自由，店员偶尔也会接一些……奇怪的委托。
        </SectionHead>

        <div className={s.grid}>
          <Chalkboard />
          <div className={s.side}>
            <Omikuji />
            <MoonCard />
          </div>
        </div>

        <div className={s.terminus} ref={terminus} data-ending={trueEnd ? "true" : "normal"}>
          <LogoMark size={46} />
          <p className={s.ending}>{trueEnd ? "— TRUE END —" : "— NORMAL END —"}</p>
          <h3 className={s.terminusTitle}>世界很大，<br />下一站<span>见。</span></h3>
          <p>{trueEnd ? "谢谢你陪我走完了全部的旅程。愿你往后的每一刻，都是值得珍藏的时光。" : "愿每一次连接，都通往更辽阔的世界。"}</p>
          {collected !== null && !trueEnd && (
            <p className={s.progress}>已收集 {collected} / {total} 枚旅途记忆 · 全部收集后，结局会改变</p>
          )}
          <div className={s.actions}>
            <button type="button" className="btn btn--gold" onClick={() => scrollToSection("hero")}>回到 0 号站台 <Spark size={12} /></button>
            <a className="btn" href="https://github.com/luomo66ccff/luomo-home" target="_blank" rel="noopener noreferrer">这座车站的源代码 ↗</a>
          </div>
          <p className={s.until}>UNTIL NEXT TIME, TRAVELER.</p>
        </div>
      </div>
    </section>
  );
}
