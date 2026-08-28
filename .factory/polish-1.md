# Polish round 1 — Audio Reflection Markers

Candidate repaired from `f2915bcbd07a378d4fac868ea97f9b44a897dc19`.

Local visual evidence: `.factory/polish-1-mobile.png` (390 × 844) and `.factory/polish-1-desktop.png` (1440 × 900). Live mobile evidence: `.factory/polish-1-live-mobile.png`. All show the rewritten first screen and isolated `?demo=1` banner.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Replaced the first-screen copy with the required listener/audience wording and added the one-click sample action plus result text. | `@claim:demo-isolation`; mobile screenshot |
| F-1-2 | Added `/demo` and `?demo=1`, `demo:reflection-markers`, `demo:arm-source`, seeded lecture markers, banner, reset, and Start for real. | `@claim:demo-isolation` |
| F-1-3 | Kept the offline fact only with `offline-reload` in claims and a worker-controlled offline reload proof. | `@claim:offline-reload` |
| F-1-4 | Reworded the badge/fact as browser storage and added local-only request and IndexedDB proof. | `@claim:local-only` |
| F-1-5 | Rewrote the source note to reference-only/manual-timer language and proved no external fetch plus a 15-second manual advance. | `@claim:reference-only-manual-timer` |
| F-1-6 | Rewrote local-file copy and asserted local media mounts with no upload request. | `@claim:local-file-no-upload` |
| F-1-7 | Replaced the broad footer promise with tested plain facts; privacy account/analytics copy has its own proof. | `@claim:no-account-or-analytics` |
| F-1-8 | Added styled `404.html`, response override, strict-host 404 response, and route test. | `shows a designed 404 response for an unknown route` |
| F-1-9 | Removed malformed-backup `console.error`; save/delete/clear now wait for IndexedDB transaction completion before navigation. | `invalid backup gives a recovery message without a console error` |
| F-1-10 | Added canonical, description, Open Graph, Twitter metadata, social card, robots sitemap, and per-route title checks. | `sets page titles, metadata, legal links, and demo focus for each route` |
| F-1-11 | Added Demo/Mark audio/Privacy navigation, visible Data action, and complete footer on all pages. | route metadata/link test; screenshots |
| F-1-12 | Replaced the slogan headline with `Mark useful moments in audio`. | mobile screenshot; copy audit |
| F-1-13 | Replaced the eyebrow with `Save a listening marker`. | mobile screenshot; copy audit |
| F-1-14 | Replaced the node metaphor with `No markers yet` / `Save your first marker`. | desktop browser suite |
| F-1-15 | Removed vague `Private by design`; concrete privacy facts are tested instead. | `@claim:local-only` |
| F-1-16 | Renamed the control `Export markers`. | capture/export browser test |
| F-1-17 | Removed artwork provenance from task UI; provenance remains in design documentation. | landing screenshot |
| F-1-18 | Rewrote the README introduction in plain language. | `.factory/copy-audit.md` |
| F-1-19 | Replaced `synced timer` with `manual timer` in README and app. | `@claim:reference-only-manual-timer` |
| F-1-20 | Rewrote recall-flow README wording in plain language. | `.factory/copy-audit.md` |
| F-1-21 | Replaced storage implementation jargon in README. | `.factory/copy-audit.md` |
| F-1-22 | Rewrote the offline README statement in user language and kept its claim proof. | `@claim:offline-reload` |
| F-1-23 | Rewrote privacy README wording in plain language. | `.factory/copy-audit.md`; `@claim:no-account-or-analytics` |
| F-1-24 | Rewrote local-file README wording in plain language. | `@claim:local-file-no-upload` |
| F-1-25 | Rewrote browser/voice README wording in plain language. | `.factory/copy-audit.md` |

## Full local evidence

- `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, and `npm run test:update` passed.
- `npm run test:e2e` passed 30 checks at desktop and 390 px, including Axe serious/critical = 0, offline reload, route/title/404 checks, malformed-backup console recovery, and every claim.
- Strict preview headers returned 404 for `/does-not-exist`; the app JS is 19.1 KB raw and CSS 17.5 KB raw.

## Live re-check

Deployment `81521017-0ca9-4727-9f90-7b316670de48` was opened cold at <https://audio-reflection-markers.sociobot.in/?demo=1>. The 390 px Chromium check confirmed the sample marker, persistent banner/reset/start-real controls, only same-origin initial requests, zero Axe serious/critical findings, an activated service worker, offline reload, and no console errors. <https://audio-reflection-markers.sociobot.in/does-not-exist> returned HTTP 404 and the styled `This page is not here` page, including after the service worker controlled the browser. Root, demo, privacy, terms, sitemap, and share metadata all returned successfully.
