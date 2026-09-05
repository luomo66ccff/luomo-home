"use client";
import { useRef, useState } from "react";
import { Bot, Code2, Files, Gauge, Terminal } from "lucide-react";
import { TECH_STACK } from "@/lib/services";
import styles from "./HomeExperience.module.css";
const phases = [
  { phase: "01", title: "LuomoOps", subtitle: "先让运行状态变得清楚", body: "从服务心跳和日常运维开始，把零散的事件与监控信号收进同一个控制台。看得清楚，才能从容维护。", icon: Gauge },
  { phase: "02", title: "LuomoFile", subtitle: "给文件一个安稳的落脚点", body: "从私人上传到临时分享，把储存、访问与分享各自整理好。让重要的资料随时可以找到。", icon: Files },
  { phase: "03", title: "LuomoAPI", subtitle: "把能力连接成接口", body: "为应用提供统一的接口入口，整理密钥、权限与调用路径，让下一个小工具更容易开始。", icon: Code2 },
  { phase: "04", title: "LuomoTerminal", subtitle: "让远程工作触手可及", body: "将 SSH、SFTP 与项目操作放进个人云服务的同一张地图。在需要时，迅速回到工作现场。", icon: Terminal },
  { phase: "05", title: "AstrBot API", subtitle: "为云端留一点陪伴", body: "从实用工具延伸到机器人与自动化，也为交互伙伴留出位置。让这里成为一个可以持续生长的数字空间。", icon: Bot },
];
export default function BuildTimeline() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const phase = phases[active];
  return <div className={styles.sectionInner}><header className={styles.sectionHeader}><div><p className={styles.eyebrow}>06 / THE BUILD JOURNAL</p><h2 className={styles.sectionTitle}>一点一点，<span>把这里变成家。</span></h2></div><p className={styles.sectionDescription}>每个项目解决一个具体的小问题。<br />它们连在一起，就是这片云端的日常。</p></header>
    <div className={styles.timelineLayout}><div className={styles.timelineTabs} role="tablist" aria-label="项目构建手记">{phases.map((p, i) => {
      const Icon = p.icon;
      return <button ref={el => { tabs.current[i] = el; }} id={"build-tab-" + i} key={p.phase} className={styles.timelineTab + (active === i ? " " + styles.timelineTabActive : "")} role="tab" aria-selected={active === i} aria-controls="build-panel" tabIndex={active === i ? 0 : -1} onClick={() => setActive(i)} onKeyDown={event => {
        const key = event.key;
        if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(key)) return;
        event.preventDefault();
        const next = key === "Home" ? 0 : key === "End" ? phases.length - 1 : (i + (key === "ArrowDown" || key === "ArrowRight" ? 1 : -1) + phases.length) % phases.length;
        setActive(next); tabs.current[next]?.focus();
      }}><span className={styles.timelineTabIcon}><Icon size={16} /></span><span>{p.title}<small>CHAPTER / {p.phase}</small></span></button>;
    })}</div><div id="build-panel" role="tabpanel" aria-labelledby={"build-tab-" + active} tabIndex={0} className={styles.timelineDetail}><div><span className={styles.timelinePhase}>CHAPTER / {phase.phase}</span><h3>{phase.title}</h3><p className={styles.timelineSubtitle}>{phase.subtitle}</p><p className={styles.timelineBody}>{phase.body}</p></div><div className={styles.stackList} aria-label="使用的技术">{TECH_STACK.map(item => <span className={styles.stackItem} key={item}>{item}</span>)}</div></div></div>
  </div>;
}
