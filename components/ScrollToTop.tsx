"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 right-6 z-40 w-10 h-10 rounded-full glass border border-white/10
        flex items-center justify-center text-white/60 hover:text-white hover:border-cyan-300/30
        transition-all duration-300 active:scale-95"
      aria-label="Scroll to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}