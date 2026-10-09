import type { BannerArt as ArtId } from "@/content/wish";
import { SPARK_PATH } from "./Icons";

const r1 = (n: number) => Math.round(n * 10) / 10;

const STARS = (() => {
  let seed = 3070;
  const next = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  return Array.from({ length: 46 }, (_, i) => ({ x: r1(next() * 640), y: r1(next() * 230), r: i % 7 === 0 ? 1.5 : 0.7 }));
})();

function Stars({ opacity = 0.8 }: { opacity?: number }) {
  return <g fill="#fff" opacity={opacity}>{STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} />)}</g>;
}

function Spark({ x, y, size, fill = "#fff", opacity = 1 }: { x: number; y: number; size: number; fill?: string; opacity?: number }) {
  return <path d={SPARK_PATH} fill={fill} opacity={opacity} transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})`} />;
}

function Ops({ uid }: { uid: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-bg`} cx=".7" cy=".2" r="1"><stop offset="0" stopColor="#1b3566" /><stop offset="1" stopColor="#040817" /></radialGradient>
        <radialGradient id={`${uid}-planet`} cx=".3" cy=".25" r=".9"><stop offset="0" stopColor="#6fd6ff" /><stop offset=".45" stopColor="#1e5aa8" /><stop offset="1" stopColor="#071433" /></radialGradient>
      </defs>
      <rect width="640" height="360" fill={`url(#${uid}-bg)`} />
      <Stars />
      <circle cx="560" cy="560" r="340" fill={`url(#${uid}-planet)`} />
      <circle cx="560" cy="560" r="346" fill="none" stroke="#9be4ff" strokeOpacity=".5" strokeWidth="3" />
      <path d="M260 330C330 250 470 210 640 230" stroke="#bff0ff" strokeOpacity=".25" strokeWidth="1.5" fill="none" />
      <g transform="translate(372 138) rotate(-12)">
        <rect x="-150" y="-12" width="70" height="24" fill="#16305c" stroke="#8fd3ff" strokeWidth="1.2" />
        <path d="M-150 -4H-80M-150 4H-80M-132 -12V12M-114 -12V12M-97 -12V12" stroke="#8fd3ff" strokeOpacity=".5" strokeWidth=".8" />
        <rect x="80" y="-12" width="70" height="24" fill="#16305c" stroke="#8fd3ff" strokeWidth="1.2" />
        <path d="M80 -4H150M80 4H150M98 -12V12M115 -12V12M132 -12V12" stroke="#8fd3ff" strokeOpacity=".5" strokeWidth=".8" />
        <path d="M-80 0H80" stroke="#cfe9ff" strokeWidth="3" />
        <ellipse rx="96" ry="30" fill="none" stroke="#8fd3ff" strokeWidth="7" />
        <ellipse rx="96" ry="30" fill="none" stroke="#ffffff" strokeOpacity=".6" strokeWidth="1.5" />
        <path d="M-68 -21L0 0M68 -21L0 0M-68 21L0 0M68 21L0 0" stroke="#8fd3ff" strokeOpacity=".7" strokeWidth="1.5" />
        <rect x="-18" y="-24" width="36" height="48" rx="10" fill="#d8ecff" />
        <rect x="-12" y="-14" width="24" height="5" rx="2" fill="#1b3566" />
        <rect x="-12" y="-4" width="24" height="5" rx="2" fill="#1b3566" />
        <circle cy="14" r="4" fill="#ffcf6b" />
        <path d="M0 -24V-48M-6 -48H6" stroke="#d8ecff" strokeWidth="2" />
        <circle cy="-50" r="2.6" fill="#ff6b6b" />
      </g>
      <path className="art-ecg" d="M0 262H168L180 238L196 300L212 214L226 270L236 256H392L402 244L414 276L426 262H640" fill="none" stroke="#8fd3ff" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M0 262H168L180 238L196 300L212 214L226 270L236 256H392L402 244L414 276L426 262H640" fill="none" stroke="#8fd3ff" strokeOpacity=".22" strokeWidth="10" strokeLinejoin="round" />
      <text x="24" y="330" fill="#8fd3ff" fontFamily="monospace" fontSize="11" letterSpacing="3" opacity=".8">HEARTBEAT · 60 BPM · ALL GREEN</text>
    </>
  );
}

