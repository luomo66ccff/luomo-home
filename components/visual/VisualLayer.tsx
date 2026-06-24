"use client";
import StarfieldCanvas from "./StarfieldCanvas";
import SakuraField from "./SakuraField";
import HologramNoise from "./HologramNoise";

interface Props {
  enabled?: boolean;
  starfield?: boolean;
  sakura?: boolean;
  noise?: boolean;
  starfieldDensity?: "low" | "medium" | "high";
}

export default function VisualLayer({
  enabled = true, starfield = true, sakura = true, noise = true,
  starfieldDensity = "medium",
}: Props) {
  if (!enabled) return null;
  return (
    <>
      {starfield && <StarfieldCanvas density={starfieldDensity} />}
      {sakura && <SakuraField density="low" />}
      {noise && <HologramNoise />}
    </>
  );
}
