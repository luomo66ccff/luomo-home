interface Props { size?: number; className?: string; }

export default function MagicCircle({ size = 220, className = "" }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 220 220" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mcGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r="100" fill="none" stroke="url(#mcGrad)" strokeWidth="1.5" strokeDasharray="8 6"
        className="origin-center animate-[spin_32s_linear_infinite]" />
      <circle cx="110" cy="110" r="72" fill="none" stroke="rgba(244,114,182,0.25)" strokeWidth="1" strokeDasharray="4 4"
        className="origin-center animate-[spin_24s_linear_infinite_reverse]" />
      <circle cx="110" cy="110" r="48" fill="none" stroke="rgba(34,211,238,0.2)" strokeWidth="0.5" />
      <text x="110" y="122" textAnchor="middle" fill="#fde68a" fontSize="36" fontWeight="900" fontFamily="monospace">LC</text>
    </svg>
  );
}
