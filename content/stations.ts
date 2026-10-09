import { SERVICES, type ServiceMeta } from "@/lib/services";

export type Station = ServiceMeta & {
  stop: string;
  title: string;
  summary: string;
  flavor: string;
  host: string;
  /** Position on the 1000 × 420 line map. */
  x: number;
  y: number;
};

const EXTRA: Record<string, Omit<Station, keyof ServiceMeta | "host">> = {
  ops: { stop: "空间站", title: "监控空间站", summary: "系统状态、DailyOps、事件记录与监控。", flavor: "天才们的空间站，也需要有人值夜班。", x: 150, y: 268 },
  file: { stop: "星槎海", title: "文件星港", summary: "文件、图片、临时分享与存储路由。", flavor: "货物与回忆，都在这里靠岸。", x: 345, y: 136 },
  api: { stop: "白日梦", title: "酒店前台", summary: "API 路由、密钥、权限范围与开发者接入。", flavor: "请收好您的房卡。祝您好梦。", x: 545, y: 278 },
  terminal: { stop: "磐岩镇", title: "地下控制室", summary: "Web SSH、SFTP、FTPS、Docker 快捷操作与项目运维。", flavor: "地火未熄，隧道一直通往更深处。", x: 742, y: 132 },
  atri: { stop: "海边小镇", title: "机器人邮局", summary: "机器人 API 桥接与自动化接口。", flavor: "「我可是高性能的！」——偶尔也需要睡上一觉。", x: 900, y: 262 },
};

export const STATIONS: Station[] = SERVICES.map(service => ({
  ...service,
  ...EXTRA[service.id],
  host: new URL(service.url).host,
}));
