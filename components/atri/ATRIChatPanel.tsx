"use client";

import { useEffect, useState } from "react";
import { useAtriBrain, type AtriBrainHandle } from "@/hooks/useAtriBrain";
import { isModelChatLocked } from "@/lib/modelChatLock";
import type { AtriBrainRequest, AtriBrainResponse } from "@/lib/atri-brain/types";

type ThinkingState = { text: string; mood: AtriBrainResponse["mood"]; source: "thinking" };

interface Props {
  onResponse?: (response: AtriBrainResponse) => void;
  onThinking?: (state: ThinkingState) => void;
  onLoadingChange?: (loading: boolean) => void;
  context?: AtriBrainRequest["context"];
  /** Pass the parent's client so command events and this panel share one request. */
  brain?: AtriBrainHandle;
}

export default function ATRIChatPanel({ onResponse, onThinking, onLoadingChange, context, brain }: Props) {
  const [input, setInput] = useState("");
  const [chatLocked, setChatLocked] = useState(false);
  // Hooks must be called unconditionally. The parent handle is selected after
  // creating this local fallback, so standalone debug pages still work.
  const ownBrain = useAtriBrain();
  const activeBrain = brain ?? ownBrain;
  const { askAtri, loading, error } = activeBrain;
  const disabled = loading || chatLocked;

  useEffect(() => {
    setChatLocked(isModelChatLocked());
    const handler = (event: Event) => setChatLocked(Boolean((event as CustomEvent).detail?.locked));
    window.addEventListener("model-chat:lock-change", handler);
    return () => window.removeEventListener("model-chat:lock-change", handler);
  }, []);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || disabled || isModelChatLocked()) return;

    onThinking?.({ text: "ATRI 正在思考中……记忆回路正在微微发光。", mood: "focused", source: "thinking" });
    onLoadingChange?.(true);
    try {
      const response = await askAtri(msg, context);
      // Keep a failed draft available for correction or retry. Successful
      // scripted/AI responses are the only responses that clear the field.
      if (response.ok) setInput("");
      onResponse?.(response);
    } finally {
      onLoadingChange?.(false);
    }
  };

  return (
    <div className="mt-2">
      {error && <p className="mb-2 text-[11px] leading-5 text-rose-200" role="alert">{error}</p>}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
            event.preventDefault();
            void handleSend();
          }}
          readOnly={disabled}
          data-model-chat-input
          aria-label="发送给 ATRI 的消息"
          placeholder="向 ATRI 低声说些什么..."
          className="min-w-0 flex-1 rounded-xl border border-cyan-200/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none backdrop-blur-sm focus:border-cyan-300/30"
          maxLength={500}
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={disabled}
          data-model-chat-send
          className="shrink-0 rounded-xl border border-cyan-200/15 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-40"
        >
          {disabled ? "…" : "发送"}
        </button>
      </div>
    </div>
  );
}
