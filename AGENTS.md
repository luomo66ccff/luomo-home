# Luomo Cloud Homepage — Agent Guide

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on **port 7891** (`next dev -H 0.0.0.0 -p 7891`) |
| `npm run build` | `next build` |
| `npm run start` | Production on port 7891 |
| `npm run smoke` | Smoke test (needs dev server running) |
| `npm run check:no-secrets` | Scans app/, components/, lib/, scripts/, public/, .next/server for secrets |
| `npm run visual:check` | Playwright screenshot tests (needs dev server + `npx playwright install`) |

No linter, formatter, test framework, or CI config exists.

## Architecture

- **Next.js 14** App Router, TypeScript, Tailwind CSS, PostCSS
- **Path alias**: `@/*` → project root
- **Single-page app** with 7 scroll sections orchestrated by `components/HomeShell.tsx` and `content/sections.ts`
- **Scene metadata** single source of truth: `lib/scenes.ts`
- **Section width pattern**: content containers use `mx-auto max-w-[1280px] px-6 lg:px-10`; reusable via `components/layout/SectionContainer.tsx`

### Directory layout

| Path | Purpose |
|---|---|
| `app/` | Pages + API routes |
| `app/api/*/route.ts` | 4 API routes: `health`, `status`, `services`, `atri/brain` |
| `components/` | React components (ui/, effects/, visual/, live2d/, atri/, layout/, motion/) |
| `lib/` | Business logic (status checking, ATRI brain, Live2D controls, companion registry) |
| `content/` | Copy text (`copy.ts`) and section metadata (`sections.ts`) |
| `scripts/` | Utility scripts (smoke test, secret scan, visual check) |
| `styles/tokens.css` | CSS custom properties design tokens |
| `public/live2d/` | Live2D model files (ATRI, Murasame, Allium) |
| `docs/live2d-model-capabilities.md` | Model parameter reference |
| `app-backup-20260622/` | Old backup, ignore |

### Debug pages

- `/live2d-test` — Live2D model + expression/motion/form/brain debug UI
- `/atri-brain-test` — ATRI brain API debug

### Key API routes

- `GET /api/health` → `{ status: "ok" }`
- `GET /api/status` → LuomoHome self-status
- `GET /api/services` → Fetches live health of all 5 backend services
- `POST /api/atri/brain` → ATRI chatbot (configurable provider via `ATRI_BRAIN_PROVIDER` env)

## Version

`package.json` version follows rolling date format `YYYY.M.D` (e.g. `2026.6.24`). The `v7.0.1` migration marker in `LuomoCompanionDock.tsx` is frozen — do not change.

## Setup & env

Copy `.env.example` → `.env`. The `.env` file is gitignored and contains real secrets (API tokens). `check:no-secrets` scans tracked dirs for accidental leaks.

## Key gotchas

- **`app/page.tsx` exports `dynamic = 'force-dynamic'`** — prefetching/caching assumptions may break
- **No eslint/prettier config** — avoid commands like `npm run lint`
- **`pixi.js` and `pixi-live2d-display` are transpiled** via `transpilePackages` in next.config.js
- **Docker**: `docker compose up` exposes port 7891 on `127.0.0.1` only, uses external network `luomocore_default`
- **ATRI Brain**: falls back to scripted responses when `ATRI_BRAIN_PROVIDER` is unset or remote fails; safety filter blocks dangerous requests server-side
- **InfrastructureOrbit RAF animation**: uses `transform` (not `left`/`top`) for smooth orbit — always prefer `transform` for RAF-driven positioning

## Deployed at

<https://luomo.moe>
