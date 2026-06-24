import type { CSSProperties } from "react";

const petals = Array.from({ length: 16 }, (_, index) => index);

export default function SakuraParticles() {
  return (
    <div className="sakura-field" aria-hidden="true">
      {petals.map((petal) => (
        <span key={petal} style={{ "--i": petal } as CSSProperties} />
      ))}
    </div>
  );
}
