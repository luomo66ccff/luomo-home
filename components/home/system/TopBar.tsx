"use client";

import { useEffect, useRef, useState } from "react";
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
  const barRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const trainRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const rail = railRef.current;
    const fill = fillRef.current;
    const train = trainRef.current;
    if (!bar || !rail || !fill || !train) return;
    const desktopNav = window.matchMedia("(min-width: 1081px)");
    let frame = 0;
    let maxScroll = 0;
    let railWidth = rail.clientWidth;
    let viewportHeight = window.innerHeight;
    let dimensionsDirty = true;
    let navigationDirty = true;
    let activeSection = "hero";
    let navObserver: IntersectionObserver | null = null;
    let lastProgress = -1;
    let lastTrainX = -1;

    const selectActive = (id: string) => {
      if (activeSection === id) return;
      activeSection = id;
      setActive(id);
    };
    const syncNavigation = () => {
      navigationDirty = false;
      navObserver?.disconnect();
      navObserver = null;
      // The mobile navigation is hidden: never measure its eight sections on scroll.
      if (!desktopNav.matches) return;
      selectActive(currentSectionId());
      const intersecting = new Set<string>();
      const marker = Math.floor(viewportHeight * 0.4);
      const observer = new IntersectionObserver(entries => {
        if (navObserver !== observer || !desktopNav.matches) return;
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        }
        const section = SECTIONS.find(entry => intersecting.has(entry.id));
        // Gap transitions are infrequent; preserve the original nearest-section rule.
        selectActive(section?.id ?? currentSectionId());
      }, { rootMargin: `-${marker}px 0px -${Math.max(0, viewportHeight - marker - 1)}px 0px` });
      navObserver = observer;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) navObserver.observe(element);
      }
    };
    const update = () => {
      frame = 0;
      // Geometry is refreshed only after viewport/content size changes, before writes.
      if (dimensionsDirty) {
        dimensionsDirty = false;
        viewportHeight = window.innerHeight;
        maxScroll = Math.max(0, document.documentElement.scrollHeight - viewportHeight);
      }
      if (navigationDirty) syncNavigation();
      const y = window.scrollY;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, y / maxScroll)) : 0;
      const scrolled = String(y > 8);
      if (bar.dataset.scrolled !== scrolled) bar.dataset.scrolled = scrolled;
      if (progress !== lastProgress) {
        lastProgress = progress;
        fill.style.transform = `scaleX(${progress})`;
      }
      const trainX = progress * railWidth;
      if (trainX !== lastTrainX) {
        lastTrainX = trainX;
        train.style.transform = `translate3d(${trainX}px, 0, 0)`;
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const onResize = () => {
      dimensionsDirty = true;
      navigationDirty = true;
      onScroll();
    };
    const sizes = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === rail) railWidth = entry.contentRect.width;
      }
      dimensionsDirty = true;
      onScroll();
    });
    sizes.observe(rail);
    sizes.observe(document.body);
    const main = document.getElementById("main");
    if (main) sizes.observe(main);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    desktopNav.addEventListener("change", onResize);
    return () => {
      cancelAnimationFrame(frame);
      sizes.disconnect();
      navObserver?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      desktopNav.removeEventListener("change", onResize);
    };
  }, []);

  const day = theme === "light";

  return (
    <header ref={barRef} className={s.bar}>
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
      <div ref={railRef} className={s.rail} aria-hidden="true">
        <span ref={fillRef} className={s.railFill} />
        <span ref={trainRef} className={s.railTrain}><TrainGlyph size={30} /></span>
      </div>
    </header>
  );
}
