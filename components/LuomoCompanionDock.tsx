"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import StardustBurst from "@/components/effects/StardustBurst";
import Live2DShell from "@/components/live2d/Live2DShell";
import ATRIChatPanel from "@/components/atri/ATRIChatPanel";
import { atriForms, type AtriActiveForms } from "@/lib/live2d/atriForms";
import type { CharacterId } from "@/lib/live2d/characterRegistry";
import type { CompanionId } from "@/lib/companions/companionRegistry";
import { getCompanionProfile } from "@/lib/companions/companionRegistry";
import { getRandomReaction } from "@/lib/companions/companionReaction";
import { CharacterSwitcher } from "@/components/layout/CharacterSwitcher";
import { SECTIONS } from "@/content/sections";

type LuomoMood = "idle" | "welcome" | "curious" | "focused" | "excited" | "secret" | "system" | "greeting" | "sleepy" | "warning";

const sectionIds = SECTIONS.map((s) => s.id);

function getCurrentSection(): string {
  if (typeof window === "undefined") return "hero";
  let closest = "hero"; let minDist = Infinity;
  for (const id of sectionIds) { const el = document.getElementById(id); if (!el) continue; const rect = el.getBoundingClientRect(); const dist = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2); if (dist < minDist) { minDist = dist; closest = id; } }
  return closest;
}

interface Props { onCollapsedChange?: (collapsed: boolean) => void; initialCollapsed?: boolean; }

export default function LuomoCompanionDock({ onCollapsedChange, initialCollapsed = true }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    let nextExpanded = !mobile;
    try {
      const storedFolded = localStorage.getItem("luomochan_folded");
      if (storedFolded === "false") nextExpanded = true;
      if (storedFolded === "true") nextExpanded = false;
    } catch {}
    setExpanded(nextExpanded);
    setHydrated(true);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // First-time desktop migration: force expand on v7.0.1 upgrade
  useEffect(() => {
    if (!hydrated) return;
    const migratedKey = "luomo:live2d-dock-migrated-v701";
    try {
      if (!isMobile && !localStorage.getItem(migratedKey)) {
        localStorage.setItem("luomochan_folded", "false");
        localStorage.setItem(migratedKey, "true");
        setExpanded(true);
      }
    } catch {}
  }, [hydrated, isMobile]);

  const [mood, setMood] = useState<LuomoMood>("greeting");
  const [activeForms, setActiveForms] = useState<AtriActiveForms>({});
  const companionForm = Object.values(activeForms)[0] || "default";
  const [allowSecret, setAllowSecretForms] = useState(false);
  const [allowDebug, setAllowDebugForms] = useState(false);
  const [stardustActive, setStardustActive] = useState(false);
  const [section, setSection] = useState("hero");
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [companionExpression, setCompanionExpression] = useState<string | undefined>(undefined);
  const [companionMotion, setCompanionMotion] = useState<string | undefined>(undefined);
  const [character, setCharacter] = useState<CompanionId>("atri");
  const companionProfile = getCompanionProfile(character);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [atriLoading, setAtriLoading] = useState(false);
  const [dialoguePages, setDialoguePages] = useState<string[]>([]);
  const [dialoguePageIndex, setDialoguePageIndex] = useState(0);
  const [dialogueSource, setDialogueSource] = useState("idle");
  const [manualUntil, setManualUntil] = useState(0);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { if (!hydrated) return; try { localStorage.setItem("luomochan_folded", String(!expanded)); } catch {} }, [expanded, hydrated]);

  // Diagnostics
  useEffect(() => {
    console.info("[ATRI\u00b7HomepageDock] render", { collapsed: !expanded, isMobile, mood, companionForm });
  }, [expanded, mood, companionForm]);

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.mood) setMood(d.mood);
      if (d?.mood === "secret") setStardustActive(true);
      if (d?.form !== undefined) setActiveForms(d.form);
      if (d?.allowSecret !== undefined) setAllowSecretForms(d.allowSecret);
      if (d?.allowDebug !== undefined) setAllowDebugForms(d.allowDebug);
    };
    window.addEventListener("luomo:mood", handler);
  
    return () => window.removeEventListener("luomo:mood", handler);
  }, []);

  useEffect(() => { if (mood !== "greeting") return; const t = setTimeout(() => setMood("idle"), 8000); return () => clearTimeout(t); }, [mood]);
  useEffect(() => { if (mood !== "secret") return; const t = setTimeout(() => setMood("idle"), 8000); return () => clearTimeout(t); }, [mood]);

  const splitDialoguePages = useCallback((text: string, maxLen = 72) => {
    const normalized = text.trim();
    if (!normalized) return [];
    const sentences = normalized.split(/(?<=[\u3002\uff01\uff1f!?\u2026])/);
    const pages: string[] = [];
    let current = "";
    for (const sentence of sentences) {
      if ((current + sentence).length > maxLen && current) {
        pages.push(current);
        current = sentence;
      } else {
        current += sentence;
      }
    }
    if (current) pages.push(current);
    return pages.length ? pages : [normalized];
  }, []);

  

  const playRandomCompanionReaction = function(trigger: "switch" | "next" | "hover" | "click" | "thinking" | "warning" | "idle") {
    const reaction = getRandomReaction(character, trigger, mood);
    if (reaction.expression) setCompanionExpression(reaction.expression);
    if (reaction.motion) setCompanionMotion(typeof reaction.motion === "string" ? reaction.motion : (reaction.motion?.group || ""));
  };
