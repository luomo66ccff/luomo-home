"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import StardustBurst from "@/components/effects/StardustBurst";
import Live2DShell from "@/components/live2d/Live2DShell";
import ATRIChatPanel from "@/components/atri/ATRIChatPanel";
import { atriForms, type AtriActiveForms, type AtriFormId } from "@/lib/live2d/atriForms";
import type { CompanionId } from "@/lib/companions/companionRegistry";
import { getCompanionProfile } from "@/lib/companions/companionRegistry";
import { getRandomReaction } from "@/lib/companions/companionReaction";
import { CharacterSwitcher } from "@/components/layout/CharacterSwitcher";
import { SECTIONS } from "@/content/sections";
import { getCompanionTouchReaction, pickTouchLine, type CompanionTouchArea } from "@/lib/companions/companionTouch";
import type { AtriBrainResponse } from "@/lib/atri-brain/types";
import { useAtriBrain } from "@/hooks/useAtriBrain";

type LuomoMood = "idle" | "welcome" | "curious" | "focused" | "excited" | "secret" | "system" | "greeting" | "sleepy" | "warning";
type ThinkingPayload = { text?: string; mood?: LuomoMood; source?: string };
type CompanionBrainResponse = Omit<Partial<AtriBrainResponse>, "source"> & { source?: string };

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
  const [expanded, setExpanded] = useState(!initialCollapsed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    let nextExpanded = !initialCollapsed;
    if (mobile) nextExpanded = false;
    setExpanded(nextExpanded);
    setHydrated(true);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [initialCollapsed]);

  // Preserve the frozen v7.0.1 migration marker without forcing the dock open.
  useEffect(() => {
    if (!hydrated) return;
    const migratedKey = "luomo:live2d-dock-migrated-v701";
    try {
      if (!isMobile && !localStorage.getItem(migratedKey)) {
        localStorage.setItem(migratedKey, "true");
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
  const [modelReady, setModelReady] = useState(false);
  const panelOpen = isMobile ? mobileOpen : expanded;
  const [atriLoading, setAtriLoading] = useState(false);
  const [dialoguePages, setDialoguePages] = useState<string[]>([]);
  const [dialoguePageIndex, setDialoguePageIndex] = useState(0);
  const [dialogueSource, setDialogueSource] = useState("idle");
  const [manualUntil, setManualUntil] = useState(0);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const atriBrain = useAtriBrain();
  const { askAtri } = atriBrain;

  const updateManualUntil = useCallback((until: number) => {
    if (manualTimerRef.current) clearTimeout(manualTimerRef.current);
    setManualUntil(until);
    const delay = Math.max(0, until - Date.now());
    manualTimerRef.current = setTimeout(() => {
      manualTimerRef.current = null;
      setManualUntil(0);
    }, delay);
  }, []);

  useEffect(() => () => {
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    if (manualTimerRef.current) clearTimeout(manualTimerRef.current);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.mood) setMood(d.mood);
      if (d?.mood === "secret") setStardustActive(true);
      if (d?.form !== undefined) {
        if (d.form === "default") {
          setActiveForms({});
        } else if (typeof d.form === "string" && d.form in atriForms) {
          const formId = d.form as AtriFormId;
          const slot = atriForms[formId].slot;
          setActiveForms((previous) => ({ ...previous, [slot]: formId }));
        }
      }
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

  

  const playRandomCompanionReaction = useCallback((trigger: "switch" | "next" | "hover" | "click" | "thinking" | "warning" | "idle", companionId: CompanionId = character, reactionMood = mood) => {
    const reaction = getRandomReaction(companionId, trigger, reactionMood);
    if (reaction.expression) setCompanionExpression(reaction.expression);
    if (reaction.motion) setCompanionMotion(typeof reaction.motion === "string" ? reaction.motion : (reaction.motion?.group || ""));
  }, [character, mood]);
const handleNextLine = useCallback(() => {
    if (atriLoading || dialogueSource === "thinking") return;

    // Has multiple pages: flip to next page
    if (dialoguePages.length > 1) {
      const nextIndex = (dialoguePageIndex + 1) % dialoguePages.length;
      setDialoguePageIndex(nextIndex);
      setDisplayedText(dialoguePages[nextIndex]);
      console.debug("[ATRI] next page", { page: nextIndex + 1, total: dialoguePages.length });
      updateManualUntil(Date.now() + 16000);
      return;
    }

    // Brain/fallback single page: just extend display time, no pool switch
    if (dialogueSource === "brain" || dialogueSource === "fallback") {
      updateManualUntil(Date.now() + 12000);
      return;
    }

    // Non-ATRI companion: cycle through defaultLines
    const pool = getCompanionProfile(character).defaultLines || [];
    if (!pool.length) {
      updateManualUntil(Date.now() + 8000);
      playRandomCompanionReaction("next");
      return;
    }
    const currentIdx = pool.indexOf(displayedText);
    const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % pool.length : 0;
    const text = pool[nextIdx];
    setDisplayedText(text);
    setDialoguePages([text]);
    setDialoguePageIndex(0);
    updateManualUntil(Date.now() + 10000);
    playRandomCompanionReaction("next");
    return;

  }, [atriLoading, dialogueSource, dialoguePages, dialoguePageIndex, displayedText, character, playRandomCompanionReaction, updateManualUntil]);

  const canAutoUpdateDialogue = useCallback(() => {
    return !atriLoading && Date.now() > manualUntil;
  }, [atriLoading, manualUntil]);

  const applyAtriThinking = useCallback((payload: ThinkingPayload = {}) => {
    const text = payload.text || "ATRI \u6b63\u5728\u601d\u8003\u4e2d\u2026\u2026\u8bb0\u5fc6\u56de\u8def\u6b63\u5728\u5fae\u5fae\u53d1\u5149\u3002";
    setAtriLoading(true);
    setDialogueSource("thinking");
    setDisplayedText(text);
    setDialoguePages([text]);
    setDialoguePageIndex(0);
    setMood(payload.mood || "focused");
    updateManualUntil(Date.now() + 20000);
  }, [updateManualUntil]);

  const applyAtriBrainResponse = useCallback((response: CompanionBrainResponse) => {
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
    if (response.form === "default") {
      setActiveForms({});
    } else if (response.form && response.form in atriForms) {
      const formId = response.form as AtriFormId;
      const slot = atriForms[formId].slot;
      setActiveForms((previous) => ({ ...previous, [slot]: formId }));
    }
    if (response.expression) setCompanionExpression(response.expression);
    if (response.motion) setCompanionMotion(response.motion);
    updateManualUntil(Date.now() + 16000);
  }, [splitDialoguePages, updateManualUntil]);

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

  const openAtri = useCallback(() => {
    setCharacter("atri");
    if (isMobile) setMobileOpen(true);
    else setExpanded(true);
  }, [isMobile]);

  const focusAtriInput = useCallback(() => {
    openAtri();
    const focus = () => document.querySelector<HTMLInputElement>("[data-model-chat-input]")?.focus();
    requestAnimationFrame(() => { focus(); requestAnimationFrame(focus); });
  }, [openAtri]);

  // CommandPalette and the visible chat panel share this hook instance. This
  // keeps the global lock and request lifecycle in one place.
  useEffect(() => {
    const handler = (e: Event) => {
      const rawMessage = (e as CustomEvent).detail?.message;
      const message = typeof rawMessage === "string" ? rawMessage.trim() : "";
      if (!message) {
        focusAtriInput();
        return;
      }
      openAtri();
      applyAtriThinking({ text: "ATRI 正在思考中……记忆回路正在微微发光。", mood: "focused", source: "thinking" });
      void askAtri(message, {
        companionId: "atri",
        currentSection: section,
        currentMood: mood,
        currentForm: companionForm,
        servicesCount: 5,
      }).then(applyAtriBrainResponse);
    };
    window.addEventListener("atri:ask", handler);
    return () => window.removeEventListener("atri:ask", handler);
  }, [applyAtriBrainResponse, applyAtriThinking, askAtri, companionForm, focusAtriInput, mood, openAtri, section]);

  useEffect(() => {
    const handler = () => {
      setSection(getCurrentSection());
      setMood((previous) => (previous === "idle" || previous === "greeting" ? "idle" : previous));
    };
    handler(); window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { if (panelOpen) setLineIndex(0); }, [section, mood, panelOpen]);

  useEffect(() => {
    if (!panelOpen) { setDisplayedText(""); return; }
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
  }, [section, mood, lineIndex, panelOpen, manualUntil, atriLoading, dialogueSource, character, canAutoUpdateDialogue]);

  const handleAvatarClick = useCallback(() => {
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current); clickCountRef.current += 1;
    if (clickCountRef.current >= 7) { clickCountRef.current = 0; setMood("secret"); setStardustActive(true); return; }
    clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 4000);
    setExpanded(!expanded); onCollapsedChange?.(expanded);
  }, [onCollapsedChange, expanded]);

  const close = useCallback(() => { setExpanded(false); onCollapsedChange?.(true); }, [onCollapsedChange]);

  const handleCompanionChange = useCallback((nextId: CompanionId) => {
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
    updateManualUntil(Date.now() + 12000);

    playRandomCompanionReaction("switch", nextId, "welcome");
  }, [character, playRandomCompanionReaction, updateManualUntil]);

  const handleCompanionTouch = useCallback((payload: { area: CompanionTouchArea }) => {
    const reaction = getCompanionTouchReaction(character, payload.area);
    const text = pickTouchLine(reaction.lines);
    if (text) {
      setDisplayedText(text);
      setDialoguePages([text]);
      setDialoguePageIndex(0);
      setDialogueSource("touch");
    }
    if (reaction.mood) setMood(reaction.mood as LuomoMood);
    if (reaction.expression) setCompanionExpression(reaction.expression);
    if (reaction.motion) setCompanionMotion(reaction.motion);
    updateManualUntil(Date.now() + 9000);
  }, [character, updateManualUntil]);

  return <>
    <StardustBurst active={stardustActive} onDone={() => setStardustActive(false)} />
    {hydrated && <div className="luomo-companion-dock">
      {!panelOpen ? <button type="button" className="companion-launcher" aria-label="打开云端伙伴" aria-expanded={false} onClick={() => isMobile ? setMobileOpen(true) : handleAvatarClick()}><span>✳</span></button> : <>
        <div className="companion-model" data-model-ready={modelReady}>
          <Live2DShell modelPath={companionProfile.modelPath} layout={isMobile ? companionProfile.mobileLayout || companionProfile.layout : companionProfile.layout}
            mood={mood} activeForms={activeForms} expression={companionExpression} motion={companionMotion} characterId={character}
            allowSecret={allowSecret} allowDebug={allowDebug} variant={isMobile ? "mobile" : "dock"}
            onReady={() => setModelReady(true)} onError={() => setModelReady(false)} onTouch={handleCompanionTouch} />
        </div>
        <section className="companion-panel" aria-label="云端伙伴">
          <div className="companion-heading"><div><strong><span>✳</span> {companionProfile.displayName}</strong><small>在这片云里，陪你聊一会儿。</small></div>
            <button type="button" className="companion-close" aria-label="收起云端伙伴" onClick={() => { setModelReady(false); if (isMobile) setMobileOpen(false); else close(); }}>×</button></div>
          <CharacterSwitcher value={character} onChange={handleCompanionChange} disabled={atriBrain.loading} />
          <p className="companion-dialogue">{displayedText || "你好呀，很高兴在这里遇见你。"}{isTyping && <span aria-hidden="true">▏</span>}</p>
          <button type="button" className="companion-next" onClick={handleNextLine} disabled={atriBrain.loading || dialogueSource === "thinking"}>
            {atriBrain.loading ? "正在思考…" : dialoguePages.length > 1 ? (dialoguePageIndex + 1) + "/" + dialoguePages.length + " 下一句 ↓" : "换一句话 ↓"}
          </button>
          {character === "atri" && companionProfile.capability.chat ? <ATRIChatPanel
            context={{ companionId: character, currentSection: section, currentMood: mood, currentForm: companionForm, servicesCount: 5 }}
            onThinking={applyAtriThinking} onResponse={applyAtriBrainResponse} onLoadingChange={setAtriLoading} brain={atriBrain} />
            : <p className="companion-note">这位伙伴陪你欣赏风景，想聊天可以切换到 ATRI。</p>}
        </section>
      </>}
    </div>}
  </>;
}
