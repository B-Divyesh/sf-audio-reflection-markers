# Polish 4 — Audio Reflection Markers

Date: 2026-08-29  
Base reviewed: `95b71c54f2f48ac3217ed55ce833e5ae2ec1efd1`  
Review applied: `4e0d20e52207dc9fd5a78659b6de4c00a7657015`

## Repair

Added the missing `demo-sample-content` contract. The demo test now enters a fresh `/demo` route, proves exactly two seeded MIT OpenCourseWare lecture markers in the isolated demo database and UI, proves the advertised recall cue, and preserves the first-marker/cue/Review action above the 390 px fold. The claim appears in `.factory/claims.json`, where it is linked to exactly one tagged test.

The product version is `1.0.4`. The catalog line is now the verb-first, 69-character sentence: “Mark podcast and lecture moments, then save one short cue to revisit.”

## Cumulative finding map

| Finding | Change retained or made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained the job-first headline, named podcast and lecture listeners, and the first-screen sample action/result. | `@claim:demo-sample-content`; `polish-4-live/screenshot-mobile.png`; live `/` |
| F-1-2 | Retained direct isolated demo routes, `demo:` storage, banner, reset, and exit. | `@claim:demo-isolation`; live `/demo` |
| F-1-3 | Retained the qualified offline fact and service-worker reload path. | `@claim:offline-reload`; live `/demo` cold/offline check |
| F-1-4 | Retained browser-only marker storage and request/namespace proof. | `@claim:local-only` |
| F-1-5 | Retained reference-only source links and the manual timer wording. | `@claim:reference-only-manual-timer` |
| F-1-6 | Retained local playback with no upload. | `@claim:local-file-no-upload` |
| F-1-7 | Retained discrete account, analytics, payment, and media-boundary claims. | `@claim:no-account-or-analytics`, `@claim:no-payment-or-account`, `@claim:no-remote-media-processing`, `@claim:no-media-copying-or-sharing` |
| F-1-8 | Retained the designed status-404 response configuration and page. | browser 404 tests; live unknown route |
| F-1-9 | Retained visible malformed-backup recovery without a console error. | `invalid backup gives a recovery message without a console error` |
| F-1-10 | Retained per-route titles, canonical/share metadata, sitemap, and social image. | `sets page titles, metadata, legal links, and demo focus for each route`; live route audit |
| F-1-11 | Retained desktop links, 44 px phone Menu, and consistent versioned footer. | `mobile navigation keeps every product destination reachable`; live routes |
| F-1-12 | Retained `Mark useful moments in audio` as the home h1. | live `/`; copy audit |
| F-1-13 | Retained `Save a listening marker` as the factual first label. | live `/`; copy audit |
| F-1-14 | Retained `No markers yet` and `Save your first marker`. | `@claim:delete-all-markers` |
| F-1-15 | Retained the concrete browser-storage fact. | `@claim:local-only` |
| F-1-16 | Retained `Export markers` and explicitly named downloads. | `@claim:marker-export` |
| F-1-17 | Kept asset provenance in design documentation, outside the task screen. | copy audit; live `/` |
| F-1-18 | Retained the short, plain README introduction. | `.factory/copy-audit.md` |
| F-1-19 | Retained `manual timer` terminology throughout. | `@claim:reference-only-manual-timer`; copy audit |
| F-1-20 | Retained plain cue-first review wording. | `@claim:reveal-first-review`; copy audit |
| F-1-21 | Retained browser-language storage wording. | `@claim:local-only`; copy audit |
| F-1-22 | Retained the tested offline wording. | `@claim:offline-reload`; copy audit |
| F-1-23 | Retained specific privacy wording rather than implementation jargon. | `@claim:no-account-or-analytics`, `@claim:no-remote-media-processing` |
| F-1-24 | Retained the exact local-file-on-reload boundary. | `@claim:local-file-session-only` |
| F-1-25 | Retained tested Chromium scope and typed voice fallback. | `@claim:voice-unavailable-typed-fallback` |
| F-2-1 | Retained marker-first phone demo presentation and made it a declared claim. | `@claim:demo-sample-content`; `polish-4-live/screenshot-mobile.png` |
| F-2-2 | Retained typed capture and optional local voice-note coverage. | `@claim:capture-marker`, `@claim:local-voice-note` |
| F-2-3 | Retained recall-cue/date and cue-first review-result coverage. | `@claim:recall-cue-and-date`, `@claim:reveal-first-review` |
| F-2-4 | Retained Markdown/CSV/JSON exports and isolated backup import. | `@claim:marker-export`, `@claim:backup-import` |
| F-2-5 | Retained voice-locality/no-network proof and typed fallback. | `@claim:local-voice-note`, `@claim:voice-unavailable-typed-fallback` |
| F-2-6 | Retained `Manage marker data` as the result-naming control. | browser suite; copy audit |
| F-2-7 | Retained `Audio source` and `Saved markers` section labels. | browser suite; live `/` |
| F-2-8 | Retained favicon, Apple-touch icon, and complete legal/404 share metadata. | route metadata test; live route audit |
| F-2-9 | Retained the precise local-file lifetime statement. | `@claim:local-file-session-only`; copy audit |
| F-3-1 | Retained the working MIT OpenCourseWare source and timestamp URLs. | `demo sample source links return a successful response`; live source-link check |
| F-3-2 | Retained the accessible 44 px phone Menu. | `mobile navigation keeps every product destination reachable`; live mobile |
| F-3-3 | Retained only the tested reload lifetime promise. | `@claim:local-file-session-only`; copy audit |
| F-3-4 | Retained direct 404 recovery wording. | browser 404 test; live unknown route |
| F-3-5 | Retained route heading focus, live announcement, and history focus behavior. | `home navigation moves focus and announces the route on forward and back` |
| F-3-6 | Retained `How it works` and privacy-limit sections. | live `/`; `polish-4-live/screenshot-desktop.png` |
| F-3-7 | Retained `Show due markers` and `Show all markers`. | browser suite; copy audit |
| F-3-8 | Retained the direct cue-first review heading. | `@claim:reveal-first-review`; copy audit |
| F-3-9 | Retained the direct review outcome prompt. | `@claim:reveal-first-review`; copy audit |
| F-3-10 | Retained `Manage marker data` as the settings heading. | browser suite; copy audit |
| F-3-11 | Retained precise marker/voice-note storage copy. | `@claim:local-only`, `@claim:local-voice-note` |
| F-3-12 | Retained `cue` as the sole recall-prompt term. | browser suite; copy audit |
| F-3-13 | Retained `Reload` as the update action’s static and runtime accessible name. | `npm run test:update` |
| F-3-14 | Retained 44 px targets for visible phone controls. | `mobile visible controls meet the 44px touch-target baseline`; live mobile |
| F-4-1 | **Added** the `demo-sample-content` claim and one fresh `/demo` tagged test for two markers and a recall cue. | `npm run test:e2e -- --grep @claim:demo-sample-content`; live `/demo` |

## Verification evidence

- Clean-clone evidence and deployed live evidence are recorded in `.factory/handoff.md`.
- `polish-4-local/verify.json` and its desktop/mobile screenshots record the final local build check.
- `polish-4-live/verify.json` and its desktop/mobile screenshots record the final cold live check.
- The live URL checks cover `/`, `/demo`, `/privacy/`, `/terms/`, `/404.html`, `robots.txt`, `sitemap.xml`, manifest, icons, and an unknown URL returning HTTP 404.
