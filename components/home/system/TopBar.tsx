"use client";

import { useEffect, useState } from "react";
import { LogoMark, TrainGlyph } from "../art/Icons";
import { usePrefs } from "../PrefsContext";
import { SECTIONS } from "@/content/sections";
import { openCommand, openConfig } from "@/lib/home/store";
import { currentSectionId, quickLoad, quickSave } from "@/lib/home/quicksave";
import { useDocumentTheme } from "@/lib/home/hooks";
import s from "./system.module.css";

export default function TopBar() {
  const { setTheme } = usePrefs();
  const theme = useDocumentTheme();
  const [active, setActive] = useState("hero");
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 8);
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      setActive(currentSectionId());
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const day = theme === "light";

  return (
    <header className={s.bar} data-scrolled={scrolled}>
      <div className={s.barInner}>
        <a href="#hero" className={s.brand} aria-label="洛墨站，回到 0 号站台">
          <LogoMark size={32} />
          <span><b>洛墨站</b><small>LUOMO STATION</small></span>
        </a>
        <nav className={s.nav} aria-label="站点导航">
          <ol>
            {SECTIONS.map(section => (
              <li key={section.id}>
                <a href={`#${section.id}`} aria-current={active === section.id ? "location" : undefined}>
                  <i aria-hidden="true" />{section.navLabel}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className={s.tools}>
          <button type="button" className={s.textTool} onClick={quickSave}>Q.SAVE</button>
          <button type="button" className={s.textTool} onClick={quickLoad}>Q.LOAD</button>
          <button type="button" className={s.iconTool} onClick={() => setTheme(day ? "dark" : "light")} aria-label={day ? "切换到夜行模式" : "切换到夏日模式"} title={day ? "夜" : "朝"}>
            {day ? (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="currentColor" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.4" fill="currentColor" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            )}
          </button>
          <button type="button" className={s.iconTool} onClick={openConfig} aria-label="打开 CONFIG 设置" title="CONFIG">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.4 3.5-.1-1.3 2-1.6-2-3.4-2.4 1a8 8 0 0 0-2.2-1.3L15.4 3h-4l-.4 2.4a8 8 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6a8 8 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-1a8 8 0 0 0 2.2 1.3l.4 2.4h4l.4-2.4a8 8 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6.1-1.3Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" className={s.warp} onClick={openCommand} aria-label="打开传送锚点（Ctrl 或 ⌘ + K）">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2 4 8v8l8 6 8-6V8Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>
            <span>传送</span>
            <kbd>⌘K</kbd>
          </button>
        </div>
      </div>
      <div className={s.rail} aria-hidden="true">
        <span className={s.railFill} style={{ transform: `scaleX(${progress})` }} />
        <span className={s.railTrain} style={{ left: `${progress * 100}%` }}><TrainGlyph size={30} /></span>
      </div>
    </header>
  );
}
