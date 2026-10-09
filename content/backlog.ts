export type BacklogEntry = { chapter: string; speaker: string; line: string; note: string };

export const BACKLOG: BacklogEntry[] = [
  { chapter: "CHAPTER 01", speaker: "洛墨", line: "先让运行状态变得清楚。", note: "LuomoOps：服务心跳、日常运维与事件记录收进同一个控制台。看得清楚，才能从容维护。" },
  { chapter: "CHAPTER 02", speaker: "洛墨", line: "给文件一个安稳的落脚点。", note: "LuomoFile：私人上传、临时分享与存储路由各自整理好，重要的资料随时找得到。" },
  { chapter: "CHAPTER 03", speaker: "洛墨", line: "把能力连接成接口。", note: "LuomoAPI：统一入口，整理密钥、权限与调用路径。" },
  { chapter: "CHAPTER 04", speaker: "洛墨", line: "让远程工作触手可及。", note: "LuomoTerminal：SSH、SFTP 与项目操作放进同一张线路图。" },
  { chapter: "CHAPTER 05", speaker: "ATRI", line: "为云端留一点陪伴——这种事，交给高性能的我就好。", note: "AstrBot API 与云端伙伴：从实用工具，延伸到机器人与对话。" },
  { chapter: "CHAPTER 06", speaker: "列车长", line: "列车换上新涂装了帕！请各位乘客重新检票。", note: "2026.10 · 洛墨站 · 夜行线：整站前端重做，素材全部重新绘制。" },
];
