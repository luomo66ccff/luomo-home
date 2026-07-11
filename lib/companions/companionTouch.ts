import type { CompanionId } from "./companionRegistry";

export type CompanionTouchArea =
  | "head" | "face" | "hair" | "hand" | "body"
  | "outfit" | "step" | "accessory" | "guarded" | "unknown";

export type CompanionTouchReaction = {
  lines: string[];
  mood?: string;
  expression?: string;
  motion?: string;
  voice?: string;
};

export type CompanionTouchPayload = {
  companionId: CompanionId;
  area: CompanionTouchArea;
  nativeHitAreas?: string[];
  x?: number;
  y?: number;
};

export const nativeHitAreaMap: Record<string, CompanionTouchArea> = {
  Head: "head",
  Face: "face",
  Hair: "hair",
  Body: "body",
  Hand: "hand",
};

export const companionTouchReactions: Record<CompanionId, Partial<Record<CompanionTouchArea, CompanionTouchReaction>>> = {
  atri: {
    head: { lines: ["唔……头部传感器被轻轻触碰了。", "ATRI 收到摸头信号，心情参数上升中。"], mood: "curious", expression: "expression3", motion: "dec-l" },
    face: { lines: ["请、请不要一直盯着 ATRI 的脸看啦。", "面部距离过近，ATRI 会有点不好意思。"], mood: "welcome", expression: "expression2", motion: "model" },
    body: { lines: ["机体外壳状态良好，触摸反馈正常。", "嗯，我在这里，云端连接稳定。"], mood: "focused", expression: "expression4", motion: "model" },
    hand: { lines: ["要牵手吗？ATRI 会认真导航的。"], mood: "excited", expression: "expression5", motion: "dec-r" },
    unknown: { lines: ["ATRI 感觉到了轻轻的点击。", "收到互动信号，我会继续陪着你。"], mood: "idle", expression: "expression1", motion: "model" },
  },
  murasame: {
    head: { lines: ["大胆，竟敢摸本座的头……不过这次就准了。", "哼，若是供奉的话，本座便勉强收下。"], mood: "curious", expression: "exp3.exp3", motion: "Taphair" },
    face: { lines: ["离得太近了，主人。礼数还是要守的。"], mood: "warning", expression: "exp4.exp3", motion: "Tapface" },
    body: { lines: ["结界无恙，本座也无恙。", "主人，巡守之时可不能分心。"], mood: "idle", expression: "exp1.exp3", motion: "Idle" },
    unknown: { lines: ["本座听见了。有什么吩咐？", "风声回应了你的触碰。"], mood: "welcome", expression: "exp2.exp3", motion: "Tapface" },
  },
  allium: {
    head: { lines: ["顶部感应区域已触发，Allium 正在记录互动样本。", "触摸反馈已写入数据花园。"], mood: "curious" },
    body: { lines: ["巡航终端状态稳定。", "收到触摸事件，风险扫描继续运行。"], mood: "focused" },
    unknown: { lines: ["Allium online。互动信号已确认。", "收到你的输入，云图保持展开。"], mood: "idle" },
  },
};

export function pickTouchLine(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)] || "";
}

export function mapNativeHitArea(hitAreas?: string[]): CompanionTouchArea {
  const hit = hitAreas?.find((item) => nativeHitAreaMap[item]);
  return hit ? nativeHitAreaMap[hit] : "unknown";
}

export function fallbackAreaFromNormalizedPoint(x: number, y: number): CompanionTouchArea {
  if (y < 0.34) return x > 0.28 && x < 0.72 ? "head" : "hair";
  if (y < 0.52) return "face";
  if (y < 0.78) return "body";
  return "step";
}

export function getCompanionTouchReaction(companionId: CompanionId, area: CompanionTouchArea): CompanionTouchReaction {
  const reactions = companionTouchReactions[companionId] || companionTouchReactions.atri;
  return reactions[area] || reactions.unknown || { lines: ["收到互动信号。"] };
}
