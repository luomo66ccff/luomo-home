import { LogoMark } from "../art/Icons";
import { STATIONS } from "@/content/stations";
import s from "./system.module.css";

export function NextStop({ label, index }: { label: string; index: string }) {
  return (
    <div className={`wrap ${s.nextStop}`} aria-hidden="true">
      <span className={s.nextLine} />
      <p><span>NEXT · {index}</span>下一站，{label}</p>
      <span className={s.nextLine} />
    </div>
  );
}

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={s.footer}>
      <div className="wrap">
        <div className={s.footTop}>
          <a href="#hero" className={s.footBrand}>
            <LogoMark size={40} />
            <span><b>洛墨站</b><small>LUOMO STATION · NIGHT LINE</small></span>
          </a>
          <p className={s.footQuote}>A little space for things I love.</p>
        </div>
        <nav className={s.footLinks} aria-label="页脚服务导航">
          {STATIONS.map(station => (
            <a key={station.id} href={station.url} target="_blank" rel="noopener noreferrer">
              <small>{station.stop}</small>{station.name}
            </a>
          ))}
          <a href="https://github.com/luomo66ccff" target="_blank" rel="noopener noreferrer"><small>源代码</small>GitHub</a>
        </nav>
        <p className={s.credits}>
          插画为 AI 辅助生成后挑选 · 图形、图标与动效均为代码绘制 · 字体：得意黑、霞鹜文楷、Cormorant Garamond、JetBrains Mono（SIL OFL 1.1）
        </p>
        <div className={s.footBottom}>
          <p>© {year} LUOMO · 用好奇心构建</p>
          <a href="#hero">BACK TO PLATFORM 0 ↑</a>
        </div>
      </div>
    </footer>
  );
}
