"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight, Sparkles, Command } from "lucide-react";
import { visualAssets } from "@/lib/visual-assets";
import { useServiceStatus } from "./ServiceStatusProvider";
import styles from "./HomeExperience.module.css";

export default function HeroCore() {
  const { data, error, loading, metrics } = useServiceStatus();
  const signal = error ? "状态暂不可用" : data ? metrics.operational + " / " + data.services.length + " 项服务正常" : "正在接收服务信号";
  return (
    <>
      <div className={styles.heroArtwork}>
        <Image className={styles.heroBackdrop} src={visualAssets.hero.primary} alt="月光下的云端观测站，少女与星球投影相伴" fill sizes="(max-width: 760px) 100vw, 72vw" priority />
        <div className={styles.heroShade} aria-hidden="true" />
        <span className={styles.artCoordinate}>OBSERVATORY — 01 / LUOMO.MOE</span>
      </div>
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span className={styles.tinyStar}>✳</span> A LITTLE SPACE, A BIG UNIVERSE</p>
          <h1 className={styles.heroTitle}>在云端，<br />让<span>热爱</span>发生<span className={styles.titlePeriod}>.</span></h1>
          <p className={styles.heroLead}>你好，我是洛墨。<span>写一点代码，造一些小工具，收藏沿途的星光。<br className={styles.desktopBreak} />这里是我的数字基地，也是通往所有想法的入口。</span></p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#services">探索我的云端 <ArrowUpRight size={17} /></a>
            <a className={styles.secondaryAction} href="https://github.com/luomo66ccff" target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={15} /></a>
          </div>
          <div className={styles.heroFootnote}><span /> PERSONAL SPACE · BUILT WITH CURIOSITY</div>
        </div>
        <a className={styles.heroSceneCard} href="#worlds"><Sparkles size={18} /><span><small>此刻，在另一片星空</small><strong>星海观测室 <ArrowUpRight size={13} /></strong></span></a>
      </div>
      <div className={styles.statusRail}>
        <div className={styles.statusRailInner}>
          <a href="#operations" className={styles.railSignal}><span className={styles.statusDot} data-state={error ? "unknown" : data ? metrics.attention ? "degraded" : metrics.operational === data.services.length ? "operational" : "unknown" : "unknown"} /><span>{signal}</span>{loading && data && <small>同步中</small>}<ArrowUpRight size={13} /></a>
          <span className={styles.railNote}>代码有逻辑，热爱无边界。</span>
          <a className={styles.scrollHint} href="#services">SCROLL TO EXPLORE <ArrowDown size={13} /></a>
          <button className={styles.railCommand} onClick={() => window.dispatchEvent(new Event("luomo:command"))} aria-label="打开快捷指令"><Command size={13} /> K</button>
        </div>
      </div>
    </>
  );
}
