import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Braces,
  CloudCog,
  Compass,
  Files,
  Globe2,
  Sparkles,
  Terminal,
} from "lucide-react";

export type HomeProject = {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  status: string;
  stack: string[];
  accent: "cyan" | "rose" | "mint" | "gold";
  icon: LucideIcon;
  preview: string[];
};

export const HOME_PROJECTS: HomeProject[] = [
  {
    title: "LuomoOps",
    subtitle: "云端驾驶舱",
    description: "把状态、日常运维、事件记录和服务心跳收束进一个安静的控制面。",
    href: "https://ops.luomo.moe",
    status: "Online",
    stack: ["Next.js", "Monitoring", "Docker"],
    accent: "cyan",
    icon: CloudCog,
    preview: ["health.sync()", "incident.watch", "tokyo-node: green"],
  },
  {
    title: "LuomoFile",
    subtitle: "私人文件星港",
    description: "面向图片、临时分享和私有上传的文件服务，默认克制，必要时开放。",
    href: "https://file.luomo.moe",
    status: "Maintained",
    stack: ["FastAPI", "Storage", "Private Share"],
    accent: "rose",
    icon: Files,
    preview: ["upload.private", "share.ttl = 24h", "route.storage"],
  },
  {
    title: "LuomoTerminal",
    subtitle: "远程终端桥",
    description: "把 SSH、SFTP 和项目操作入口连接到同一套个人云服务轨道。",
    href: "https://terminal.luomo.moe",
    status: "Access Gate",
    stack: ["SSH", "SFTP", "Ops"],
    accent: "mint",
    icon: Terminal,
    preview: ["ssh luomo@node", "docker compose ps", "logs --follow"],
  },
];

export const ABOUT_SIGNALS = [
  { label: "Build", body: "把零散想法做成真的能访问、能维护、能复用的服务。", icon: Braces },
  { label: "Explore", body: "AI、服务器、前端视觉、自动化和二次元文化都可以进同一片云。", icon: Compass },
  { label: "Connect", body: "luomo.moe 是入口，也是把项目、文件、API 与角色陪伴连起来的坐标。", icon: Globe2 },
  { label: "Create", body: "持续迭代，不追求一次完美，只让每次部署都更像自己。", icon: Sparkles },
];

export const FOOTER_LINKS = [
  { label: "LuomoOps", href: "https://ops.luomo.moe" },
  { label: "LuomoFile", href: "https://file.luomo.moe" },
  { label: "LuomoAPI", href: "https://api.luomo.moe" },
  { label: "Terminal", href: "https://terminal.luomo.moe" },
  { label: "AstrBot", href: "https://atri-api.luomo.moe", icon: Bot },
];
