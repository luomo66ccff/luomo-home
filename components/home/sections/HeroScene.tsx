"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import StarField from "../StarField";
import { Butterfly } from "../art/Icons";
import { unlock } from "@/lib/home/achievements";
import { toast } from "@/lib/home/store";
import s from "./hero.module.css";

const HORIZON = 600;
const DECK = 690;
const RAIL = "M -340 690 L 880 690 C 1030 690 1130 640 1230 540 C 1330 440 1410 300 1530 190 C 1610 118 1700 50 1820 -60";
const SKY_RAIL = "M 880 690 C 1030 690 1130 640 1230 540 C 1330 440 1410 300 1530 190 C 1610 118 1700 50 1820 -60";
const TREASURES = ["佛前的石钵", "蓬莱的玉枝", "火鼠的裘衣", "龙首的明珠", "燕子的子安贝"];
const BUTTERFLY_LINES = [
  "翅膀上映着一段不属于你的夏天。",
  "好像听见了谁在防波堤上喊你的名字。",
  "据说这种蝴蝶，会把记忆带到岛的另一边。",
];

function seeded(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function buildCity(seed: number, minH: number, maxH: number, litChance: number) {
  const rand = seeded(seed);
  let blocks = "";
  let windows = "";
  let x = -30;
  while (x < 1640) {
    const w = 16 + Math.round(rand() * 30);
    const phase = ((x + 360) / 1445) % 1;
    const cluster = 1 - Math.abs(phase * 2 - 1);
    const h = Math.round(minH + (maxH - minH) * (0.25 + 0.75 * rand() * (0.45 + cluster * 0.55)));
    const top = HORIZON - h;
    blocks += `M${x} ${HORIZON}V${top}H${x + w}V${HORIZON}Z`;
    if (rand() < 0.3) blocks += `M${x + w / 2 - 1} ${top}V${top - 8 - Math.round(rand() * 10)}h2V${top}Z`;
    for (let wy = top + 6; wy < HORIZON - 6; wy += 8) {
      for (let wx = x + 4; wx < x + w - 5; wx += 6) {
        if (rand() < litChance) windows += `M${wx} ${wy}h2.6v3.6h-2.6z`;
      }
    }
    x += w + Math.round(rand() * 4);
  }
  return { blocks, windows };
}

const FAR = buildCity(7, 18, 70, 0.08);
const NEAR = buildCity(19, 26, 118, 0.17);

function towerLattice() {
  let d = "";
  const legAt = (y: number) => { const t = (HORIZON - y) / (HORIZON - 420); return [798 + 16 * t, 842 - 16 * t]; };
  let flip = false;
  for (let y = HORIZON; y > 424; y -= 18) {
    const [l1, r1] = legAt(y);
    const [l2, r2] = legAt(y - 18);
    d += flip ? `M${l1} ${y}L${r2} ${y - 18}` : `M${r1} ${y}L${l2} ${y - 18}`;
    d += `M${l1} ${y}H${r1}`;
    flip = !flip;
  }
  return d;
}
const LATTICE = towerLattice();

function viaduct() {
  let spandrel = "";
  let piers = "";
  const span = 136;
  const pier = 20;
  for (let x = -60; x < 1660; x += span) {
    const a = x + pier;
    const b = x + span;
    const r = (b - a) / 2;
    spandrel += `M${a} ${DECK + 12}H${b}V${DECK + 74}A${r} ${r * 0.86} 0 0 0 ${a} ${DECK + 74}Z`;
    piers += `M${x} ${DECK + 12}h${pier}V900h-${pier}Z`;
  }
  return { spandrel, piers };
}
const BRIDGE = viaduct();

const BAMBOO = [
  { x: 36, w: 15, lean: -1.4, delay: 0 },
  { x: 92, w: 21, lean: 0.6, delay: -1.6, glow: true },
  { x: 150, w: 13, lean: 1.8, delay: -3.1 },
  { x: 206, w: 22, lean: -0.4, delay: -0.8 },
];

const LEAVES = [
  [44, 120, -30], [30, 160, 200], [100, 70, 150], [118, 210, -20], [86, 300, 210], [158, 140, -40],
  [142, 260, 200], [214, 90, 160], [232, 190, -25], [200, 330, 205], [60, 420, -35], [226, 470, 195],
];

function Car({ loco, x, motion, begin }: { loco?: boolean; x: number; motion: boolean; begin: string }) {
  const body = loco
    ? "M-34 -6V-25Q-34 -30 -29 -30H6V-36H12V-30H18Q29 -30 35 -18L39 -9Q39 -6 35 -6Z"
    : "M-31 -6V-24Q-31 -31 -24 -31H24Q31 -31 31 -24V-6Z";
  return (
    <g transform={motion ? undefined : `translate(${x} ${DECK})`}>
      {motion && <animateMotion dur="30s" repeatCount="indefinite" rotate="auto" begin={begin}><mpath href="#hero-rail" /></animateMotion>}
      {loco && <path d="M39 -14L150 -36V8Z" fill="url(#hero-beam)" className={s.beam} />}
      <path d={body} fill="var(--train)" stroke="var(--train-rim)" strokeWidth="1" />
      {loco
        ? <><rect x="-27" y="-24" width="8" height="8" rx="1.5" fill="var(--window)" /><rect x="-15" y="-24" width="8" height="8" rx="1.5" fill="var(--window)" /><circle cx="35" cy="-14" r="2.6" fill="var(--gold-hi)" /></>
        : [-24, -13, -2, 9, 20].map(wx => <rect key={wx} x={wx - 1} y="-24" width="7" height="9" rx="1.6" fill="var(--window)" />)}
      <path d={loco ? "M-34 -10H39" : "M-31 -11H31"} stroke="var(--gold)" strokeOpacity=".55" strokeWidth=".9" />
      {(loco ? [-24, -10, 10, 26] : [-20, -12, 12, 20]).map(cx => <circle key={cx} cx={cx} cy="-3.4" r="3.6" fill="var(--train)" stroke="var(--train-rim)" strokeWidth=".8" />)}
    </g>
  );
}

export default function HeroScene() {
  const [motion, setMotion] = useState(false);
  const [wish, setWish] = useState<{ key: number; text: string } | null>(null);
  const [flown, setFlown] = useState<number[]>([]);
  const clicks = useRef(0);
  const caught = useRef(0);

  const onButterfly = useCallback((index: number) => {
    setFlown(current => [...current, index]);
    window.setTimeout(() => setFlown(current => current.filter(entry => entry !== index)), 14000);
    const line = BUTTERFLY_LINES[caught.current % BUTTERFLY_LINES.length];
    caught.current += 1;
    toast({ title: "它在你的指尖停了一下", body: `${line}——然后，飞走了。` });
    unlock("butterfly");
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotion(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const onMoon = useCallback(() => {
    const index = clicks.current % TREASURES.length;
    clicks.current += 1;
    setWish({ key: clicks.current, text: TREASURES[index] });
    if (clicks.current === TREASURES.length) {
      unlock("moon");
      toast({ title: "五个难题，全部答出来了", body: "月亮好像笑了一下。——满月之夜，请不要独自看月亮。", tone: "gold" });
    }
  }, []);

  return (
    <div className={s.scene}>
      <svg className={s.layer} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--sky-top)" />
            <stop offset=".58" stopColor="var(--sky-mid)" />
            <stop offset=".9" stopColor="var(--sky-low)" />
            <stop offset="1" stopColor="var(--sky-glow)" />
          </linearGradient>
        </defs>
        <rect x="-200" y="-600" width="2000" height={HORIZON + 600} fill="url(#hero-sky)" />
      </svg>

      <StarField className={s.stars} />

      <div className={s.moonWrap}>
        <button type="button" className={s.moon} onClick={onMoon} aria-label="月亮。好像可以许愿">
          <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">
            <defs>
              <radialGradient id="moon-face" cx=".42" cy=".38" r=".7">
                <stop offset="0" stopColor="#fffaf0" />
                <stop offset=".7" stopColor="#f3e7c9" />
                <stop offset="1" stopColor="#d9c8a0" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="96" fill="url(#moon-face)" />
            <g fill="#bfae86" opacity=".28">
              <circle cx="70" cy="64" r="16" /><circle cx="128" cy="118" r="22" /><circle cx="96" cy="150" r="9" />
              <circle cx="146" cy="70" r="7" /><circle cx="56" cy="118" r="11" />
            </g>
            <path className={s.rabbit} d="M84 132c-6-3-9-10-6-16 2-4 6-6 10-6 1-9 0-19-4-26-2-4 1-7 4-4 6 6 8 17 7 28 3-10 8-18 13-21 3-2 6 1 4 4-4 6-8 14-9 22 8 2 14 9 13 17-1 9-10 13-20 11-4 4-9 5-12 3z" fill="#9f8c63" opacity=".2" />
          </svg>
        </button>
        {wish && <span key={wish.key} className={s.moonWish}>{wish.text}</span>}
      </div>

      <svg className={s.layer} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="hero-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--sea-top)" />
            <stop offset="1" stopColor="var(--sea-low)" />
          </linearGradient>
          <linearGradient id="hero-beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffe7a8" stopOpacity=".55" />
            <stop offset="1" stopColor="#ffe7a8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hero-rail-glow" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="var(--gold)" />
            <stop offset=".7" stopColor="var(--gold-hi)" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <path id="hero-rail" d={RAIL} />
        </defs>

        <g className={s.clouds}>
          {[[240, 520, 120], [360, 470, 150], [500, 500, 130], [620, 545, 90], [160, 565, 80], [430, 560, 120], [1340, 545, 90], [1450, 520, 110], [1540, 560, 80]].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} />
          ))}
        </g>

        <path d="M-40 600V566C60 548 140 560 230 540C320 520 380 548 470 556C560 562 620 534 720 528C820 522 900 552 1000 548C1110 544 1180 520 1290 530C1390 540 1470 556 1640 546V600Z" fill="var(--city-2)" opacity=".55" />
        <path d={FAR.blocks} fill="var(--city-2)" />
        <path d={FAR.windows} fill="var(--window)" opacity=".35" />

        <g className={s.tower}>
          <path d="M798 600L814 420H826L842 600Z" fill="none" stroke="var(--city)" strokeWidth="3" />
          <path d={LATTICE} stroke="var(--city)" strokeWidth="1.4" fill="none" />
          <rect x="804" y="412" width="32" height="13" rx="2" fill="var(--city)" />
          <rect x="808" y="416" width="24" height="3" fill="var(--window)" opacity=".7" />
          <path d="M815 412L817 352H823L825 412Z" fill="var(--city)" />
          <rect x="811" y="352" width="18" height="8" rx="1.5" fill="var(--city)" />
          <rect x="813" y="355" width="14" height="2" fill="var(--window)" opacity=".6" />
          <g transform="rotate(34 820 352)">
            <path d="M817.5 352L818 282L815 274L819.5 268L822 276L822.5 352Z" fill="var(--city)" />
            <path d="M818 300h4M818 320h4" stroke="var(--city-2)" strokeWidth="1" />
            <circle className={s.aviation} cx="820" cy="272" r="2.6" fill="#ff4d4d" />
          </g>
          <path d="M822 352C830 372 828 390 836 404M818 352C812 368 806 372 804 386" stroke="var(--city)" strokeWidth=".8" fill="none" />
          <circle className={s.aviation} cx="804" cy="411" r="1.8" fill="#ff4d4d" style={{ animationDelay: "-0.8s" }} />
        </g>

        <path d={NEAR.blocks} fill="var(--city)" />
        <path d={NEAR.windows} fill="var(--window)" className={s.windows} />

        <rect x="-200" y={HORIZON} width="2000" height={900 - HORIZON} fill="url(#hero-sea)" />
        <g className={s.reflection}>
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={1222 - (30 - i * 1.6) / 2 + (i % 2 ? 6 : -6)} y={HORIZON + 8 + i * 16} width={30 - i * 1.6} height="2" rx="1" />
          ))}
        </g>
        <g className={s.sparkles}>
          {Array.from({ length: 22 }, (_, i) => (
            <rect key={i} x={(i * 173) % 1600} y={HORIZON + 14 + ((i * 47) % 260)} width={8 + (i % 4) * 4} height="1.6" rx=".8" style={{ animationDelay: `${-(i % 7) * 0.6}s` }} />
          ))}
        </g>

        <path d={SKY_RAIL} fill="none" stroke="var(--gold)" strokeOpacity=".16" strokeWidth="16" strokeLinecap="round" />
        <path d={SKY_RAIL} fill="none" stroke="url(#hero-rail-glow)" strokeWidth="2.2" strokeLinecap="round" />
        <path d={SKY_RAIL} fill="none" stroke="var(--gold-hi)" strokeOpacity=".7" strokeWidth="7" strokeDasharray="1.4 12" className={s.ties} />

        <path d={BRIDGE.piers} fill="var(--bridge)" />
        <path d={BRIDGE.spandrel} fill="var(--bridge)" />
        <rect x="-200" y={DECK} width="2000" height="13" fill="var(--bridge)" />
        <path d={`M-200 ${DECK + 0.5}H2000`} stroke="var(--gold)" strokeOpacity=".5" strokeWidth="1" />
        <path d={`M-200 ${DECK + 12.5}H2000`} stroke="var(--bridge-rim)" strokeWidth="1" />

        <g className={s.train}>
          <Car x={300} motion={motion} begin="-2.5s" loco />
          <Car x={229} motion={motion} begin="-1.64s" />
          <Car x={161} motion={motion} begin="-0.82s" />
          <Car x={93} motion={motion} begin="0s" />
        </g>
      </svg>

      <svg className={s.bamboo} viewBox="0 0 260 900" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="bamboo-glow" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#fff3c8" stopOpacity=".95" />
            <stop offset=".35" stopColor="#ffd98a" stopOpacity=".45" />
            <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="102" cy="630" rx="120" ry="160" fill="url(#bamboo-glow)" className={s.bambooGlow} />
        {BAMBOO.map(stalk => (
          <g key={stalk.x} className={s.stalk} style={{ animationDelay: `${stalk.delay}s`, ["--lean" as string]: `${stalk.lean}deg` }}>
            <rect x={stalk.x} y="-40" width={stalk.w} height="960" rx={stalk.w / 2} fill="var(--bamboo)" />
            <rect x={stalk.x + 2} y="-40" width="2" height="960" fill="var(--bamboo-rim)" opacity=".6" />
            {Array.from({ length: 8 }, (_, i) => <rect key={i} x={stalk.x - 1} y={60 + i * 118 + (stalk.x % 40)} width={stalk.w + 2} height="3" rx="1.5" fill="var(--bamboo-rim)" />)}
            {stalk.glow && <rect x={stalk.x + 1} y={572} width={stalk.w - 2} height={112} rx="4" fill="#fff4cf" className={s.glowNode} />}
          </g>
        ))}
        {LEAVES.map(([x, y, angle], i) => (
          <path key={i} d="M0 0C10 -4 26 -4 40 2C26 6 10 6 0 0Z" transform={`translate(${x} ${y}) rotate(${angle})`} fill="var(--bamboo-leaf)" />
        ))}
      </svg>

      {[0, 1, 2].map(i => (
        <button key={i} type="button" className={s.butterfly} data-i={i} data-flown={flown.includes(i)} onClick={() => onButterfly(i)} disabled={flown.includes(i)} aria-label="一只发光的蝴蝶">
          <Butterfly size={i === 1 ? 22 : 18} />
        </button>
      ))}
      <div className={s.fog} />
    </div>
  );
}
