"use client";

import { useMemo, useState } from "react";
import SectionHead from "../SectionHead";
import Modal from "@/components/ui/Modal";
import ModalBody from "../ModalBody";
import { LogoMark, Spark } from "../art/Icons";
import { STATIONS, type Station } from "@/content/stations";
import { useServiceStatus } from "@/components/ServiceStatusProvider";
import { SIGNAL_LABELS, type ServiceSignal, type SignalState } from "@/lib/service-signals";
import { useReducedMotion } from "@/lib/home/hooks";
import s from "./linemap.module.css";

const W = 1000;
const H = 420;

function smoothPath(points: { x: number; y: number }[]) {
  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x} ${p2.y}`;
  }
  return d;
}

const LINE_POINTS = [{ x: -10, y: 352 }, ...STATIONS.map(({ x, y }) => ({ x, y }))];
const LINE = smoothPath(LINE_POINTS);
const LAST = STATIONS[STATIONS.length - 1];
const TAIL = `M${LAST.x} ${LAST.y}C${LAST.x + 40} ${LAST.y - 30} ${LAST.x + 60} ${LAST.y - 80} ${W + 20} ${LAST.y - 120}`;

const BG_STARS = (() => {
  let seed = 20260712;
  const next = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  return Array.from({ length: 90 }, (_, i) => ({ x: Math.round(next() * W * 10) / 10, y: Math.round(next() * H * 10) / 10, r: i % 9 === 0 ? 1.6 : 0.8 }));
})();

const CONSTELLATIONS = [
  [[70, 70], [120, 48], [170, 80], [205, 60]],
  [[440, 380], [490, 352], [532, 384], [590, 368]],
  [[820, 340], [860, 372], [910, 360], [950, 390]],
  [[600, 60], [640, 92], [690, 70]],
];

const STATE_WORD: Record<SignalState, string> = { operational: "运营中", degraded: "晚点", down: "停运", unknown: "待确认" };

function useSignals() {
  const { data } = useServiceStatus();
  return useMemo(() => new Map((data?.services ?? []).map(entry => [entry.id, entry])), [data]);
}

function StationDetail({ station, signal, index }: { station: Station; signal?: ServiceSignal; index: number }) {
  const state = signal?.status ?? "unknown";
  return (
    <div className={s.detail}>
      <header className={s.detailHead}>
        <span className={s.detailNo}>LM<b>{String(index + 1).padStart(2, "0")}</b></span>
        <div>
          <p className={s.detailStop}>{station.stop} · {station.code}</p>
          <h3 className={s.detailTitle}>{station.title}</h3>
          <p className={s.detailName}>{station.name} <span>/ {station.worldName}</span></p>
        </div>
      </header>
      <p className={s.detailSummary}>{station.summary}</p>
      <blockquote className={s.detailFlavor}>{station.flavor}</blockquote>
      <dl className={s.detailMeta}>
        <div><dt>状态</dt><dd><span className="dot" data-state={state} /> {SIGNAL_LABELS[state]}</dd></div>
        <div><dt>延迟</dt><dd>{signal?.latency_ms != null ? `${signal.latency_ms} ms` : "—"}</dd></div>
        <div><dt>站台</dt><dd className={s.mono}>{station.host}</dd></div>
      </dl>
      <div className={s.detailTags}>{station.tags.map(tag => <span key={tag} className="chip">#{tag}</span>)}</div>
      <a className="btn btn--gold" href={station.url} target="_blank" rel="noopener noreferrer">前往 {station.host} <Spark size={12} /></a>
    </div>
  );
}

export default function LineMap() {
  const signals = useSignals();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const current = open === null ? null : STATIONS[open];

  return (
    <section id="services" className="section" aria-labelledby="services-title">
      <div className="wrap">
        <SectionHead index="01" kicker="Star Rail Map · 星轨航图" title="今晚的线路图" id="services-title">
          五座站点，由一条夜行线串起来。点亮的站台正在营业；灰掉的那一站……大概是睡着了。点击站名查看详情。
        </SectionHead>

        <div className={`${s.map} orn`}>
          <svg className={s.art} data-home-motion="desktop" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="map-line" x1="0" x2="1">
                <stop offset="0" stopColor="var(--gold-deep)" />
                <stop offset=".5" stopColor="var(--gold)" />
                <stop offset="1" stopColor="var(--gold-hi)" />
              </linearGradient>
              <path id="map-route" d={LINE} />
            </defs>
            <g className={s.grid}>
              {Array.from({ length: 11 }, (_, i) => <path key={`v${i}`} d={`M${i * 100} 0V${H}`} />)}
              {Array.from({ length: 5 }, (_, i) => <path key={`h${i}`} d={`M0 ${i * 100 + 10}H${W}`} />)}
            </g>
            <g className={s.bgStars}>{BG_STARS.map((star, i) => <circle key={i} cx={star.x} cy={star.y} r={star.r} />)}</g>
            <g className={s.constellations}>
              {CONSTELLATIONS.map((points, i) => (
                <g key={i}>
                  <path d={`M${points.map(p => p.join(" ")).join("L")}`} />
                  {points.map(([x, y], j) => <circle key={j} cx={x} cy={y} r="2" />)}
                </g>
              ))}
            </g>
            <path d={LINE} className={s.lineGlow} />
            <path d={LINE} className={s.lineBase} />
            <path d={LINE} className={s.lineCore} />
            <path d={TAIL} className={s.lineTail} />
            {!reduce && (
              <g className={s.runner}>
                <animateMotion dur="14s" repeatCount="indefinite" rotate="auto"><mpath href="#map-route" /></animateMotion>
                <rect x="-11" y="-4.5" width="22" height="9" rx="4.5" />
                <circle cx="8" cy="0" r="1.8" className={s.runnerLamp} />
              </g>
            )}
          </svg>

          <div className={s.compass} aria-hidden="true">
            <LogoMark size={30} />
            <span>N</span>
          </div>

          <ol className={s.stations}>
            {STATIONS.map((station, index) => {
              const state = signals.get(station.id)?.status ?? "unknown";
              const above = station.y < H / 2;
              return (
                <li key={station.id} className={s.station} style={{ left: `${(station.x / W) * 100}%`, top: `${(station.y / H) * 100}%` }} data-pos={above ? "above" : "below"}>
                  <button type="button" className={s.stationBtn} onClick={() => setOpen(index)} data-state={state} aria-label={`${station.title}（${station.name}），${STATE_WORD[state]}。查看详情`}>
                    <span className={s.node} aria-hidden="true"><i /></span>
                    <span className={s.label}>
                      <small>LM{String(index + 1).padStart(2, "0")} · {station.stop}</small>
                      <strong>{station.title}</strong>
                      <em>{station.name}</em>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className={s.legend} aria-hidden="true">
            <span><i className={s.legendLine} />夜行线</span>
            <span><i className={s.legendNode} />营业中</span>
            <span><i className={`${s.legendNode} ${s.legendOff}`} />休息中</span>
            <span className={s.scale}>1 光年 ≈ 1 ping</span>
          </div>
        </div>

        <ol className={s.strip} aria-label="线路站点列表">
          {STATIONS.map((station, index) => {
            const state = signals.get(station.id)?.status ?? "unknown";
            return (
              <li key={station.id}>
                <button type="button" className={s.stripBtn} onClick={() => setOpen(index)} data-state={state}>
                  <span className={s.node} aria-hidden="true"><i /></span>
                  <span className={s.stripText}>
                    <small>LM{String(index + 1).padStart(2, "0")} · {station.stop} · {STATE_WORD[state]}</small>
                    <strong>{station.title}</strong>
                    <em>{station.name} · {station.host}</em>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {current && open !== null && (
        <Modal onClose={() => setOpen(null)} label={`${current.title} 站点详情`}>
          <ModalBody onClose={() => setOpen(null)}>
            <StationDetail station={current} signal={signals.get(current.id)} index={open} />
          </ModalBody>
        </Modal>
      )}
    </section>
  );
}
