// lib/scenes.ts
// Single source of truth for all fullpage scene metadata.
// SceneNavDots, SceneProgress, SceneTransitionOverlay, and FullPageScenes
// all derive their labels, counts, and IDs from this array.

export type SceneMeta = {
  readonly id: string;
  readonly shortName: string;      // For nav dots
  readonly fullName: string;       // For progress indicator
  readonly transitionLabel: string; // For transition overlay
  readonly bgClass: string;        // CSS background class
};

export const SCENES: readonly SceneMeta[] = [
  { id: "cloud-core",      shortName: "Cloud Core",     fullName: "CLOUD CORE",      transitionLabel: "SCENE 01 // CLOUD CORE",      bgClass: "bg-cloud-core" },
  { id: "visual-world",    shortName: "Visual World",   fullName: "VISUAL WORLD",    transitionLabel: "SCENE 02 // VISUAL WORLD",    bgClass: "bg-visual-world" },
  { id: "constellation",   shortName: "Constellation",  fullName: "CONSTELLATION",   transitionLabel: "SCENE 03 // CONSTELLATION",   bgClass: "bg-constellation" },
  { id: "cockpit",         shortName: "Cockpit",        fullName: "OPS COCKPIT",     transitionLabel: "SCENE 04 // OPS COCKPIT",     bgClass: "bg-cockpit" },
  { id: "orbit",           shortName: "Orbit",          fullName: "ORBIT",           transitionLabel: "SCENE 05 // ORBIT",           bgClass: "bg-orbit" },
  { id: "build-log",       shortName: "Build Log",      fullName: "BUILD LOG",       transitionLabel: "SCENE 06 // BUILD LOG",       bgClass: "bg-build-log" },
  { id: "enter-cloud",     shortName: "Enter",          fullName: "ENTER",           transitionLabel: "SCENE 07 // ENTER THE CLOUD", bgClass: "bg-enter-cloud" },
] as const;

export const SCENE_COUNT: number = SCENES.length;
