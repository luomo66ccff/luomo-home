"use client";
import { useEffect, useRef } from "react";

interface Props { density?: "low" | "medium" | "high"; }

export default function StarfieldCanvas({ density = "medium" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const isMobile = window.innerWidth < 768;
    const countMap = { low: 20, medium: 50, high: 90 };
    const starCount = isMobile ? Math.floor(countMap[density] * 0.4) : countMap[density];

    const stars: { x: number; y: number; r: number; o: number; s: number }[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.3,
        o: Math.random() * 0.5 + 0.2,
        s: Math.random() * 0.25 + 0.05,
      });
    }

    let id: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.y += s.s;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${s.o})`;
        ctx.fill();
      }
      id = requestAnimationFrame(draw);
    };
    if (starCount > 0) draw();

    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, [density]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[-2]" aria-hidden="true" />;
}
