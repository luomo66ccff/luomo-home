"use client";
import { useState, useEffect } from "react";

const SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "gallery", label: "Gallery" },
  { id: "services", label: "Services" },
  { id: "cockpit", label: "Cockpit" },
  { id: "infrastructure", label: "Infra" },
  { id: "timeline", label: "Log" },
  { id: "enter", label: "Gate" },
];

export default function SectionNavigator() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const handler = () => {
      let closest = "hero";
      let minDist = Infinity;
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
        if (dist < minDist) { minDist = dist; closest = sec.id; }
      }
      setActive(closest);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed right-5 top-1/2 z-50 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2.5 pointer-events-none">
      {SECTIONS.map((sec) => (
        <button key={sec.id} onClick={() => scrollTo(sec.id)}
          className={"pointer-events-auto w-2 h-2 rounded-full transition-all duration-300 " +
            (active === sec.id
              ? "bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)] scale-125"
              : "bg-slate-600/40 hover:bg-slate-400/60")}
          aria-label={`Scroll to ${sec.label}`} />
      ))}
    </nav>
  );
}
