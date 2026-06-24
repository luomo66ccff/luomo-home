export type CompanionId = "atri" | "murasame" | "allium";


export type CompanionLayout = {
  width?: number;
  height?: number;
  targetHeightRatio: number;
  xRatio: number;
  yRatio: number;
  offsetX: number;
  offsetY: number;
  minScale: number;
  maxScale: number;
};
export interface CompanionProfile {
  id: CompanionId;
  displayName: string;
  shortName: string;
  tagline: string;
  modelPath: string;
  defaultLines: string[];
  sectionLines?: Record<string, string>;
  serviceHoverLines?: Record<string, string>;
  capability: { chat: boolean; brain: boolean };
  layout: CompanionLayout;
  mobileLayout?: CompanionLayout;
}

export const companionOrder: CompanionId[] = ["atri", "murasame", "allium"];

const companionProfiles: Record<CompanionId, CompanionProfile> = {
  atri: {
    id: "atri", displayName: "ATRI", shortName: "ATRI",
    tagline: "终端桥接已就绪",
    modelPath: "/live2d/atri/atri_8.model3.json",
    sectionLines: {"hero": "主控台运转正常。", "gallery": "星门画廊的每扇窗都映着不同的世界。"},
  serviceHoverLines: {"ops": "监控系统正在记录一百零七条航线。", "terminal": "终端桥接保持畅通。"},
    defaultLines: [
      "欢迎回来，主人。ATRI 已从待机模式苏醒。",
      "五道星门正在发光，我会继续守在这里。",
      "云端航路已重新点亮。请下达今天的第一条指令。",
      "记忆日志同步完成。没有异常，也没有遗失。",
      "今天的云端很安静，适合继续前进。",
    ],
    capability: { chat: true, brain: true },
    layout: { width: 320, height: 460, targetHeightRatio: 0.72, xRatio: 0.58, yRatio: 0.96, offsetX: 0, offsetY: 0, minScale: 0.08, maxScale: 1.1 },
    mobileLayout: { targetHeightRatio: 0.58, xRatio: 0.58, yRatio: 0.98, offsetX: 0, offsetY: 8, minScale: 0.04, maxScale: 0.75 },
  },
  murasame: {
    id: "murasame", displayName: "丛雨", shortName: "丛雨",
    tagline: "风之精灵……吗？",
    modelPath: "/live2d/companions/murasame/Murasame.model3.json",
    defaultLines: [
      "丛雨，前来报到。请多指教。",
      "主人，云上结界已然展开。本座会替你守住此处。",
      "既然唤醒了本座，今日的星门巡查便不可偷懒。",
      "此处虽非穗织之乡，却也有星河如祭灯般明灭。",
      "风声很轻，云气也稳。主人，此刻正宜静观。",
      "若有异动，本座自会替你斩断它。",
    ],
    capability: { chat: false, brain: false },
    layout: { width: 320, height: 460, targetHeightRatio: 0.66, xRatio: 0.60, yRatio: 0.99, offsetX: 8, offsetY: 12, minScale: 0.06, maxScale: 0.72 },
    mobileLayout: { targetHeightRatio: 0.56, xRatio: 0.58, yRatio: 1.00, offsetX: 0, offsetY: 10, minScale: 0.04, maxScale: 0.62 },
  },
  allium: {
    id: "allium", displayName: "Allium", shortName: "Allium",
    tagline: "数据花园的守护者",
    modelPath: "/live2d/companions/allium/ariu/ariu.model3.json",
    defaultLines: [
      "Allium 系统已就绪。",
      "Allium online。战术云图已展开，等待你的指令。",
      "接口同步完成。今日的巡航路线已经标记。",
      "系统风向稳定，云端航道清晰。",
      "低噪巡航中。当前没有异常信号。",
      "机能模块自检完毕。我会负责前方的风险扫描。",
    ],
    capability: { chat: false, brain: false },
    layout: { width: 320, height: 460, targetHeightRatio: 0.54, xRatio: 0.62, yRatio: 0.99, offsetX: 12, offsetY: 12, minScale: 0.04, maxScale: 0.62 },
    mobileLayout: { targetHeightRatio: 0.46, xRatio: 0.60, yRatio: 1.00, offsetX: 0, offsetY: 10, minScale: 0.03, maxScale: 0.56 },
  },
};

export function getCompanionProfile(id: CompanionId | string | null | undefined): CompanionProfile {
  if (id === "murasame") return companionProfiles.murasame;
  if (id === "allium") return companionProfiles.allium;
  return companionProfiles.atri;
}
