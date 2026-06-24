interface Props {
  status: "operational" | "degraded" | "down" | "unknown";
  label?: string;
  className?: string;
}

const colors = {
  operational: "bg-emerald-400/15 text-emerald-300 border-emerald-400/20",
  degraded: "bg-yellow-400/15 text-yellow-300 border-yellow-400/20",
  down: "bg-red-400/15 text-red-300 border-red-400/20 animate-pulse",
  unknown: "bg-slate-400/15 text-slate-300 border-slate-400/20",
};

export default function StatusPill({ status, label, className = "" }: Props) {
  return (
    <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${colors[status]} ${className}`}>
      {label || status}
    </span>
  );
}
