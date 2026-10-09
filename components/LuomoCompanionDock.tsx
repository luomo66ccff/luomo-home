"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Live2DShell from "@/components/live2d/Live2DShell";
import { Spark } from "@/components/home/art/Icons";
import { atriForms, type AtriActiveForms, type AtriFormId } from "@/lib/live2d/atriForms";
import { companionOrder, getCompanionProfile, type CompanionId } from "@/lib/companions/companionRegistry";
import { getRandomReaction } from "@/lib/companions/companionReaction";
import { getCompanionTouchReaction, pickTouchLine, type CompanionTouchArea } from "@/lib/companions/companionTouch";
import { isModelChatLocked } from "@/lib/modelChatLock";
import type { AtriBrainResponse } from "@/lib/atri-brain/types";
import { useAtriBrain } from "@/hooks/useAtriBrain";
import { SECTIONS } from "@/content/sections";
import { unlock } from "@/lib/home/achievements";
import { addAffection, HEART_COUNT, heartsFor, parseAffection, type AffectionMap } from "@/lib/home/affection";
import { KEYS, readJson, toast, writeJson } from "@/lib/home/store";

type LuomoMood = "idle" | "welcome" | "curious" | "focused" | "excited" | "secret" | "system" | "greeting" | "sleepy" | "warning";
type ThinkingPayload = { text?: string; mood?: LuomoMood; source?: string };
type CompanionBrainResponse = Omit<Partial<AtriBrainResponse>, "source"> & { source?: string };
type Bubble = { id: number; from: "them" | "me" | "sys"; text: string };

const sectionIds = SECTIONS.map(section => section.id);
const AVATAR: Record<CompanionId, { mark: string; tint: string }> = {
  atri: { mark: "A", tint: "linear-gradient(135deg, #b8e1ff, #6d8cff)" },
  murasame: { mark: "丛", tint: "linear-gradient(135deg, #c9f2d8, #63b888)" },
  allium: { mark: "Al", tint: "linear-gradient(135deg, #ffd6e8, #c48cff)" },
};
const QUICK = ["你好呀", "今天服务器怎么样？", "推荐一个站点", "你是高性能的吗？"];
const LOG_LIMIT = 40;

