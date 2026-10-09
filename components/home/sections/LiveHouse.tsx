"use client";

import { useRef, useState, type PointerEvent } from "react";
import SectionHead from "../SectionHead";
import { Bass, Drum, Mic, Pick, Spark } from "../art/Icons";
import { TECH_STACK } from "@/lib/services";
import { useVnSettings } from "@/lib/home/settings";
import { pluck } from "@/lib/home/sound";
import { unlock } from "@/lib/home/achievements";
import { toast } from "@/lib/home/store";
import s from "./live.module.css";

const MEMBERS = [
  { part: "主音吉他", role: "前端", color: "var(--pink)", Icon: Pick, skills: ["Next.js", "React", "动效与视觉"], line: "平时不太说话，但代码会替我开口。" },
  { part: "鼓", role: "运维", color: "var(--yellow)", Icon: Drum, skills: ["Docker", "Cloudflare Tunnel", "监控"], line: "把节奏稳住，服务就不会掉拍。" },
  { part: "贝斯", role: "后端", color: "var(--blue)", Icon: Bass, skills: ["FastAPI", "SQLite", "存储"], line: "低音很少被注意到，可少了它就不成曲子。" },
  { part: "主唱", role: "机器人", color: "var(--red)", Icon: Mic, skills: ["AstrBot", "自动化", "Live2D"], line: "负责笑着和大家打招呼的那一位。" },
] as const;

const STRINGS = [
  { note: "E", hz: 329.63 },
  { note: "B", hz: 246.94 },
  { note: "G", hz: 196 },
  { note: "D", hz: 146.83 },
  { note: "A", hz: 110 },
  { note: "E", hz: 82.41 },
] as const;

function Guitar() {
  const { settings, update } = useVnSettings();
  const [rings, setRings] = useState<number[]>(() => STRINGS.map(() => 0));
  const plucked = useRef(new Set<number>());
  const hinted = useRef(false);

  const strike = (index: number) => {
    setRings(current => current.map((value, i) => (i === index ? value + 1 : value)));
    pluck(STRINGS[index].hz);
    plucked.current.add(index);
    if (!settings.sound && !hinted.current) {
      hinted.current = true;
      toast({ title: "嘘——现在是静音的", body: "点右边的「声音」按钮，就能听见弦响了。" });
    }
    if (plucked.current.size === STRINGS.length && unlock("guitar")) {
      toast({ title: "六根弦都响了", body: "台下好像有人在小声鼓掌。……是错觉吗？", tone: "gold" });
    }
  };

  const onEnter = (event: PointerEvent<HTMLButtonElement>, index: number) => {
    if (event.pointerType === "mouse") strike(index);
  };

  return (
    <div className={s.guitar}>
      <div className={s.neck} role="group" aria-label="吉他指板，拨动琴弦">
        <div className={s.frets} aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => <span key={i} data-dot={[2, 4, 6, 8].includes(i) ? "1" : i === 11 ? "2" : undefined} />)}
        </div>
        {STRINGS.map((string, index) => (
          <button
            key={index}
            type="button"
            className={s.string}
            onClick={() => strike(index)}
            onPointerEnter={event => onEnter(event, index)}
            aria-label={`第 ${index + 1} 弦 ${string.note}`}
            style={{ ["--thick" as string]: `${1 + index * 0.45}px` }}
          >
            <span key={rings[index]} className={rings[index] ? s.ring : undefined} />
          </button>
        ))}
      </div>
      <div className={s.guitarSide}>
        <p>划过琴弦，或者用键盘逐根拨响。</p>
        <button type="button" className={s.soundToggle} aria-pressed={settings.sound} onClick={() => update({ sound: !settings.sound })}>
          {settings.sound ? "声音 · 开" : "声音 · 关"}
        </button>
      </div>
    </div>
  );
}

export default function LiveHouse() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="wrap">
        <SectionHead index="04" kicker="Live House · 关于" title="吉他、孤独与蓝色星球" id="about-title">
          台上的灯一亮，就没有退路了。——不过别紧张，台下的人其实都很温柔。
        </SectionHead>

        <div className={s.grid}>
          <article className={`${s.poster} paper`} aria-label="演出海报">
            <span className={s.tape} aria-hidden="true" />
            <span className={`${s.tape} ${s.tape2}`} aria-hidden="true" />
            <p className={s.posterVenue}>LIVE HOUSE <b>STARRY</b></p>
            <h3 className={s.posterTitle}>洛墨<br /><span>一人乐队</span></h3>
            <p className={s.posterTime}>OPEN 18:30 / START 19:00</p>
            <p className={s.posterPrice}>TICKET ¥0 <small>+1 DRINK</small></p>
            <ol className={s.setlist} aria-label="曲目单">
              {TECH_STACK.map(item => <li key={item}>{item}</li>)}
              <li className={s.encore}>EN. 下一首还没写完</li>
            </ol>
            <p className={s.posterFoot}><Spark size={10} /> 本场演出全程自托管</p>
          </article>

          <div className={s.copy}>
            <div className={s.intro}>
              <p>你好呀，我是<b>洛墨</b>。喜欢写代码，也喜欢二次元。日常在服务器、前端、AI 和自动化之间来回穿梭，把脑海里那句「要是有这个就好了」，一点点变成真的。</p>
              <p>这座车站没有宏大的使命，只是想给喜欢的东西留一个位置。工具可以实用，界面可以漂亮，技术也可以有一点温度。</p>
              <a className={s.github} href="https://github.com/luomo66ccff" target="_blank" rel="noopener noreferrer">在 GitHub 找到我 ↗</a>
            </div>

            <ul className={s.members}>
              {MEMBERS.map(({ part, role, color, Icon, skills, line }) => (
                <li key={part} className={s.member} style={{ ["--c" as string]: color }}>
                  <span className={s.memberIcon}><Icon size={22} /></span>
                  <div>
                    <p className={s.memberPart}>{part} <span>· {role}</span></p>
                    <p className={s.memberLine}>{line}</p>
                    <p className={s.memberSkills}>{skills.join(" / ")}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Guitar />
      </div>
    </section>
  );
}
