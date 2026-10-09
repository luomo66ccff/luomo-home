"use client";

import { useEffect, useRef } from "react";
import { usePrefs } from "../PrefsContext";
import { useReducedMotion } from "@/lib/home/hooks";
import s from "./system.module.css";

type Mote = { x: number; y: number; vx: number; vy: number; life: number; size: number; hue: number };

export default function StarTrail() {
  const { prefs } = usePrefs();
  const reduce = useReducedMotion();
  const enabled = prefs.particlesEnabled && !reduce;
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const motes: Mote[] = [];
    let frame = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        m.life -= 0.022;
        m.x += m.vx;
        m.y += m.vy;
        m.vy += 0.02;
        if (m.life <= 0) { motes.splice(i, 1); continue; }
        ctx.globalAlpha = m.life;
        ctx.fillStyle = `hsl(${m.hue} 100% 82%)`;
        const r = m.size * m.life;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y - r * 2);
        ctx.quadraticCurveTo(m.x, m.y, m.x + r * 2, m.y);
        ctx.quadraticCurveTo(m.x, m.y, m.x, m.y + r * 2);
        ctx.quadraticCurveTo(m.x, m.y, m.x - r * 2, m.y);
        ctx.quadraticCurveTo(m.x, m.y, m.x, m.y - r * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      frame = motes.length ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      for (let i = 0; i < 2; i++) {
        motes.push({ x: event.clientX, y: event.clientY, vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.8) * 1.1, life: 1, size: 1.5 + Math.random() * 2, hue: [45, 200, 280][Math.floor(Math.random() * 3)] });
      }
      if (motes.length > 160) motes.splice(0, motes.length - 160);
      if (!frame) frame = requestAnimationFrame(tick);
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas ref={ref} className={s.trail} aria-hidden="true" />;
}
