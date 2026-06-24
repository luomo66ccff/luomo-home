export default function Live2DFallback() {
  return (
    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center text-white font-bold shadow-lg border border-white/20 backdrop-blur-sm"
      style={{ boxShadow: "0 0 28px rgba(34,211,238,0.35), 0 0 52px rgba(168,85,247,0.2)" }}>
      <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 3" />
        <text x="20" y="26" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="900" fontFamily="monospace">LC</text>
      </svg>
    </div>
  );
}
