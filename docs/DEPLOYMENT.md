# Deployment Guide

## Architecture

All services run on a single Tencent Cloud VM and are exposed via Cloudflare Tunnel.

## Prerequisites

- Ubuntu 24.04 server
- Docker + Docker Compose
- Cloudflare Tunnel token
- Domain: luomo.moe (managed on Cloudflare)

## Setup

### 1. Clone and build

```bash
git clone https://github.com/luomo66ccff/luomo-home.git
cd luomo-home
docker compose build --no-cache
docker compose up -d
```

### 2. Cloudflare Tunnel

```bash
# Install cloudflared
sudo cloudflared service install YOUR_TUNNEL_TOKEN

# Config is at /etc/cloudflared/config.yaml
sudo systemctl restart cloudflared
```

### 3. DNS

Add CNAME records in Cloudflare DNS pointing each domain to:
```
your_tunnel_id.cfargotunnel.com
```

### 4. Verify

```bash
curl https://luomo.moe/health
curl https://api.luomo.moe/health
```

## Service Ports

| Service | Internal Port | Container |
|---------|--------------|-----------|
| LuomoHome | 7891 | luomo-home |
| LuomoAPI Hub | 8790 | luomoapi-hub |
| LuomoFile Hub | 8791 | luomofile-hub |
| LuomoCore | 8787 | luomocore |
| LuomoTerminal | 8793 | luomoterminal |
| Error Pages | 8090 | nginx (static) |
| Live Dashboard | 3001 | live-dashboard |

## Update

```bash
cd /opt/luomo-home
git pull
docker compose build --no-cache
docker compose up -d
```

## Rollback

```bash
cd /opt/luomo-home
git revert HEAD
docker compose build --no-cache
docker compose up -d
```
