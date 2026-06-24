"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Live2DFallback from "./Live2DFallback";
import { live2dConfig, type Live2dVariant } from "@/lib/live2d/live2dConfig";
import { pushLive2DDebug } from "@/lib/live2d/live2dDebug";
import type { CompanionLayout } from "@/lib/companions/companionRegistry";

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
  variant?: Live2dVariant;
}

export default function Live2DShell({ characterId = "atri", modelPath, layout, mood = "idle", form = "default", expression, motion, emotionStrength, activeForms, allowSecret = false, allowDebug = false, collapsed, onToggle, onError, variant = "dock" }: Props) {
  const [live2dFailed, setLive2dFailed] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    pushLive2DDebug("info", "shell mounted", { enabled: live2dConfig.enabled, collapsed, mood, variant });
  }, []);
  useEffect(() => {
    setLive2dFailed(false);
  }, [characterId, modelPath, variant]);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
      if (!gl) setWebglAvailable(false);
    } catch { setWebglAvailable(false); }
  }, []);

  if (collapsed) {
    // Collapsed mode: show small avatar circle
    return (
      <button onClick={onToggle} aria-label="Open ATRI" className="cursor-pointer">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 shadow-lg hover:scale-105 transition-transform">
          <span className="text-lg font-bold text-white">A</span>
        </div>
      </button>
    );
  }

  if (!live2dConfig.enabled || !webglAvailable || live2dFailed) {
    pushLive2DDebug("warn", "shell fallback", { enabled: live2dConfig.enabled, webgl: webglAvailable, failed: live2dFailed });
    return <Live2DFallback />;
  }

  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    pushLive2DDebug("warn", "reduced-motion fallback");
    return <Live2DFallback />;
  }

  // Expanded mode: render full Live2DCanvas
  return (
    <div className="relative h-full w-full overflow-visible">
      <Live2DCanvas
        characterId={characterId}
        modelPath={modelPath}
        layout={layout}
        mood={mood}
        form={form}
        variant={variant}
        allowSecret={allowSecret}
        allowDebug={allowDebug}
        expression={expression}
        motion={motion}
        emotionStrength={emotionStrength}
        onLoad={() => setLive2dFailed(false)}
        activeForms={characterId === "atri" ? activeForms : {}}
        onError={() => { setLive2dFailed(true); onError?.(); }}
      />
    </div>
  );
}