function getCurrentSection(): string {
  if (typeof window === "undefined") return "hero";
  let closest = "hero";
  let minDist = Infinity;
  for (const id of sectionIds) {
    const el = document.getElementById(id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const dist = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
    if (dist < minDist) { minDist = dist; closest = id; }
  }
  return closest;
}

function splitPages(text: string, maxLen = 72) {
  const normalized = text.trim();
  if (!normalized) return [];
  const pages: string[] = [];
  let current = "";
  for (const sentence of normalized.split(/(?<=[\u3002\uff01\uff1f!?\u2026])/)) {
    if ((current + sentence).length > maxLen && current) { pages.push(current); current = sentence; }
    else current += sentence;
  }
  if (current) pages.push(current);
  return pages.length ? pages : [normalized];
}

interface Props { onCollapsedChange?: (collapsed: boolean) => void; initialCollapsed?: boolean }

export default function LuomoCompanionDock({ onCollapsedChange, initialCollapsed = true }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState(!initialCollapsed);
  const [hydrated, setHydrated] = useState(false);
  const userToggled = useRef(false);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!userToggled.current) setExpanded(mobile ? false : !initialCollapsed);
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
  const [burst, setBurst] = useState(0);
  const [section, setSection] = useState("hero");
  const [character, setCharacter] = useState<CompanionId>("atri");
  const profile = getCompanionProfile(character);
  const [expression, setExpression] = useState<string | undefined>(undefined);
  const [motion, setMotion] = useState<string | undefined>(undefined);
  const [commandId, setCommandId] = useState(0);
  const [modelReady, setModelReady] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [unread, setUnread] = useState(1);
  const [log, setLog] = useState<Bubble[]>([]);
  const [input, setInput] = useState("");
  const [chatLocked, setChatLocked] = useState(false);
  const nextId = useRef(1);
  const logRef = useRef<HTMLDivElement>(null);
  const lastSectionLine = useRef<string>("");
  const greeted = useRef(false);
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const atriBrain = useAtriBrain();
  const { askAtri } = atriBrain;
  const open = expanded;
  const chatDisabled = atriBrain.loading || chatLocked;

  const push = useCallback((from: Bubble["from"], text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setLog(current => [...current, { id: nextId.current++, from, text: clean }].slice(-LOG_LIMIT));
  }, []);

  const [affection, setAffection] = useState<AffectionMap>({});
  useEffect(() => {
    const sync = () => setAffection(readJson(KEYS.affection, parseAffection));
    sync();
    window.addEventListener("luomo:progress-reset", sync);
    return () => window.removeEventListener("luomo:progress-reset", sync);
  }, []);

  const bumpAffection = useCallback((id: CompanionId, amount: number) => {
    const result = addAffection(readJson(KEYS.affection, parseAffection), id, amount);
    if (!result.changed) return;
    writeJson(KEYS.affection, result.next);
    setAffection(result.next);
    if (!result.rose) return;
    const name = getCompanionProfile(id).displayName;
    const full = result.hearts >= HEART_COUNT;
    toast({ title: `（${name} 的好感度上升了）`, body: full ? "……心跳的声音，好像被对方听见了。" : undefined, tone: full ? "gold" : "info" });
    if (full) unlock("affection");
  }, []);

  useEffect(() => () => { if (clickTimer.current) clearTimeout(clickTimer.current); }, []);

  useEffect(() => {
    setChatLocked(isModelChatLocked());
    const handler = (event: Event) => setChatLocked(Boolean((event as CustomEvent).detail?.locked));
    window.addEventListener("model-chat:lock-change", handler);
    return () => window.removeEventListener("model-chat:lock-change", handler);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const d = (event as CustomEvent).detail;
      if (d?.mood) setMood(d.mood);
      if (d?.mood === "secret") setBurst(value => value + 1);
      if (d?.form !== undefined) {
        if (d.form === "default") setActiveForms({});
        else if (typeof d.form === "string" && d.form in atriForms) {
          const formId = d.form as AtriFormId;
          const slot = atriForms[formId].slot;
          setActiveForms(previous => ({ ...previous, [slot]: formId }));
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

  const playReaction = useCallback((trigger: "switch" | "next" | "hover" | "click" | "thinking" | "warning" | "idle", companionId: CompanionId = character, reactionMood: LuomoMood = mood) => {
    const reaction = getRandomReaction(companionId, trigger, reactionMood);
    setExpression(reaction.expression);
    setMotion(typeof reaction.motion === "string" ? reaction.motion : reaction.motion?.group);
    if (reaction.expression || reaction.motion) setCommandId(value => value + 1);
  }, [character, mood]);

  const applyThinking = useCallback((payload: ThinkingPayload = {}) => {
    setThinking(true);
    setMood(payload.mood || "focused");
  }, []);

  const applyResponse = useCallback((response: CompanionBrainResponse) => {
    if (!response) return;
    setThinking(false);
    const text = response.text || "ATRI 已收到回应。";
    for (const page of splitPages(text)) push(response.ok === false && response.source === "fallback" ? "sys" : "them", page);
    if (response.mood) setMood(response.mood);
    if (response.form === "default") setActiveForms({});
    else if (response.form && response.form in atriForms) {
      const formId = response.form as AtriFormId;
      const slot = atriForms[formId].slot;
      setActiveForms(previous => ({ ...previous, [slot]: formId }));
    }
    setExpression(response.expression);
    setMotion(response.motion);
    if (response.expression || response.motion) setCommandId(value => value + 1);
  }, [push]);

  useEffect(() => {
    const handler = (event: Event) => applyResponse((event as CustomEvent).detail);
    window.addEventListener("atri:brain-response", handler);
    return () => window.removeEventListener("atri:brain-response", handler);
  }, [applyResponse]);

  useEffect(() => {
    const handler = (event: Event) => applyThinking((event as CustomEvent).detail);
    window.addEventListener("atri:thinking", handler);
    return () => window.removeEventListener("atri:thinking", handler);
  }, [applyThinking]);

  const openPhone = useCallback(() => {
    userToggled.current = true;
    setExpanded(true);
    setUnread(0);
    onCollapsedChange?.(false);
  }, [onCollapsedChange]);

  const closePhone = useCallback(() => {
    userToggled.current = true;
    setModelReady(false);
    setExpanded(false);
    onCollapsedChange?.(true);
  }, [onCollapsedChange]);

  const focusInput = useCallback(() => {
    const focus = () => document.querySelector<HTMLInputElement>("[data-model-chat-input]")?.focus();
    requestAnimationFrame(() => { focus(); requestAnimationFrame(focus); });
  }, []);

  const send = useCallback(async (raw: string) => {
    const message = raw.trim();
    if (!message || atriBrain.loading || isModelChatLocked()) return;
    if (character !== "atri") setCharacter("atri");
    push("me", message);
    unlock("atri");
    applyThinking({ mood: "focused" });
    const response = await askAtri(message, { companionId: "atri", currentSection: section, currentMood: mood, currentForm: companionForm, servicesCount: 5 });
    if (response.ok) {
      setInput(current => (current.trim() === message ? "" : current));
      bumpAffection("atri", 2);
    }
    applyResponse(response);
  }, [applyResponse, applyThinking, askAtri, atriBrain.loading, bumpAffection, character, companionForm, mood, push, section]);

  useEffect(() => {
    const handler = (event: Event) => {
      const rawMessage = (event as CustomEvent).detail?.message;
      const message = typeof rawMessage === "string" ? rawMessage.trim() : "";
      setCharacter("atri");
      openPhone();
      if (!message) { focusInput(); return; }
      void send(message);
    };
    window.addEventListener("atri:ask", handler);
    window.addEventListener("luomo:companion-open", handler);
    return () => {
      window.removeEventListener("atri:ask", handler);
      window.removeEventListener("luomo:companion-open", handler);
    };
  }, [focusInput, openPhone, send]);

  useEffect(() => {
    const handler = () => {
      setSection(getCurrentSection());
      setMood(previous => (previous === "idle" || previous === "greeting" ? "idle" : previous));
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (!greeted.current) {
      greeted.current = true;
      push("them", profile.defaultLines[0] ?? "你好呀，很高兴在这里遇见你。");
    }
    const line = profile.sectionLines?.[section] || SECTIONS.find(entry => entry.id === section)?.companionLine;
    if (line && line !== lastSectionLine.current) {
      lastSectionLine.current = line;
      push("them", line);
    }
  }, [open, section, profile, push]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log, thinking, open]);

  const onAvatar = useCallback(() => {
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickCount.current += 1;
    if (clickCount.current >= 7) {
      clickCount.current = 0;
      setMood("secret");
      setBurst(value => value + 1);
      return;
    }
    if (clickCount.current === 1) bumpAffection(character, 1);
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 4000);
    playReaction("click");
  }, [bumpAffection, character, playReaction]);

  const switchTo = useCallback((nextId: CompanionId) => {
    if (nextId === character) return;
    const nextProfile = getCompanionProfile(nextId);
    setCharacter(nextId);
    setThinking(false);
    setExpression(undefined);
    setMotion(undefined);
    setActiveForms({});
    setModelReady(false);
    push("sys", `已切换到 ${nextProfile.displayName}`);
    push("them", nextProfile.defaultLines?.[0] || `${nextProfile.displayName} 已切换完成。`);
    setMood("welcome");
    playReaction("switch", nextId, "welcome");
  }, [character, playReaction, push]);

  const nextLine = useCallback(() => {
    const pool = profile.defaultLines || [];
    if (pool.length) push("them", pool[Math.floor(Math.random() * pool.length)]);
    bumpAffection(character, 1);
    playReaction("next");
  }, [bumpAffection, character, playReaction, profile.defaultLines, push]);

  const onTouch = useCallback((payload: { area: CompanionTouchArea }) => {
    const reaction = getCompanionTouchReaction(character, payload.area);
    const text = pickTouchLine(reaction.lines);
    if (text) push("them", text);
    if (reaction.mood) setMood(reaction.mood as LuomoMood);
    setExpression(reaction.expression);
    setMotion(reaction.motion);
    if (reaction.expression || reaction.motion) setCommandId(value => value + 1);
    bumpAffection(character, 1);
  }, [bumpAffection, character, push]);

  return (
    <>
      {burst > 0 && (
        <div className="dock-burst" key={burst} aria-hidden="true" onAnimationEnd={event => { if (event.target === event.currentTarget.lastElementChild) setBurst(0); }}>
          {Array.from({ length: 12 }, (_, i) => <span key={i} style={{ ["--a" as string]: `${i * 30}deg`, animationDelay: `${(i % 3) * 60}ms` }}><Spark size={10 + (i % 3) * 4} /></span>)}
        </div>
      )}
      {hydrated && (
        <div className="luomo-companion-dock" data-open={open}>
          {!open ? (
            <button type="button" className="companion-launcher" aria-label={unread ? "打开乘务员通讯（1 条未读）" : "打开乘务员通讯"} aria-expanded={false} onClick={openPhone}>
              <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <rect x="6" y="2.5" width="12" height="19" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="M10 5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M9 11.5h6M9 14.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".7" />
              </svg>
              {unread > 0 && <span className="badge">{unread}</span>}
            </button>
          ) : (
            <>
              <div className="companion-model" data-model-ready={modelReady}>
                <Live2DShell
                  modelPath={profile.modelPath}
                  layout={isMobile ? profile.mobileLayout || profile.layout : profile.layout}
                  mood={mood}
                  activeForms={activeForms}
                  expression={expression}
                  motion={motion}
                  commandId={commandId}
                  characterId={character}
                  allowSecret={allowSecret}
                  allowDebug={allowDebug}
                  variant={isMobile ? "mobile" : "dock"}
                  onReady={() => setModelReady(true)}
                  onError={() => setModelReady(false)}
                  onTouch={onTouch}
                />
              </div>
              <section className="phone" aria-label={`与 ${profile.displayName} 的通讯`}>
                <header className="phone-top">
                  <button type="button" className="phone-avatar" style={{ background: AVATAR[character].tint }} onClick={onAvatar} aria-label={`戳一戳 ${profile.displayName}`}>{AVATAR[character].mark}</button>
                  <div className="phone-who">
                    <strong>
                      {profile.displayName}
                      <span className="phone-hearts" role="img" aria-label={`好感度 ${heartsFor(affection[character])} / ${HEART_COUNT}`}>
                        {Array.from({ length: HEART_COUNT }, (_, i) => <i key={i} data-on={i < heartsFor(affection[character])} />)}
                      </span>
                    </strong>
                    <small>{thinking ? "对方正在输入……" : `在线 · ${profile.tagline}`}</small>
                  </div>
                  <button type="button" className="modal-close" aria-label="收起通讯" onClick={closePhone}>
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                  </button>
                </header>
                <div className="phone-contacts" role="group" aria-label="选择伙伴">
                  {companionOrder.map(id => {
                    const entry = getCompanionProfile(id);
                    return (
                      <button key={id} type="button" aria-pressed={id === character} onClick={() => switchTo(id)} disabled={atriBrain.loading}>
                        <span className="mini" style={{ background: AVATAR[id].tint }} aria-hidden="true">{AVATAR[id].mark}</span>
                        {entry.shortName}
                      </button>
                    );
                  })}
                </div>
                <div className="phone-log" ref={logRef} aria-live="polite">
                  {log.map(bubble => <p key={bubble.id} className={`bubble ${bubble.from}`}>{bubble.text}</p>)}
                  {thinking && <span className="typing" aria-label="正在输入"><i /><i /><i /></span>}
                </div>
                {character === "atri" && profile.capability.chat ? (
                  <>
                    <div className="phone-quick">
                      {QUICK.map(text => <button key={text} type="button" onClick={() => void send(text)} disabled={chatDisabled}>{text}</button>)}
                    </div>
                    {atriBrain.error && <p className="phone-alert" role="alert">{atriBrain.error}</p>}
                    <div className="phone-input">
                      <input
                        type="text"
                        value={input}
                        onChange={event => setInput(event.target.value)}
                        onKeyDown={event => {
                          if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
                          event.preventDefault();
                          void send(input);
                        }}
                        readOnly={chatDisabled}
                        data-model-chat-input
                        aria-label="发送给 ATRI 的消息"
                        placeholder="向 ATRI 低声说些什么……"
                        maxLength={500}
                      />
                      <button type="button" onClick={() => void send(input)} disabled={chatDisabled} data-model-chat-send>{chatDisabled ? "…" : "发送"}</button>
                    </div>
                  </>
                ) : (
                  <div className="phone-note">
                    这位伙伴陪你欣赏风景，想聊天可以切换到 ATRI。
                    <button type="button" className="phone-next" onClick={nextLine}>换一句话</button>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </>
  );
}
