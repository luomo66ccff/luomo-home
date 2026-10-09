import type { ReactNode } from "react";
import { LogoMark } from "./art/Icons";
import s from "./route.module.css";

type Props = {
  code: string;
  eyebrow: string;
  title: ReactNode;
  art: ReactNode;
  children: ReactNode;
  actions: ReactNode;
};

export default function RouteMessage({ code, eyebrow, title, art, children, actions }: Props) {
  return (
    <main className={s.page}>
      <div className={s.sky} aria-hidden="true" />
      <article className={s.notice}>
        <header className={s.head}>
          <LogoMark size={28} />
          <span>洛墨站 · 旅客告示</span>
          <b>{code}</b>
        </header>
        <div className={s.art}>{art}</div>
        <p className={s.eyebrow}>{eyebrow}</p>
        <h1 className={s.title}>{title}</h1>
        <div className={s.body}>{children}</div>
        <div className={s.actions}>{actions}</div>
        <p className={s.stamp} aria-hidden="true">LUOMO STATION · NIGHT LINE</p>
      </article>
    </main>
  );
}

export function MangoBox() {
  return (
    <svg className={s.box} width="168" height="140" viewBox="0 0 168 140" role="img" aria-label="一个微微发抖的纸箱">
      <ellipse cx="84" cy="131" rx="66" ry="6" fill="rgba(0, 0, 0, 0.28)" />
      <path d="M22 50L84 36L146 50V122L84 134L22 122Z" fill="#d9a35f" stroke="#8a5a26" strokeWidth="2" strokeLinejoin="round" />
      <path d="M84 50V134" stroke="#8a5a26" strokeWidth="1.6" opacity=".55" />
      <path d="M22 50L84 64L146 50" fill="none" stroke="#8a5a26" strokeWidth="2" strokeLinejoin="round" />
      <path d="M22 50L8 30L70 18L84 36Z" fill="#e7b672" stroke="#8a5a26" strokeWidth="2" strokeLinejoin="round" />
      <path d="M146 50L160 30L98 18L84 36Z" fill="#c99350" stroke="#8a5a26" strokeWidth="2" strokeLinejoin="round" />
      <path d="M78 64H90V96H78Z" fill="#c6c1b4" opacity=".7" />
      <g transform="translate(34 72)">
        <path d="M14 4C24 0 34 8 32 20C30 30 18 34 9 28C1 22 2 9 14 4Z" fill="#ffb627" stroke="#b76e00" strokeWidth="1.4" />
        <path d="M18 4C18 0 21 -2 24 -2" stroke="#4d7a2a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M10 12C12 9 15 8 17 8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".7" fill="none" />
      </g>
      <text x="116" y="88" textAnchor="middle" fontSize="15" fontWeight="700" fill="#6b3f14" fontFamily="var(--font-display), sans-serif">完熟</text>
      <text x="116" y="106" textAnchor="middle" fontSize="9" letterSpacing="2" fill="#6b3f14" opacity=".75" fontFamily="var(--font-mono), monospace">MANGO</text>
      <g className={s.eyes}>
        <circle cx="76" cy="44" r="2.2" fill="#2b1a0b" />
        <circle cx="90" cy="44" r="2.2" fill="#2b1a0b" />
      </g>
    </svg>
  );
}

export function SignalLight() {
  return (
    <svg className={s.signal} width="120" height="150" viewBox="0 0 120 150" role="img" aria-label="亮着红灯的信号机">
      <rect x="56" y="70" width="8" height="74" rx="2" fill="#3b4366" />
      <rect x="34" y="140" width="52" height="8" rx="3" fill="#2a3150" />
      <rect x="30" y="6" width="60" height="96" rx="30" fill="#151a33" stroke="#4a5480" strokeWidth="2" />
      <circle className={s.red} cx="60" cy="36" r="16" fill="#ff4d5e" />
      <circle cx="60" cy="72" r="16" fill="#2c3a2f" />
      <path d="M40 26A22 22 0 0 1 80 26" stroke="#4a5480" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
