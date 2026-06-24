"use client";

import { useEffect, useRef } from "react";
import { Cloud, Container, Database, KeyRound, Network, Server, ShipWheel, SquareTerminal, Workflow } from "lucide-react";

/* ── Data: ring 1 (inner) + ring 2 (outer), orbitSpeed 0 = static ── */
const orbitNodes = [
  { label: "Cloudflare Tunnel", ring: 1, angle: -90,  icon: Cloud,          orbitSpeed:  0.45 },
  { label: "Docker Compose",   ring: 1, angle: -160, icon: Container,       orbitSpeed:  0 },
  { label: "FastAPI",          ring: 1, angle: 20,   icon: Server,          orbitSpeed: -0.35 },
  { label: "SSH / SFTP",       ring: 1, angle: 160,  icon: KeyRound,        orbitSpeed:  0 },
  { label: "Next.js",          ring: 2, angle: -45,  icon: SquareTerminal,  orbitSpeed:  0.25 },
  { label: "SQLite",           ring: 2, angle: 45,   icon: ShipWheel,       orbitSpeed:  0 },
  { label: "R2 / COS",         ring: 2, angle: 180,  icon: Database,        orbitSpeed: -0.3 },
  { label: "AstrBot",          ring: 2, angle: 90,   icon: Workflow,        orbitSpeed:  0.5 },
  { label: "Ops Monitoring",   ring: 2, angle: -135, icon: Network,          orbitSpeed:  0 },
];

const RING_RADII: Record<number, { rx: number; ry: number }> = {
  1: { rx: 200, ry: 180 },
  2: { rx: 310, ry: 275 },
};

function polarToCartesian(angleDeg: number, rx: number, ry: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad) * rx, y: Math.sin(rad) * ry };
}

export default function InfrastructureOrbit() {
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ── RAF orbit animation (direct DOM, no re-renders) ── */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    // Promote animated nodes to GPU layer
    orbitNodes.forEach((node, i) => {
      if (node.orbitSpeed) {
        const el = nodeRefs.current[i];
        if (el) el.style.willChange = "transform";
      }
    });

    let rafId: number;
    const start = Date.now();

    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      orbitNodes.forEach((node, i) => {
        if (!node.orbitSpeed) return;
        const el = nodeRefs.current[i];
        if (!el) return;
        const a = node.angle + elapsed * node.orbitSpeed;
        const rad = (a * Math.PI) / 180;
        const { rx, ry } = RING_RADII[node.ring];
        el.style.left = "50%";
        el.style.top = "50%";
        el.style.transform = `translate(calc(-50% + ${Math.cos(rad) * rx}px), calc(-50% + ${Math.sin(rad) * ry}px))`;
      });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  /* ── Render ── */
  return (
    <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
      {/* Section header */}
      <div className="section-heading text-center lg:text-left">
        <p className="eyebrow">Scene 05 · Infrastructure Orbit</p>
        <h2>Behind the glow, a compact stack keeps the dream alive.</h2>
        <p className="mx-auto mt-3 max-w-[720px] text-base leading-relaxed text-slate-400 lg:mx-0">
          Tunnels, containers, APIs, storage routes, and terminal bridges
          drift around the cloud core like a small technical star system.
        </p>
      </div>

      {/* ===== DESKTOP orbit stage ===== */}
      <div className="relative mx-auto hidden h-[760px] max-w-[1080px] overflow-hidden rounded-[32px] border border-cyan-200/5 bg-slate-950/20 p-10 lg:block">

        {/* ── Animated orbit rings + flow lights ── */}
        {/* Outer ring (slow, clockwise) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[480px] h-[420px] rounded-full border border-cyan-300/10 animate-spin"
            style={{ animationDuration: "55s" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400/30 shadow-[0_0_14px_rgba(34,211,238,0.35)]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-400/25 shadow-[0_0_10px_rgba(168,85,247,0.3)]" />
          </div>
        </div>

        {/* Middle ring (reverse, mid-speed) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[580px] h-[520px] rounded-full border border-fuchsia-300/8 animate-spin"
            style={{ animationDuration: "70s", animationDirection: "reverse" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-fuchsia-300/25 shadow-[0_0_8px_rgba(232,121,249,0.25)]" />
          </div>
        </div>

        {/* Inner ring (slowest, clockwise) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[370px] h-[330px] rounded-full border border-white/6 animate-spin"
            style={{ animationDuration: "85s" }} />
        </div>

        {/* ── Luomo Stack core (breathing + floating) ── */}
        <div
          className="absolute left-1/2 top-1/2 z-30 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[36px] border border-cyan-200/15 bg-slate-950/80 backdrop-blur-xl"
          style={{
            animation: "coreBreath 3.5s ease-in-out infinite, coreFloat 5s ease-in-out infinite",
            boxShadow: "0 0 80px rgba(34,211,238,0.2)",
          }}
        >
          <div className="text-3xl font-black text-yellow-200">LC</div>
          <div className="mt-2 text-sm font-bold text-slate-100">Luomo Stack</div>
          <div className="mt-1 text-[10px] text-cyan-100/50 font-mono">all systems orbiting</div>
        </div>

        {/* ── Tech nodes ── */}
        {orbitNodes.map((node, i) => {
          const { x, y } = polarToCartesian(node.angle, RING_RADII[node.ring].rx, RING_RADII[node.ring].ry);
          const IconComp = node.icon;
          return (
            <div
              key={node.label}
              ref={(el) => { nodeRefs.current[i] = el; }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
            >
              <div className="group flex min-h-[46px] min-w-[130px] cursor-default items-center justify-center gap-2 rounded-2xl border border-cyan-200/12 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-100 shadow-[0_0_28px_rgba(34,211,238,0.08)] backdrop-blur-xl hover:transition-all hover:duration-300 hover:z-40 hover:-translate-y-1.5 hover:scale-105 hover:border-cyan-300/45 hover:shadow-[0_0_48px_rgba(34,211,238,0.3),0_0_80px_rgba(34,211,238,0.1)]">
                <IconComp size={16} className="text-cyan-300 shrink-0" />
                <span className="whitespace-nowrap">{node.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== MOBILE: grid ===== */}
      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        <div className="col-span-full mb-4 flex justify-center">
          <div className="flex h-32 w-32 flex-col items-center justify-center rounded-[32px] border border-cyan-200/15 bg-slate-950/75 shadow-[0_0_48px_rgba(34,211,238,0.14)] backdrop-blur-xl">
            <div className="text-2xl font-black text-yellow-200">LC</div>
            <div className="mt-2 text-xs font-bold text-slate-100">Luomo Stack</div>
            <div className="mt-0.5 text-[10px] text-cyan-100/50 font-mono">all systems orbiting</div>
          </div>
        </div>
        {orbitNodes.map((node) => (
          <div key={node.label} className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-cyan-200/10 bg-slate-950/50 px-3 py-3 text-xs font-semibold text-slate-200 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
            {node.label}
          </div>
        ))}
      </div>
    </div>
  );
}
