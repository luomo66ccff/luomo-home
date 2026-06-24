"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useEasterEgg } from "./EasterEgg";
import EasterEggOverlay from "./EasterEgg";
import type { ThemeMode } from "@/hooks/useLuomoPreferences";
import type { AtriBrainResponse } from "@/lib/atri-brain/types";

interface Command {
  label: string;
  action: "help" | "whoami" | "status" | "ls" | "cd" | "open" | "theme" | "particles" | "luomo" | "easter" | "clear" | "scroll" | "ask";
  url?: string;
  id?: string;
  arg?: string;
}

const COMMANDS: Command[] = [
  { label: "help", action: "help" },
  { label: "whoami", action: "whoami" },
  { label: "status", action: "status" },
  { label: "ls", action: "ls" },
  { label: "cd projects", action: "cd" },
  { label: "open ops", action: "open", url: "https://ops.luomo.moe", arg: "ops" },
  { label: "open file", action: "open", url: "https://file.luomo.moe", arg: "file" },
  { label: "open api", action: "open", url: "https://api.luomo.moe", arg: "api" },
  { label: "open terminal", action: "open", url: "https://terminal.luomo.moe", arg: "terminal" },
  { label: "open bot", action: "open", url: "https://atri-api.luomo.moe", arg: "bot" },
  { label: "theme dark", action: "theme", arg: "dark" },
  { label: "theme light", action: "theme", arg: "light" },
  { label: "theme system", action: "theme", arg: "system" },
  { label: "particles on", action: "particles", arg: "on" },
  { label: "particles off", action: "particles", arg: "off" },
  { label: "luomo", action: "luomo" },
  { label: "companion", action: "luomo" },
  { label: "ask atri", action: "ask" },
  { label: "atri", action: "ask" },
  { label: "easter egg", action: "easter" },
  { label: "form default", action: "luomo", arg: "form-default" },
  { label: "form pajama", action: "luomo", arg: "form-pajama" },
  { label: "form pajama-pants", action: "luomo", arg: "form-pajamaPants" },
  { label: "form sandals", action: "luomo", arg: "form-sandals" },
  { label: "form shoes", action: "luomo", arg: "form-shoes" },
  { label: "form bird", action: "luomo", arg: "form-bird" },
  { label: "form kani", action: "luomo", arg: "form-kani" },
  { label: "form pillow-left", action: "luomo", arg: "form-pillowLeft" },
  { label: "form pillow-right", action: "luomo", arg: "form-pillowRight" },
  { label: "unlock secret forms", action: "luomo", arg: "unlock-secret" },
  { label: "lock secret forms", action: "luomo", arg: "lock-secret" },
  { label: "unlock debug forms", action: "luomo", arg: "unlock-debug" },
  { label: "lock debug forms", action: "luomo", arg: "lock-debug" },
  { label: "clear", action: "clear" },
  { label: "jump hero", action: "scroll", id: "hero" },
  { label: "jump visual", action: "scroll", id: "visual-world" },
  { label: "jump services", action: "scroll", id: "service-constellation" },
  { label: "jump cockpit", action: "scroll", id: "operations-cockpit" },
  { label: "jump orbit", action: "scroll", id: "infrastructure-orbit" },
  { label: "jump log", action: "scroll", id: "build-log" },
  { label: "jump gate", action: "scroll", id: "enter-cloud" },
];

const HELP_TEXT = `Available commands:

  help          Show this help
  whoami        Who built this cloud
  status        Fetch service constellation status
  ls            List accessible services
  cd projects   Scroll to build log
  jump <sec>    Jump to section: hero | visual | services | cockpit | orbit | log | gate
  open <svc>    Open service: ops | file | api | terminal | bot
  theme <mode>  Set theme: dark | light | system
  particles <on|off>  Toggle particle effects
  luomo         Special ATRI greeting
  easter egg    ???
  clear         Clear terminal output

Ctrl+K to toggle · Esc to close · ↑↓ to navigate`;

const WHOAMI_TEXT = "Luomo — 五道星门的建造者，云端灯塔的守夜人。The keeper of five glowing gates and the dream beneath the stars.";
const LS_TEXT = "  ops/  file/  api/  terminal/  atri-api/";
const LUOMO_TEXT = "ATRI says: \"Hidden star route activated. The cloud knows you were here. ✦\"";

interface Props {
  onToggleParticles?: () => void;
  onSetTheme?: (theme: ThemeMode) => void;
  particlesEnabled?: boolean;
}

