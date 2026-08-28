# Independent verification 2 — PASS

Date: 2026-08-28  
Candidate: `737651318323b9b0559b27c33e9df8fa726a38c8`  
Live URL: <https://audio-reflection-markers.sociobot.in>

## Release decision

**PASS.** Fresh, independent evidence confirms that the live static PWA matches the candidate and completes the researched job: a listener can reference a link or use local media, capture a timestamped typed takeaway/cue/action date, return for a recall check, retain data locally, and export it. The production service worker now installs and controls fresh clients; first-visit offline reload works on the live host.

One non-blocking P3 console-noise defect is recorded below. There are no P0, P1, or P2 defects.

## Clean-checkout quality gates

Verification used a new detached clone at the candidate commit and a new dependency install.

| Gate | Fresh result |
| --- | --- |
| `npm ci` | 143 packages audited; 0 vulnerabilities |
| `npm run lint` | passed |
| `npm test` | passed, 1 file / 5 tests |
| `npm run build` | passed: `tsc --noEmit`, Vite production build, artifact/policy verification, and budget check |
| `npm run test:e2e` | passed, 10/10 Chromium tests at 1440×900 and 390×844 |
| `npm run test:update` | passed; two worker requests produced the update toast and Reload action |

The exact production build emitted 17.1 KB raw initial app JavaScript (16.7 KiB budget measurement), 16.2 KB raw CSS (15.8 KiB budget measurement), and a 9.9 KB largest image. These are below the 200 KB JS, 50 KB CSS, and 300 KB image budgets; no webfont payload is shipped.

## Independent product and browser exercise

Fresh hosted Chromium contexts were used, not retained local data.

- Desktop normal flow: set a `https://example.com/...` reference and title, move the synced timer, save a timestamped takeaway, recall cue, and future action date, complete a reveal-first review, and download CSV. A separate fresh run completed the review lifecycle and displayed `100% followed up`.
- Local-file flow: selected `lecture.wav`; the app mounted a local `<audio>` player and made no upload request.
- Boundary/error recovery: `00:00` saved; `4:99` stayed in the editor with “Enter a valid time such as 12:34 or 1:02:03.”; a blank typed/voice takeaway was rejected with a specific error; `not a URL` was rejected by native URL validation (“Please enter a URL.”); malformed JSON backup showed “That file is not a valid backup. Nothing was changed.” and preserved the marker.
- Content safety/export: an HTML-like takeaway rendered as literal text and created no marker-card image element. CSV was downloaded as `reflection-markers.csv`; formula-leading cells are covered by the passing unit export tests. Markdown export, persistence, local-media mounting, JSON export/import, and delete confirmation are covered by the passing end-to-end suite.
- Desktop and 390×844 screenshots were visually inspected. The mobile layout stacks intentionally with no horizontal overflow or hidden fixed controls; the primary capture control remains visible and comfortably sized.
- Keyboard/mobile accessibility: first Tab targets the skip link with a citrus `3px solid` visible outline; arrow keys switch source tabs; `M` from non-control page content opens the capture dialog and focuses the takeaway. `prefers-reduced-motion: reduce` gives marker transitions `0.00001s`. Axe returned zero serious or critical findings in the fresh 390px live context (and the clean suite passed at both viewports).
- Normal live flows produced no console or page errors. The malformed JSON recovery deliberately logs its caught parse error; see P3.

## PWA, privacy, policies, and deployment identity

- In a fresh live profile, `navigator.serviceWorker.ready` resolved and `navigator.serviceWorker.controller.state` was `activated`. After setting the browser context offline, a reload rendered the full app and `Working offline`.
- The live worker precache has 13 URLs; each independently returned production HTTP 200. It uses `no-cache`; hashed JS/CSS/WebP assets use `public, max-age=31536000, immutable`; the manifest uses `application/manifest+json` and `public, max-age=3600`.
- Root responses include CSP `default-src 'self'`, a restrictive Permissions-Policy (`camera=(), geolocation=(), microphone=(self), payment=(), usb=()`), HSTS, `nosniff`, and strict-origin referrer policy.
- Observed normal link and local-file browser requests were same-origin only. There are no runtime third-party fonts/scripts, analytics, account calls, uploads, remote-media fetches, transcription, summaries, or sharing. Markers/voice data are stored in IndexedDB; source metadata uses localStorage; local files are object URLs. This is a static PWA with no server-side API endpoint, so rate-limit testing and sign-in/Entra validation are not applicable.
- Candidate/live SHA-256 identity matches for the core deployable artifacts:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `9cce31bb1cc44c92980f4d609b85cecb772b4c8a5792718613d9cabeff6742fb` |
| `sw.js` | `ee5f027f281e6c356f202fd44f3868176acab9cb198bcea7cabd09dea8ed52f3` |
| `manifest.webmanifest` | `54e2da7c8a42c580f41b1a52f2831239f89c0af6885eb08250248814f6580c7e` |
| `assets/app-Csm3HaSu.js` | `e82d804cee7683a392024b8de6d3961a39523334ae8c5385a509dacbf7a062c1` |

## Performance

Fresh Lighthouse 13.4.1 mobile run against the live URL: Performance **100**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP **0.9 s**, LCP **0.9 s**, TBT **0 ms**, CLS **0**, interactive **0.9 s**.

## Defects

### P3 — malformed backup import logs a caught SyntaxError

Submitting malformed JSON correctly keeps existing data and gives the user the recovery message, but `importBackup(...).catch` also calls `console.error(error)`. This causes one browser console error on the intentionally invalid-input path. It does not occur on load or normal operation and does not affect user data; it is non-blocking console noise.

## Known product constraints

- A user must reselect a local media file after a browser restart; saved marker data remains local.
- Voice capture depends on browser `MediaRecorder` support and microphone permission; typed capture remains fully usable.
- Follow-up cues are in-app due states, not push notifications.
