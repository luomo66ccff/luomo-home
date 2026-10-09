"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Modal from "@/components/ui/Modal";
import { Waypoint } from "../art/Icons";
import { usePrefs } from "../PrefsContext";
import { SECTIONS } from "@/content/sections";
import { STATIONS } from "@/content/stations";
import { openCompanion, openConfig, scrollToSection } from "@/lib/home/store";
import { quickLoad, quickSave } from "@/lib/home/quicksave";
import s from "./system.module.css";

type Item = { id: string; group: string; label: string; hint?: string; keywords?: string; run: () => void };

export default function CommandPalette() {
  const { setTheme } = usePrefs();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const show = () => { setQuery(""); setCursor(0); setOpen(true); };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(value => { if (!value) { setQuery(""); setCursor(0); } return !value; });
      }
    };
    window.addEventListener("luomo:command", show);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("luomo:command", show); window.removeEventListener("keydown", onKey); };
  }, []);

  const items = useMemo<Item[]>(() => {
    const close = (fn: () => void) => () => { setOpen(false); window.setTimeout(fn, 30); };
    const base: Item[] = [
      ...SECTIONS.map(section => ({ id: `go-${section.id}`, group: "传送锚点", label: section.label, hint: section.navLabel, keywords: section.id, run: close(() => scrollToSection(section.id)) })),
      { id: "theme-dark", group: "操作", label: "切换到夜行模式", keywords: "theme dark night 夜", run: close(() => setTheme("dark")) },
      { id: "theme-light", group: "操作", label: "切换到夏日模式", keywords: "theme light day 朝 夏", run: close(() => setTheme("light")) },
      { id: "save", group: "操作", label: "快速存档", hint: "Q.SAVE", keywords: "save", run: close(quickSave) },
      { id: "load", group: "操作", label: "快速读档", hint: "Q.LOAD", keywords: "load", run: close(quickLoad) },
      { id: "config", group: "操作", label: "打开 CONFIG", keywords: "config settings 设置", run: close(openConfig) },
      { id: "atri", group: "操作", label: "和乘务员 ATRI 聊聊", keywords: "atri chat 聊天", run: close(() => openCompanion()) },
      ...STATIONS.map(station => ({ id: `site-${station.id}`, group: "站点", label: `${station.title} · ${station.name}`, hint: station.host, keywords: `${station.stop} ${station.tags.join(" ")}`, run: close(() => window.open(station.url, "_blank", "noopener,noreferrer")) })),
    ];
    const q = query.trim().toLowerCase();
    const filtered = q ? base.filter(item => `${item.label} ${item.hint ?? ""} ${item.keywords ?? ""}`.toLowerCase().includes(q)) : base;
    if (q) filtered.push({ id: "ask", group: "问问 ATRI", label: `「${query.trim()}」`, hint: "发送给 ATRI", run: close(() => openCompanion(query.trim())) });
    return filtered;
  }, [query, setTheme]);

  useEffect(() => { setCursor(0); }, [query]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") { event.preventDefault(); setCursor(value => Math.min(items.length - 1, value + 1)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setCursor(value => Math.max(0, value - 1)); }
    else if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); items[cursor]?.run(); }
  };

  if (!open) return null;
  let lastGroup = "";

  return (
    <Modal onClose={() => setOpen(false)} label="传送锚点" className={s.palette}>
      <div className={s.paletteBody}>
        <div className={s.paletteSearch}>
          <Waypoint size={18} />
          <input
            autoFocus
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="要传送到哪里？也可以直接输入想对 ATRI 说的话"
            aria-label="搜索传送锚点"
            aria-controls="palette-list"
            aria-activedescendant={items[cursor] ? `palette-${items[cursor].id}` : undefined}
            role="combobox"
            aria-expanded="true"
          />
          <kbd>ESC</kbd>
        </div>
        <ul className={s.paletteList} id="palette-list" role="listbox" ref={listRef}>
          {items.map((item, index) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            return (
              <li key={item.id} role="presentation">
                {header && <p className={s.paletteGroup} role="presentation">{header}</p>}
                <button
                  type="button"
                  id={`palette-${item.id}`}
                  role="option"
                  aria-selected={index === cursor}
                  data-index={index}
                  className={s.paletteItem}
                  onMouseEnter={() => setCursor(index)}
                  onClick={item.run}
                >
                  <span>{item.label}</span>
                  {item.hint && <small>{item.hint}</small>}
                </button>
              </li>
            );
          })}
        </ul>
        <p className={s.paletteFoot}><kbd>↑</kbd><kbd>↓</kbd> 选择 · <kbd>Enter</kbd> 传送 · 已激活的锚点会一直亮着</p>
      </div>
    </Modal>
  );
}
