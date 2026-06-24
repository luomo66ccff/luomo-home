"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function AccessPassButton({ href, children, className = "" }: Props) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const maxDist = 10;
    const dist = Math.min(Math.sqrt(x * x + y * y) / Math.min(rect.width, rect.height) * 2, 1);
    setMousePos({ x: x * dist * 0.18, y: y * dist * 0.18 });
  }, [prefersReduced]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={
        "group relative overflow-hidden inline-flex items-center gap-2 min-h-[48px] px-6 py-3 rounded-full " +
        "bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 text-slate-900 font-bold text-sm " +
        "transition-all duration-300 focus-visible:ring-2 focus-visible:ring-cyan-400/60 " +
        "shadow-[0_0_20px_rgba(34,211,238,0.2)] " +
        "hover:shadow-[0_0_32px_rgba(34,211,238,0.45),0_0_52px_rgba(168,85,247,0.25)] " +
        "border border-cyan-300/30 " +
        className
      }
      style={
        isHovered && !prefersReduced
          ? { transform: "translate(" + mousePos.x + "px, " + mousePos.y + "px) scale(1.03)" }
          : isHovered
          ? { transform: "scale(1.03)" }
          : undefined
      }
    >
      {/* Border glow ring */}
      <span className="absolute inset-0 rounded-full border border-cyan-300/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Active glow ring */}
      <span className="absolute inset-0 rounded-full opacity-0 group-active:opacity-100 transition-opacity duration-100 pointer-events-none"
        style={{ boxShadow: "inset 0 0 24px rgba(34,211,238,0.5)" }} />

      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute ripple-ring"
          style={{ left: r.x - 8, top: r.y - 8, width: 16, height: 16 }}
        />
      ))}
      <span className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300 relative z-10">
        {children}
      </span>
      <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
    </a>
  );
}