"use client";

import { useState, useEffect } from "react";

const tips = [
  "欢迎回来，主人。云端系统正在发光。",
  "终端桥接已就绪。不要随便乱点哦。",
  "File Constellation 闪烁着好看的光。",
  "API Gateway 正在监听新的星轨请求。",
  "Service Constellation 已同步。",
  "The terminal bridge is standing by.",
  "Cloud systems are glowing quietly.",
  "A new build log has been written.",
];

export default function LuomoChan() {
  const [tipIndex, setTipIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(true);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (collapsed) return;
    const timer = setTimeout(() => {
      setTipIndex((i) => (i + 1) % tips.length);
    }, 6000);
    return () => clearTimeout(timer);
  }, [collapsed, tipIndex]);

  return (
    <aside className={"fixed z-40 transition-all duration-300 " + (isMobile && collapsed ? "w-12 h-12" : "")}
      style={{ right: "clamp(12px, 2vw, 28px)", bottom: "clamp(12px, 2vw, 28px)" }}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={"flex items-center gap-3 p-3 rounded-2xl transition-all " + (collapsed ? "bg-white/10 backdrop-blur-sm border border-white/20 w-12 h-12 justify-center" : "bg-black/60 backdrop-blur-md border border-white/10 w-[min(300px,calc(100vw-32px))]")}
        aria-label="Luomo-chan assistant"
      >
        <span className={"flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center text-xs font-bold " + (collapsed ? "" : "")}>
          &gt;_&lt;
        </span>
        {!collapsed && (
          <div className="flex-1 text-left">
            <p className="text-xs text-cyan-300 font-medium">Luomo-chan</p>
            <p className="text-sm text-slate-300 leading-snug">{tips[tipIndex]}</p>
          </div>
        )}
      </button>
    </aside>
  );
}
