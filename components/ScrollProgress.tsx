"use client";

import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const progress = total <= 0 ? 0 : window.scrollY / total;
      ref.current?.style.setProperty("--progress", `${Math.max(0, Math.min(1, progress)) * 100}%`);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}
