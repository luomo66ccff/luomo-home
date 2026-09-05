"use client";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { live2dConfig, type Live2dVariant } from "@/lib/live2d/live2dConfig";
import { live2dMoodMap } from "@/lib/live2d/live2dController";
import { captureAtriBaseline, applyAtriActiveFormsToModel } from "@/lib/live2d/atriFormController";
import type { AtriActiveForms } from "@/lib/live2d/atriForms";
import { pushLive2DDebug } from "@/lib/live2d/live2dDebug";
import { applyCompanionModelLayout } from "@/lib/live2d/live2dLayout";
import { applyCompanionExpression, applyCompanionMotion } from "@/lib/live2d/live2dControls";
import { fallbackAreaFromNormalizedPoint, type CompanionTouchArea } from "@/lib/companions/companionTouch";

declare global {
  interface Window {
    __LUOMO_LIVE2D_CANVAS_COUNT__?: number;
  }
}

interface Props {
  modelPath?: string;
  layout?: { width?: number; height?: number; scale?: number; xRatio?: number; yRatio?: number };
  mood?: string;
  form?: string;
  allowSecret?: boolean;
  allowDebug?: boolean;
  expression?: string;
  motion?: string;
  emotionStrength?: number;
  activeForms?: AtriActiveForms;
  characterId?: string;
  onLoad?: () => void;
  onError?: () => void;
  onTouch?: (payload: { x: number; y: number; normalizedX: number; normalizedY: number; area: CompanionTouchArea; characterId: string }) => void;
  collapsed?: boolean;
  variant?: Live2dVariant;
}

function hasWebGL(): boolean {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl") || c.getContext("experimental-webgl")); }
  catch { return false; }
}

type ScriptLoad = { promise: Promise<void>; script: HTMLScriptElement };
const scriptLoads = new Map<string, ScriptLoad>();

export function loadScriptOnce(src: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if ((window as any).Live2DCubismCore) return Promise.resolve();

  const cached = scriptLoads.get(src);
  if (cached) return cached.promise;

  let existing = document.querySelector<HTMLScriptElement>(`script[data-live2d-core="${src}"]`);
  // A rejected script is removed by onError below. This branch also handles a
  // failed script left by another loader so a retry can create a fresh node.
  if (existing?.dataset.live2dCoreState === "failed") {
    existing.remove();
    existing = null;
  }
  if (existing?.dataset.live2dCoreState === "loaded" && !(window as any).Live2DCubismCore) {
    existing.remove();
    existing = null;
  }

  let resolvePromise!: () => void;
  let rejectPromise!: (reason?: unknown) => void;
  const promise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  const script = existing || document.createElement("script");
  let settled = false;
  let loadTimeout: ReturnType<typeof setTimeout>;
  const cleanup = () => {
    clearTimeout(loadTimeout);
    script.removeEventListener("load", onLoad);
    script.removeEventListener("error", onError);
  };
  const onLoad = () => {
    if (settled) return;
    settled = true;
    cleanup();
    script.dataset.live2dCoreState = "loaded";
    scriptLoads.delete(src);
    resolvePromise();
  };
  const onError = () => {
    if (settled) return;
    settled = true;
    cleanup();
    script.dataset.live2dCoreState = "failed";
    scriptLoads.delete(src);
    script.remove();
    rejectPromise(new Error("core script failed: " + src));
  };

  script.src = src;
  script.async = false;
  script.defer = false;
  script.dataset.live2dCore = src;
  script.dataset.live2dCoreState = "loading";
  script.addEventListener("load", onLoad, { once: true });
  script.addEventListener("error", onError, { once: true });
  scriptLoads.set(src, { promise, script });
  loadTimeout = setTimeout(onError, 10000);
  if (!existing) document.head.appendChild(script);

  // A completed script without the core global cannot emit another useful
  // load event. Settle it as a failure instead of leaving callers pending.
  if (existing && (existing as HTMLScriptElement & { readyState?: string }).readyState === "complete") {
    queueMicrotask(onError);
  }
  return promise;
}

async function waitForCubismCore(timeoutMs = 5000, signal?: AbortSignal) {
  
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if ((window as any).Live2DCubismCore) return true;
    if (signal?.aborted) return false;
    await new Promise(r => setTimeout(r, 50));
  }
  return false;
}

