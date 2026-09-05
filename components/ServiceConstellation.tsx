"use client";

import { useState } from "react";
import { ArrowUpRight, Bot, Code2, Files, Gauge, Info, Terminal } from "lucide-react";
import ServiceQuickView from "./ServiceQuickView";
import { SERVICES } from "@/lib/services";
import { SIGNAL_LABELS } from "@/lib/service-signals";
import { useServiceStatus } from "./ServiceStatusProvider";
import styles from "./HomeExperience.module.css";

const icons = { ops: Gauge, file: Files, api: Code2, terminal: Terminal, atri: Bot };
const copy: Record<string, [string, string]> = {
  ops: ["云端驾驶舱", "服务状态、日常运维与事件记录，一眼掌握。"],
  file: ["私人文件星港", "收好重要文件，让临时分享轻松一点。"],
  api: ["开发者入口", "把分散的接口，连接成顺手的工具。"],
  terminal: ["远程终端桥", "从浏览器出发，连接你的远程工作台。"],
  atri: ["自动化伙伴", "连接机器人与自动化，让灵感持续运行。"],
};
export default function ServiceConstellation() {
  const { data, error, loading, refresh } = useServiceStatus();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = SERVICES.find(s => s.id === selectedId);
  const signals = data?.services ?? [];
  return (
    <div className={styles.sectionInner}>
      <header className={styles.sectionHeader}>
        <div><p className={styles.eyebrow}>01 / CONNECTED SERVICES</p><h2 className={styles.sectionTitle}>你的下一站，<span>都在这里。</span></h2></div>
        <div className={styles.sectionSide}><p className={styles.sectionDescription}>从文件到终端，让每一次连接都有清晰的目的地。</p><a href="#operations" className={styles.textLink}>查看运行状态 <ArrowUpRight size={14} /></a></div>
      </header>
      {error && <div className={styles.inlineNotice} role="status">{data ? "状态更新失败，下方为上次记录。" : error}<button onClick={() => void refresh()} disabled={loading}>{loading ? "重试中…" : "重新获取"}</button></div>}
      <div className={styles.serviceGrid}>
        {SERVICES.map(service => {
          const live = signals.find(s => s.id === service.id);
          const state = live?.status ?? "unknown";
          const Icon = icons[service.id as keyof typeof icons] ?? Code2;
          return <article className={styles.serviceCard} key={service.id}>
            <div className={styles.serviceTop}><span className={styles.serviceIcon} data-accent={service.accent}><Icon size={21} /></span><span className={styles.serviceCode}>{service.code}</span></div>
            <h3 className={styles.serviceName}>{service.name}</h3>
            <p className={styles.serviceWorld}>{copy[service.id]?.[0] ?? service.worldName}</p>
            <p className={styles.serviceDescription}>{copy[service.id]?.[1] ?? service.description}</p>
            <div className={styles.serviceBottom}>
              <span className={styles.statusBadge} data-state={state}><span className={styles.statusDot} />{!data && loading ? "检测中" : SIGNAL_LABELS[state]}</span>
              <div className={styles.serviceLinks}><button className={styles.serviceDetail} onClick={() => setSelectedId(service.id)} aria-label={"查看 " + service.name + " 详情"}><Info size={16} /></button><a className={styles.serviceLink} href={service.url} target="_blank" rel="noopener noreferrer" aria-label={"打开 " + service.name}><ArrowUpRight size={19} /></a></div>
            </div>
          </article>;
        })}
      </div>
      <p className={styles.sectionFootnote}>状态来自最近一次服务探测 · 每分钟自动更新 · 私有服务可能需要登录</p>
      {selected && <ServiceQuickView service={{ ...selected, status: signals.find(s => s.id === selectedId)?.status ?? "unknown" }} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
