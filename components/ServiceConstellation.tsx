"use client";
import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import ServiceQuickView from "./ServiceQuickView";
import GlassCard from "@/components/ui/GlassCard";
import { SERVICES, type ServiceMeta } from "@/lib/services";

type ApiService = { id: string; name: string; status: string; latency_ms: number | null; source: string };
type QuickViewService = ServiceMeta & { status: string };

const cardPositions = [
  { id: "ops",      x: 0,   y: -240 },
  { id: "file",     x: -290, y: 0 },
  { id: "atri",     x: 290,  y: 0 },
  { id: "api",      x: -200, y: 240 },
  { id: "terminal", x: 200,  y: 240 },
];

export default function ServiceConstellation() {
  const [statuses, setStatuses] = useState<Record<string, ApiService>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [corePulse, setCorePulse] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/services").then((r) => r.json()).then((data) => {
      if (cancelled) return;
      const map: Record<string, ApiService> = {};
      (data.services || []).forEach((s: ApiService) => { map[s.id] = s; });
      setStatuses(map);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const quickViewService: QuickViewService | null = useMemo(() => {
    if (!selectedId) return null;
    const meta = SERVICES.find((s) => s.id === selectedId);
    if (!meta) return null;
    const api = statuses[selectedId];
    return { ...meta, status: api?.status || "unknown" };
  }, [selectedId, statuses]);

  const handleCoreClick = () => { setCorePulse(true); setTimeout(() => setCorePulse(false), 600); };

  return (
    <section className="relative overflow-hidden py-12 lg:py-20">
      {/* Heading */}
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="section-heading mb-4 mx-auto text-center">
          <p className="section-eyebrow">Service Constellation</p>
          <h2>Five luminous gates circle the cloud core.</h2>
          <p className="text-slate-400 mt-2">Each node guards a part of infrastructure.</p>
        </div>
      </div>

      {/* Desktop 3-row stage */}
      <div className="relative mx-auto mt-4 hidden max-w-[1180px] lg:block" style={{ minHeight: 740 }}>
        <svg className="absolute inset-0 h-full w-full pointer-events-none z-0 opacity-20" viewBox="-500 -500 1000 1000" aria-hidden="true">
          {cardPositions.map((item) => (
            <line key={item.id} className="star-trail" x1="0" y1="0" x2={item.x * 1.5} y2={item.y * 1.5} stroke="#22d3ee" strokeOpacity={hoveredId === item.id ? "0.6" : "0.2"} strokeWidth={hoveredId === item.id ? 2 : 1} />
          ))}
        </svg>

        {/* Core */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center">
            <div className="relative h-[180px] w-[180px]">
              <div className="absolute inset-0 rounded-full border border-cyan-300/20 animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-[16%] rounded-full border border-fuchsia-300/20 animate-[spin_80s_linear_infinite_reverse]" />
              <button onClick={handleCoreClick} className={"absolute inset-[8%] flex flex-col items-center justify-center rounded-[28px] border border-cyan-300/20 bg-slate-950/80 shadow-[0_0_80px_rgba(34,211,238,0.2)] transition-all duration-300 backdrop-blur-xl " + (corePulse ? "scale-110" : "")} aria-label="Core">
                <Sparkles className="h-6 w-6 text-cyan-300" />
                <div className="mt-1 text-sm font-bold text-white">Luomo Core</div>
                <div className="text-[10px] text-cyan-200/60">all systems linked</div>
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        {cardPositions.map((item) => {
          const service = SERVICES.find((s) => s.id === item.id);
          if (!service) return null;
          const api = statuses[item.id];
          const statusText = api?.status || "unknown";
          const isDown = statusText === "down";
          const statusColor = isDown ? "bg-red-400" : statusText === "unknown" ? "bg-slate-500" : "bg-emerald-400";
          return (
            <div key={item.id} className="absolute left-1/2 top-1/2 z-10 w-[300px]" style={{ transform: "translate(calc(-50% + " + item.x + "px), calc(-50% + " + item.y + "px))" }}>
              <GlassCard className={"min-h-[180px] rounded-[24px] border border-cyan-200/10 bg-slate-950/75 p-5 shadow-[0_0_40px_rgba(14,165,233,0.08)] backdrop-blur-xl transition-all duration-300 cursor-pointer " + (hoveredId === item.id ? "border-cyan-300/30 -translate-y-1" : "hover:-translate-y-1 hover:border-cyan-300/30") + " hover:shadow-[0_18px_60px_rgba(15,23,42,0.35),0_0_32px_rgba(34,211,238,0.16)]"}
                onMouseEnter={() => setHoveredId(item.id)} onMouseLeave={() => setHoveredId(null)} onClick={() => setSelectedId(item.id)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-500">{service.code}</span>
                  <div className={"w-2 h-2 rounded-full " + statusColor + (isDown ? " animate-pulse" : "")} />
                </div>
                <h3 className="text-base font-bold text-white mb-0.5">{service.name}</h3>
                <p className="text-xs text-slate-400 mb-2">{service.worldName}</p>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{service.description}</p>
                <div className="flex gap-2 text-xs text-slate-500">
                  <span className={"capitalize " + (isDown ? "text-red-400" : "text-emerald-400")}>{statusText}</span>
                  {api?.latency_ms != null && <span>· {api.latency_ms}ms</span>}
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>

      {/* Mobile List */}
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid gap-4 lg:hidden mt-8">
          {SERVICES.map((s) => {
            const api = statuses[s.id];
            return (
              <GlassCard key={s.id} onClick={() => setSelectedId(s.id)} className="rounded-2xl border border-cyan-200/10 bg-slate-950/75 p-5 backdrop-blur-xl cursor-pointer hover:border-cyan-300/30 transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-slate-500">{s.code}</span>
                  <span className={"text-xs capitalize " + (api?.status === "operational" ? "text-emerald-400" : api?.status === "down" ? "text-red-400" : "text-slate-400")}>{api?.status || "unknown"}</span>
                </div>
                <h3 className="text-base font-bold text-white">{s.name}</h3>
                <p className="text-xs text-slate-400">{s.worldName}</p>
              </GlassCard>
            );
          })}
        </div>
      </div>
      {quickViewService && <ServiceQuickView service={quickViewService} onClose={() => setSelectedId(null)} />}
    </section>
  );
}
