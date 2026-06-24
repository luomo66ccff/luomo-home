"use client";
import { useEffect, useState } from "react";

interface Props { density?: "low" | "medium"; }

export default function SakuraField({ density = "low" }: Props) {
  const [petals, setPetals] = useState<{ id: number; l: number; d: number; dur: number; s: number }[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const isMobile = window.innerWidth < 768;
    const countMap = { low: isMobile ? 6 : 12, medium: isMobile ? 12 : 20 };
    const count = countMap[density];

    setPetals(Array.from({ length: count }, (_, i) => ({
      id: i,
      l: Math.random() * 100,
      d: Math.random() * 12,
      dur: Math.random() * 8 + 10,
      s: Math.random() * 10 + 8,
    })));
  }, [density]);

  if (petals.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[-2] overflow-hidden" aria-hidden="true">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.l}%`,
            top: "-6%",
            width: p.s,
            height: p.s * 1.3,
            background: "radial-gradient(circle, rgba(244,164,196,0.18), transparent 70%)",
            animation: `sakuraFall ${p.dur}s ${p.d}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}