export default function CommandPalette({ onToggleParticles, onSetTheme, particlesEnabled }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [output, setOutput] = useState<string | null>(null);
  const [easterActive, setEasterActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEasterEgg(() => setEasterActive(true));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => { if (open) { setQuery(""); setSelectedIndex(0); setOutput(null); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);

  const filtered = query.length > 0
    ? COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS;

  const execute = useCallback((cmd: Command) => {
    switch (cmd.action) {
      case "help": setOutput(HELP_TEXT); window.dispatchEvent(new CustomEvent("luomo:mood", { detail: { mood: "focused" } })); break;
      case "whoami": setOutput(WHOAMI_TEXT); break;
      case "ls": setOutput(LS_TEXT); break;
      case "cd": document.getElementById("build-log")?.scrollIntoView({ behavior: "smooth" }); setOutput("cd ~/projects"); break;
      case "open":
        if (cmd.url) window.open(cmd.url, "_blank");
        setOutput(`Opening ${cmd.arg || "service"}...`);
        window.dispatchEvent(new CustomEvent("luomo:mood", { detail: { mood: "excited" } }));
        break;
      case "theme":
        onSetTheme?.(cmd.arg as ThemeMode);
        setOutput(`Theme set to ${cmd.arg}`);
        break;
      case "particles":
        onToggleParticles?.();
        setOutput(`Particles ${cmd.arg === "on" ? "enabled" : "disabled"}`);
        break;
      case "luomo":
        if (cmd.arg?.startsWith("form-")) {
          const fid = cmd.arg.replace("form-", "") as any;
          setOutput("ATRI form: " + fid);
          window.dispatchEvent(new CustomEvent("luomo:mood", { detail: { mood: "system", form: fid } }));
        } else if (cmd.arg === "unlock-secret") {
          setOutput("Secret forms unlocked.");
          window.dispatchEvent(new CustomEvent("luomo:mood", { detail: { mood: "system", allowSecret: true } }));
        } else if (cmd.arg === "lock-secret") {
          setOutput("Secret forms locked.");
          window.dispatchEvent(new CustomEvent("luomo:mood", { detail: { mood: "system", allowSecret: false, form: "default" } }));
        } else if (cmd.arg === "unlock-debug") {
          setOutput("Debug forms unlocked.");
          window.dispatchEvent(new CustomEvent("luomo:mood", { detail: { mood: "system", allowDebug: true } }));
        } else if (cmd.arg === "lock-debug") {
          setOutput("Debug forms locked.");
          window.dispatchEvent(new CustomEvent("luomo:mood", { detail: { mood: "system", allowDebug: false, form: "default" } }));
        } else {
          setOutput(LUOMO_TEXT);
          setEasterActive(true);
          window.dispatchEvent(new CustomEvent("luomo:mood", { detail: { mood: "secret" } }));
        }
        break;
      case "easter":
        setOutput("Hidden route unlocked: /march7th");
        setEasterActive(true);
        window.dispatchEvent(new CustomEvent("luomo:mood", { detail: { mood: "secret" } }));
        break;
      case "clear":
        setOutput(null);
        setQuery("");
        break;
      case "scroll":
        if (cmd.id) document.getElementById(cmd.id)?.scrollIntoView({ behavior: "smooth" });
        setOutput(`Jumping to ${cmd.id}...`);
        window.dispatchEvent(new CustomEvent("luomo:mood", { detail: { mood: "focused" } }));
        break;
      case "status":
        window.dispatchEvent(new CustomEvent("luomo:mood", { detail: { mood: "system" } }));
        fetch("/api/services")
          .then((r) => r.json())
          .then((d) => {
            const svcs = d.services || [];
            const ops = svcs.filter((s: any) => s.status === "operational");
            setOutput(`Cloud Pulse: ${svcs.length} linked · ${ops.length} operational · ${new Date().toLocaleTimeString()}`);
          })
          .catch(() => setOutput("Status: degraded / unknown"));
        break;
    }
  }, [onToggleParticles, onSetTheme]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); return; }
    if (e.key === "Enter") {
      const line = query.trim();
      const match = COMMANDS.find((c) => c.label === line);
      if (match) { execute(match); setQuery(""); return; }
      if (filtered.length > 0) { execute(filtered[Math.min(selectedIndex, filtered.length - 1)]); setQuery(""); return; }
      setOutput(`command not found: ${line}`);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full
          glass border border-white/10 text-white/70 hover:text-white hover:border-cyan-300/30
          transition-all text-xs font-mono active:scale-95"
        aria-label="Open command palette"
        style={{ minHeight: "44px", minWidth: "44px" }}
      >
        <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7"/></svg>
        <span className="hidden sm:inline text-white/50">Ctrl K</span>
      </button>
    );
  }

  return (
    <>
      <EasterEggOverlay active={easterActive} onClose={() => setEasterActive(false)} />
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      >
        <div className="glass-strong rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border-white/5 flex flex-col" style={{ maxHeight: "min(80vh, 600px)" }}>
          {/* Input */}
          <div className="p-3 border-b border-white/5 flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-xs shrink-0">luomo@cloud-core:~$</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="type a command..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white placeholder-slate-600 outline-none text-sm font-mono"
              autoComplete="off"
            />
          </div>

          {/* Suggestions or Command List */}
          {query.length > 0 && !output && (
            <div className="max-h-52 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="text-slate-500 text-sm p-3 text-center font-mono">command not found: {query}</p>
              )}
              {filtered.map((cmd, i) => (
                <button
                  key={cmd.label}
                  onClick={() => { execute(cmd); setQuery(""); }}
                  className={"w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 flex items-center gap-3 font-mono "
                    + (i === selectedIndex ? "bg-cyan-500/10 text-cyan-100 border border-cyan-400/20" : "text-slate-400 hover:bg-white/5")}
                >
                  <span className="text-cyan-500">{">"}</span>
                  {cmd.label}
                </button>
              ))}
            </div>
          )}

          {/* Output */}
          {output && (
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="cmd-feedback whitespace-pre-wrap break-words text-sm">{output}</pre>
            </div>
          )}

          {/* Footer */}
          <div className="p-2 border-t border-white/5 flex gap-4 text-xs text-slate-600 px-3 py-2 font-mono">
            <span>Esc close</span>
            <span>↑↓ nav</span>
            <span>Enter run</span>
            <span className="ml-auto text-cyan-500/50">v4</span>
          </div>
        </div>
      </div>
    </>
  );
}