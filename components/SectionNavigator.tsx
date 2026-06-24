"use client";

import { useState, useEffect, useRef } from "react";

import { SECTIONS } from "@/content/sections";

export default function SectionNavigator() {
  const [activeId, setActiveId] = useState("hero");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 }
    );

    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, []);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-1" aria-label="Section navigator">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => jump(s.id)}
          onMouseEnter={() => setHoveredId(s.id)}
          onMouseLeave={() => setHoveredId(null)}
          className="group relative flex items-center"
          aria-label={`Jump to ${s.label}`}
        >
          <span
            className={
              "block w-2 h-2 rounded-full transition-all duration-300 " +
              (activeId === s.id
                ? "bg-gradient-to-br from-cyan-400 to-pink-400 shadow-[0_0_12px_rgba(34,211,238,0.5)] scale-125"
                : "bg-slate-700 hover:bg-slate-500")
            }
          />
          {hoveredId === s.id && (
            <span className="absolute right-5 whitespace-nowrap px-2 py-1 rounded-md bg-slate-900/90 border border-white/10 text-xs text-slate-300 backdrop-blur-sm">
              {s.label}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}