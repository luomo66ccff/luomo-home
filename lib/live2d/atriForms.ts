export type AtriFormSlot =
  | "outfit" | "bottom" | "footwear" | "accessory" | "effect" | "debug";

export type AtriFormId =
  | "default" | "pajama" | "pajamaPants" | "sandals" | "leatherShoes"
  | "bird" | "kani" | "pillowLeft" | "pillowRight"
  | "bikini" | "secretDim" | "secretWhiteEyes" | "secretVanish" | "secretBlood" | "secretDarkBlood";

export type AtriFormConfig = {
  id: AtriFormId;
  label: string;
  slot: AtriFormSlot;
  safety: "normal" | "secret" | "debug";
  params: Record<string, number>;
  description?: string;
};

export type AtriActiveForms = Partial<Record<AtriFormSlot, AtriFormId>>;

export const defaultAtriActiveForms: AtriActiveForms = {};

export const atriForms: Record<AtriFormId, AtriFormConfig> = {
  default:        { id: "default",        label: "Default",        slot: "outfit",    safety: "normal", params: {},                                         description: "????????" },
  pajama:         { id: "pajama",         label: "Pajama",         slot: "outfit",    safety: "normal", params: { Param18: 30 } },
  pajamaPants:    { id: "pajamaPants",    label: "Pajama Pants",   slot: "bottom",    safety: "normal", params: { Param9: 30 } },
  sandals:        { id: "sandals",        label: "Sandals",        slot: "footwear",  safety: "normal", params: { Param19: 30 } },
  leatherShoes:   { id: "leatherShoes",   label: "Leather Shoes",  slot: "footwear",  safety: "normal", params: { Param20: 30 } },
  bird:           { id: "bird",           label: "Bird",           slot: "accessory", safety: "normal", params: { Param37: 30 } },
  kani:           { id: "kani",           label: "Kani",           slot: "accessory", safety: "normal", params: { Param38: 30 } },
  pillowLeft:     { id: "pillowLeft",     label: "Pillow Left",    slot: "accessory", safety: "normal", params: { Param39: -30 } },
  pillowRight:    { id: "pillowRight",    label: "Pillow Right",   slot: "accessory", safety: "normal", params: { Param39: 30 } },
  bikini:         { id: "bikini",         label: "Bikini",         slot: "outfit",    safety: "secret", params: { Param17: 30 } },
  secretDim:      { id: "secretDim",      label: "Dim",            slot: "effect",    safety: "secret", params: { Param10: 30 } },
  secretWhiteEyes:{ id: "secretWhiteEyes",label: "White Eyes",     slot: "debug",     safety: "debug",  params: { Param22: 30 } },
  secretVanish:   { id: "secretVanish",   label: "Vanish",         slot: "debug",     safety: "debug",  params: { Param31: 30 } },
  secretBlood:    { id: "secretBlood",    label: "Blood",          slot: "debug",     safety: "debug",  params: { Param36: 30 } },
  secretDarkBlood:{ id: "secretDarkBlood",label: "Dark Blood",     slot: "debug",     safety: "debug",  params: { Param36: 30, Param10: 30, Param21: 30 } },
};

export const SLOTS: AtriFormSlot[] = ["outfit", "bottom", "footwear", "accessory", "effect", "debug"];

export function getFormsBySlot(slot: AtriFormSlot): AtriFormConfig[] {
  return Object.values(atriForms).filter((f) => f.slot === slot);
}