function File({ uid }: { uid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c1442" /><stop offset=".62" stopColor="#7a4a8c" /><stop offset="1" stopColor="#f6a5c0" /></linearGradient>
        <linearGradient id={`${uid}-sail`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff4f8" /><stop offset="1" stopColor="#f6a5c0" /></linearGradient>
      </defs>
      <rect width="640" height="360" fill={`url(#${uid}-bg)`} />
      <Stars opacity={0.7} />
      <circle cx="120" cy="80" r="34" fill="#fff3e6" opacity=".9" />
      <circle cx="132" cy="72" r="30" fill="#2a1c52" opacity=".9" />
      <g className="art-bob">
        <path d="M232 238C262 276 420 280 470 236L488 222H214Z" fill="#3b2353" stroke="#f6a5c0" strokeWidth="2" />
        <path d="M236 232H486" stroke="#ffd98a" strokeWidth="2.4" />
        <path d="M352 222V64" stroke="#ffe7f0" strokeWidth="3" />
        <path d="M356 70C420 100 448 160 452 214H356Z" fill={`url(#${uid}-sail)`} opacity=".95" />
        <path d="M348 92C306 118 288 168 286 214H348Z" fill={`url(#${uid}-sail)`} opacity=".8" />
        <path d="M372 110C398 130 412 160 418 196M368 150C384 162 392 180 396 200" stroke="#f6a5c0" strokeWidth="1.4" fill="none" />
        <path d="M352 62L380 70L352 78Z" fill="#ff7aa8" />
        <g>
          <rect x="262" y="194" width="34" height="28" rx="3" fill="#ffcf6b" />
          <path d="M262 202H296" stroke="#b07d22" strokeWidth="1.5" />
          <rect x="298" y="200" width="28" height="22" rx="3" fill="#8fd3ff" />
          <path d="M298 207H326" stroke="#2f6aa8" strokeWidth="1.5" />
          <rect x="274" y="172" width="26" height="22" rx="3" fill="#c49cff" />
          <path d="M274 179H300" stroke="#6b45b3" strokeWidth="1.5" />
        </g>
        {[[240, 230], [470, 228]].map(([x, y]) => (
          <g key={x}>
            <path d={`M${x} ${y - 14}V${y - 4}`} stroke="#ffe7f0" strokeWidth="1.2" />
            <ellipse cx={x} cy={y + 2} rx="7" ry="9" fill="#ff5a6e" />
            <ellipse cx={x} cy={y + 2} rx="16" ry="16" fill="#ff8a8a" opacity=".2" />
          </g>
        ))}
      </g>
      {[[150, 170, -18], [520, 120, 14], [560, 210, -8], [96, 250, 10], [440, 70, -22]].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <g className="art-float" style={{ animationDelay: `${-i * 1.3}s` }}>
            <path d="M-14 -18H6L14 -10V18H-14Z" fill="#fff6fa" opacity=".9" />
            <path d="M6 -18V-10H14" fill="none" stroke="#f6a5c0" strokeWidth="1.2" />
            <path d="M-8 -6H8M-8 0H8M-8 6H3" stroke="#f6a5c0" strokeWidth="1.4" />
          </g>
        </g>
      ))}
      <path d="M0 268C60 250 110 270 170 262C240 252 280 276 350 270C430 262 480 248 540 258C590 266 620 260 640 256V360H0Z" fill="#ffe1ec" opacity=".85" />
      <path d="M0 296C70 282 130 300 210 292C290 284 350 306 430 298C510 290 570 280 640 290V360H0Z" fill="#fff4f8" />
      <path d="M0 330C90 318 170 334 260 326C350 318 430 338 520 330C580 324 620 322 640 324V360H0Z" fill="#ffffff" />
    </>
  );
}

