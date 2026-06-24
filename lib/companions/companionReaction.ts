import type { CompanionId } from "./companionRegistry";
import {
  companionLive2DControls,
  type CompanionMotionRef,
  type CompanionReactionTrigger,
} from "./companionLive2DControls";

export function pickRandom<T>(items?: T[]): T | undefined {
  if (!items?.length) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

export function getCompanionReaction(
  companionId: CompanionId,
  trigger: CompanionReactionTrigger,
  mood?: string
): { expression?: string; motion?: CompanionMotionRef } {
  const controls = companionLive2DControls[companionId];
  if (!controls) return {};
  const expression =
    pickRandom(mood ? controls.emotionMap[mood] : undefined) ||
    pickRandom(controls.expressions);
  const motion =
    pickRandom(controls.motionMap[trigger]) ||
    pickRandom(controls.motions);
  return { expression, motion };
}

export const getRandomReaction = getCompanionReaction;