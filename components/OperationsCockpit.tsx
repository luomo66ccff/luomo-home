"use client";

import { Activity, Gauge, RadioTower, Sparkles, RefreshCw } from "lucide-react";
import MotionSection from "./MotionSection";
import { useState, useEffect, useCallback } from "react";

const baseMetrics = [
  { label: "Services connected", key: "operational", icon: Gauge },
  { label: "Active incidents", key: "down", icon: Activity },
  { label: "Unknown status", key: "unknown", icon: RadioTower },
  { label: "Cloud mood", key: "mood", icon: Sparkles },
];

interface StatusItem {
  id: string; name: string; status: string; latency_ms: number | null;
}

export default function OperationsCockpit() {
  const [services, setServices] = useState<StatusItem[]>([]);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(data.services || []);
      setLastChecked(new Date().toLocaleTimeString());
    } catch {
      // degraded / unknown
    } finally {
      setRefreshing(false);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 10000);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const operational = services.filter((s: StatusItem) => s.status === "operational").length;
  const downCount = services.filter((s: StatusItem) => s.status === "down").length;
  const unknownCount = services.filter((s: StatusItem) => s.status === "unknown").length;

  const getMood = () => {
    if (downCount > 0) return "alert ⚠";
    if (unknownCount > 1) return "uncertain ✦";
    return "calm ✦";
  };

  return (
    <MotionSection id="cockpit" className="cockpit-scene">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
      <div className="section-heading">
        <p className="section-eyebrow">Scene 04 · Operations Cockpit</p>
        <h2>Signals from the cloud are gathered here.</h2>
        <p>Calm, clear, and ready — the private cloud bridge keeps glowing without drama.</p>
      </div>

      <div className="cockpit-grid">
        {/* Metrics Cards */}
        <div className="metrics-grid">
          {baseMetrics.map((metric) => {
            const Icon = metric.icon;
            let value: string;
            if (metric.key === "operational") value = String(operational);
            else if (metric.key === "down") value = String(downCount);
            else if (metric.key === "unknown") value = String(unknownCount);
            else value = getMood();
            return (
              <div className="metric-card glass-card" key={metric.label}>
                <Icon size={21} className="text-cyan-300" />
                <strong className={metric.key === "down" && downCount > 0 ? "text-red-400" : ""}>{value}</strong>
                <span>{metric.label}</span>
              </div>
            );
          })}
        </div>

        {/* Radar + Signal List */}
        <div className="radar-card glass-card">
          <div className="radar-orb radar-scan">
            <span />
          </div>
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <p className="text-xs text-slate-400">Service Signals</p>
              <div className="flex items-center gap-2">
                {lastChecked && (
                  <span className="text-xs text-slate-500 font-mono">last: {lastChecked}</span>
                )}
                <button
                  onClick={fetchServices}
                  disabled={refreshing || cooldown}
                  className={"px-3 py-1.5 text-xs rounded-full transition-all font-mono " +
                    (refreshing || cooldown
                      ? "bg-white/5 text-slate-600 cursor-not-allowed"
                      : "bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20")}
                >
                  {refreshing ? (
                    <span className="flex items-center gap-1"><RefreshCw size={12} className="animate-spin" /> refreshing</span>
                  ) : cooldown ? (
                    "wait..."
                  ) : (
                    "refresh status"
                  )}
                </button>
              </div>
            </div>

            {services.length === 0 ? (
              <ul>
                <li className="text-sm text-slate-400 py-1 font-mono">No service data available.</li>
              </ul>
            ) : (
              <ul>
                {services.map((s) => {
                  const statusColor =
                    s.status === "operational" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" :
                    s.status === "down" ? "bg-red-400 animate-pulse" :
                    "bg-slate-500";
                  return (
                    <li key={s.id} className="flex items-center gap-2 py-1 text-sm">
                      <span className={"w-2 h-2 rounded-full flex-shrink-0 " + statusColor} />
                      <span className="text-slate-300">{s.name}</span>
                      <span className={"text-xs ml-auto capitalize " +
                        (s.status === "operational" ? "text-emerald-400" :
                         s.status === "down" ? "text-red-400" :
                         "text-slate-500")}>
                        {s.status}
                      </span>
                      {s.latency_ms != null && (
                        <span className="text-xs text-slate-600 font-mono">{s.latency_ms}ms</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

      </div>
      </div>
    </MotionSection>
  );
}