function Terminal({ uid }: { uid: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-glow`} cx=".52" cy=".55" r=".5"><stop offset="0" stopColor="#ffb35c" /><stop offset=".35" stopColor="#c45a2a" stopOpacity=".7" /><stop offset="1" stopColor="#0b1512" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${uid}-rock`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2a26" /><stop offset="1" stopColor="#0a1210" /></linearGradient>
      </defs>
      <rect width="640" height="360" fill="#0b1512" />
      <ellipse cx="333" cy="196" rx="300" ry="190" fill={`url(#${uid}-glow)`} />
      <path d="M0 0H640V360H520C520 260 470 150 333 140C196 150 146 260 146 360H0Z" fill={`url(#${uid}-rock)`} />
      <path d="M40 40L90 70L70 120M590 60L560 110L600 150M20 220L70 240M600 250L560 280" stroke="#2d4640" strokeWidth="2" fill="none" />
      <path d="M210 360L318 200M456 360L348 200" stroke="#6b5a48" strokeWidth="4" />
      {Array.from({ length: 9 }, (_, i) => {
        const t = i / 8;
        const y = r1(360 - (160 * Math.pow(t, 0.7)));
        const half = 128 * (1 - t) + 16;
        return <path key={i} d={`M${333 - half} ${y}H${333 + half}`} stroke="#3d342b" strokeWidth={6 - t * 4} />;
      })}
      <g transform="translate(250 286)">
        <path d="M-40 -34H40L32 0H-32Z" fill="#4a3c30" stroke="#8be3b5" strokeOpacity=".4" />
        <path d="M-34 -34L-24 -48H24L34 -34" fill="#7d6a58" />
        <circle cx="-20" cy="2" r="7" fill="#1d1712" stroke="#8be3b5" strokeOpacity=".5" />
        <circle cx="20" cy="2" r="7" fill="#1d1712" stroke="#8be3b5" strokeOpacity=".5" />
      </g>
      <path d="M150 90C220 120 280 112 333 104C390 96 450 112 500 92" stroke="#3a2d22" strokeWidth="1.5" fill="none" />
      {[[190, 106], [262, 110], [333, 104], [404, 102], [474, 100]].map(([x, y], i) => (
        <g key={i} className="art-lamp" style={{ animationDelay: `${-i * 0.7}s` }}>
          <path d={`M${x} ${y}v8`} stroke="#3a2d22" strokeWidth="1.2" />
          <rect x={x - 5} y={y + 8} width="10" height="13" rx="3" fill="#ffcf6b" />
          <circle cx={x} cy={y + 14} r="16" fill="#ffcf6b" opacity=".18" />
        </g>
      ))}
      <g transform="translate(470 190) rotate(-4)">
        <rect x="-62" y="-30" width="124" height="60" rx="6" fill="#0d1a17" stroke="#8be3b5" strokeWidth="1.5" />
        <text x="-50" y="-8" fill="#8be3b5" fontFamily="monospace" fontSize="11">$ docker ps</text>
        <text x="-50" y="8" fill="#8be3b5" fontFamily="monospace" fontSize="11" opacity=".75">5 up · 0 down</text>
        <rect className="art-caret" x="-50" y="14" width="7" height="10" fill="#8be3b5" />
        <path d="M-40 30V52M40 30V52" stroke="#3a2d22" strokeWidth="3" />
      </g>
      {[[96, 300], [120, 318], [560, 312], [586, 296]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y}l8 -22l8 22z`} fill="#8be3b5" opacity=".55" />
      ))}
    </>
  );
}

function Api({ uid }: { uid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#170c33" /><stop offset="1" stopColor="#47236e" /></linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff0c4" /><stop offset="1" stopColor="#c99a3a" /></linearGradient>
      </defs>
      <rect width="640" height="360" fill={`url(#${uid}-bg)`} />
      <g stroke="#e9c87c" strokeOpacity=".2" strokeWidth="1.2">
        {Array.from({ length: 19 }, (_, i) => { const a = Math.PI * (i / 18); return <path key={i} d={`M320 300L${r1(320 - Math.cos(a) * 520)} ${r1(300 - Math.sin(a) * 520)}`} />; })}
      </g>
      {[[90, 120, 18], [150, 60, 10], [520, 90, 22], [580, 170, 12], [470, 40, 8], [60, 220, 9]].map(([x, y, r], i) => (
        <g key={i} className="art-float" style={{ animationDelay: `${-i * 1.1}s` }}>
          <circle cx={x} cy={y} r={r} fill="#c49cff" opacity=".18" stroke="#e8d5ff" strokeOpacity=".6" />
          <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.22} fill="#fff" opacity=".7" />
        </g>
      ))}
      <g transform="translate(320 104)">
        <circle r="58" fill={`url(#${uid}-gold)`} />
        <circle r="48" fill="#2a1650" />
        <circle r="44" fill="#fff8e6" />
        {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <circle key={i} cx={r1(Math.cos(a) * 36)} cy={r1(Math.sin(a) * 36)} r="2.2" fill="#c99a3a" />; })}
        <circle cx="-14" cy="-6" r="4.5" fill="#2a1650" />
        <circle cx="14" cy="-6" r="4.5" fill="#2a1650" />
        <path d="M-18 12C-10 24 10 24 18 12" stroke="#2a1650" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path className="art-hand" d="M0 0V-30" stroke="#c45a7a" strokeWidth="3" strokeLinecap="round" />
        <path d="M-58 -30C-80 -60 -60 -84 -38 -70M58 -30C80 -60 60 -84 38 -70" stroke={`url(#${uid}-gold)`} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      <g transform="translate(320 262)">
        <path d="M-210 0H210L196 98H-196Z" fill="#2a1650" stroke="#e9c87c" strokeWidth="2" />
        <path d="M-224 -10H224V2H-224Z" fill={`url(#${uid}-gold)`} />
        <path d="M-150 20V90M-75 20V90M0 20V90M75 20V90M150 20V90" stroke="#e9c87c" strokeOpacity=".3" strokeWidth="2" />
        <text x="0" y="56" fill="#e9c87c" textAnchor="middle" fontFamily="serif" fontSize="18" letterSpacing="10">RECEPTION</text>
        <path d="M120 -10C120 -34 160 -34 160 -10Z" fill={`url(#${uid}-gold)`} />
        <rect x="114" y="-12" width="52" height="4" rx="2" fill="#c99a3a" />
        <circle cx="140" cy="-36" r="3" fill="#fff0c4" />
      </g>
      <g transform="translate(110 182)">
        <rect x="-50" y="-36" width="100" height="70" rx="6" fill="#2a1650" stroke="#e9c87c" strokeOpacity=".6" />
        {[-30, -10, 10, 30].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy="-20" r="3" fill="#e9c87c" />
            <path d={`M${x} -17v18`} stroke="#e9c87c" strokeWidth="2" />
            <rect x={x - 6} y="1" width="12" height="16" rx="2" fill={["#c49cff", "#8fd3ff", "#ffcf6b", "#f6a5c0"][i]} />
          </g>
        ))}
      </g>
    </>
  );
}