const handleNextLine = useCallback(() => {
    if (atriLoading || dialogueSource === "thinking") return;

    // Has multiple pages: flip to next page
    if (dialoguePages.length > 1) {
      const nextIndex = (dialoguePageIndex + 1) % dialoguePages.length;
      setDialoguePageIndex(nextIndex);
      setDisplayedText(dialoguePages[nextIndex]);
      console.debug("[ATRI] next page", { page: nextIndex + 1, total: dialoguePages.length });
      setManualUntil(Date.now() + 16000);
      return;
    }

    // Brain/fallback single page: just extend display time, no pool switch
    if (dialogueSource === "brain" || dialogueSource === "fallback") {
      setManualUntil(Date.now() + 12000);
      return;
    }

    // Non-ATRI companion: cycle through defaultLines
    const pool = getCompanionProfile(character).defaultLines || [];
    if (!pool.length) {
      setManualUntil(Date.now() + 8000);
      playRandomCompanionReaction("next");
      return;
    }
    const currentIdx = pool.indexOf(displayedText);
    const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % pool.length : 0;
    const text = pool[nextIdx];
    setDisplayedText(text);
    setDialoguePages([text]);
    setDialoguePageIndex(0);
    setManualUntil(Date.now() + 10000);
    playRandomCompanionReaction("next");
    return;

    // Section/idle: cycle through current mood lines
    const nextLine = () => {
      const profile = getCompanionProfile(character);
      const pool = profile.defaultLines || [];
      if (!pool.length) {
        setManualUntil(Date.now() + 8000);
        return;
      }
      const current = displayedText;
      const idx = pool.indexOf(current);
      const nextIdx = idx >= 0 ? (idx + 1) % pool.length : 0;
      const text = pool[nextIdx];
      setDisplayedText(text);
      setDialoguePages([text]);
      setDialoguePageIndex(0);
      setManualUntil(Date.now() + 10000);
    };
    nextLine();
  }, [atriLoading, dialogueSource, dialoguePages, dialoguePageIndex, displayedText, mood, character]);

  const canAutoUpdateDialogue = useCallback(() => {
    return !atriLoading && Date.now() > manualUntil;
  }, [atriLoading, manualUntil]);

  const applyAtriThinking = useCallback((payload: any = {}) => {
    const text = payload.text || "ATRI \u6b63\u5728\u601d\u8003\u4e2d\u2026\u2026\u8bb0\u5fc6\u56de\u8def\u6b63\u5728\u5fae\u5fae\u53d1\u5149\u3002";
    setAtriLoading(true);
    setDialogueSource("thinking");
    setDisplayedText(text);
    setDialoguePages([text]);
    setDialoguePageIndex(0);
    setMood(payload.mood || "focused");
    setManualUntil(Date.now() + 20000);
  }, []);

  const applyAtriBrainResponse = useCallback((response: any) => {
    if (!response) return;
    setAtriLoading(false);
    const source = response.source === "ai" || response.source === "scripted" ? "brain" : response.source === "fallback" ? "fallback" : "brain";
    setDialogueSource(source);
    const text = response.text || "ATRI \u5df2\u6536\u5230\u56de\u5e94\u3002";
    const pages = splitDialoguePages(text);
    setDialoguePages(pages);
    setDialoguePageIndex(0);
    setDisplayedText(pages[0] || text);
    setIsTyping(false);
    if (response.mood) setMood(response.mood);
    if (response.form) { try { setActiveForms((prev) => ({ ...prev, outfit: response.form })); } catch {}
    }
    if (response.expression) setCompanionExpression(response.expression);
    if (response.motion) setCompanionMotion(response.motion);
    setManualUntil(Date.now() + 16000);
  }, [splitDialoguePages]);

  // Listen for brain responses from CommandPalette
  useEffect(() => {
    const handler = (e: Event) => { applyAtriBrainResponse((e as CustomEvent).detail); };
    window.addEventListener("atri:brain-response", handler);
    return () => window.removeEventListener("atri:brain-response", handler);
  }, [applyAtriBrainResponse]);

  // Listen for thinking state from CommandPalette
  useEffect(() => {
    const handler = (e: Event) => { applyAtriThinking((e as CustomEvent).detail); };
    window.addEventListener("atri:thinking", handler);
    return () => window.removeEventListener("atri:thinking", handler);
  }, [applyAtriThinking]);

  // Listen for ask requests from CommandPalette
  useEffect(() => {
    const handler = async (e: Event) => {
      const { message } = (e as CustomEvent).detail;
      if (!message) return;
      const res = await fetch("/api/atri/brain", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context: { currentSection: section, currentMood: mood, servicesCount: 5 } }),
      });
      const data = await res.json();
      if (data) applyAtriBrainResponse(data);
    };
    window.addEventListener("atri:ask", handler);
    return () => window.removeEventListener("atri:ask", handler);
  }, [applyAtriBrainResponse, section, mood]);

  useEffect(() => {
    const handler = () => { const sec = getCurrentSection(); setSection(sec); if (mood === "idle" || mood === "greeting") setMood("idle"); };
    handler(); window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { if (!expanded) return; setLineIndex(0); }, [section, mood, expanded]);

  useEffect(() => {
    if (!expanded) { setDisplayedText(""); return; }
    if (!canAutoUpdateDialogue()) return;
    if (dialogueSource === "thinking" && atriLoading) return;
    if (Date.now() < manualUntil) return;
    const profile = getCompanionProfile(character);
    const sectionLine = profile.sectionLines?.[section] || SECTIONS.find(s => s.id === section)?.companionLine;
    const allLines = sectionLine ? [sectionLine, ...profile.defaultLines] : profile.defaultLines;
    const currentLine = allLines[lineIndex % allLines.length] || "Cloud systems are glowing.";
    let ci = 0; setIsTyping(true); setDisplayedText("");
    typeTimerRef.current = setInterval(() => { ci++; setDisplayedText(currentLine.slice(0, ci)); if (ci >= currentLine.length) { if (typeTimerRef.current) clearInterval(typeTimerRef.current); setIsTyping(false); cycleTimerRef.current = setTimeout(() => setLineIndex(prev => (prev + 1) % allLines.length), 5000); } }, 50);
    return () => { if (typeTimerRef.current) clearInterval(typeTimerRef.current); if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current); };
  }, [section, mood, lineIndex, expanded]);

  const handleAvatarClick = useCallback(() => {
    const now = Date.now(); if (clickTimerRef.current) clearTimeout(clickTimerRef.current); clickCountRef.current += 1;
    if (clickCountRef.current >= 7) { clickCountRef.current = 0; setMood("secret"); setStardustActive(true); return; }
    clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 4000);
    setExpanded(prev => { const next = !prev; onCollapsedChange?.(!next); return next; });
  }, [onCollapsedChange]);

  const close = useCallback(() => { setExpanded(false); onCollapsedChange?.(true); }, [onCollapsedChange]);

  const handleCompanionChange = useCallback((nextId: CompanionId) => {
    console.info("[Companion] change request", {
      from: character,
      to: nextId,
    });

    if (nextId === character) return;

    const nextProfile = getCompanionProfile(nextId);
    const text =
      nextProfile.defaultLines?.[0] ||
      `${nextProfile.displayName} 已切换完成。`;

    setCharacter(nextId);
    setAtriLoading(false);
    setIsTyping(false);
    setCompanionExpression(undefined);
    setCompanionMotion(undefined);
    setActiveForms({});
    setDialogueSource("command");
    setDisplayedText(text);
    setDialoguePages([text]);
    setDialoguePageIndex(0);
    setMood("welcome");
    setManualUntil(Date.now() + 12000);

    console.info("[Companion] changed", {
      nextId,
      modelPath: nextProfile.modelPath,
    });
    playRandomCompanionReaction("switch");
  }, [character]);

  return (
    <>
      <StardustBurst active={stardustActive} onDone={() => setStardustActive(false)} />

      {/* Collapsed mode: small avatar button */}
      {hydrated && isMobile === false && !expanded && (
        <div className="fixed bottom-5 right-5 z-[90] pointer-events-auto">
          <button onClick={handleAvatarClick} aria-label="Open ATRI" className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <span className="text-lg font-bold text-white">A</span>
          </button>
        </div>
      )}

      {/* Expanded mode: Live2D + dialog bubble */}
      {hydrated && isMobile === false && expanded && (
        <div className="fixed bottom-5 right-5 z-[90] pointer-events-none">
          <div className="relative h-[560px] w-[600px] overflow-visible pointer-events-auto">
            {/* Hologram base glow - subtle floor effect */}
            <div className="absolute bottom-[25px] right-[110px] z-0 h-16 w-48 bg-gradient-to-r from-transparent via-cyan-300/5 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-[38px] right-[160px] z-0 h-5 w-32 rounded-full border border-cyan-200/5 pointer-events-none" />

            {/* ATRI Live2D - bottom right area, transparent */}
            <div className="absolute bottom-0 right-0 z-10 h-[460px] w-[320px] overflow-visible bg-transparent">
              <Live2DShell 
                modelPath={companionProfile.modelPath}
                layout={companionProfile.layout}
                mood={mood}
                activeForms={activeForms}
                expression={companionExpression}
                motion={companionMotion}
                characterId={character}
                allowSecret={allowSecret}
                allowDebug={allowDebug}
                variant="dock"
              />
            </div>

            {/* Dialogue bubble - above and left of Live2D */}
            <div className="absolute bottom-[285px] right-[190px] z-30 w-[380px] pointer-events-auto">
              <div
    className={
      "relative rounded-[30px] border border-cyan-200/20 bg-slate-950/82 px-5 py-4 shadow-[0_0_36px_rgba(34,211,238,0.16),0_18px_50px_rgba(0,0,0,0.36)] backdrop-blur-xl " +
      (mood === "secret" ? " border-yellow-400/40 shadow-[0_0_44px_rgba(250,204,21,0.15)]" : "")
    }
  >
    {/* Bubble tail pointing to ATRI */}
    <div className="absolute right-[-12px] bottom-[72px] h-6 w-6 rotate-45 border-r border-t border-cyan-200/20 bg-slate-950/82 shadow-[8px_-8px_18px_rgba(34,211,238,0.08)] backdrop-blur-xl pointer-events-none" />
    {/* Top highlight line */}
    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent" />

        <div className="relative z-10">
      {/* Title row */}
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <span className="text-xs font-semibold tracking-[0.22em] text-cyan-200">
              {getCompanionProfile(character).displayName}
            </span>
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-300/55">
            {getCompanionProfile(character).tagline}
          </div>
        </div>
        <button onClick={close} type="button" className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-400 hover:bg-white/10 hover:text-slate-200" aria-label="Close ATRI">
          &times;
        </button>
      </div>

      {/* Companion Switcher - between title and body */}
      <CharacterSwitcher value={character} onChange={handleCompanionChange} disabled={atriLoading} />

      {/* Body text */}
      <p className="text-[14px] leading-7 text-slate-100/90">
        {displayedText}{isTyping && <span className="animate-pulse">|</span>}
      </p>

      {/* Next button */}
      <button type="button" onClick={handleNextLine} disabled={atriLoading || dialogueSource === "thinking"}
        className="mt-1 text-xs text-cyan-200/60 hover:text-cyan-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
        {(atriLoading || dialogueSource === "thinking") ? "Thinking..." : dialoguePages.length > 1 ? (dialoguePageIndex + 1) + "/" + dialoguePages.length + " Next" : "\u25bc Next"}
      </button>

      {/* ATRI-only chat input or observation mode hint */}
      {character === "atri" && getCompanionProfile(character).capability.chat ? (
        <div className="mt-3">
          <ATRIChatPanel
            context={{
              companionId: character,
              currentSection: section,
              currentMood: mood,
              currentForm: companionForm,
              servicesCount: 5,
              allowSecret,
              allowDebug,
            }}
            onThinking={applyAtriThinking}
            onResponse={applyAtriBrainResponse}
            onLoadingChange={setAtriLoading}
          />
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-200/70">
          当前 Companion 为观赏模式，仅 ATRI 支持云端对话。
        </div>
      )}
    </div>
  </div>
</div>
          </div>
        </div>
      )}

      {/* Mobile Companion */}
      {hydrated && isMobile === true && (
          <>
        {/* Mobile collapse/expand button */}
        <div className="fixed bottom-4 right-4 z-[90] md:hidden">
          <button type="button" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle companion"
            className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-200/25 bg-slate-950/80 text-xs font-semibold text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.22)] backdrop-blur-xl">
            {companionProfile.shortName?.slice(0, 2) || "AT"}
          </button>
        </div>

        {/* Mobile Live2D model */}
        <div className={"fixed bottom-8 right-1 z-[80] h-[260px] w-[180px] overflow-visible pointer-events-none transition " + (mobileOpen ? "opacity-100" : "opacity-90")}>
          <Live2DShell
            modelPath={companionProfile.modelPath}
            layout={companionProfile.mobileLayout || companionProfile.layout}
            mood={mood}
            expression={companionExpression}
            motion={companionMotion}
            characterId={character}
            activeForms={character === "atri" ? activeForms : {}}
            allowSecret={allowSecret}
            allowDebug={allowDebug}
            variant="mobile"
          />
        </div>

        {/* Mobile bubble panel */}
        {mobileOpen ? (
          <div className="fixed inset-x-3 bottom-20 z-[95] md:hidden">
            <div className="max-h-[55vh] overflow-y-auto rounded-[28px] border border-cyan-200/20 bg-slate-950/85 p-4 shadow-[0_0_36px_rgba(34,211,238,0.18)] backdrop-blur-xl">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                    <span className="text-xs font-semibold tracking-[0.22em] text-cyan-200">{companionProfile.displayName}</span>
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-slate-400">{companionProfile.tagline}</div>
                </div>
                <button type="button" onClick={() => setMobileOpen(false)} className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-300">&times;</button>
              </div>

              <CharacterSwitcher value={character} onChange={handleCompanionChange} disabled={atriLoading} />

              <p className="mt-3 text-sm leading-7 text-slate-100/90">{displayedText}</p>

              <button type="button" onClick={handleNextLine} disabled={atriLoading || dialogueSource === "thinking"}
                className="mt-2 text-xs font-medium text-cyan-100/75 disabled:opacity-50">
                &#9660; {atriLoading ? "Thinking..." : "Next"}
              </button>

              <div className="mt-3">
                {character === "atri" && companionProfile.capability.chat ? (
                  <ATRIChatPanel
                    context={{ companionId: character, currentSection: section, currentMood: mood, servicesCount: 5 }}
                    onThinking={applyAtriThinking}
                    onResponse={applyAtriBrainResponse}
                    onLoadingChange={setAtriLoading}
                  />
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-300/70">
                    当前 Companion 为观赏模式，仅 ATRI 支持云端对话。
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
          </>
      )}
    </>
  );
}
