"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import MotionSection from "./MotionSection";
import { Code2, Files, Gauge, MessageCircle, Terminal } from "lucide-react";

const phases = [
  {
    phase: "Phase 01", title: "LuomoOps", subtitle: "Cloud Status Cockpit",
    body: "Status dashboard, DailyOps foundation, and calm incident signals.",
    tone: "cyan", icon: Gauge,
  },
  {
    phase: "Phase 02", title: "LuomoFile", subtitle: "Private File Constellation",
    body: "A quiet file starfield for images, shares, and storage routes.",
    tone: "pink", icon: Files,
  },
  {
    phase: "Phase 03", title: "LuomoAPI", subtitle: "Developer Gateway",
    body: "Keys, scopes, and gateway routes gathered behind a glowing door.",
    tone: "purple", icon: Code2,
  },
  {
    phase: "Phase 04", title: "LuomoTerminal", subtitle: "Operations Bridge",
    body: "SSH, SFTP, and command routes stretch like bridges through the night.",
    tone: "mint", icon: Terminal,
  },
  {
    phase: "Phase 05", title: "AstrBot API", subtitle: "Bot Interface",
    body: "Automation, agent bridges, and companion signals awaken at the edge of the cloud.",
    tone: "gold", icon: MessageCircle,
  },
];

export default function BuildTimeline() {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <MotionSection id="build-log" className="timeline-scene">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
      <div className="section-heading">
        <p className="section-eyebrow">Scene 06 · Build Chronicle</p>
        <h2>Every service began as a small spark.</h2>
        <p>Then each spark became part of the constellation, written like a cloud travel journal.</p>
      </div>

      {/* DESKTOP: left-right layout */}
      <div className="hidden gap-8 lg:grid lg:grid-cols-[280px_1fr]">
        {/* Phase list */}
        <div className="flex flex-col gap-2">
          {phases.map((p, i) => {
            const Icon = p.icon;
            const isActive = i === activePhase;
            return (
              <button
                key={p.phase}
                onClick={() => setActivePhase(i)}
                className={
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 " +
                  "border " +
                  (isActive
                    ? "border-cyan-300/25 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                    : "border-transparent hover:border-cyan-200/10 hover:bg-slate-900/40")
                }
              >
                <Icon size={18} className={isActive ? "text-cyan-300" : "text-slate-500 group-hover:text-slate-400"} />
                <span className={"text-sm font-semibold " + (isActive ? "text-cyan-100" : "text-slate-400 group-hover:text-slate-300")}>
                  {p.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail card */}
        <div className="luomo-card card-glow rounded-[28px] p-8 min-h-[280px]">
          <p className="text-xs font-mono text-cyan-400/70 tracking-[0.16em] uppercase mb-2">
            {phases[activePhase].phase}
          </p>
          <h3 className="text-2xl font-bold text-white mb-1">
            {phases[activePhase].title}
          </h3>
          <p className="text-sm text-cyan-300/70 mb-4">
            {phases[activePhase].subtitle}
          </p>
          <p className="text-slate-300 leading-relaxed">
            {phases[activePhase].body}
          </p>
        </div>
      </div>

      {/* MOBILE: vertical cards */}
      <div className="flex flex-col gap-4 lg:hidden">
        {phases.map((p, i) => {
          const Icon = p.icon;
          const isActive = i === activePhase;
          return (
            <button
              key={p.phase}
              onClick={() => setActivePhase(i)}
              className={
                "luomo-card card-glow rounded-[22px] p-5 text-left transition-all duration-200 " +
                (isActive ? "border-cyan-300/30 shadow-[0_0_16px_rgba(34,211,238,0.1)]" : "border-white/5")
              }
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={16} className="text-cyan-300" />
                <span className="text-xs font-mono text-cyan-400/70">{p.phase}</span>
              </div>
              <h3 className="text-base font-bold text-white">{p.title}</h3>
              <p className="text-xs text-cyan-300/70 mt-0.5">{p.subtitle}</p>
              {isActive && (
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">{p.body}</p>
              )}
            </button>
          );
        })}
      </div>
      </div>
    </MotionSection>
  );
}
