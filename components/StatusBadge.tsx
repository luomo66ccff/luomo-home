type StatusBadgeProps = {
  status: string;
  label?: string;
};

const statusClass: Record<string, string> = {
  operational: "badge-success",
  ok: "badge-success",
  degraded: "badge-warning",
  down: "badge-danger",
  unknown: "badge-muted"
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const normalized = String(status || "unknown").toLowerCase();
  return (
    <span className={`badge ${statusClass[normalized] || "badge-muted"}`}>
      {label || normalized}
    </span>
  );
}
