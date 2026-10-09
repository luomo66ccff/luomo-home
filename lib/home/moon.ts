export const SYNODIC_MONTH = 29.530588853;
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);
const DAY_MS = 86_400_000;

export type MoonPhase = {
  age: number;
  fraction: number;
  illumination: number;
  name: string;
  daysToFull: number;
  waxing: boolean;
};

const NAMES: [number, string][] = [
  [0.0339, "新月"],
  [0.216, "蛾眉月"],
  [0.284, "上弦月"],
  [0.466, "盈凸月"],
  [0.534, "满月"],
  [0.716, "亏凸月"],
  [0.784, "下弦月"],
  [0.9661, "残月"],
  [1, "新月"],
];

export function moonPhase(date: Date): MoonPhase {
  const days = (date.getTime() - KNOWN_NEW_MOON_MS) / DAY_MS;
  const age = ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const fraction = age / SYNODIC_MONTH;
  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2;
  const name = NAMES.find(([limit]) => fraction < limit)?.[1] ?? "新月";
  const half = SYNODIC_MONTH / 2;
  const daysToFull = ((half - age) % SYNODIC_MONTH + SYNODIC_MONTH) % SYNODIC_MONTH;
  return { age, fraction, illumination, name, daysToFull, waxing: fraction < 0.5 };
}

/** SVG path for the lit part of a moon disc of radius r centred at (r, r). */
export function moonLitPath(fraction: number, r: number): string {
  const f = ((fraction % 1) + 1) % 1;
  const waxing = f < 0.5;
  const k = Math.cos(2 * Math.PI * f);
  const rx = Math.abs(k) * r;
  const top = `${r} 0`;
  const bottom = `${r} ${2 * r}`;
  const outerSweep = waxing ? 1 : 0;
  const innerSweep = waxing ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0);
  return `M ${top} A ${r} ${r} 0 0 ${outerSweep} ${bottom} A ${rx} ${r} 0 0 ${innerSweep} ${top} Z`;
}
