"use client";

import { useMemo, useState } from "react";
import SectionHead from "../SectionHead";
import { STATIONS } from "@/content/stations";
import { useServiceStatus } from "@/components/ServiceStatusProvider";
import type { SignalState } from "@/lib/service-signals";
import { hhmm } from "@/lib/home/hooks";
import s from "./board.module.css";

const TICKER = "本站列车均为自托管运行 · 请勿在车门关闭时强行上车 · 遗失物品请至文件星港招领 · 七号车厢的小旅客正在看星星，请保持安静 · 机器人也有休息的权利 · 下一班车，开往有你的明天 ·";

const STATE_TEXT: Record<SignalState, string> = { operational: "正点", degraded: "晚点", down: "停运", unknown: "待确认" };

function remark(id: string, state: SignalState) {
  if (state === "operational") return id === "ops" ? "今夜也有人值班" : "";
  if (state === "degraded") return "部分车厢晚点";
  if (state === "down") return id === "atri" ? "乘务员充电中 · 禁止机器人歧视" : "临时停运 · 正在抢修";
  return "正在联络本站";
}

function Flap({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`${s.flap} ${className ?? ""}`}>
      <span className="visually-hidden">{text}</span>
      {Array.from(text).map((char, i) => (
        <span key={`${i}-${char}`} className={s.cell} style={{ animationDelay: `${i * 45}ms` }} aria-hidden="true">{char === " " ? "\u00a0" : char}</span>
      ))}
    </span>
  );
}

export default function DepartureBoard() {
  const { data, loading, error, refresh, metrics } = useServiceStatus();
  const [spinning, setSpinning] = useState(false);
  const signals = useMemo(() => new Map((data?.services ?? []).map(entry => [entry.id, entry])), [data]);
  const updated = data ? hhmm(new Date(data.updated_at)) : "--:--";

  const onRefresh = async () => {
    setSpinning(true);
    await refresh();
    setSpinning(false);
  };

  return (
    <section id="operations" className="section" aria-labelledby="operations-title">
      <div className="wrap">
        <SectionHead index="02" kicker="Departures · 发车信息" title="发车信息板" id="operations-title">
          每分钟向各站发一次问候。正点、晚点还是停运，都会如实写在板子上——这座车站不会骗人。
        </SectionHead>

        <div className={s.board}>
          <div className={s.top}>
            <p className={s.brand}><span className={s.lamp} aria-hidden="true" />洛墨站 · 出发 <em>DEPARTURES</em></p>
            <div className={s.summary} aria-live="polite">
              <span>运营 <b>{data ? metrics.operational : "-"}</b>/{STATIONS.length}</span>
              <span>需关注 <b>{data ? metrics.attention : "-"}</b></span>
              <span>中位延迟 <b>{metrics.median != null ? `${metrics.median}ms` : "—"}</b></span>
              <span>更新 <b suppressHydrationWarning>{updated}</b></span>
            </div>
            <button type="button" className={s.refresh} onClick={onRefresh} disabled={loading || spinning} data-busy={loading || spinning}>
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {loading || spinning ? "联络中" : "刷新"}
            </button>
          </div>

          <div className={s.tableWrap}>
            <table className={s.table}>
              <caption className="visually-hidden">各站点运行状态</caption>
              <thead>
                <tr><th scope="col">车次</th><th scope="col">开往</th><th scope="col">站台</th><th scope="col">状态</th><th scope="col">延迟</th><th scope="col" className={s.remarkCol}>备注</th></tr>
              </thead>
              <tbody>
                {STATIONS.map((station, index) => {
                  const signal = signals.get(station.id);
                  const state = signal?.status ?? "unknown";
                  return (
                    <tr key={station.id} data-state={state}>
                      <td><Flap text={`LM${String(index + 1).padStart(2, "0")}`} className={s.code} /></td>
                      <td>
                        <span className={s.dest}>{station.title}</span>
                        <span className={s.serviceName}>{station.name}</span>
                      </td>
                      <td><a className={s.host} href={station.url} target="_blank" rel="noopener noreferrer">{station.host}</a></td>
                      <td><Flap text={STATE_TEXT[state]} className={s.state} /></td>
                      <td><Flap text={signal?.latency_ms != null ? `${signal.latency_ms}ms` : "---"} className={s.latency} /></td>
                      <td className={s.remarkCol}><span className={s.remark}>{remark(station.id, state)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className={s.ticker} aria-hidden="true">
            <span>{TICKER}<span className={s.dup}> {TICKER}</span></span>
          </p>
          {error && <p className={s.error} role="status">{error}</p>}
        </div>
      </div>
    </section>
  );
}
