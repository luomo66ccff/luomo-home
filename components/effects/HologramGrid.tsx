"use client";
export default function HologramGrid() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: "linear-gradient(rgba(125, 211, 252, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(125, 211, 252, 0.5) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
      aria-hidden="true" />
  );
}
