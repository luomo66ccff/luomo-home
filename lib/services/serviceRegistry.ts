"use client";

export type CloudService = {
  id: string;
  name: string;
  code: string;
  worldName: string;
  description: string;
  url?: string;
  statusUrl?: string;
  healthUrl?: string;
  tags: string[];
  external: boolean;
};

export const CLOUD_SERVICES: CloudService[] = [
  { id: 'ops', name: 'LuomoOps', code: 'SYS-01', worldName: 'Cloud Status Cockpit', description: 'System status, DailyOps, incidents, and monitoring.', url: 'https://ops.luomo.moe', statusUrl: 'https://ops.luomo.moe/api/public/status', healthUrl: 'https://ops.luomo.moe/health', tags: ['status', 'dailyops', 'monitoring'], external: true },
  { id: 'file', name: 'LuomoFile', code: 'SYS-02', worldName: 'Cloud Object Storage', description: 'File sharing, object storage, and secure sync.', url: 'https://file.luomo.moe', statusUrl: 'https://file.luomo.moe/api/public/status', healthUrl: 'https://file.luomo.moe/health', tags: ['files', 'storage', 'share'], external: true },
  { id: 'api', name: 'LuomoAPI', code: 'SYS-03', worldName: 'API Gateway', description: 'Public API gateway for cloud services.', url: 'https://api.luomo.moe', statusUrl: 'https://api.luomo.moe/api/public/status', healthUrl: 'https://api.luomo.moe/health', tags: ['api', 'gateway', 'developer'], external: true },
  { id: 'terminal', name: 'LuomoTerminal', code: 'SYS-04', worldName: 'Web SSH Terminal', description: 'Browser-based SSH terminal and file manager.', url: 'https://terminal.luomo.moe', statusUrl: 'https://terminal.luomo.moe/api/public/status', healthUrl: 'https://terminal.luomo.moe/health', tags: ['terminal', 'ssh', 'files'], external: true },
  { id: 'astrbot', name: 'AstrBot API', code: 'AGENT-01', worldName: 'Cloud Agent', description: 'AI-powered cloud assistant and automation agent.', tags: ['ai', 'agent', 'chat'], external: false },
];

export function getCloudService(id: string): CloudService | undefined {
  return CLOUD_SERVICES.find(s => s.id === id);
}

export const CLOUD_SERVICE_COUNT = CLOUD_SERVICES.length;