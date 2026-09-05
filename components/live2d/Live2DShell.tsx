"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Live2DFallback from "./Live2DFallback";
import { live2dConfig, type Live2dVariant } from "@/lib/live2d/live2dConfig";
import { pushLive2DDebug } from "@/lib/live2d/live2dDebug";
import type { CompanionLayout } from "@/lib/companions/companionRegistry";
import type { CompanionTouchArea } from "@/lib/companions/companionTouch";

const Live2DCanvas = dynamic(() => import("./Live2DCanvas"), {
  ssr: false,
  loading: () => <Live2DFallback />,
});

import type { CharacterId } from "@/lib/live2d/characterRegistry";
import type { AtriActiveForms } from "@/lib/live2d/atriForms";

interface Props {
  modelPath?: string;
  layout?: CompanionLayout;
  companionId?: string;
  characterId?: CharacterId;
  mood?: string;
  form?: string;
  activeForms?: AtriActiveForms;
  expression?: string;
  motion?: string;
  emotionStrength?: number;
  allowSecret?: boolean;
  allowDebug?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  onError?: () => void;
  onReady?: () => void;
  onTouch?: (payload: { x: number; y: number; normalizedX: number; normalizedY: number; area: CompanionTouchArea; characterId: string }) => void;
  variant?: Live2dVariant;
}

export default function Live2DShell({ characterId = "atri", modelPath, layout, mood = "idle", form = "default", expression, motion, emotionStrength, activeForms, allowSecret = false, allowDebug = false, collapsed, onToggle, onError, onReady, onTouch, variant = "dock" }: Props) {
  const [failed, setFailed] = useState(false);
  const [available, setAvailable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const failureCallback = useRef(onError);
  failureCallback.current = onError;
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    setAvailable(false); setFailed(false); failureCallback.current?.();
    if (collapsed || reducedMotion || !live2dConfig.enabled) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    void (async () => {
      try {
        const response = await fetch("/api/companions", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const manifest = await response.json();
        const entry = manifest?.models?.[characterId];
        if (manifest?.core?.exists !== true || entry?.exists !== true || entry.path !== (modelPath || live2dConfig.modelPath)) return;
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
        const supported = Boolean(gl);
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
        if (!controller.signal.aborted) setAvailable(supported);
      } catch { /* Missing or unavailable assets use the normal static experience. */ }
      finally { clearTimeout(timeout); }
    })();
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [characterId, modelPath, collapsed, reducedMotion]);
  useEffect(() => { if (failed) pushLive2DDebug("warn", "model fallback active", { characterId }); }, [failed, characterId]);
  if (collapsed) return <button onClick={onToggle} aria-label="打开云端伙伴"><Live2DFallback /></button>;
  if (!available || failed || reducedMotion) return <Live2DFallback />;
  return <div className="relative h-full w-full overflow-visible">
    <Live2DCanvas key={characterId + "|" + modelPath + "|" + variant}
      characterId={characterId} modelPath={modelPath} layout={layout} mood={mood}
      form={form} variant={variant} allowSecret={allowSecret} allowDebug={allowDebug}
      expression={expression} motion={motion} emotionStrength={emotionStrength}
      onLoad={() => { setFailed(false); onReady?.(); }}
      activeForms={characterId === "atri" ? activeForms : {}}
      onError={() => { setFailed(true); onError?.(); }} onTouch={onTouch}
    />
  </div>;
}
