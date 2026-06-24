"use client";
import { useState } from "react";
import { useAtriBrain } from "@/hooks/useAtriBrain";

interface Props { onResponse?: (r: any) => void; onThinking?: (r: any) => void; onLoadingChange?: (loading: boolean) => void; context?: Record<string, any>; }

export default function ATRIChatPanel({ onResponse, onThinking, onLoadingChange, context }: Props) {
  const [input, setInput] = useState("");
  const { askAtri, loading } = useAtriBrain();

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    onThinking?.({ text: "ATRI \u6b63\u5728\u601d\u8003\u4e2d\u2026\u2026\u8bb0\u5fc6\u56de\u8def\u6b63\u5728\u5fae\u5fae\u53d1\u5149\u3002", mood: "focused", source: "thinking" });
    onLoadingChange?.(true);
    const r = await askAtri(msg, context);
    onLoadingChange?.(false);
    onResponse?.(r);
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="text" value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSend()}
        placeholder="向 ATRI 低声说些什么..."
        className="flex-1 rounded-xl border border-cyan-200/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none backdrop-blur-sm focus:border-cyan-300/30"
        maxLength={200}
      />
      <button onClick={handleSend} disabled={loading}
        className="shrink-0 rounded-xl border border-cyan-200/15 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-40">
        {loading ? "..." : "Send"}
      </button>
    </div>
  );
}
