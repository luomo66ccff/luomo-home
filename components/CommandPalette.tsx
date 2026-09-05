"use client";
import { useState, useEffect, useRef } from "react";
import { Search, ArrowUpRight, X } from "lucide-react";
import Modal from "./ui/Modal";
import EasterEggOverlay, { useEasterEgg } from "./EasterEgg";
import { SERVICES } from "@/lib/services";
import { SECTIONS } from "@/content/sections";
import { atriForms } from "@/lib/live2d/atriForms";
import type { ThemeMode } from "@/hooks/useLuomoPreferences";
import { useServiceStatus } from "./ServiceStatusProvider";
import styles from "./HomeExperience.module.css";
type Command = { label: string; description: string; run: () => void };
export default function CommandPalette({ onToggleParticles, onSetTheme, particlesEnabled }: { onToggleParticles?: () => void; onSetTheme?: (theme: ThemeMode) => void; particlesEnabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [output, setOutput] = useState("");
  const [showStatus, setShowStatus] = useState(false);
  const [easter, setEaster] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const { data, metrics, refresh, loading, error } = useServiceStatus();
  useEasterEgg(() => setEaster(true));
  useEffect(() => {
    const toggle = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen(v => !v); } };
    const show = () => setOpen(true);
    document.addEventListener("keydown", toggle); window.addEventListener("luomo:command", show);
    return () => { document.removeEventListener("keydown", toggle); window.removeEventListener("luomo:command", show); };
  }, []);
  useEffect(() => { if (open) { setQuery(""); setSelected(0); setOutput(""); setShowStatus(false); input.current?.focus(); } }, [open]);
  const jump = (id: string) => { setOpen(false); requestAnimationFrame(() => { const target = document.getElementById(id); target?.scrollIntoView({ behavior: "auto" }); }); };
  const ask = (message = "") => { setOpen(false); setTimeout(() => window.dispatchEvent(new CustomEvent("atri:ask", { detail: { message } })), 0); };
  const commands: Command[] = [
    ...SERVICES.map(s => ({ label: "open " + (s.id === "atri" ? "bot" : s.id), description: s.name + " · " + s.worldName, run: () => { window.open(s.url, "_blank", "noopener,noreferrer"); setOpen(false); } })),
    ...SECTIONS.map(s => ({ label: "jump " + s.id, description: "前往" + s.label, run: () => jump(s.id) })),
    { label: "ask atri", description: "和 ATRI 聊聊 · 可在指令后输入内容", run: () => ask() },
    { label: "atri", description: "打开 ATRI 对话", run: () => ask() },
    { label: "companion", description: "打开云端伙伴", run: () => ask() },
    { label: "luomo", description: "向云端伙伴打个招呼", run: () => ask() },
    { label: "status", description: "查看服务状态", run: () => { setShowStatus(true); void refresh(); } },
    { label: "cd projects", description: "前往项目手记", run: () => jump("projects") },
    ...(["dark", "light", "system"] as const).map(mode => ({ label: "theme " + mode, description: { dark: "深色主题", light: "浅色主题", system: "跟随系统主题" }[mode], run: () => { onSetTheme?.(mode); setOutput("主题已设置：" + mode); } })),
    ...(["on", "off"] as const).map(mode => ({ label: "particles " + mode, description: mode === "on" ? "开启星光效果" : "关闭星光效果", run: () => { if (particlesEnabled !== (mode === "on")) onToggleParticles?.(); setOutput(mode === "on" ? "星光已开启（尊重减少动态效果设置）" : "星光已关闭"); } })),
    ...Object.values(atriForms).filter(f => f.safety === "normal").map(f => ({ label: "form " + ({ leatherShoes: "shoes", pajamaPants: "pajama-pants", pillowLeft: "pillow-left", pillowRight: "pillow-right" }[f.id as string] ?? f.id), description: "ATRI 形态 · " + f.label, run: () => { window.dispatchEvent(new CustomEvent("luomo:mood", { detail: { mood: "system", form: f.id } })); setOutput("已选择 " + f.label + "，安装对应模型后可见。"); } })),
    { label: "help", description: "快捷指令使用方法", run: () => setOutput("搜索服务、页面或指令。↑↓ 选择，Enter 执行，Esc 关闭。可使用 open ops、theme light、particles off、ask atri 你好。") },
    { label: "whoami", description: "关于洛墨", run: () => setOutput("洛墨 / Luomo · 学生开发者，好奇心长期持有者。") },
    { label: "ls", description: "列出服务", run: () => setOutput(SERVICES.map(s => s.name).join(" / ")) },
    { label: "easter egg", description: "拾起一颗藏起来的星星", run: () => { setEaster(true); setOutput("星光已送达，旅途愉快。"); } },
    { label: "clear", description: "清除输出", run: () => setOutput("") },
  ];
  const normalized = query.trim().toLowerCase();
  const filtered = commands.filter(c => (c.label + " " + c.description).toLowerCase().includes(normalized))
    .sort((a, b) => Number(b.label.toLowerCase() === normalized) - Number(a.label.toLowerCase() === normalized));
  if (/^ask atri\s+\S/i.test(query)) filtered.unshift({ label: query.trim(), description: "发送给 ATRI", run: () => ask(query.trim().replace(/^ask atri\s+/i, "")) });
  const statusOutput = loading ? "正在获取最新状态…" : error ? error : data ? metrics.operational + " / " + data.services.length + " 项服务正常。" : "暂时没有服务状态。";
  const visibleOutput = showStatus ? statusOutput : output;
  const run = (command: Command) => { setShowStatus(false); command.run(); setQuery(""); setSelected(0); input.current?.focus(); };
  return <><EasterEggOverlay active={easter} onClose={() => setEaster(false)} />{open && <Modal onClose={() => setOpen(false)} label="快捷指令" className="command-modal">
    <div className="command-search"><Search size={19} /><input ref={input} autoFocus aria-label="搜索快捷指令" aria-controls="command-results" aria-activedescendant={filtered[selected] ? "command-option-" + selected : undefined} role="combobox" aria-expanded="true" aria-autocomplete="list" placeholder="搜索服务、页面，或输入一条指令…" value={query} autoComplete="off" onChange={event => { setQuery(event.target.value); setSelected(0); setOutput(""); setShowStatus(false); }} onKeyDown={event => {
      if (event.nativeEvent.isComposing) return;
      if (event.key === "ArrowDown") { event.preventDefault(); setSelected(i => filtered.length ? (i + 1) % filtered.length : 0); }
      if (event.key === "ArrowUp") { event.preventDefault(); setSelected(i => filtered.length ? (i - 1 + filtered.length) % filtered.length : 0); }
      if (event.key === "Enter") { event.preventDefault(); if (filtered[selected]) run(filtered[selected]); }
    }} /><button className={styles.iconButton} onClick={() => setOpen(false)} aria-label="关闭快捷指令"><X size={18} /></button></div>
    {visibleOutput && <p className="command-output" role="status">{visibleOutput}</p>}
    <div id="command-results" role="listbox" aria-label="匹配的指令" className="command-results">{filtered.length ? filtered.map((c, i) => <div role="option" aria-selected={i === selected} id={"command-option-" + i} key={c.label} className={"command-option " + (i === selected ? "selected" : "")} onMouseDown={event => event.preventDefault()} onClick={() => run(c)} ref={element => { if (i === selected) element?.scrollIntoView({ block: "nearest" }); }}><span><strong>{c.description}</strong><small>{c.label}</small></span><ArrowUpRight size={14} /></div>) : <p className="command-empty">没有匹配的指令，试试「服务」或「theme」。</p>}</div>
    <div className="command-footer"><span>↑↓ 选择 · Enter 执行</span><span>Esc 关闭</span></div>
  </Modal>}</>;
}
