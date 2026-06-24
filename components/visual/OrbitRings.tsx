"use client";

interface Props {
  rings?: { size: number; border: string; className?: string }[];
}

const defaultRings = [
  { size: 480, border: "border-cyan-300/10" },
  { size: 640, border: "border-fuchsia-300/8" },
];

export default function OrbitRings({ rings = defaultRings }: Props) {
  return (
    <>
      {rings.map((r, i) => (
        <div
          key={i}
          className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${r.border} ${r.className || ""}`}
          style={{ width: r.size, height: r.size }}
        />
      ))}
    </>
  );
}
