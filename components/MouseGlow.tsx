"use client";

import { useEffect, useRef } from "react";

export default function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const glow = ref.current;
    if (!glow) return;
    const move = (event: PointerEvent) => {
      glow.style.setProperty("--mx", `${event.clientX}px`);
      glow.style.setProperty("--my", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return <div ref={ref} className="mouse-glow" aria-hidden="true" />;
}
