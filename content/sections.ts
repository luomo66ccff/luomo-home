export const SECTIONS = [
  { id: "hero",                   label: "Cloud Core",          navLabel: "Hero",         companionLine: "欢迎抵达 Luomo Cloud。ATRI 已在云端灯塔下苏醒。" },
  { id: "visual-world",           label: "Visual World",        navLabel: "Visual World",  companionLine: "这里收藏着星光、樱花、海风和未完成的梦。" },
  { id: "service-constellation",  label: "Service Gates",       navLabel: "Constellation", companionLine: "五道星门围绕云核运转，航路全部校准完成。" },
  { id: "operations-cockpit",     label: "Operations Cockpit",  navLabel: "Ops Cockpit",   companionLine: "状态信号正在同步。ATRI 会守住这片安静的云海。" },
  { id: "infrastructure-orbit",   label: "Infrastructure Orbit",navLabel: "Infra Orbit",   companionLine: "底层轨道正在缓慢运行，就像海面下的发电机。" },
  { id: "build-log",              label: "Build Chronicle",     navLabel: "Build Log",     companionLine: "每一条构建记录，都是写进记忆日志的一页。" },
  { id: "enter-cloud",            label: "Final Gate",          navLabel: "Enter Cloud",   companionLine: "Final Gate 已展开。请选择你的下一段航路。" },
] as const;

export type SectionId = typeof SECTIONS[number]["id"];
