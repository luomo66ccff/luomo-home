"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Command, Menu, Moon, Sun, X } from "lucide-react";
import { SECTIONS } from "@/content/sections";
import type { ThemeMode } from "@/hooks/useLuomoPreferences";
import styles from "./HomeExperience.module.css";

const links = SECTIONS.filter(s => ["services", "projects", "worlds", "about"].includes(s.id));
export default function HomeNavigation({ theme, onSetTheme }: { theme: ThemeMode; onSetTheme: (theme: ThemeMode) => void }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("hero");
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: "-15% 0px -55% 0px" });
    SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); }
    };
    const outside = (event: PointerEvent) => {
      if (!menu.current?.contains(event.target as Node) && !menuButton.current?.contains(event.target as Node)) setOpen(false);
    };
    const resize = () => { if (window.innerWidth > 900) setOpen(false); };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", resize);
    return () => { document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", outside); window.removeEventListener("resize", resize); };
  }, [open]);
  const toggleTheme = () => {
    const currentlyLight = document.documentElement.dataset.theme === "light";
    onSetTheme(currentlyLight ? "dark" : "light");
  };
  return (
    <header className={styles.navWrap}>
      <nav className={styles.nav} aria-label="主要导航">
        <a className={styles.brand} href="#hero" aria-label="Luomo 洛墨首页"><span className={styles.brandMark}>L<span>✳</span></span><strong>luomo<span>.</span></strong><span className={styles.brandNote}>PERSONAL UNIVERSE</span></a>
        <div className={styles.navLinks}>{links.map(link => <a className={styles.navLink} href={"#" + link.id} key={link.id} aria-current={active === link.id ? "location" : undefined}>{link.label}</a>)}</div>
        <div className={styles.navActions}>
          <button className={styles.iconButton} type="button" onClick={toggleTheme} aria-label="切换明暗主题" title={"主题：" + theme}><Sun size={17} className={styles.sunIcon} /><Moon size={17} className={styles.moonIcon} /></button>
          <button className={styles.commandButton} type="button" onClick={() => window.dispatchEvent(new Event("luomo:command"))} aria-label="打开快捷指令"><Command size={15} /><kbd>K</kbd></button>
          <a className={styles.navCta} href="#services">进入云端 <ArrowUpRight size={15} /></a>
          <button ref={menuButton} className={styles.menuButton} type="button" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "关闭导航" : "打开导航"}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        {open && <div ref={menu} id="mobile-navigation" className={styles.mobileMenu}>{SECTIONS.map(link => <a href={"#" + link.id} key={link.id} onClick={() => setOpen(false)}>{link.label}<ArrowUpRight size={14} /></a>)}</div>}
      </nav>
    </header>
  );
}
