"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; a: number; speed: number; phase: number };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; width: number };

const METEOR_COLORS = [
  { color: "255, 214, 120", weight: 0.06 },
  { color: "205, 160, 255", weight: 0.16 },
  { color: "200, 225, 255", weight: 0.78 },
];

function meteorColor() {
  let roll = Math.random();
  for (const entry of METEOR_COLORS) { if ((roll -= entry.weight) < 0) return entry.color; }
  return METEOR_COLORS[2].color;
}

export default function StarField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stars: Star[] = [];
    const meteors: Meteor[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    let visible = true;
    let nextMeteor = performance.now() + 2500;

    const isDay = () => document.documentElement.dataset.theme === "light";

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(460, Math.round((width * height) / 2600));
      stars = Array.from({ length: count }, () => {
        const y = Math.pow(Math.random(), 1.6) * height * 0.8;
        return { x: Math.random() * width, y, r: Math.random() < 0.08 ? 1.5 + Math.random() : 0.4 + Math.random() * 0.9, a: 0.35 + Math.random() * 0.65, speed: 0.4 + Math.random() * 1.6, phase: Math.random() * Math.PI * 2 };
      });
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      if (isDay()) return;
      const t = time / 1000;
      for (const star of stars) {
        const twinkle = reduce.matches ? 1 : 0.65 + 0.35 * Math.sin(t * star.speed + star.phase);
        ctx.globalAlpha = star.a * twinkle;
        ctx.fillStyle = star.r > 1.4 ? "#fff3cf" : "#ffffff";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
        if (star.r > 1.4) {
          ctx.globalAlpha = star.a * twinkle * 0.35;
          ctx.fillRect(star.x - star.r * 3, star.y - 0.3, star.r * 6, 0.6);
          ctx.fillRect(star.x - 0.3, star.y - star.r * 3, 0.6, star.r * 6);
        }
      }
      ctx.globalAlpha = 1;
      if (reduce.matches) return;
      if (time > nextMeteor) {
        nextMeteor = time + 4500 + Math.random() * 7000;
        const angle = Math.PI * (0.78 + Math.random() * 0.1);
        const speed = 9 + Math.random() * 6;
        meteors.push({ x: width * (0.3 + Math.random() * 0.7), y: height * Math.random() * 0.3, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0, max: 55 + Math.random() * 30, color: meteorColor(), width: 1.2 + Math.random() * 1.4 });
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life += 1;
        m.x += m.vx;
        m.y += m.vy;
        const fade = Math.sin((m.life / m.max) * Math.PI);
        const tailX = m.x - m.vx * 14;
        const tailY = m.y - m.vy * 14;
        const gradient = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(${m.color}, ${0.95 * fade})`);
        gradient.addColorStop(1, `rgba(${m.color}, 0)`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = m.width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        ctx.fillStyle = `rgba(255, 255, 255, ${fade})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.width * 0.9, 0, Math.PI * 2);
        ctx.fill();
        if (m.life >= m.max) meteors.splice(i, 1);
      }
    };

    const loop = (time: number) => {
      draw(time);
      if (running) frame = requestAnimationFrame(loop);
    };

    const sync = () => {
      const shouldRun = visible && !document.hidden && !reduce.matches && !isDay();
      if (shouldRun && !running) { running = true; frame = requestAnimationFrame(loop); }
      else if (!shouldRun && running) { running = false; cancelAnimationFrame(frame); draw(performance.now()); }
      else if (!shouldRun) draw(performance.now());
    };

    resize();
    sync();
    const ro = new ResizeObserver(() => { resize(); if (!running) draw(performance.now()); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    io.observe(canvas);
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
