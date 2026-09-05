"use client";

import { ArrowUpRight, RefreshCw, Radio } from "lucide-react";
import { SERVICES } from "@/lib/services";
import { SIGNAL_LABELS } from "@/lib/service-signals";
import { useServiceStatus } from "./ServiceStatusProvider";
import styles from "./HomeExperience.module.css";

export default function OperationsCockpit() {
  const { data, error, loading, refresh, metrics } = useServiceStatus();
  const timestamp = data ? new Date(data.updated_at).toLocaleTimeString("zh-CN", { hour12: false }) : null;
  return <div className={styles.sectionInner}>
    <header className={styles.sectionHeader}><div><p className={styles.eyebrow}>03 / CLOUD PULSE</p><h2 className={styles.sectionTitle}>听见云端的<span>每一次心跳。</span></h2></div><p className={styles.sectionDescription}>真实的信号，清楚的状态。<br />每一个正在运行的小世界，都值得认真照看。</p></header>
    <div className={styles.operationsGrid}>
      <div className={styles.pulsePanel}><span className={styles.pulseLabel}><Radio size={16} /> NETWORK OBSERVATORY</span><div className={styles.pulseOrbit} aria-hidden="true"><span /><span /><span /><b>✳</b></div><div className={styles.pulseHeadline}><strong>{data ? metrics.operational : "—"}<span> / {SERVICES.length}</span></strong><p>{error ? "等待重新连接" : data ? "项服务响应正常" : "正在接收信号"}</p></div><a href={SERVICES[0].url} target="_blank" rel="noopener noreferrer" className={styles.textLink}>打开完整控制台 <ArrowUpRight size={14} /></a></div>
      <div className={styles.signals}>
        <div className={styles.signalHeader}><div><strong>服务信号</strong><span>{error ? data ? "更新失败 · 显示上次记录 " + timestamp : "暂未获取到状态" : timestamp ? "最近检测 " + timestamp : "首次检测中…"}</span></div><button className={styles.iconButton} onClick={() => void refresh()} disabled={loading} aria-label="刷新服务状态"><RefreshCw className={loading ? styles.spinning : ""} size={16} /></button></div>
        {error && <p className={styles.inlineNotice} role="status">{error}</p>}
        <ul className={styles.signalList}>{SERVICES.map(meta => {
          const service = data?.services.find(s => s.id === meta.id);
          const state = service?.status ?? "unknown";
          return <li className={styles.signalRow} key={meta.id}><div className={styles.signalIdentity}><span className={styles.statusDot} data-state={state} /><strong>{meta.name}</strong></div><span className={styles.signalLatency}>{service?.latency_ms != null ? service.latency_ms + " ms" : "—"}</span><span className={styles.statusBadge} data-state={state}>{!data && loading ? "检测中" : SIGNAL_LABELS[state]}</span></li>;
        })}</ul>
        <div className={styles.signalFooter}><span>正常响应中位数 <strong>{metrics.median === null ? "—" : metrics.median + " ms"}</strong></span><span>待关注 <strong>{data ? metrics.attention : "—"}</strong></span></div>
      </div>
    </div>
  </div>;
}
