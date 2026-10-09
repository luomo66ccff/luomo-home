import type { WishItem, WishPool } from "@/lib/home/wish";

export type BannerArt = "ops" | "file" | "terminal" | "api" | "live2d" | "album";

export type Banner = {
  id: string;
  art: BannerArt;
  name: string;
  epithet: string;
  event: string;
  description: string;
  href: string;
  host: string;
  stack: string[];
  preview: string[];
  accent: string;
};

export const BANNERS: Banner[] = [
  {
    id: "ops", art: "ops", name: "LuomoOps", epithet: "云端的值夜人", event: "监控空间站 · 限定",
    description: "把服务心跳、日常运维和事件记录收进一个安静的控制面。看得清楚，才能从容维护。",
    href: "https://ops.luomo.moe", host: "ops.luomo.moe", stack: ["Next.js", "Monitoring", "Docker"],
    preview: ["health.sync()", "incident.watch --quiet", "tokyo-node: green"], accent: "#8fd3ff",
  },
  {
    id: "file", art: "file", name: "LuomoFile", epithet: "私人星港", event: "星槎海 · 限定",
    description: "面向图片、临时分享和私有上传的文件服务。默认克制，必要时开放。",
    href: "https://file.luomo.moe", host: "file.luomo.moe", stack: ["FastAPI", "Storage", "Private Share"],
    preview: ["upload --private", "share.ttl = 24h", "route.storage()"], accent: "#f6a5c0",
  },
  {
    id: "terminal", art: "terminal", name: "LuomoTerminal", epithet: "地下的舰桥", event: "磐岩镇 · 限定",
    description: "把 SSH、SFTP 和项目操作入口接到同一条线路上。需要的时候，立刻回到现场。",
    href: "https://terminal.luomo.moe", host: "terminal.luomo.moe", stack: ["SSH", "SFTP", "Docker"],
    preview: ["ssh luomo@node", "docker compose ps", "logs --follow"], accent: "#8be3b5",
  },
  {
    id: "api", art: "api", name: "LuomoAPI", epithet: "美梦的前台", event: "白日梦 · 限定",
    description: "统一的接口入口，整理密钥、权限与调用路径，让下一个小工具更容易开始。",
    href: "https://api.luomo.moe", host: "api.luomo.moe", stack: ["Gateway", "Keys", "Scopes"],
    preview: ["POST /v1/keys", "scope: read:status", "rate.limit = calm"], accent: "#c49cff",
  },
  {
    id: "live2d", art: "live2d", name: "Hikari 展示馆", epithet: "会眨眼的女孩", event: "常驻 · 展示馆",
    description: "一位 Live2D 角色的网页展示馆：表情、动作与换装，都可以直接在浏览器里看到。",
    href: "https://live2d.luomo.moe/Amahane_Hikari/", host: "live2d.luomo.moe", stack: ["Live2D Cubism", "WebGL", "PixiJS"],
    preview: ["model.load(hikari)", "expression = smile", "physics: on"], accent: "#ffcf6b",
  },
  {
    id: "album", art: "album", name: "三月的相簿", epithet: "总爱拍照的女孩", event: "同人 · 映像册",
    description: "为一位粉发、爱拍照、名字是个日期的女孩做的同人小站。纸本编辑式的映像册，收着很多回忆。",
    href: "https://march7th.cn/", host: "march7th.cn", stack: ["Next.js", "Editorial", "同人"],
    preview: ["album.open(3, 7)", "photo.develop()", "memory: kept"], accent: "#ff9ec7",
  },
];

const FOUR: WishItem[] = [
  { id: "ticket", rarity: 4, name: "夜行专票（已检）", blurb: "背面写着：「愿此行，终抵群星。」" },
  { id: "mango", rarity: 4, name: "纸箱（完熟芒果）", blurb: "里面好像有人。请不要敲。" },
  { id: "lilies", rarity: 4, name: "红与蓝的彼岸花", blurb: "总是一起出现，谁也离不开谁。" },
  { id: "butterfly", rarity: 4, name: "发光的蓝蝴蝶", blurb: "停在指尖的那一刻，好像想起了某个夏天。" },
  { id: "ramune", rarity: 4, name: "岛上的波子汽水", blurb: "玻璃珠卡在瓶口，叮当作响。" },
  { id: "omamori", rarity: 4, name: "温泉街的御守", blurb: "背面绣着一把小小的刀。" },
  { id: "ciallo", rarity: 4, name: "一次「Ciallo～」", blurb: "(∠・ω< )⌒★ 效果：心情 +1。" },
  { id: "emergency", rarity: 4, name: "应急食品", blurb: "「才不是！」——某位飘浮的向导。" },
  { id: "pick", rarity: 4, name: "粉色吉他拨片", blurb: "上面有一点点咬过的痕迹。" },
  { id: "strawhat", rarity: 4, name: "被风吹走的草帽", blurb: "在灯塔下面找到的。帽檐上，停着一只发光的蝴蝶。" },
  { id: "heart", rarity: 4, name: "心的碎片", blurb: "据说集齐了，就能实现一个愿望。……代价，要自己承担。" },
  { id: "yuzu", rarity: 4, name: "一颗柚子", blurb: "闻起来酸酸甜甜。不知为什么，总让人想起四本书。" },
];

const THREE: WishItem[] = [
  { id: "weed", rarity: 3, name: "路边的野草", blurb: "据说某位贝斯手认为可以吃。" },
  { id: "commit", rarity: 3, name: "未提交的 commit", blurb: "保存了，但没有推。" },
  { id: "coffee", rarity: 3, name: "放凉的咖啡", blurb: "写代码的时候总会忘记它。" },
  { id: "slingshot", rarity: 3, name: "弹弓", blurb: "不知道为什么，总是它。" },
  { id: "debate", rarity: 3, name: "以理服人", blurb: "物理意义上的。" },
  { id: "dragon", rarity: 3, name: "讨龙英杰谭", blurb: "读完之后，好像更有勇气了。" },
  { id: "cache", rarity: 3, name: "Docker 镜像缓存", blurb: "占了 12 GB，舍不得删。" },
  { id: "stub", rarity: 3, name: "过期的车票", blurb: "日期是很久以前的某个夏天。" },
  { id: "morning", rarity: 3, name: "一句没说出口的早安", blurb: "下次一定。" },
  { id: "window", rarity: 3, name: "靠窗的空座位", blurb: "上一位乘客是个白头发的女孩子，玻璃上还留着她画的星星。" },
  { id: "dango", rarity: 3, name: "一串团子", blurb: "一家人，要整整齐齐的。" },
];

export function wishPool(): WishPool {
  return {
    five: BANNERS.map(banner => ({ id: banner.id, rarity: 5 as const, name: banner.name, blurb: banner.epithet, href: banner.href })),
    four: FOUR,
    three: THREE,
  };
}

export function findWishItem(id: string): WishItem | undefined {
  const pool = wishPool();
  return [...pool.five, ...pool.four, ...pool.three].find(item => item.id === id);
}
