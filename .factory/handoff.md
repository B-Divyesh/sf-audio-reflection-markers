# Polish round 2 handoff — Audio Reflection Markers

## Status

Complete. Every finding in `.factory/review-1.md` and `.factory/review-2.md` is mapped in `.factory/polish-2.md` and has implementation plus evidence. No known product, accessibility, privacy, offline, routing, metadata, copy, mobile, or claim gap remains in scope.

Production: <https://audio-reflection-markers.sociobot.in>

Demo: <https://audio-reflection-markers.sociobot.in/?demo=1>

Deployment: `b0f881b6-50c9-45f8-961a-036d5341b303`

## What changed

- Made demo entry marker-first on phones. A complete timestamp, takeaway, cue, and Review action now appear above the 844px fold.
- Fixed `/demo/` to use the `demo:` database and source key, not the real namespace.
- Kept the persistent demo banner, reset, and real-mode exit; Start for real now clears demo data.
- Expanded `.factory/claims.json` from 7 to 19 claims. Each has exactly one tagged test and an observable sandbox outcome.
- Added tests for capture, fixture voice storage/playback, cue/date, reveal/result, Markdown/CSV/JSON export, valid import, typed fallback, remote-media privacy, file cleanup, microphone timing, deletion, and media boundaries.
- Renamed `Data` to `Manage marker data`; replaced the `desk` and `ledger` labels with `Audio source` and `Saved markers`.
- Completed SVG favicon, manifest, Apple-touch, Open Graph, and Twitter metadata on legal and 404 pages.
- Narrowed README statements to what the suite proves and updated the verb-first 73-character catalog description.
- Added an early demo-mode bootstrap to prevent layout shift while keeping the orbital listening-room identity intact.

## Exact verification

Verified from a fresh local clone of commit `881eb73528cf996914ab212c0778d3ee95d9ea07`:

```bash
npm ci
npm run lint
npm test
npm run build
# Every `test` command in .factory/claims.json, run independently
npm run test:e2e
npm run test:update
```

Results:

- Dependencies: 142 installed, 0 vulnerabilities.
- Unit: 5 passed.
- Claims: 19 independent commands; 38 passed executions across desktop and 390px projects.
- Browser/integration/accessibility/privacy/offline: 57 passed, 1 intentional desktop skip for the mobile-only fold assertion, 0 failed.
- Axe: 0 serious or critical violations at desktop and mobile widths.
- Update lifecycle: passed after 2 service-worker requests.
- Strict static artifact: 16 precache URLs and Azure response policies passed.
- Main JS: 19.6 KB raw; CSS: 18.5 KB raw.
- Lighthouse mobile demo: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.7 s, CLS 0.003, TBT 20 ms.
- Local `verify-url.sh`: title, `lang`, one h1, main landmark, alt text, button labels, and console checks passed.

Production was then opened in a fresh 390 × 844 Chromium profile. The live audit confirmed:

- v1.0.2 and the marker-first sample layout;
- the sample card and Review action above the initial fold;
- isolated demo IndexedDB with an empty real marker store;
- same-origin requests only and zero console/page errors;
- Axe serious/critical = 0;
- service-worker-controlled offline reload with sample data;
- correct titles, canonical/share/icon metadata, and h1 focus on Privacy and Terms;
- a styled HTTP 404 for `/does-not-exist`;
- 200 responses for home, demo, legal routes, sitemap, robots, social card, favicon, and manifest.

Evidence:

- `.factory/polish-2.md`
- `.factory/polish-2-mobile.png`
- `.factory/polish-2-desktop.png`
- `.factory/lighthouse-polish-2.json`
- `.factory/verify-local/verify.json`
- `.factory/verify-live/verify.json`

## Run and deploy

Use Node.js 20 or newer.

```bash
npm ci
npm run dev
npm run build
npm run preview
```

The work-order static deployment uses `npm ci && npm test && npm run build` and uploads `dist/` with `/opt/fleet/lib/deploy-static.sh audio-reflection-markers dist`.

## Known gaps and next steps

None for the reviewed scope. Browser automation is intentionally described as Chromium-only; the README makes no unverified Firefox or Safari promise.
