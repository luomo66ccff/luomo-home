export type ServiceMeta = {
  id: string;
  code: string;
  name: string;
  worldName: string;
  description: string;
  url: string;
  statusUrl: string;
  healthUrl: string;
  tags: string[];
  accent: "cyan" | "mint" | "pink" | "purple" | "gold" | "blue";
};

const env = (key: string, fallback: string) => process.env[key] || fallback;

export const SERVICES: ServiceMeta[] = [
  {
    id: "ops",
    code: "SYS-01",
    name: "LuomoOps",
    worldName: "Cloud Status Cockpit",
    description: "System status, DailyOps, incidents, and monitoring.",
    url: env("LUOMO_OPS_URL", "https://ops.luomo.moe"),
    statusUrl: `${env("LUOMO_OPS_URL", "https://ops.luomo.moe")}/api/public/status`,
    healthUrl: `${env("LUOMO_OPS_URL", "https://ops.luomo.moe")}/health`,
    tags: ["status", "dailyops", "monitoring"],
    accent: "cyan"
  },
  {
    id: "file",
    code: "SYS-02",
    name: "LuomoFile",
    worldName: "Private File Constellation",
    description: "Files, images, temporary shares, and storage routing.",
    url: env("LUOMO_FILE_URL", "https://file.luomo.moe"),
    statusUrl: `${env("LUOMO_FILE_URL", "https://file.luomo.moe")}/api/public/status`,
    healthUrl: `${env("LUOMO_FILE_URL", "https://file.luomo.moe")}/health`,
    tags: ["files", "storage", "private"],
    accent: "pink"
  },
  {
    id: "api",
    code: "SYS-03",
    name: "LuomoAPI",
    worldName: "Developer Gateway",
    description: "API routes, keys, scopes, and developer access.",
    url: env("LUOMO_API_URL", "https://api.luomo.moe"),
    statusUrl: `${env("LUOMO_API_URL", "https://api.luomo.moe")}/api/public/status`,
    healthUrl: `${env("LUOMO_API_URL", "https://api.luomo.moe")}/health`,
    tags: ["gateway", "keys", "developer"],
    accent: "purple"
  },
  {
    id: "terminal",
    code: "SYS-04",
    name: "LuomoTerminal",
    worldName: "Operations Bridge",
    description: "Web SSH, SFTP, FTPS, Docker shortcuts, and project operations.",
    url: env("LUOMO_TERMINAL_URL", "https://terminal.luomo.moe"),
    statusUrl: `${env("LUOMO_TERMINAL_URL", "https://terminal.luomo.moe")}/api/public/status`,
    healthUrl: `${env("LUOMO_TERMINAL_URL", "https://terminal.luomo.moe")}/health`,
    tags: ["terminal", "sftp", "ops"],
    accent: "mint"
  },
  {
    id: "atri",
    code: "SYS-06",
    name: "AstrBot API",
    worldName: "Bot Interface",
    description: "Bot API bridge and automation interface.",
    url: env("LUOMO_ATRI_API_URL", "https://atri-api.luomo.moe"),
    statusUrl: `${env("LUOMO_ATRI_API_URL", "https://atri-api.luomo.moe")}/api/public/status`,
    healthUrl: `${env("LUOMO_ATRI_API_URL", "https://atri-api.luomo.moe")}/health`,
    tags: ["bot", "automation", "bridge"],
    accent: "blue"
  }
];

export const TECH_STACK = [
  "Cloudflare Tunnel",
  "Docker Compose",
  "FastAPI",
  "Next.js",
  "SQLite",
  "R2 / COS",
  "SSH / SFTP",
  "AstrBot",
  "Ops Monitoring"
];