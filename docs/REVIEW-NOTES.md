# Issue 2 remediation notes

Issue #2 reviewed an older snapshot and mixed concrete defects with optional
architecture suggestions. This note records the disposition used for the public
release.

| Finding | Disposition |
| --- | --- |
| C1 Docker build | Replaced with a cached multi-stage Node 22 build, standalone output, and a non-root runtime. The ignore list now excludes VCS data, environment files, build output, private assets, and logs. |
| C2 password SSH deploy | Resolved by removing automatic production deployment from the public workflow. CI has read-only repository permissions and performs checks only. |
| H1 client safety flags | Fixed. The API accepts only a small context schema; secret forms come from a server environment switch and debug forms are impossible in production. |
| H2 test coverage | Added Node's built-in test runner for message safety, form policy, recursive redaction, origin checks, client identity, and rate limiting. |
| H3 payload redaction | Replaced the shallow filter with bounded, recursive, cycle-safe object and array sanitization. |
| H4 API abuse controls | Added same-origin validation, a bounded per-client request bucket, `Retry-After`, and no-store responses. Edge rate limiting is still recommended for multi-instance deployments. |
| M1 service fallbacks | Retained intentionally because this is Luomo's personal portal. Every endpoint remains configurable through environment variables for forks. |
| M2 browser logging | Removed high-frequency render and switch logs. Live2D informational logs are bounded and silent in production unless explicitly enabled. |
| M3 CSS size | Not treated as a security defect. New page-specific work already lives in `HomeExperience.module.css`; further extraction should happen alongside visual regression tests. |
| M4 external command URLs | Added HTTPS and `luomo.moe` host validation plus `noopener,noreferrer`. |
| M5 error boundary | Added the App Router `app/error.tsx` boundary with an in-place retry. |
| M6 duplicate services | Removed the unused client registry; `lib/services.ts` remains the single active source. |
| L1 broad `any` types | Removed them from the Brain API boundary and key UI callbacks. A few remain around untyped PIXI/Live2D runtime objects. |
| L2 timer cleanup | No change. The reported `HomeShell` timer already cleaned itself up and the current component no longer contains it. |
| L3 metadata | Added a canonical URL and structured personal-site data. Search-engine verification stays deployment-specific. |
| L4 dead component | Removed `HolographicCloudCore.tsx`. |
| Repository size | Removed non-redistributable Live2D assets from the public tree and Git history. Runtime assets now use a private read-only Compose mount. |

The review's statement that `COPY . .` always includes ignored files was not
technically correct; Docker honors `.dockerignore`. The old ignore list was too
narrow, however, so the resulting hardening was still necessary.
