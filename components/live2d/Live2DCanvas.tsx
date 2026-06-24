"use client";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { live2dConfig, type Live2dVariant } from "@/lib/live2d/live2dConfig";
import { live2dMoodMap, applyAtriExpression, applyAtriMotion } from "@/lib/live2d/live2dController";
import { captureAtriBaseline, applyAtriActiveFormsToModel } from "@/lib/live2d/atriFormController";
import type { AtriActiveForms } from "@/lib/live2d/atriForms";
import { pushLive2DDebug } from "@/lib/live2d/live2dDebug";
import { applyCompanionModelLayout } from "@/lib/live2d/live2dLayout";
import { applyCompanionExpression, applyCompanionMotion } from "@/lib/live2d/live2dControls";

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
  collapsed?: boolean;
  variant?: Live2dVariant;
}

function hasWebGL(): boolean {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl") || c.getContext("experimental-webgl")); }
  catch { return false; }
}

function loadScriptOnce(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") { reject(new Error("no window")); return; }
    const existing = document.querySelector<HTMLScriptElement>("script[data-live2d-core=\"" + src + "\"]");
    if (existing) {
      if ((window as any).Live2DCubismCore) { resolve(); return; }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("core script error")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src; script.async = false; script.defer = false;
    script.dataset.live2dCore = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("core script failed: " + src));
    document.head.appendChild(script);
  });
}

async function waitForCubismCore(timeoutMs = 5000) {
  
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if ((window as any).Live2DCubismCore) return true;
    await new Promise(r => setTimeout(r, 50));
  }
  return false;
}

const MODEL_PATHS: Record<string, string> = {
  atri: "/live2d/atri/atri_8.model3.json",
  murasame: "/live2d/companions/murasame/Murasame.model3.json",
  allium: "/live2d/companions/allium/ariu/ariu.model3.json",
};

export default function Live2DCanvas({ characterId = "atri", mood = "idle", form = "default", expression, motion, emotionStrength, activeForms, allowSecret = false, allowDebug = false, onLoad, onError, collapsed, modelPath, layout, variant = "dock" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const Live2DModelRef = useRef<any>(null);
  const loadTokenRef = useRef(0);
  const lastLayoutKeyRef = useRef<string>("");
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
    console.info("[Live2D instance] mounted", {
      count: window.__LUOMO_LIVE2D_CANVAS_COUNT__,
      companionId: characterId,
      modelPath: resolvedModelPath,
    });
    return () => {
      window.__LUOMO_LIVE2D_CANVAS_COUNT__ = Math.max((window.__LUOMO_LIVE2D_CANVAS_COUNT__ || 1) - 1, 0);
      console.info("[Live2D instance] unmounted", {
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pushLive2DDebug("warn", "reduced-motion");
      setLoadState("error");
      setLoadError("Reduced motion mode");
      if (onError) onError();
      return;
    }

    let disposed = false;

    async function initPixiApp() {
      try {
        await loadScriptOnce(live2dConfig.cubismCorePath);
        pushLive2DDebug("success", "Cubism Core script loaded");

        const hasCore = await waitForCubismCore();
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
      console.info("[Live2D lifecycle] canvas unmount destroy app");
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

      console.info("[Live2D lifecycle] model load start", {
        token,
        companionId: characterId,
        modelPath: resolvedModelPath,
      });

      try {
        // Remove & destroy old model inside effect body (NOT in cleanup)
        const oldModel = modelRef.current;
        if (oldModel) {
          try { app.stage.removeChild(oldModel); } catch (e) {}
          try { oldModel.destroy?.({ children: true, texture: false, baseTexture: false }); } catch (e) {}
          if (modelRef.current === oldModel) modelRef.current = null;
          console.info("[Live2D lifecycle] old model destroyed", { token, companionId: characterId });
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

        // Apply layout
        applyCompanionModelLayout(model, { companionId: characterId, app, layout });
 const layoutKey = JSON.stringify({ characterId, resolvedModelPath, layout, variant });
 lastLayoutKeyRef.current = layoutKey;

        // Auto-fit into viewport
        requestAnimationFrame(function () {
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

        console.info("[Live2D lifecycle] model ready", {
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
      console.info("[Live2D lifecycle] model load effect cleanup", {
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
  // ===== 4. Expression (all companions) =====
  useEffect(() => {
    if (loadState !== "ready") return;
    if (!modelRef.current || !expression) return;
    const result = applyCompanionExpression(modelRef.current, characterId, expression);
    pushLive2DDebug(result.ok ? "success" : "warn", "companion expression apply", result);
  }, [loadState, characterId, expression]);

  // ===== 5. Motion (all companions) =====
  useEffect(() => {
    if (loadState !== "ready") return;
    if (!modelRef.current || !motion) return;
    const result = applyCompanionMotion(modelRef.current, characterId, motion);
    pushLive2DDebug(result.ok ? "success" : "warn", "companion motion apply", result);
  }, [loadState, characterId, motion]);

  // ===== 6. ATRI-specific: activeForms =====
  useEffect(() => {
    if (characterId !== "atri") return;
    if (loadState !== "ready") return;
    if (!modelRef.current) return;
    const result = applyAtriActiveFormsToModel(modelRef.current, activeForms ?? {}, { allowSecret, allowDebug });
    pushLive2DDebug(result.ok ? "success" : "warn", "ATRI active forms apply", result);
  }, [characterId, loadState, activeForms, allowSecret, allowDebug]);

  // ===== 7. ATRI-specific: mood =====
  useEffect(() => {
    if (characterId !== "atri") return;
    if (loadState !== "ready") return;
    if (!modelRef.current) return;
    try {
      const map = live2dMoodMap[mood];
      if (!map) return;
      try { modelRef.current.motion(map.motion); } catch (e) {}
      try { modelRef.current.expression(map.expression); } catch (e) {}
    } catch (e) {}
  }, [characterId, loadState, mood]);

  // ===== 8. ATRI-specific: expression override =====
  useEffect(() => {
    if (characterId !== "atri") return;
    if (loadState !== "ready") return;
    if (!modelRef.current) return;
    const result = applyAtriExpression(modelRef.current, expression);
    pushLive2DDebug(result.ok ? "success" : "warn", "ATRI expression apply", result);
  }, [characterId, loadState, expression]);

  // ===== 9. ATRI-specific: motion override =====
  useEffect(() => {
    if (characterId !== "atri") return;
    if (loadState !== "ready") return;
    if (!modelRef.current) return;
    const result = applyAtriMotion(modelRef.current, motion);
    pushLive2DDebug(result.ok ? "success" : "warn", "ATRI motion apply", result);
  }, [characterId, loadState, motion]);

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
      })
    )
  );
}
