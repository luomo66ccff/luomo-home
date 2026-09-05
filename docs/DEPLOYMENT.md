# Deployment Guide

This runbook keeps Luomo Home private at the origin: the container publishes to
loopback and a reverse proxy or Cloudflare Tunnel provides the public hostname.

## Prerequisites

- Linux host with Docker Engine and Compose v2
- Node.js 22 for local checks and builds (the image uses Node.js 22)
- Existing `luomocore_default` Docker network, or an equivalent network name
- A DNS/Tunnel route for the chosen public hostname
- Separately licensed Live2D runtime assets if the companion canvas is enabled

## Prepare configuration

```bash
git clone https://github.com/luomo66ccff/luomo-home.git
cd luomo-home
cp .env.example .env
docker network inspect luomocore_default >/dev/null 2>&1 || \
  docker network create luomocore_default
```

Review every URL in `.env`. `LUOMO_*_URL` values are server-only probe origins;
public destination links are defined in `lib/services.ts`. Keep `ATRI_BRAIN_PROVIDER=scripted` unless an
authenticated bridge is ready. Generate and store bridge credentials outside
Git; never add them to a `NEXT_PUBLIC_*` variable.

## Private Live2D assets

The repository does not redistribute models or Cubism Core. Place licensed
runtime files under `/opt/luomo-home-assets/live2d` and set:

```dotenv
LUOMO_HOME_LIVE2D_PATH=/opt/luomo-home-assets/live2d
```

Compose mounts the directory read-only at `/app/public/live2d`. Without it, the
site remains usable and the companion component falls back to its static state.

## Build and start

```bash
npm ci
npm run typecheck
npm test
npm run check:no-secrets
docker compose config
docker compose build
docker compose up -d
curl --fail http://127.0.0.1:7891/health
```

The image uses a multi-stage Node 22 build and runs the standalone Next.js
server as the unprivileged `node` account.

## Local port conflict

The development and production commands use port `7891` by default. If that
port is already in use, start a loopback-only development server on `37891`
and pass the same address to the checks:

```bash
npx next dev -H 127.0.0.1 -p 37891
BASE_URL=http://127.0.0.1:37891 npm run smoke
VISUAL_CHECK_URL=http://127.0.0.1:37891 npm run visual:check
```

Install the Playwright browser before running visual checks:

```bash
npx playwright install chromium
```

## Public route

Point the public hostname to `http://127.0.0.1:7891` through the existing
reverse proxy or a named Cloudflare Tunnel. Do not publish port 7891 on all
interfaces. Configure the trusted proxy to set `Host`, `X-Forwarded-Host`,
`X-Forwarded-For`, and `X-Forwarded-Proto` from its validated connection and
hostname. Overwrite client-supplied forwarding headers rather than forwarding
them unchanged; the ATRI endpoint uses these headers for same-origin and
per-client controls. The application rate limiter is per process; multi-instance
deployments need a shared limiter at the proxy or edge for an aggregate limit.

`/live2d-test` and `/atri-brain-test` are development diagnostics and return 404
in production. `/api/companions` checks the current read-only model mount; it
does not expose filesystem paths or load missing model scripts in the browser.

## Update and rollback

```bash
git pull --ff-only
npm ci
npm test
docker compose build
docker compose up -d
```

For rollback, check out a known commit, rebuild, and verify both `/health` and
the homepage before retaining that revision. Database migration steps are not
needed because Luomo Home stores no application database.
