"use client";
import { useEffect, useState } from "react";

interface Props { active: boolean; onDone?: () => void; }

export default function StardustBurst({ active, onDone }: Props) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; s: number; d: number }[]>([]);

  useEffect(() => {
    if (!active) { setParticles([]); return; }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setParticles([]); onDone?.(); return; }

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 10 : 28;
    const arr = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      s: Math.random() * 6 + 4,
      d: Math.random() * 0.8 + 0.4,
    }));
    setParticles(arr);

    const t = setTimeout(() => { setParticles([]); onDone?.(); }, 1800);
    return () => clearTimeout(t);
  }, [active, onDone]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[85] overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: p.s, height: p.s,
            background: `radial-gradient(circle, rgba(34,211,238,0.7), transparent)`,
            animation: `stardustOut ${p.d}s ease-out forwards`,
            transform: `translate(calc(-50% + ${p.x * 60}vw), calc(-50% + ${p.y * 40}vh))`,
          }}
        />
      ))}
    </div>
  );
}
