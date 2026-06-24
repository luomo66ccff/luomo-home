export default function HolographicCloudCore() {
  return (
    <div className="cloud-core-wrap" aria-label="Holographic Luomo Cloud Core">
      <div className="rune-ring rune-ring-outer" aria-hidden="true">
        ✦ ASTRAL · CORE · FLOW · LUMEN · MAGIC · DATA ·
      </div>
      <div className="rune-ring rune-ring-inner" aria-hidden="true">
        ᚠ ᚱ ᚨ ᚾ ᚲ · SYS · 01 · 02 · 03 · 04 · 05 · 06
      </div>
      <div className="moon-ring" />
      <div className="orbit orbit-one">
        <span />
        <span />
      </div>
      <div className="orbit orbit-two">
        <span />
        <span />
      </div>
      <div className="orbit orbit-three">
        <span />
        <span />
      </div>
      <svg className="core-lines" viewBox="0 0 420 420" aria-hidden="true">
        <defs>
          <linearGradient id="coreLine" x1="0" x2="1">
            <stop stopColor="#22d3ee" />
            <stop offset="0.55" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#f472b6" />
          </linearGradient>
        </defs>
        <path d="M76 222 C124 108 274 86 345 187" />
        <path d="M78 244 C156 338 286 335 352 230" />
        <path d="M210 64 C272 143 274 281 211 356" />
        <path d="M115 132 C193 198 250 204 312 132" />
      </svg>
      <div className="cloud-core">
        <span className="cloud-lobe lobe-a" />
        <span className="cloud-lobe lobe-b" />
        <span className="cloud-lobe lobe-c" />
        <span className="cloud-lobe lobe-d" />
        <span className="cloud-spark">✦</span>
      </div>
      <div className="core-caption">
        <span>Cloud Core</span>
        <strong>jump vector locked</strong>
      </div>
    </div>
  );
}
