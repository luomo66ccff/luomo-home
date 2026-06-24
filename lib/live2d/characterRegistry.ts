export type CharacterId = "atri" | "murasame" | "allium";

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  title: string;
  modelPath: string;
  moodMap: Record<string, { expression: string; motion: string; lineGroup: string }>;
  lines: Record<string, string[]>;
  defaultForm: string;
}

import { luomoChanLines } from "../luomo-chan/lines";

export const ATRIMOODS: Record<string, { expression: string; motion: string; lineGroup: string }> = {
  "idle": {
    "expression": "atl_exp_00",
    "motion": "atl_m01",
    "lineGroup": "idle"
  },
  "welcome": {
    "expression": "atl_exp_01",
    "motion": "atl_m02",
    "lineGroup": "welcome"
  },
  "curious": {
    "expression": "atl_exp_02",
    "motion": "atl_m03",
    "lineGroup": "curious"
  },
  "focused": {
    "expression": "atl_exp_03",
    "motion": "atl_m04",
    "lineGroup": "focused"
  },
  "excited": {
    "expression": "atl_exp_04",
    "motion": "atl_m05",
    "lineGroup": "excited"
  },
  "secret": {
    "expression": "atl_exp_05",
    "motion": "atl_m06",
    "lineGroup": "secret"
  },
  "system": {
    "expression": "atl_exp_00",
    "motion": "atl_m01",
    "lineGroup": "system"
  },
  "greeting": {
    "expression": "atl_exp_01",
    "motion": "atl_m02",
    "lineGroup": "greeting"
  },
  "sleepy": {
    "expression": "atl_exp_06",
    "motion": "atl_m01",
    "lineGroup": "sleepy"
  },
  "warning": {
    "expression": "atl_exp_07",
    "motion": "atl_m07",
    "lineGroup": "warning"
  }
};

export const MURASAMEMOODS: Record<string, { expression: string; motion: string; lineGroup: string }> = {
  "idle": {
    "expression": "exp_normal",
    "motion": "idle",
    "lineGroup": "idle"
  },
  "welcome": {
    "expression": "exp_happy",
    "motion": "greet",
    "lineGroup": "welcome"
  },
  "curious": {
    "expression": "exp_surprise",
    "motion": "surprise",
    "lineGroup": "curious"
  },
  "focused": {
    "expression": "exp_serious",
    "motion": "thinking",
    "lineGroup": "focused"
  },
  "excited": {
    "expression": "exp_happy",
    "motion": "excited",
    "lineGroup": "excited"
  },
  "secret": {
    "expression": "exp_wink",
    "motion": "secret",
    "lineGroup": "secret"
  },
  "system": {
    "expression": "exp_normal",
    "motion": "ready",
    "lineGroup": "system"
  },
  "greeting": {
    "expression": "exp_happy",
    "motion": "greet",
    "lineGroup": "welcome"
  },
  "sleepy": {
    "expression": "exp_tired",
    "motion": "yawn",
    "lineGroup": "sleepy"
  },
  "warning": {
    "expression": "exp_angry",
    "motion": "alert",
    "lineGroup": "warning"
  }
};

 