const MODEL_PATHS: Record<string, string> = {
  atri: "/live2d/atri/atri_8.model3.json",
  murasame: "/live2d/companions/murasame/Murasame.model3.json",
  allium: "/live2d/companions/allium/ariu/ariu.model3.json",
};

type CompanionManifest = {
  core?: { exists?: boolean };
  models?: Record<string, { path?: string; exists?: boolean }>;
};

function parseCompanionManifest(value: unknown): CompanionManifest {
  if (!value || typeof value !== "object") throw new Error("Live2D asset manifest is invalid");
  const manifest = value as CompanionManifest;
  if (manifest.core?.exists !== true || !manifest.models || typeof manifest.models !== "object") {
    throw new Error("Live2D assets are unavailable");
  }
  return manifest;
}

async function fetchCompanionManifest(signal: AbortSignal): Promise<CompanionManifest> {
  const response = await fetch("/api/companions", { cache: "no-store", signal });
  if (!response.ok) throw new Error(`Live2D asset manifest failed (HTTP ${response.status})`);
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Live2D asset manifest returned invalid JSON");
  }
  return parseCompanionManifest(payload);
}

export default function Live2DCanvas({ characterId = "atri", mood = "idle", form = "default", expression, motion, emotionStrength, activeForms, allowSecret = false, allowDebug = false, onLoad, onError, onTouch, collapsed, modelPath, layout, variant = "dock" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const Live2DModelRef = useRef<any>(null);
  const manifestRef = useRef<CompanionManifest | null>(null);
  const loadTokenRef = useRef(0);
  const lastLayoutKeyRef = useRef<string>("");
  const appliedCommandsRef = useRef<WeakMap<object, { expression?: string; motion?: string }>>(new WeakMap());
  const [pixiReady, setPixiReady] = useState(false);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [loadError, setLoadError] = useState<string | null>(null);

  const resolvedModelPath = modelPath || MODEL_PATHS[characterId] || MODEL_PATHS["atri"];
  const size = variant === "test" ? live2dConfig.test
    : variant === "mobile" ? live2dConfig.mobile
    : live2dConfig.dock;

  // ===== Global instance counter (debug: should always be 1) =====
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__LUOMO_LIVE2D_CANVAS_COUNT__ = (window.__LUOMO_LIVE2D_CANVAS_COUNT__ || 0) + 1;
    pushLive2DDebug("info", "instance mounted", {
      count: window.__LUOMO_LIVE2D_CANVAS_COUNT__,
      companionId: characterId,
      modelPath: resolvedModelPath,
    });
    return () => {
      window.__LUOMO_LIVE2D_CANVAS_COUNT__ = Math.max((window.__LUOMO_LIVE2D_CANVAS_COUNT__ || 1) - 1, 0);
      pushLive2DDebug("info", "instance unmounted", {
        count: window.__LUOMO_LIVE2D_CANVAS_COUNT__,
        companionId: characterId,
        modelPath: resolvedModelPath,
      });
    };
  }, []);

  // ===== 1. PIXI Application Init - runs only once =====
  useEffect(() => {
    if (collapsed || typeof window === "undefined") return;
    if (!hasWebGL()) {
      pushLive2DDebug("error", "WebGL not available");
      setLoadState("error");
      setLoadError("WebGL not available");
      if (onError) onError();
      return;
    }
    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pushLive2DDebug("warn", "reduced-motion");
      setLoadState("error");
      setLoadError("Reduced motion mode");
      if (onError) onError();
      return;
    }

    let disposed = false;
    const initController = new AbortController();

    async function initPixiApp() {
      try {
        const manifest = await fetchCompanionManifest(initController.signal);
        const modelEntry = manifest.models?.[characterId];
        if (!modelEntry?.exists || modelEntry.path !== resolvedModelPath) {
          throw new Error(`Live2D model unavailable for ${characterId}`);
        }
        manifestRef.current = manifest;

        await loadScriptOnce(live2dConfig.cubismCorePath);
        pushLive2DDebug("success", "Cubism Core script loaded");

        const hasCore = await waitForCubismCore(5000, initController.signal);
        pushLive2DDebug(hasCore ? "success" : "error", "Cubism Core global", { hasCore });
        if (!hasCore) throw new Error("Live2DCubismCore not found after script load");

        const PIXI = await import("pixi.js");
        (window as any).PIXI = PIXI;
        pushLive2DDebug("success", "pixi imported");

        const { Live2DModel } = await import("pixi-live2d-display/cubism4");
        Live2DModelRef.current = Live2DModel;
        pushLive2DDebug("success", "pixi-live2d-display/cubism4 imported");

        if (disposed || !canvasRef.current) return;

        const app = new (PIXI as any).Application({
          view: canvasRef.current,
          width: size.width,
          height: size.height,
          backgroundAlpha: 0,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
        });
        appRef.current = app;
        setPixiReady(true);
        pushLive2DDebug("success", "PIXI Application ready", {
          width: size.width,
          height: size.height,
        });
      } catch (e) {
        if (disposed) return;
        const msg = (e as Error).message || String(e);
        pushLive2DDebug("error", "PIXI init failed", { reason: msg });
        setLoadState("error");
        setLoadError(msg);
        if (onError) onError();
      }
    }

    initPixiApp();

    return () => {
      disposed = true;
      initController.abort();
      pushLive2DDebug("info", "canvas unmount destroy app");
      try { if (modelRef.current) modelRef.current.destroy({ children: true, texture: false, baseTexture: false }); } catch (e) {}
      try { if (appRef.current) appRef.current.destroy(true, { children: true, texture: false, baseTexture: false }); } catch (e) {}
      modelRef.current = null;
      appRef.current = null;
      Live2DModelRef.current = null;
    };
  }, []);

  // ===== 2. Model Load - runs when PIXI ready AND character changes =====
  useEffect(() => {
    if (!pixiReady) return;
    if (!appRef.current || !Live2DModelRef.current) return;

    const token = ++loadTokenRef.current;
    let cancelled = false;

    setLoadState("loading");
    setLoadError(null);

    async function loadModel() {
      const app = appRef.current;
      const Live2DModelCls = Live2DModelRef.current;

      pushLive2DDebug("info", "model load start", {
        token,
        companionId: characterId,
        modelPath: resolvedModelPath,
      });

      try {
        // Keep the current model until its replacement has loaded successfully.
        const oldModel = modelRef.current;

        const modelEntry = manifestRef.current?.models?.[characterId];
        if (!modelEntry?.exists || modelEntry.path !== resolvedModelPath) {
          throw new Error(`Live2D model unavailable for ${characterId}`);
        }

        // Load new model
        const model = await Live2DModelCls.from(resolvedModelPath);

        // Stale guard
        if (cancelled || token !== loadTokenRef.current) {
          console.warn("[Live2D lifecycle] stale model load discarded", {
            token, currentToken: loadTokenRef.current, companionId: characterId, modelPath: resolvedModelPath,
          });
          try { model.destroy?.({ children: true, texture: false, baseTexture: false }); } catch (e) {}
          return;
        }

        modelRef.current = model;
        app.stage.addChild(model);
        if (oldModel) {
          app.stage.removeChild(oldModel);
          oldModel.destroy?.({ children: true, texture: false, baseTexture: false });
        }

        // Apply layout
        applyCompanionModelLayout(model, { companionId: characterId, app, layout });
 const layoutKey = JSON.stringify({ characterId, resolvedModelPath, layout, variant });
 lastLayoutKeyRef.current = layoutKey;

        // Auto-fit into viewport
        requestAnimationFrame(function () {
          if (cancelled || token !== loadTokenRef.current) return;
          try {
            const bounds = model.getBounds();
            if (bounds && bounds.width && bounds.height) {
              const screenH = app.screen.height;
              const bottom = bounds.y + bounds.height;
              const overBottom = bottom - screenH;
              const overTop = 0 - bounds.y;
              if (overBottom > 0) model.y -= overBottom + 20;
              if (overTop > 0) model.y += overTop + 20;
            }
          } catch (e) {
            pushLive2DDebug("warn", "model fit correction error", { error: String(e) });
          }
        });

        // ATRI baseline capture (one-time per model load)
        if (characterId === "atri") {
          try { captureAtriBaseline(model); } catch (e) {}
        }

        pushLive2DDebug("info", "model ready", {
          token, companionId: characterId, modelPath: resolvedModelPath, stageChildren: app.stage.children.length,
        });

        setLoadState("ready");
        if (onLoad) onLoad();
        pushLive2DDebug("success", "model loaded and ready", { companionId: characterId });
      } catch (e) {
        if (cancelled || token !== loadTokenRef.current) return;
        const msg = (e as Error).message || String(e);
        console.error("[Live2D lifecycle] model load failed", { token, companionId: characterId, modelPath: resolvedModelPath, message: msg });
        setLoadState("error");
        setLoadError(msg);
        if (onError) onError();
      }
    }

    loadModel();

    // Cleanup: do NOT destroy modelRef.current, only cancel this load
    return () => {
      cancelled = true;
      pushLive2DDebug("info", "model load effect cleanup", {
        token,
        companionId: characterId,
        modelPath: resolvedModelPath,
      });
    };
  }, [pixiReady, resolvedModelPath, characterId]);

  // ===== 3. Layout re-apply (when layout changes, dedup) =====
  useEffect(() => {
    if (loadState !== "ready") return;
    if (!modelRef.current || !appRef.current) return;
    const layoutKey = JSON.stringify({ characterId, resolvedModelPath, layout, variant });
    if (lastLayoutKeyRef.current === layoutKey) return;
    applyCompanionModelLayout(modelRef.current, { companionId: characterId, app: appRef.current, layout });
    lastLayoutKeyRef.current = layoutKey;
    pushLive2DDebug("info", "layout reapplied", { companionId: characterId });
  }, [loadState, characterId, resolvedModelPath, layout, variant]);
  // ===== 4. Expression/motion commands (deduped per model) =====
  // ATRI moods and explicit reactions use the same command path. The model's
  // real managers are checked by the control helpers before anything is sent.
  useEffect(() => {
    if (loadState !== "ready") return;
    const model = modelRef.current;
    if (!model) return;

    const moodMap = characterId === "atri" ? live2dMoodMap[mood] : undefined;
    const requestedExpression = expression || moodMap?.expression;
    const requestedMotion = motion || moodMap?.motion;
    const previous = appliedCommandsRef.current.get(model) || {};

    if (requestedExpression && previous.expression !== requestedExpression) {
      const result = applyCompanionExpression(model, characterId, requestedExpression);
      pushLive2DDebug(result.ok ? "success" : "warn", "companion expression apply", result);
      if (result.ok) previous.expression = requestedExpression;
    }
    if (requestedMotion && previous.motion !== requestedMotion) {
      const result = applyCompanionMotion(model, characterId, requestedMotion);
      pushLive2DDebug(result.ok ? "success" : "warn", "companion motion apply", result);
      if (result.ok) previous.motion = requestedMotion;
    }
    appliedCommandsRef.current.set(model, previous);
  }, [loadState, characterId, mood, expression, motion]);

  // ===== 6. ATRI-specific: activeForms =====
  useEffect(() => {
    if (characterId !== "atri") return;
    if (loadState !== "ready") return;
    if (!modelRef.current) return;
    const result = applyAtriActiveFormsToModel(modelRef.current, activeForms ?? {}, { allowSecret, allowDebug });
    pushLive2DDebug(result.ok ? "success" : "warn", "ATRI active forms apply", result);
  }, [characterId, loadState, activeForms, allowSecret, allowDebug]);

  // ===== Error State UI =====
  if (loadState === "error") {
    return (
      React.createElement("div", { className: "relative flex items-center justify-center rounded-3xl border border-rose-300/20 bg-slate-950/70 p-6 text-center backdrop-blur-xl", style: { width: size.width, height: size.height } },
        React.createElement("div", null,
          React.createElement("div", { className: "text-xs font-semibold text-rose-200" }, "Live2D model failed to load"),
          React.createElement("div", { className: "mt-2 text-[11px] text-rose-100/70 break-all" }, characterId + " - " + resolvedModelPath),
          loadError ? React.createElement("div", { className: "mt-2 text-[10px] text-rose-100/50 break-all" }, loadError) : null
        )
      )
    );
  }

  return (
    React.createElement("div", { suppressHydrationWarning: true, className: "relative", style: { width: size.width, height: size.height } },
      React.createElement("canvas", {
        ref: canvasRef,
        className: "block w-full h-full pointer-events-auto",
        "aria-label": "Live2D model",
        onPointerDown: (event: React.PointerEvent<HTMLCanvasElement>) => {
          if (!onTouch) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const normalizedX = rect.width ? x / rect.width : 0.5;
          const normalizedY = rect.height ? y / rect.height : 0.5;
          onTouch({ x, y, normalizedX, normalizedY, area: fallbackAreaFromNormalizedPoint(normalizedX, normalizedY), characterId });
        },
      })
    )
  );
}
