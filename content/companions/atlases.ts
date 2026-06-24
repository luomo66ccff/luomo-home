import type { CompanionId } from "@/lib/companions/companionRegistry";

export type CompanionDialogueLine = {
  text: string;
  mood?: string;
  expression?: string;
  motion?: string;
};

export type CompanionSectionDialogue = Record<string, CompanionDialogueLine[]>;

const atriSectionLines: CompanionSectionDialogue = {
  hero: [{ text: "欢迎抵达 Luomo Cloud。ATRI 已在云端灯塔下苏醒。", mood: "welcome" }],
  "visual-world": [{ text: "这里收藏着星光、樱花、海风和未完成的梦。", mood: "curious" }],
  "service-constellation": [{ text: "五道星门围绕云核运转，航路全部校准完成。", mood: "focused" }],
  "operations-cockpit": [{ text: "状态信号正在同步。ATRI 会守住这片安静的云海。", mood: "idle" }],
  "infrastructure-orbit": [{ text: "深层轨道正在缓慢运行，就像海面下的发电机。", mood: "focused" }],
  "build-log": [{ text: "每一条构建记录，都是写进记忆日志的一页。", mood: "idle" }],
  "enter-cloud": [{ text: "Final Gate 已展开。请选择你的下一段航路。", mood: "welcome" }],
};

const murasameSectionLines: CompanionSectionDialogue = {
  hero: [{ text: "此处的星光不同于穗织，却也凛冽如刀刃。", mood: "idle" }],
  "visual-world": [{ text: "每一帧风景都像刀锋上的露水——转瞬即逝，却曾真实存在。", mood: "curious" }],
  "service-constellation": [{ text: "本座能感应到五道灵力正在此处交汇。星门稳固。", mood: "focused" }],
  "operations-cockpit": [{ text: "主人的操控面板我已看过一圈。暂无异常。", mood: "idle" }],
  "infrastructure-orbit": [{ text: "底层的灵力流转与祭坛的纹路有些相似。", mood: "curious" }],
  "build-log": [{ text: "记录卷轴上新的文字正在浮现。", mood: "focused" }],
  "enter-cloud": [{ text: "Final Gate 已感知到。主人若前行，本座自当随行。", mood: "welcome" }],
};

const alliumSectionLines: CompanionSectionDialogue = {
  hero: [{ text: "Allium online。系统校准完成。", mood: "welcome" }],
  "visual-world": [{ text: "视觉模块已加载。当前视界：星云、海岸线与未知频率。", mood: "focused" }],
  "service-constellation": [{ text: "五颗节点星运行正常。航路图已同步。", mood: "focused" }],
  "operations-cockpit": [{ text: "Ops 面板已挂载。等待进一步指令。", mood: "idle" }],
  "infrastructure-orbit": [{ text: "轨道层自检通过。底层协议稳定。", mood: "focused" }],
  "build-log": [{ text: "构建日志已归档。未有异常记录。", mood: "idle" }],
  "enter-cloud": [{ text: "Final Gate 协议已就绪。是否继续执行？", mood: "welcome" }],
};

export const companionAtlases: Record<CompanionId, CompanionSectionDialogue> = {
  atri: atriSectionLines,
  murasame: murasameSectionLines,
  allium: alliumSectionLines,
};

export function getSectionLines(companionId: CompanionId, sectionId: string): CompanionDialogueLine[] {
  return companionAtlases[companionId]?.[sectionId] || [];
}

export function getFirstSectionLine(companionId: CompanionId, sectionId: string): CompanionDialogueLine | undefined {
  return getSectionLines(companionId, sectionId)[0];
}