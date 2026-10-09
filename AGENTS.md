# Luomo Cloud Homepage — Agent Guide

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on **port 7891** (`next dev -H 0.0.0.0 -p 7891`) |
| `npm run build` | `next build` |
| `npm run start` | Production on port 7891 |
| `npm run typecheck` | Generates Next route types and runs TypeScript without emitting files |
| `npm test` | Vitest suite |
| `npm run smoke` | HTTP smoke test (needs dev server running) |
| `npm run check:no-secrets` | Scans source/config directories and `.next/server` + `.next/static` for secret markers, skipping `.env*` files |
| `npm run visual:check` | Playwright screenshots in `output/playwright/tNNN/` (needs a running server + Chromium, or `PLAYWRIGHT_CHANNEL=msedge`) |
| `node scripts/inspect-live2d-models.mjs` | Reports mounted Live2D capabilities; missing private assets exit non-zero |

The read-only workflow at `.github/workflows/ci.yml` runs the secret scan,
Vitest and production build. The optional CI upgrade in `docs/ci-upgrade-t003.patch` adds explicit typecheck and HTTP/browser regression; it needs workflow write permission. There is no linter or formatter
configuration.

## Architecture

- **Next.js 16** App Router, **React 19**, TypeScript, Tailwind CSS, PostCSS
- **Vitest** for the test suite; GitHub Actions runs the read-only CI checks
- **Path alias**: `@/*` → project root
- **Single-page app** with 8 scroll sections orchestrated by `components/home/HomeShell.tsx` and `content/sections.ts`
- **Homepage section metadata** single source of truth: `content/sections.ts` (ids are anchors, nav labels and companion lines)
- **Homepage styling**: CSS Modules next to each component in `components/home/`; design tokens (night + `[data-theme="light"]` summer theme), buttons, native dialog and companion panel styles in `app/globals.css`.
- **Client state**: localStorage keys live in `KEYS` (`lib/home/store.ts`); components talk through `window` CustomEvents (`luomo:toast`, `luomo:achievement`, `luomo:progress-reset`, `luomo:companion-open`, …). Pure logic in `lib/home/*` is unit-tested in `tests/home-logic.test.ts`.
- **SSR determinism**: anything rendered on the server must not depend on unrounded `Math.sin/cos` output or `Math.random`; use the seeded LCG + 0.1 rounding pattern in `LineMap.tsx` / `BannerArt.tsx`, or render after mount.
- **Fonts**: `app/fonts/*.woff2` are generated subsets (OFL, licenses in `app/fonts/licenses/`). New CJK copy needs `node subset-fonts.mjs` in the external `tools/` directory, otherwise new glyphs fall back to system fonts. The Smiley Sans subset must keep its renamed family (*Luomo Station Display*) because of its Reserved Font Names.

### Directory layout

| Path | Purpose |
|---|---|
| `app/` | Pages + API routes |
| `app/api/*/route.ts` | 5 API routes: `health`, `status`, `services`, `companions`, `atri/brain` |
| `components/home/` | Homepage shell, sections (`sections/`), system layer (`system/`), code-drawn art (`art/`) |
| `components/` | Companion dock, Live2D, ATRI, `ui/Modal.tsx`, `ServiceStatusProvider.tsx` |
| `lib/home/` | Wish pity, moon phase, omikuji, affection, achievements, quick save, sound, storage |
| `lib/` | Business logic (status checking, ATRI brain, Live2D controls, companion registry) |
| `content/` | Section metadata (`sections.ts`), stations, wish banners/pool, CG gallery, backlog, companions |
| `scripts/` | Utility scripts (smoke test, secret scan, visual check, model inspection) |
| `public/live2d/` | README plus optional private Live2D runtime assets (ATRI, Murasame, Allium) |
| `docs/live2d-model-capabilities.md` | Model parameter reference |

### Debug pages

- `/live2d-test` — Live2D model + expression/motion/form/brain debug UI (development only)
- `/atri-brain-test` — ATRI brain API debug (development only)

### Key API routes

- `GET /api/health` → `{ status: "ok" }`
- `GET /api/status` → LuomoHome self-status
- `GET /api/services` → Fetches live health of all 5 backend services
- `GET /api/companions` → Reports runtime presence of the Cubism core and mounted companion model files
- `POST /api/atri/brain` → ATRI chatbot (configurable provider via `ATRI_BRAIN_PROVIDER` env)

## Version

`package.json` version follows rolling date format `YYYY.M.D` (e.g. `2026.6.24`). The `v7.0.1` migration marker in `LuomoCompanionDock.tsx` is frozen — do not change.

## Setup & env

Copy `.env.example` → `.env`. The `.env` file is gitignored and contains real secrets (API tokens). `check:no-secrets` scans tracked dirs for accidental leaks.

The default local port is `7891`. If it is occupied, start a development
server on an alternate loopback port and point checks at it:

```bash
npx next dev -H 127.0.0.1 -p 37891
BASE_URL=http://127.0.0.1:37891 npm run smoke
VISUAL_CHECK_URL=http://127.0.0.1:37891 npm run visual:check
```

## Key gotchas

- **`app/page.tsx` exports `dynamic = 'force-dynamic'`** — prefetching/caching assumptions may break
- **No eslint/prettier config** — avoid commands like `npm run lint`
- **Playwright** is a development dependency; install its browser once with `npx playwright install chromium`. A compatible system browser can be selected with `PLAYWRIGHT_EXECUTABLE_PATH`.
- **`pixi.js` and `pixi-live2d-display` are transpiled** via `transpilePackages` in next.config.js
- **Docker**: `docker compose up` exposes port 7891 on `127.0.0.1` only, uses external network `luomocore_default`
- **ATRI Brain**: falls back to scripted responses when `ATRI_BRAIN_PROVIDER` is unset or remote fails; safety filter blocks dangerous requests server-side
- **Animation**: prefer `transform`/`opacity` for animated positioning; every looping animation needs a `prefers-reduced-motion` fallback
- **Hidden references**: homepage copy alludes to games/anime without naming them; keep new copy in the same implicit style

## Deployed at

<https://luomo.moe>

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