function Live2d({ uid }: { uid: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-bg`} cx=".5" cy=".4" r=".8"><stop offset="0" stopColor="#5a3550" /><stop offset="1" stopColor="#1a0c1f" /></radialGradient>
        <linearGradient id={`${uid}-spot`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff2cc" stopOpacity=".55" /><stop offset="1" stopColor="#fff2cc" stopOpacity="0" /></linearGradient>
        <radialGradient id={`${uid}-iris`} cx=".45" cy=".4" r=".6"><stop offset="0" stopColor="#ffe9a8" /><stop offset=".55" stopColor="#e6a23c" /><stop offset="1" stopColor="#7a4a1a" /></radialGradient>
        <clipPath id={`${uid}-eye`}><path d="M200 182C250 120 390 120 440 182C390 244 250 244 200 182Z" /></clipPath>
      </defs>
      <rect width="640" height="360" fill={`url(#${uid}-bg)`} />
      <path d="M260 0H380L470 360H170Z" fill={`url(#${uid}-spot)`} />
      <path d="M0 0H130C120 80 140 160 110 240C96 290 104 330 120 360H0Z" fill="#8a1f3a" />
      <path d="M30 0C34 120 20 240 40 360M70 0C80 120 60 240 82 360" stroke="#5e1226" strokeWidth="8" fill="none" opacity=".6" />
      <path d="M640 0H510C520 80 500 160 530 240C544 290 536 330 520 360H640Z" fill="#8a1f3a" />
      <path d="M610 0C606 120 620 240 600 360M570 0C560 120 580 240 558 360" stroke="#5e1226" strokeWidth="8" fill="none" opacity=".6" />
      <path d="M0 0H640V26C560 46 480 30 400 40C320 50 240 30 160 42C90 52 40 36 0 30Z" fill="#a8304e" />
      <path d="M0 26C40 36 90 52 160 42C240 30 320 50 400 40C480 30 560 46 640 26" stroke="#ffcf6b" strokeWidth="2" fill="none" />
      <g>
        <path d="M200 182C250 120 390 120 440 182C390 244 250 244 200 182Z" fill="#fffaf3" />
        <g clipPath={`url(#${uid}-eye)`}>
          <circle cx="320" cy="182" r="54" fill={`url(#${uid}-iris)`} />
          <circle cx="320" cy="182" r="22" fill="#3a1f0c" />
          <circle cx="304" cy="164" r="11" fill="#fff" />
          <circle cx="338" cy="198" r="5" fill="#fff" opacity=".8" />
          <g transform="translate(0 -150)"><rect className="art-lid" x="190" y="110" width="260" height="146" fill="#5a3550" /></g>
        </g>
        <path d="M196 182C250 112 390 112 444 182" stroke="#2a1426" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M232 140L220 122M270 124L264 104M320 118V97M370 124L376 104M408 140L420 122" stroke="#2a1426" strokeWidth="4" strokeLinecap="round" />
      </g>
      <Spark x={150} y={110} size={22} fill="#ffcf6b" />
      <Spark x={492} y={90} size={16} fill="#fff" />
      <Spark x={470} y={270} size={26} fill="#ffcf6b" />
      <Spark x={180} y={280} size={14} fill="#fff" opacity={0.8} />
      <path d="M150 360C200 330 440 330 490 360Z" fill="#2a1426" />
    </>
  );
}

function Album({ uid }: { uid: string }) {
  const photo = (x: number, y: number, r: number, sky: string, ground: string, date: string, key: string) => (
    <g key={key} transform={`translate(${x} ${y}) rotate(${r})`}>
      <rect x="-56" y="-62" width="112" height="128" rx="3" fill="#fffdf8" />
      <rect x="-48" y="-54" width="96" height="92" fill={sky} />
      <path d="M-48 14C-20 4 10 20 48 6V38H-48Z" fill={ground} />
      <circle cx="22" cy="-30" r="10" fill="#fff6d8" opacity=".9" />
      <text x="40" y="58" textAnchor="end" fill="#ff7aa8" fontFamily="cursive" fontSize="12">{date}</text>
    </g>
  );
  const flake = (x: number, y: number, size: number, key: string) => (
    <g key={key} transform={`translate(${x} ${y})`} stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity=".85">
      <g className="art-spin">
        {[0, 60, 120].map(angle => <path key={angle} d={`M0 ${-size}V${size}M${-size * 0.3} ${-size * 0.7}L0 ${-size * 0.45}L${size * 0.3} ${-size * 0.7}M${-size * 0.3} ${size * 0.7}L0 ${size * 0.45}L${size * 0.3} ${size * 0.7}`} transform={`rotate(${angle})`} />)}
      </g>
    </g>
  );
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffb8d6" /><stop offset=".55" stopColor="#d9c4ff" /><stop offset="1" stopColor="#a8dcff" /></linearGradient>
      </defs>
      <rect width="640" height="360" fill={`url(#${uid}-bg)`} />
      <g opacity=".35" fill="#fff">{Array.from({ length: 14 }, (_, i) => <circle key={i} cx={(i * 97) % 640} cy={(i * 53) % 360} r={2 + (i % 3)} />)}</g>
      {photo(150, 180, -12, "#8fd3ff", "#4f9a62", "3.7", "p1")}
      {photo(500, 176, 10, "#ffb07a", "#7a4a8c", "3.7", "p2")}
      {photo(420, 120, -4, "#3b4a9a", "#1d2b5a", "03/07", "p3")}
      <g transform="translate(300 214)">
        <rect x="-92" y="-56" width="184" height="112" rx="16" fill="#fdf6ff" stroke="#ff9ec7" strokeWidth="3" />
        <rect x="-92" y="-56" width="184" height="30" rx="14" fill="#ff9ec7" />
        <rect x="-70" y="-74" width="44" height="22" rx="6" fill="#ff9ec7" />
        <circle cy="8" r="44" fill="#2b2442" />
        <circle cy="8" r="34" fill="#4a5ba8" />
        <circle cy="8" r="22" fill="#1a1f40" />
        <circle cx="-10" cy="-4" r="8" fill="#ffffff" opacity=".75" />
        <circle cx="64" cy="-40" r="7" fill="#fff6d8" />
        <rect x="52" y="22" width="24" height="10" rx="5" fill="#a8dcff" />
      </g>
      {flake(80, 70, 14, "f1")}
      {flake(580, 60, 10, "f2")}
      {flake(600, 300, 16, "f3")}
      {flake(60, 300, 9, "f4")}
      <Spark x={240} y={70} size={18} fill="#fff" />
      <Spark x={380} y={300} size={14} fill="#fff" />
      <path d="M-10 340C120 300 220 352 320 330C440 304 520 350 650 320" stroke="#ff7aa8" strokeWidth="6" fill="none" opacity=".6" />
    </>
  );
}

export default function BannerArt({ art, uid, className }: { art: ArtId; uid: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {art === "ops" && <Ops uid={uid} />}
      {art === "file" && <File uid={uid} />}
      {art === "terminal" && <Terminal uid={uid} />}
      {art === "api" && <Api uid={uid} />}
      {art === "live2d" && <Live2d uid={uid} />}
      {art === "album" && <Album uid={uid} />}
    </svg>
  );
}
