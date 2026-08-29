# Polish round 2 — Audio Reflection Markers

Candidate repaired from `b65ee7da9151548597757bd9c6713f5ba75ac624`; cumulative review source `fc1f65f17fae5fdb3d144bd55a4c96973785f222`.

Local visual evidence: `.factory/polish-2-mobile.png` (390 × 844) and `.factory/polish-2-desktop.png` (1440 × 900). Live evidence: `.factory/verify-live/screenshot-mobile.png`, `.factory/verify-live/screenshot-desktop.png`, and `.factory/verify-live/verify.json`.

## Cumulative finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the job-first headline, named podcast and lecture listeners, and retained the adjacent one-click sample action. | Live `/`; live screenshots; first-screen copy audit. |
| F-1-2 | Kept `?demo=1`, fixed direct `/demo/` detection, separated `demo:` storage, retained the banner/reset controls, and made Start for real clear demo data. | `@claim:demo-isolation`; live cold storage audit. |
| F-1-3 | Retained the offline fact with worker-controlled offline reload proof. | `@claim:offline-reload`; live offline reload. |
| F-1-4 | Retained browser-storage wording with persistence, request-log, and namespace proof. | `@claim:local-only`. |
| F-1-5 | Kept reference-only/manual-timer copy and added reload persistence proof without fetching the source. | `@claim:reference-only-manual-timer`. |
| F-1-6 | Kept the local-file privacy statement and proved local playback, same-origin GETs, and no restoration after reload. | `@claim:local-file-no-upload`; `@claim:local-file-session-only`. |
| F-1-7 | Kept only specific account, analytics, upload, and processing statements with matching request/UI tests. | `@claim:no-account-or-analytics`; `@claim:no-remote-media-processing`. |
| F-1-8 | Preserved the designed 404 and Azure 404 response override. | `shows a designed 404 response for an unknown route`; live `/does-not-exist` = 404. |
| F-1-9 | Kept invalid backup errors in the UI without logging user-input parse failures. | `invalid backup gives a recovery message without a console error`; live console errors = 0. |
| F-1-10 | Preserved route titles, descriptions, canonical, OG/Twitter metadata, social card, robots, and sitemap. | `sets page titles, metadata, legal links, and demo focus for each route`; live route audit. |
| F-1-11 | Preserved Demo/Mark audio/Privacy navigation and complete versioned footers. | Route metadata test; live v1.0.2 check. |
| F-1-12 | Kept `Mark useful moments in audio` as the home h1. | Live `/`; `.factory/copy-audit.md`. |
| F-1-13 | Kept `Save a listening marker` as the plain first-screen label. | Live `/`; `.factory/copy-audit.md`. |
| F-1-14 | Kept `No markers yet` and `Save your first marker`. | `@claim:delete-all-markers`. |
| F-1-15 | Kept the concrete `Markers stay in this browser` fact. | `@claim:local-only`. |
| F-1-16 | Kept `Export markers` with explicit Markdown and CSV results. | `@claim:marker-export`. |
| F-1-17 | Kept generator provenance out of the task screen and in design documentation. | Live screenshots; `.factory/design.md`. |
| F-1-18 | Kept the two short README opening sentences. | `.factory/copy-audit.md`. |
| F-1-19 | Kept `manual timer` everywhere; no `synced timer` remains. | `@claim:reference-only-manual-timer`; copy audit. |
| F-1-20 | Kept plain review wording and proved the reveal/result sequence. | `@claim:reveal-first-review`; copy audit. |
| F-1-21 | Kept browser-language storage wording in user-facing docs. | `@claim:local-only`; copy audit. |
| F-1-22 | Narrowed the README to the tested result: `Works offline after the first visit.` | `@claim:offline-reload`; copy audit. |
| F-1-23 | Replaced implementation jargon with tested account, analytics, upload, and media-processing facts. | `@claim:no-account-or-analytics`; `@claim:no-remote-media-processing`. |
| F-1-24 | States that a local file lasts only until reload or close, with an observable cleanup test. | `@claim:local-file-session-only`. |
| F-1-25 | Removed API and unverified multi-browser language; documented Chromium automation and the typed fallback. | `@claim:voice-unavailable-typed-fallback`; copy audit. |
| F-2-1 | Added a compact demo h1 and marker-first phone layout; the first full sample card, cue, and Review action end at y=454 before the 844px fold. | `demo opens with a complete sample marker in the phone viewport`; mobile screenshots; live cold audit. |
| F-2-2 | Added separate typed-capture and fixture voice-note claim contracts with rendered-card, IndexedDB, playback, and request assertions. | `@claim:capture-marker`; `@claim:local-voice-note`. |
| F-2-3 | Added claim contracts for cue/date storage and cue-first review/result persistence. | `@claim:recall-cue-and-date`; `@claim:reveal-first-review`. |
| F-2-4 | Added downloads/content proof for Markdown, CSV, JSON including voice data, plus isolated valid-backup import. | `@claim:marker-export`; `@claim:backup-import`. |
| F-2-5 | Proved fixture voice storage/no-network behavior and unsupported-recorder typed fallback; narrowed README browser support to tested Chromium. | `@claim:local-voice-note`; `@claim:voice-unavailable-typed-fallback`. |
| F-2-6 | Renamed `Data` to `Manage marker data` on both app entry documents. | Live cold audit; mobile/desktop screenshots. |
| F-2-7 | Replaced `Listening desk / live` and `Reflection ledger` with `Audio source` and `Saved markers`. | Live cold audit asserts old labels absent; screenshots. |
| F-2-8 | Added SVG favicon, manifest, Apple-touch icon, and full share metadata to legal and 404 pages. | Route metadata test; live legal/404 audit. |
| F-2-9 | Reworded README privacy precisely and added remote-processing and reload cleanup claim tests. | `@claim:no-remote-media-processing`; `@claim:local-file-session-only`. |

## Verification evidence

- Fresh clone at `881eb73528cf996914ab212c0778d3ee95d9ea07`: `npm ci`, `npm run lint`, `npm test`, and `npm run build` passed.
- Every command in `.factory/claims.json` ran independently: 19 claims × 2 viewports = 38 passed claim executions.
- Fresh-clone full browser run: 57 passed, 1 intentional desktop skip for the mobile-only fold assertion; zero failures.
- `npm run test:update`: passed after two service-worker requests.
- Build budgets: main JS 19.6 KB raw; CSS 18.5 KB raw; all 16 precache URLs verified.
- Lighthouse mobile demo: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.7 s, CLS 0.003, TBT 20 ms. Raw report: `.factory/lighthouse-polish-2.json`.
- Local verifier: title/lang/one h1/main/alt/button labels passed; zero console errors. Evidence: `.factory/verify-local/verify.json`.
- Deployment `b0f881b6-50c9-45f8-961a-036d5341b303` published to <https://audio-reflection-markers.sociobot.in>.
- Cold live 390 × 844 audit: complete sample marker and Review action above fold, real store empty, demo store isolated, same-origin requests only, Axe serious/critical 0, console errors 0, offline reload passed.
- Live Privacy/Terms metadata and focus passed; unknown route returned the styled HTTP 404; all internal route/assets checked returned 200.

No review finding remains unresolved.
