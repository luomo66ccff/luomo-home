export const SECTIONS = [
  { id: "hero", label: "云端首页", navLabel: "首页", companionLine: "欢迎抵达 Luomo Cloud，云端的灯为你亮着。" },
  { id: "services", label: "服务入口", navLabel: "服务", companionLine: "在这里，选择你的下一站。" },
  { id: "projects", label: "项目手记", navLabel: "项目", companionLine: "把一个小小的想法，慢慢做成可以使用的作品。" },
  { id: "operations", label: "运行状态", navLabel: "状态", companionLine: "服务信号正在同步，我们一起看看吧。" },
  { id: "worlds", label: "视觉漫游", navLabel: "漫游", companionLine: "这里收藏着星光、樱花、海风和未完成的梦。" },
  { id: "about", label: "关于洛墨", navLabel: "关于", companionLine: "代码之外，也要给喜欢的事物留一个位置。" },
  { id: "build", label: "构建记录", navLabel: "构建", companionLine: "每一条构建记录，都是写进记忆的一页。" },
  { id: "enter", label: "下一站", navLabel: "出发", companionLine: "下一段旅程，由你来选择。" },
] as const;
export type SectionId = typeof SECTIONS[number]["id"];
