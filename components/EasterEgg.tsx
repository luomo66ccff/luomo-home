"use client";

import { useEffect, useState, useCallback } from "react";

interface Props {
  onTrigger?: () => void;
}

export function useEasterEgg(onTrigger?: () => void) {
  const [konamiIndex, setKonamiIndex] = useState(0);
  const konami = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const next = e.key === konami[konamiIndex] ? konamiIndex + 1 : (e.key === konami[0] ? 1 : 0);
      setKonamiIndex(next);
      if (next === konami.length) {
        setKonamiIndex(0);
        onTrigger?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [konamiIndex, onTrigger]);
}

export default function EasterEggOverlay({ active, onClose }: { active: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [active, onClose]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 text-center space-y-3">
        <p className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent animate-pulse">
          ✦ Hidden route unlocked ✦
        </p>
        <p className="text-sm text-slate-400 font-mono">
          /march7th — a secret path through the stars
        </p>
        {/* Star burst particles */}
        <div className="flex gap-1 justify-center mt-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"
              style={{ animationDelay: `${i * 80}ms`, animationDuration: "1.2s" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}