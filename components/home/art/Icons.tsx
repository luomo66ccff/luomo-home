import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...rest }: IconProps) {
  return { width: size, height: size, "aria-hidden": true, focusable: false, ...rest } as SVGProps<SVGSVGElement>;
}

export const SPARK_PATH = "M12 0 C12.9 7.2 16.8 11.1 24 12 C16.8 12.9 12.9 16.8 12 24 C11.1 16.8 7.2 12.9 0 12 C7.2 11.1 11.1 7.2 12 0 Z";

export function Spark(props: IconProps) {
  return <svg viewBox="0 0 24 24" {...base(props)}><path d={SPARK_PATH} fill="currentColor" /></svg>;
}

export function LogoMark(props: IconProps) {
  return (
    <svg viewBox="0 0 40 40" {...base({ size: 34, ...props })}>
      <circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" strokeOpacity=".45" />
      <circle cx="24.5" cy="15" r="8" fill="currentColor" />
      <circle cx="28" cy="12.5" r="7" fill="var(--ink-0)" />
      <path d="M4 29 C14 25 24 25 36 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 32.6 C14 28.6 24 28.6 36 31.6" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity=".7" />
      {[9, 15, 21, 27, 33].map(x => <line key={x} x1={x} x2={x - 0.6} y1={27.6} y2={31.6} stroke="currentColor" strokeWidth=".9" strokeOpacity=".7" />)}
      <path d="M11 9.5 l.9 2.1 2.1.9 -2.1.9 -.9 2.1 -.9-2.1 -2.1-.9 2.1-.9z" fill="currentColor" />
    </svg>
  );
}

export function TrainGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 48 20" {...base({ size: 44, ...props })} height={(props.size ?? 44) * 20 / 48}>
      <path d="M3 14 V7.5 C3 5.6 4.6 4 6.5 4 H20 V14 Z" fill="currentColor" />
      <rect x="21.5" y="5" width="11" height="9" rx="1.6" fill="currentColor" opacity=".85" />
      <rect x="34" y="5" width="11" height="9" rx="1.6" fill="currentColor" opacity=".7" />
      <rect x="7" y="6.6" width="3.2" height="3" rx=".6" fill="var(--ink-0)" />
      <rect x="12" y="6.6" width="3.2" height="3" rx=".6" fill="var(--ink-0)" />
      {[24, 28.2, 36.5, 40.7].map(x => <rect key={x} x={x} y="7" width="2.6" height="2.6" rx=".5" fill="var(--ink-0)" />)}
      {[7, 15, 25, 30, 37.5, 42.5].map(x => <circle key={x} cx={x} cy="15.6" r="1.8" fill="currentColor" />)}
      <path d="M0 18.4 H48" stroke="currentColor" strokeWidth=".9" />
    </svg>
  );
}

/** A teleport anchor: a small pillar crowned by a floating diamond. */
export function Waypoint(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(props)}>
      <path d="M12 1.5 L15 5.5 L12 9.5 L9 5.5 Z" fill="currentColor" />
      <path d="M8.5 12 H15.5 L14.5 20 H9.5 Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6 21.5 H18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 15.5 H14" stroke="currentColor" strokeWidth="1" opacity=".7" />
    </svg>
  );
}

export function Butterfly(props: IconProps) {
  return (
    <svg viewBox="0 0 40 32" {...base({ size: 28, ...props })}>
      <g className="wing-l"><path d="M19 15 C14 3 3 1 2.5 8 C2 13 9 16 18 16.5 C10 18 5 24 9 28 C13 31 17 24 19 17.5 Z" fill="currentColor" /></g>
      <g className="wing-r"><path d="M21 15 C26 3 37 1 37.5 8 C38 13 31 16 22 16.5 C30 18 35 24 31 28 C27 31 23 24 21 17.5 Z" fill="currentColor" /></g>
      <path d="M20 9 V24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M20 9 C19 6 17 4 15.5 3.5 M20 9 C21 6 23 4 24.5 3.5" stroke="currentColor" strokeWidth=".8" fill="none" />
    </svg>
  );
}

/** Seven original glyphs used on the boarding screen. */
export const BOOT_GLYPHS: string[] = [
  "M12 3 C17 3 20 7 18 10 C16.4 12.5 12 12 12 9.5 C12 8 13.6 7.6 14.4 8.4 M4 13 C8 11 14 12 19 15 M5 17.5 C9 16 13 16.5 17 19",
  "M12 2.5 C15 7.5 18 10.5 18 14.5 C18 18 15.3 21 12 21 C8.7 21 6 18 6 14.5 C6 10.5 9 7.5 12 2.5 Z M9.5 15 C9.7 16.8 10.8 18 12.5 18.3",
  "M12 21 C7.5 21 5.5 17.5 6.5 14 C7.3 11.5 9.5 10.5 9.5 7.5 C11.5 9 12 10.5 11.8 12.5 C13.5 11 14 8 13 4 C17 6.5 19 10.5 18 15 C17.3 18.5 15 21 12 21 Z",
  "M12 2.5 V21.5 M3.8 7.2 L20.2 16.8 M3.8 16.8 L20.2 7.2 M12 2.5 L10 5 M12 2.5 L14 5 M12 21.5 L10 19 M12 21.5 L14 19",
  "M5 19 C5 10 10 4.5 19.5 4 C19.5 13 14 19 5 19 Z M5 19 L13.5 10.5",
  "M13.5 2.5 L6.5 13 H11.5 L9.5 21.5 L17.5 10 H12.5 Z",
  "M12 2.5 L19.5 9 L12 21.5 L4.5 9 Z M4.5 9 H19.5 M9 9 L12 21.5 L15 9 M8 5.5 L9 9 M16 5.5 L15 9",
];

