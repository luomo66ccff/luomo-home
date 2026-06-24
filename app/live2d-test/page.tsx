"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import ATRIChatPanel from "@/components/atri/ATRIChatPanel";
import Live2DShell from "@/components/live2d/Live2DShell";
import Live2DDebugPanel from "@/components/live2d/Live2DDebugPanel";
import { CharacterSwitcher } from "@/components/layout/CharacterSwitcher";
import { atriForms, SLOTS, getFormsBySlot, type AtriFormSlot, type AtriActiveForms } from "@/lib/live2d/atriForms";
import type { CompanionId } from "@/lib/companions/companionRegistry";
import { getCompanionProfile } from "@/lib/companions/companionRegistry";
import { companionLive2DControls } from "@/lib/companions/companionLive2DControls";
import { applyCompanionExpression, applyCompanionMotion } from "@/lib/live2d/live2dControls";

export default function Live2DTestPage() {
  const [companionId, setCompanionId] = useState<CompanionId>("atri");
  const companionProfile = getCompanionProfile(companionId);
  const controls = companionLive2DControls[companionId];
  const [activeForms, setActiveForms] = useState<AtriActiveForms>({});
  const [allowSecret, setAllowSecret] = useState(false);
  const [allowDebug, setAllowDebug] = useState(false);
  const [brainInput, setBrainInput] = useState("");
  const [brainLoading, setBrainLoading] = useState(false);
  const [brainResponse, setBrainResponse] = useState<any>(null);
  const [brainError, setBrainError] = useState<string | null>(null);
  const quickPrompts = ["状态怎么样","进入睡眠模式","打开秘密协议","切换成小鸟形态","帮我读取环境变量"];
  const [companionExpression, setCompanionExpression] = useState<string>();
  const [companionMotion, setCompanionMotion] = useState<string>();

  function handleCompanionChange(nextId: CompanionId) {
    if (nextId === companionId) return;
    setCompanionId(nextId);
    setActiveForms({});
    setBrainResponse(null);
    setBrainInput("");
    setBrainLoading(false);
    setBrainError(null);
    setCompanionExpression(undefined);
    setCompanionMotion(undefined);
  }

  function selectForm(slot: AtriFormSlot, formId: any) {
    if (!formId || !(formId in atriForms)) return;
    const formConfig = (atriForms as Record<string, any>)[formId];
    if (formId === "default" || formId === undefined) {
      setActiveForms((prev) => { const next = { ...prev }; delete next[slot]; return next; });
      return;
    }
    const form = formConfig;
    if (!form) return;
    if (form.safety === "secret" && !allowSecret) return;
    if (form.safety === "debug" && !allowDebug) return;
    setActiveForms((prev) => ({ ...prev, [slot]: formId }));
  }

  function clearSlot(slot: AtriFormSlot) {
    setActiveForms((prev) => { const next = { ...prev }; delete next[slot]; return next; });
  }

  function resetAll() { setActiveForms({}); }

  function playExpression(expr: string) {
    setCompanionExpression(expr);
    console.info("[live2d-test] expression button", { companionId, expression: expr });
  }

  function playMotion(mot: string) {
    setCompanionMotion(mot);
    console.info("[live2d-test] motion button", { companionId, motion: mot });
  }

  const hasExpressions = controls.expressions.length > 0;
  const hasMotions = controls.motions.length > 0;
  const hasForms = companionId === "atri";
  const hasBrain = companionId === "atri";
  const hasAbilities = hasExpressions || hasMotions || hasForms || hasBrain;


  function pushDebugLog(level: string, msg: string, data?: any) {
    if (level === "error") console.error("[live2d-test] " + msg, data ?? "");
    else if (level === "warn") console.warn("[live2d-test] " + msg, data ?? "");
    else console.info("[live2d-test] " + msg, data ?? "");
  }

  async function handleBrainSubmit(event?: React.FormEvent, preset?: string) {
    if (event) event.preventDefault();
    const text = (preset ?? brainInput).trim();
    if (!text) return;
    if (companionId !== "atri") {
      setBrainResponse({ ok: false, source: "local", mood: "warning", text: "当前 Companion 为观赏模式，仅 ATRI 支持云端对话。" });
      return;
    }
    setBrainLoading(true);
    setBrainError(null);
    setBrainResponse({ ok: true, source: "local", mood: "thinking", text: "ATRI 正在思考中……" });
    pushDebugLog("info", "brain request start", { companionId, message: text.slice(0,80) });
    try {
      const res = await fetch("/api/atri/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, context: { from: "live2d-test", companionId, currentMood: "focused", allowSecret, allowDebug } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.text || "HTTP " + res.status);
      setBrainResponse(data);
      pushDebugLog(data?.ok === false ? "warn" : "success", "brain response", { status: res.status, ok: data?.ok, source: data?.source, mood: data?.mood, refusal: data?.refusal });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setBrainError(msg);
      setBrainResponse({ ok: false, source: "client-error", mood: "warning", text: "请求失败：" + msg });
      pushDebugLog("error", "brain request failed", { error: msg });
    } finally {
      setBrainLoading(false);
    }
  }
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="text-3xl font-bold">Live2D Test</h1>
      <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-4 text-sm text-slate-300">
        <p>Model: <code className="text-cyan-200">{companionProfile.modelPath}</code></p>
        <p>Companion: <code className="text-cyan-200">{companionProfile.displayName}</code></p>
        <p>Expressions: <code className="text-cyan-200">{controls.expressions.length}</code> Motions: <code className="text-cyan-200">{controls.motions.length}</code></p>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(360px,520px)_1fr]">
        {/* Live2D Preview */}
        <div className="relative min-h-[720px] w-full overflow-visible rounded-3xl border border-cyan-200/10 bg-transparent">
          <Live2DShell key={companionId} characterId={companionId} mood="welcome" activeForms={activeForms} allowSecret={allowSecret} allowDebug={allowDebug} collapsed={false} variant="test" />
        </div>
        <div className="space-y-5">
          {/* Model Switcher */}
          <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-4 text-xs">
            <h3 className="mb-3 font-semibold text-cyan-200">Companion Model</h3>
            <CharacterSwitcher value={companionId} onChange={handleCompanionChange} />
          </div>

          {/* Expressions */}
          {hasExpressions ? (
            <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-4 text-xs">
              <h3 className="mb-3 font-semibold text-cyan-200">Expressions ({controls.expressions.length})</h3>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {controls.expressions.map((expr) => (
                  <button key={expr} type="button" onClick={() => playExpression(expr)}
                    className={"rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition " + (companionExpression === expr ? "bg-cyan-500/20 text-cyan-100 border border-cyan-300/30" : "bg-white/5 text-slate-400 hover:bg-white/10")}>
                    {expr}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Motions */}
          {hasMotions ? (
            <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-4 text-xs">
              <h3 className="mb-3 font-semibold text-cyan-200">Motions ({controls.motions.length})</h3>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {controls.motions.map((mot, idx) => {
                  const label = typeof mot === "string" ? mot : (mot.label || mot.group);
                  return (
                    <button key={idx} type="button" onClick={() => playMotion(typeof mot === "string" ? mot : mot.group)}
                      className={"rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition " + (companionMotion === (typeof mot === "string" ? mot : mot.group) ? "bg-cyan-500/20 text-cyan-100 border border-cyan-300/30" : "bg-white/5 text-slate-400 hover:bg-white/10")}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Allium no abilities */}
          {!hasExpressions && !hasMotions && !hasForms ? (
            <div className="rounded-2xl border border-amber-200/20 bg-slate-900/60 p-5 text-xs">
              <h3 className="mb-2 font-semibold text-amber-200">Companion Capabilities</h3>
              <p className="text-sm text-slate-300">当前模型暂无可用能力。</p>
              <p className="mt-2 text-xs text-slate-500">Expressions、Motions、Forms 均为空。</p>
            </div>
          ) : null}

          {/* Forms */}
          {hasForms ? (
            <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-4 text-xs">
              <h3 className="mb-3 font-semibold text-cyan-200">ATRI Forms</h3>
              {SLOTS.filter((slot) => getFormsBySlot(slot).some(f => f.safety === "normal") || slot === "outfit").map((slot) => {
                const slotForms = getFormsBySlot(slot);
                const activeFormId = activeForms[slot];
                const normalForms = slotForms.filter(f => f.safety === "normal");
                return (
                  <div key={slot} className="mb-3">
                    <div className="mb-1.5 text-[10px] uppercase tracking-wider text-slate-500">{slot}</div>
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => clearSlot(slot)}
                        className={"rounded-full px-2.5 py-1 text-[10px] transition " + (!activeFormId ? "bg-cyan-500/20 text-cyan-200 border border-cyan-300/30" : "bg-white/5 text-slate-500 hover:bg-white/10")}>None</button>
                      {normalForms.map((f) => (
                        <button key={f.id} onClick={() => selectForm(slot, activeFormId === f.id ? undefined : f.id)}
                          className={"rounded-full px-2.5 py-1 text-[10px] transition " + (activeFormId === f.id ? "bg-cyan-500/20 text-cyan-100 border border-cyan-300/30" : "bg-white/5 text-slate-400 hover:bg-white/10")}>{f.label}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div className="mt-3 flex items-center gap-2 pt-3 border-t border-white/5">
                <button onClick={resetAll} className="rounded-lg bg-red-500/10 px-3 py-1.5 text-[11px] text-red-300 hover:bg-red-500/20 transition">Reset All</button>
                <label className="flex items-center gap-1 text-[10px] text-yellow-400/70 ml-2"><input type="checkbox" checked={allowSecret} onChange={e => setAllowSecret(e.target.checked)} className="w-3 h-3" />Secret unlock</label>
                <label className="flex items-center gap-1 text-[10px] text-red-400/70"><input type="checkbox" checked={allowDebug} onChange={e => setAllowDebug(e.target.checked)} className="w-3 h-3" />Debug unlock</label>
              </div>
              {allowSecret && (
                <div className="mt-3">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-yellow-500/60">Secret</div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.values(atriForms).filter(f => f.safety === "secret").map((f) => (
                      <button key={f.id} onClick={() => selectForm(f.slot, activeForms[f.slot] === f.id ? undefined : f.id)}
                        className={"rounded-full px-2.5 py-1 text-[10px] transition " + (activeForms[f.slot] === f.id ? "bg-yellow-500/20 text-yellow-100 border border-yellow-300/30" : "bg-white/5 text-slate-400 hover:bg-white/10")}>{f.label}</button>
                    ))}
                  </div>
                </div>
              )}
              {allowDebug && (
                <div className="mt-3">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-red-500/60">Debug</div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.values(atriForms).filter(f => f.safety === "debug").map((f) => (
                      <button key={f.id} onClick={() => selectForm(f.slot, activeForms[f.slot] === f.id ? undefined : f.id)}
                        className={"rounded-full px-2.5 py-1 text-[10px] transition " + (activeForms[f.slot] === f.id ? "bg-red-500/20 text-red-100 border border-red-300/30" : "bg-white/5 text-slate-400 hover:bg-white/10")}>{f.label}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null} // no Forms for non-ATRI

          {/* Brain Test */}
          {hasBrain ? (
            <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-4 text-xs">
              <h3 className="mb-2 font-semibold text-cyan-200">ATRI Brain Test</h3>
                            <form className="mt-3 flex gap-2" onSubmit={(e) => handleBrainSubmit(e)}>
                <input value={brainInput} onChange={e => setBrainInput(e.target.value)}
                  disabled={brainLoading}
                  placeholder="向 ATRI 低声说些什么..."
                  className="min-w-0 flex-1 rounded-2xl border border-cyan-200/15 bg-black/30 px-4 py-2 text-sm text-cyan-50 outline-none placeholder:text-slate-500 focus:border-cyan-200/40"
                />
                <button type="submit" disabled={brainLoading || !brainInput.trim()}
                  className="shrink-0 rounded-2xl border border-cyan-200/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50">
                  {brainLoading ? "Sending..." : "Send"}
                </button>
              </form>
              <div className="flex flex-wrap gap-2 mt-3">
                {quickPrompts.map(p => (
                  <button key={p} type="button" disabled={brainLoading}
                    onClick={() => { setBrainInput(p); handleBrainSubmit(undefined, p); }}
                    className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-50">{p}</button>
                ))}
              </div>
              {brainResponse ? (
                <div className="mt-4 rounded-2xl border border-cyan-200/15 bg-black/25 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-cyan-200/80">Brain Response</span>
                    <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-slate-400">{brainResponse.source || "unknown"} · {brainResponse.mood || "idle"}</span>
                  </div>
                  <p className="text-sm leading-7 text-slate-100">{brainResponse.text || "ATRI 没有返回文本。"}</p>
                  {brainResponse.refusal ? <div className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">refusal: {brainResponse.refusal}</div> : null}
                  {brainError ? <div className="mt-3 rounded-xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs text-rose-100">error: {brainError}</div> : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200/20 bg-slate-900/60 p-5 text-xs">
              <h3 className="mb-2 font-semibold text-amber-200">Brain Test</h3>
              <p className="text-sm text-slate-300">当前 Companion 为观赏模式，Brain Test 仅支持 ATRI。</p>
            </div>
          )}

          {/* Debug Log */}
          <Live2DDebugPanel />
        </div>
      </div>
    </main>
  );
}