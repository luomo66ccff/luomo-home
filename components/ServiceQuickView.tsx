"use client";
import { useEffect } from "react";

interface ServiceNode {
  id: string; code: string; name: string; worldName: string;
  description: string; url: string; statusUrl: string; accent: string; status: string;
}

interface Props { service: ServiceNode; onClose: () => void; }

export default function ServiceQuickView({ service, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const statusColors: Record<string, string> = {
    operational: "bg-emerald-400", degraded: "bg-yellow-400", down: "bg-red-400", unknown: "bg-slate-500",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true"
    >
      <div className="glass-strong rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-500 font-mono">{service.code}</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl" aria-label="Close">&times;</button>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{service.name}</h3>
        <p className="text-slate-400 text-sm mb-1">{service.worldName}</p>
        <div className="flex items-center gap-2 mb-4">
          <span className={"w-2 h-2 rounded-full " + (statusColors[service.status] || "bg-slate-500")} />
          <span className="text-sm capitalize text-slate-300">{service.status}</span>
        </div>
        <p className="text-slate-400 text-sm mb-6">{service.description}</p>
        <div className="flex gap-3 flex-wrap">
          <a href={service.url} target="_blank"
            className="clip-btn inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-medium hover:scale-105 transition-transform">
            Visit
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
          <a href={service.statusUrl} target="_blank"
            className="clip-btn inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-all">
            Status JSON
          </a>
        </div>
      </div>
    </div>
  );
}