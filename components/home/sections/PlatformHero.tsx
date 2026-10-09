"use client";

import { useMemo } from "react";
import HeroScene from "./HeroScene";
import NightTicket from "./NightTicket";
import VnDialog, { type VnChoice } from "../VnDialog";
import { TrainGlyph } from "../art/Icons";
import { useServiceStatus } from "@/components/ServiceStatusProvider";
import { SERVICES } from "@/lib/services";
import { openCompanion, scrollToSection } from "@/lib/home/store";
import { hhmm, useClock, useDocumentTheme } from "@/lib/home/hooks";
import s from "./hero.module.css";

const NIGHT_LINES = [
  "各位旅客晚上好，这里是洛墨站。今晚的月色很美——适合出发，也适合把没写完的代码写完。",
  "本次列车途经监控空间站、文件星港、酒店前台、地下控制室，终点是海边那间机器人邮局。",
  "……对了，您的邻座 07B 是一位白头发的小旅客。她说要一直看着窗外，直到星星靠站——经过的时候，请放轻脚步。",
  "车票请收好，乘务员就在车厢尽头。……那么，愿此行，终抵群星。",
] as const;

const DAY_LINES = [
  "早上好，这里是洛墨站。今天的天空很蓝，蓝得像是谁把夏天整个装进了波子汽水瓶。",
  "列车白天也照常运行。五座站点都在线路图上，迷路的话，就跟着蓝色的蝴蝶走吧。",
  "岛上的老奶奶说，那种发光的蝴蝶会把谁的记忆藏在翅膀里。遇见了的话，记得轻轻打个招呼。",
  "车票请收好，乘务员就在车厢尽头。……那么，愿此行，终抵群星。",
] as const;

function StatusChip() {
  const { data, loading, metrics } = useServiceStatus();
  const total = SERVICES.length;
  return (
    <button type="button" className={s.status} onClick={() => scrollToSection("operations")} aria-label="查看发车信息板">
      <span className="dot" data-state={loading && !data ? "unknown" : metrics.attention > 0 ? "degraded" : "operational"} />
      {loading && !data
        ? <span>正在联络各站……</span>
        : <span><b>{metrics.operational}/{total}</b> 站运营中{metrics.median ? <> · 中位延迟 <b>{metrics.median}ms</b></> : null}</span>}
    </button>
  );
}

export default function PlatformHero() {
  const theme = useDocumentTheme();
  const now = useClock();
  const choices = useMemo<VnChoice[]>(() => [
    { label: theme === "light" ? "先看看今天的线路图" : "先看看今晚的线路图", onSelect: () => scrollToSection("services") },
    { label: "去祈愿池碰碰运气", onSelect: () => scrollToSection("projects") },
    { label: "和车厢尽头的乘务员聊聊", onSelect: () => openCompanion() },
  ], [theme]);

  return (
    <section id="hero" className={s.hero} aria-labelledby="hero-title">
      <HeroScene />
      <div className={`wrap ${s.inner}`}>
        <div className={s.copy}>
          <p className={s.kicker}>
            <TrainGlyph size={38} />
            <span>Night Line · Platform 0</span>
            <time suppressHydrationWarning>{now ? hhmm(now) : "--:--"}</time>
          </p>
          <h1 id="hero-title" className={s.title}>
            <span className={s.titleNight}>今晚的<em>月色</em>，<br />适合出发。</span>
            <span className={s.titleDay}>今天的<em>天空</em>，<br />适合出发。</span>
          </h1>
          <p className={s.lead}>
            这里是<b>洛墨站</b>，一座自托管小宇宙的始发站。五座站点、一位高性能的乘务员，
            还有一些只有懂的人才会会心一笑的东西。
          </p>
          <VnDialog speaker="列车长" lines={theme === "light" ? DAY_LINES : NIGHT_LINES} choices={choices} />
        </div>
        <aside className={s.aside} aria-label="车票与运行状态">
          <StatusChip />
          <NightTicket />
        </aside>
      </div>
      <div className={s.platform}>
        <div className={s.sign} role="img" aria-label="站名牌：洛墨站。上一站穗织，下一站鸟白岛">
          <div className={s.board}>
            <span className={s.signNo}><span>LM<b>00</b></span></span>
            <div className={s.signMain}>
              <small>らくぼく</small>
              <strong>洛墨</strong>
              <em>LUOMO</em>
            </div>
            <span className={s.signSide}><span>NIGHT</span><span>LINE</span></span>
            <div className={s.signBar}>
              <span>← 穗织<i>HOORI</i></span>
              <span>鸟白岛<i>TORISHIRO</i> →</span>
            </div>
          </div>
        </div>
        <div className={s.edge} />
      </div>
    </section>
  );
}
