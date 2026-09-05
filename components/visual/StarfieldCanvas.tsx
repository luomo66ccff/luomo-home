"use client";
import { useEffect, useRef } from "react";
export default function StarfieldCanvas({ density = "medium" }: { density?: "low" | "medium" | "high" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = innerWidth, height = innerHeight, frame = 0, previous = 0;
    const stars = Array.from({ length: { low: 20, medium: 50, high: 90 }[density] }, () => ({ x: Math.random(), y: Math.random(), radius: .4 + Math.random(), speed: .002 + Math.random() * .004 }));
    const resize = () => {
      width = innerWidth; height = innerHeight; const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * ratio; canvas.height = height * ratio; context.setTransform(ratio,0,0,ratio,0,0);
    };
    const draw = (time: number) => {
      const elapsed = previous ? Math.min((time - previous) / 1000, .05) : 0; previous = time;
      context.clearRect(0,0,width,height);
      for (const star of stars) { star.y = (star.y + star.speed * elapsed) % 1; context.beginPath(); context.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2); context.fillStyle = "rgba(180,210,226,.3)"; context.fill(); }
      frame = requestAnimationFrame(draw);
    };
    const sync = () => { cancelAnimationFrame(frame); previous = 0; context.clearRect(0,0,width,height); if (!document.hidden && !media.matches) frame = requestAnimationFrame(draw); };
    resize(); sync();
    window.addEventListener("resize", resize); document.addEventListener("visibilitychange", sync); media.addEventListener("change", sync);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", sync); media.removeEventListener("change", sync); };
  }, [density]);
  return <canvas ref={ref} className="luomo-starfield" aria-hidden="true" />;
}
