export const SECTIONS = [
  { id: "hero", label: "0 号站台", navLabel: "站台", companionLine: "欢迎来到洛墨站。列车还要一会儿才发车，先四处看看吧。" },
  { id: "services", label: "星轨航图", navLabel: "航图", companionLine: "五座站点，一条线路。想先去哪一站？" },
  { id: "operations", label: "发车信息", navLabel: "发车", companionLine: "正点、晚点还是停运，信息板上都写着呢。" },
  { id: "projects", label: "祈愿", navLabel: "祈愿", companionLine: "要抽一发吗？就算歪了，我也不会告诉别人的。" },
  { id: "about", label: "吉他、孤独与蓝色星球", navLabel: "乐队", companionLine: "代码之外，也要给喜欢的东西留一个位置。" },
  { id: "worlds", label: "CG 鉴赏", navLabel: "CG", companionLine: "这些风景，都是旅途中替你拍下来的。" },
  { id: "log", label: "已读记录", navLabel: "LOG", companionLine: "往回翻一翻，能看到这座车站一点点长大的样子。" },
  { id: "enter", label: "终点站 · 喫茶", navLabel: "喫茶", companionLine: "到站啦。要来一杯吗？" },
] as const;
export type SectionId = typeof SECTIONS[number]["id"];
