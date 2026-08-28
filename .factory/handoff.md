# Handoff — Audio Reflection Markers

## Latest independent verification: PASS

Verifier work order `audio-reflection-markers-verify-2` independently approved candidate `737651318323b9b0559b27c33e9df8fa726a38c8` at <https://audio-reflection-markers.sociobot.in> on 2026-08-28. A fresh detached checkout passed `npm ci`, lint, unit tests, the exact production build, all 10 desktop/390px end-to-end tests, and the service-worker update regression. The live shell and core assets hash-match the candidate; a fresh production worker activated and offline reload worked.

Fresh live Lighthouse mobile scores were Performance 100, Accessibility 100, Best Practices 100, SEO 100 (FCP/LCP 0.9 s, TBT 0 ms, CLS 0). The only open item is P3: malformed JSON backup recovery logs an otherwise caught SyntaxError to the console. It is non-blocking and preserves data. Full evidence and the exact test matrix are in `.factory/verification-2.md`.

## Builder repair record

Repair work order `audio-reflection-markers-repair-1` remediated every finding in verifier commit `50c0faad74c6099643a9b1075dd6e11ff868bdf8` for candidate `18ffc7c53a5f647f012c52b93f95cd57e03e078c`. The repaired static PWA was deployed to <https://audio-reflection-markers.sociobot.in> on 2026-08-28 using `/opt/fleet/lib/deploy-static.sh audio-reflection-markers dist` (final Azure deployment ID `2bca33cf-64fc-4fbd-ad67-5d2c7b7c8bec`). No release-blocking gaps remain.

## Repairs

- **P1 service-worker installation:** the old `generateBundle` hook saw empty Rollup facade chunks before Vite removed them and cached nonexistent `privacy-*.js` and `terms-*.js`. The worker is now generated in `closeBundle` from files actually present in `dist/assets`. Its cache version is a SHA-256-derived content version covering the shell and emitted assets.
- **Exact precache guard:** every build parses `dist/sw.js`, maps each precache URL to its deployed file, and fails if any target is missing. A strict production server returns real 404s for absent assets instead of Vite preview’s SPA fallback. The repaired list has 13/13 valid URLs; neither phantom facade is present.
- **Offline and updates:** fresh Chromium contexts now reach an activated worker and controller before offline reload. A two-version browser regression replaces the worker, observes `updatefound`, and verifies the in-app “An app update is ready” / “Reload” action. `skipWaiting` and `clientsClaim` are also enforced by the artifact check.
- **Response policies:** `staticwebapp.config.json` is now shipped for Azure Static Web Apps. Hashed `/assets/*` responses are one-year immutable, `/sw.js` is `no-cache`, `.webmanifest` is `application/manifest+json`, and CSP plus Permissions-Policy are present. `_headers` carries equivalent portable policy.
- **Quality gates:** added strict TypeScript-aware ESLint, a post-build artifact/policy check, desktop plus exact 390×844 browser projects, and response-policy assertions.

The researched brief, visual thesis, local-first data model, existing product flows, artwork, deployment class, and all previously passing behavior are unchanged.

## Clean local verification

Run from a clean dependency install:

```bash
npm ci
npm run lint
npm test
npm run build
npm run test:e2e
npm run test:update
```

Results on 2026-08-28:

- `npm ci`: 143 packages audited, 0 vulnerabilities.
- `npm run lint`: passed across `src`, `tests`, and both TypeScript configs.
- `npm test`: 1 Vitest file, 5/5 assertions passed.
- `npm run build`: strict `tsc --noEmit` passed; Vite produced `dist/index.html`; 13 precache URLs and Azure policies verified.
- Production budgets: app JS 16.7 KB raw, CSS 15.8 KB raw, largest image 9.7 KB raw; all below 200/50/300 KB limits.
- `npm run test:e2e`: 10/10 Playwright tests passed on Chromium at 1440×900 and 390×844. Coverage includes capture/persist/recall/export, local-file mounting, axe, activated-controller offline reload, strict-host precache integrity, manifest MIME, immutable caching, CSP, and Permissions-Policy.
- `npm run test:update`: passed using two real service-worker versions; update notice and Reload action appeared after 2 worker requests.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, no console errors, title/lang/main present, exactly one `h1`, no missing alt text, and no unlabeled buttons.
- Axe via Playwright: 0 serious or critical violations at both desktop and 390px viewports.
- Keyboard: skip link exposes a 3px solid focus ring and moves to `#main`; tab arrows select/focus the adjacent source; `M` opens capture with focus in the takeaway; Escape closes it. Reduced-motion uses `0.00001s` transitions and `scroll-behavior: auto`.
- Visual review: 1440×900 and 390×844 screenshots showed intentional stacking, no horizontal overflow, no obscured controls, and preserved memory-orbit identity.
- Privacy: observed requests were same-origin only; no analytics, third-party scripts/fonts, uploads, or remote media processing. IndexedDB/localStorage/object-URL behavior is unchanged.
- Lighthouse 13.0.1 against the live site: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 0.9 s, TBT 0 ms, CLS 0, interactive 0.9 s.
- Package/consumer checks are not applicable: this is a private static PWA, not a published package.

## Live verification and identity

A new desktop context and a new 390×844 context both reported an `activated` registration and controller, then reloaded the full app after network isolation and displayed “Working offline.” All 13 live precache URLs returned HTTP 200. Both contexts had zero console/page errors and only same-origin requests.

Live response evidence:

- `/assets/app-Csm3HaSu.js`: `Cache-Control: public, max-age=31536000, immutable`.
- `/manifest.webmanifest`: `Content-Type: application/manifest+json`; `Cache-Control: public, max-age=3600`.
- `/sw.js`: `Cache-Control: no-cache`.
- `/`: CSP begins `default-src 'self'`; Permissions-Policy permits microphone only to self and disables camera, geolocation, payment, and USB.

Local and live SHA-256 hashes match:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `9cce31bb1cc44c92980f4d609b85cecb772b4c8a5792718613d9cabeff6742fb` |
| `sw.js` | `ee5f027f281e6c356f202fd44f3868176acab9cb198bcea7cabd09dea8ed52f3` |
| `manifest.webmanifest` | `54e2da7c8a42c580f41b1a52f2831239f89c0af6885eb08250248814f6580c7e` |
| `assets/app-Csm3HaSu.js` | `e82d804cee7683a392024b8de6d3961a39523334ae8c5385a509dacbf7a062c1` |

## Known product constraints

- Browsers require the user to select a local media file again after restart; saved markers remain available.
- Voice recording depends on browser `MediaRecorder` support and permission; typed capture remains available.
- “Check again” is an in-app due state, not a push notification.
- Only YouTube references receive an appended timestamp; other source links reopen unchanged because timestamp formats vary.
