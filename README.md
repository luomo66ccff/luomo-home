# Luomo Cloud Homepage

<div align="center">

![Luomo Cloud](https://luomo.moe/assets/hero/hero-witch-journey-generated.webp)

**A dreamy cloud gateway drifting among stars, memories, and distant journeys.**

[![Website](https://img.shields.io/badge/Web-luomo.moe-22d3ee?style=flat-square)](https://luomo.moe)
[![License](https://img.shields.io/badge/License-MIT-f472b6?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Live2D](https://img.shields.io/badge/Live2D-Cubism%204-ff69b4?style=flat-square)](https://www.live2d.com/)

</div>

---

## ✨ Features

- **🎨 Anime Cyber Visual World** — Full-screen hero with parallax depth, gallery lightbox, and animated constellation scenes
- **🤖 Live2D Companion System** — Three interactive characters (ATRI, Murasame, Allium) with speech synthesis, touch reactions, and emotion system
- **🌐 Service Constellation** — Interactive orbit visualization of cloud services (API Gateway, File Hub, Terminal, Ops Dashboard)
- **📊 Operations Cockpit** — Real-time status monitoring and infrastructure metrics
- **🏗️ Build Timeline** — Chronological project history visualizer
- **🎵 Ambient Effects** — Sakura particles, holographic grids, stardust bursts, and dynamic HUD overlays
- **📱 Mobile-First Responsive** — Fully adaptive layout with companion collapse and mobile-optimized navigation

## 🏗️ Architecture

### Cloud Infrastructure

| Service | Domain | Port | Description |
|---------|--------|------|-------------|
| Homepage | luomo.moe | 7891 | Next.js frontend with Live2D |
| API Hub | api.luomo.moe | 8790 | FastAPI developer gateway |
| File Hub | file.luomo.moe | 8791 | File storage & sharing |
| Ops | ops.luomo.moe | 8787 | Status monitoring |
| Terminal | terminal.luomo.moe | 8793 | Web SSH client |
| Error Pages | error.luomo.moe | 8090 | Custom error pages |
| ATRI API | atri-api.luomo.moe | 7891 | AI companion brain |
| Status | status.luomo.moe | 3001 | Live dashboard |

### Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS 3
- **Live2D**: pixi-live2d-display (Cubism 4) + Pixi.js
- **Runtime**: Node.js 18, Docker
- **CDN/Edge**: Cloudflare Tunnel
- **Backend**: FastAPI (Python), uvicorn

### Quick Start

`ash
git clone https://github.com/luomo66ccff/luomo-home.git
cd luomo-home
npm install
npm run dev  # Open http://localhost:7891

# Docker deployment
docker compose build --no-cache
docker compose up -d
`

### Project Structure

`
app/       — Next.js App Router pages and API routes
components/ — React components (Live2D, gallery, effects, UI)
lib/       — Core logic (companions, Live2D engine, theme)
public/    — Static assets (Live2D models, images, icons)
hooks/     — React hooks
docs/      — Documentation
`

### License

MIT (c) 2026 luomo. See LICENSE for details.
