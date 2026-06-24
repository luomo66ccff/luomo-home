"use client";
import { useEffect, useState } from "react";
import type { Live2DDebugEntry } from "@/lib/live2d/live2dDebug";

export default function Live2DDebugPanel() {
  const [entries, setEntries] = useState<Live2DDebugEntry[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const entry = (event as CustomEvent<Live2DDebugEntry>).detail;
      setEntries((prev) => [...prev.slice(-199), entry]);
    };
    window.addEventListener("atri:live2d-debug", handler);
    return () => window.removeEventListener("atri:live2d-debug", handler);
  }, []);

  function handleCopy() {
    const text = entries.map(e => `[${e.time}] ${e.level.toUpperCase()} ${e.step} ${JSON.stringify(e.detail ?? "")}`).join("\n");
    navigator.clipboard?.writeText(text);
  }

  function handleClear() {
    setEntries([]);
  }

  return (
    <section className="rounded-3xl border border-cyan-300/20 bg-slate-950/80 p-4 text-left text-xs text-slate-200">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-semibold tracking-[0.18em] text-cyan-200">Live2D Debug Log</h2>
        <div className="flex items-center gap-2">
          <button onClick={handleClear}
            className="rounded-full border border-cyan-300/20 px-3 py-1 text-[11px] text-slate-400 hover:bg-cyan-300/10 hover:text-cyan-100">
            Clear Log
          </button>
          <button onClick={handleCopy}
            className="rounded-full border border-cyan-300/20 px-3 py-1 text-[11px] text-cyan-100 hover:bg-cyan-300/10">
            Copy Debug Log
          </button>
        </div>
      </div>
      <div className="max-h-[360px] overflow-auto rounded-2xl bg-black/35 p-3 font-mono">
        {entries.length === 0 ? (
          <p className="text-slate-400">Waiting for Live2D logs...</p>
        ) : (
          entries.map((entry, i) => (
            <div key={i} className="mb-2 border-b border-white/5 pb-2">
              <span className="text-slate-500">[{entry.time}] </span>
              <span className={
                entry.level === "error" ? "text-red-300" :
                entry.level === "warn" ? "text-yellow-200" :
                entry.level === "success" ? "text-emerald-300" : "text-cyan-200"
              }>{entry.level.toUpperCase()}</span>
              <span className="ml-2 text-slate-100">{entry.step}</span>
              {entry.detail ? (
                <pre className="mt-1 whitespace-pre-wrap break-words text-slate-400">
                  {JSON.stringify(entry.detail, null, 2)}
                </pre>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