export function Glyph({ index, ...props }: IconProps & { index: number }) {
  return <svg viewBox="0 0 24 24" {...base(props)}><path d={BOOT_GLYPHS[index % BOOT_GLYPHS.length]} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function Lily({ color = "var(--lily-red)", ...props }: IconProps & { color?: string }) {
  const petals = [0, 60, 120, 180, 240, 300];
  return (
    <svg viewBox="0 0 40 48" {...base({ size: 30, ...props })}>
      <path d="M20 22 C20 32 19 40 21 47" stroke="#5f8f5a" strokeWidth="1.6" fill="none" />
      <g transform="translate(20 18)">
        {petals.map(angle => (
          <g key={angle} transform={`rotate(${angle})`}>
            <path d="M0 0 C3 -3 4 -8 1.5 -12 C1 -9 -1 -6 0 0 Z" fill={color} />
            <path d="M0 0 C1 -6 3 -11 6 -15" stroke={color} strokeWidth=".7" fill="none" />
            <circle cx="6" cy="-15" r=".9" fill={color} />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function Pick(props: IconProps) {
  return <svg viewBox="0 0 24 24" {...base(props)}><path d="M12 22 C7 17 3.5 11.5 3.5 7.5 C3.5 4 7 2.5 12 2.5 C17 2.5 20.5 4 20.5 7.5 C20.5 11.5 17 17 12 22 Z" fill="currentColor" /><path d="M8 7 C10 6 14 6 16 7" stroke="var(--ink-0)" strokeOpacity=".35" strokeWidth="1.4" fill="none" strokeLinecap="round" /></svg>;
}

export function Drum(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(props)}>
      <ellipse cx="12" cy="10" rx="8" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 10 V16 C4 17.7 7.6 19 12 19 C16.4 19 20 17.7 20 16 V10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 3 L10 9 M21 3 L14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16.5 1.5 L21 4.5 L17 6 Z" fill="currentColor" />
    </svg>
  );
}

export function Bass(props: IconProps) {
  return <svg viewBox="0 0 24 24" {...base(props)}><path d="M8 4.5 C13.5 4.5 17 8 17 12.5 C17 17 13 20.5 6 21.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="8.5" cy="9" r="2.6" fill="currentColor" /><circle cx="20" cy="9" r="1.3" fill="currentColor" /><circle cx="20" cy="14" r="1.3" fill="currentColor" /></svg>;
}

export function Mic(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(props)}>
      <rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill="currentColor" />
      <path d="M5.5 11 C5.5 15 8.5 17.5 12 17.5 C15.5 17.5 18.5 15 18.5 11 M12 17.5 V21.5 M8.5 21.5 H15.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20.5 2 l.6 1.4 1.4.6 -1.4.6 -.6 1.4 -.6-1.4 -1.4-.6 1.4-.6z" fill="currentColor" />
    </svg>
  );
}

/** A clock that smiles back at you. */
export function SmileClock(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(props)}>
      <circle cx="12" cy="12.5" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 2.8 L5.4 5 M16 2.8 L18.6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="11" r="1" fill="currentColor" />
      <circle cx="15" cy="11" r="1" fill="currentColor" />
      <path d="M8.5 14.5 C10 16.5 14 16.5 15.5 14.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Fish(props: IconProps) {
  return (
    <svg viewBox="0 0 64 36" {...base({ size: 56, ...props })}>
      <path d="M6 18 C14 6 34 4 46 14 L58 6 L56 18 L58 30 L46 22 C34 32 14 30 6 18 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
      <path d="M24 12 C27 16 27 20 24 24 M30 11 C33 16 33 20 30 25" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function GardenEel(props: IconProps) {
  return (
    <svg viewBox="0 0 40 64" {...base({ size: 46, ...props })}>
      <path d="M17 62 C17 46 13 38 14 26 C15 14 19 8 24 8 C29 8 31 13 29 18 C27 24 23 28 23 40 C23 50 25 56 25 62" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="25" cy="13" r="1.6" fill="currentColor" />
      <path d="M8 62 C14 58 26 58 34 62" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {[16, 24, 32, 40].map(y => <circle key={y} cx={y > 30 ? 21 : 18} cy={y + 6} r=".9" fill="currentColor" opacity=".7" />)}
    </svg>
  );
}

export function Barcode({ seed = "luomo", height = 34, bars = 46, ...props }: IconProps & { seed?: string; height?: number; bars?: number }) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const widths: number[] = [];
  for (let i = 0; i < bars; i++) { h = Math.imul(h ^ (h >>> 13), 1274126177); widths.push(1 + ((h >>> 3) % 3)); }
  let x = 0;
  const rects = widths.map((w, i) => { const r = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w} height={height} fill="currentColor" /> : null; x += w + (i % 2 ? 0.6 : 0); return r; });
  return <svg viewBox={`0 0 ${x} ${height}`} preserveAspectRatio="none" aria-hidden focusable={false} {...props}>{rects}</svg>;
}
