export type CompanionReactionTrigger =
  | "switch" | "next" | "hover" | "click" | "thinking" | "warning" | "idle";

export type CompanionMotionRef =
  | string
  | { group: string; index?: number; label?: string };

export type CompanionLive2DControl = {
  expressions: string[];
  motions: CompanionMotionRef[];
  emotionMap: Record<string, string[]>;
  motionMap: Partial<Record<CompanionReactionTrigger, CompanionMotionRef[]>>;
  forms: Record<string, { label: string; slot: string; params: Record<string, number> }>;
};

import type { CompanionId } from "./companionRegistry";

export const companionLive2DControls: Record<CompanionId, CompanionLive2DControl> = {
  atri: {
    expressions: ["expression1","expression2","expression3","expression4","expression5","expression6","expression7","expression8","expression9","expression10","expression11","expression12","expression13","expression14","expression15","expression16"],
    motions: [{group:"dec-l",label:"dec-l"},{group:"dec-r",label:"dec-r"},{group:"model",label:"model"}],
    emotionMap: { welcome:["expression2"],warning:["expression7"],thinking:["expression4"],sleepy:["expression6"],idle:["expression1"],curious:["expression3"],excited:["expression5"],secret:["expression8"] },
    motionMap: { switch:[{group:"model"}],next:[{group:"dec-l"}],hover:[{group:"model"}],click:[{group:"dec-l"}],thinking:[{group:"model"}],warning:[{group:"dec-r"}],idle:[{group:"model"}] },
    forms: {},
  },
  murasame: {
    expressions: ["exp1.exp3","exp2.exp3","exp3.exp3","exp4.exp3","exp5.exp3","exp6.exp3","exp7.exp3"],
    motions: [{group:"Idle",label:"Idle"},{group:"Tapface",label:"Tapface"},{group:"Taphair",label:"Taphair"},{group:"Tapxiongbu",label:"Tapxiongbu"},{group:"Tapqunzi",label:"Tapqunzi"},{group:"Tapleg",label:"Tapleg"}],
    emotionMap: { welcome:["exp2.exp3","exp1.exp3"],warning:["exp4.exp3"],thinking:["exp3.exp3"],sleepy:["exp6.exp3"],idle:["exp1.exp3"],curious:["exp3.exp3"],excited:["exp2.exp3"],secret:["exp7.exp3"] },
    motionMap: { switch:[{group:"Idle"}],next:[{group:"Tapface"},{group:"Taphair"}],hover:[{group:"Taphair"}],click:[{group:"Tapface"},{group:"Tapleg"}],thinking:[{group:"Tapleg"}],warning:[{group:"Tapxiongbu"}],idle:[{group:"Idle"}] },
    forms: {},
  },
  allium: {
    expressions: [],
    motions: [],
    emotionMap: {},
    motionMap: {},
    forms: {},
  },
};