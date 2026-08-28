# Independent verification — FAIL

Date: 2026-08-28  
Candidate: `18ffc7c53a5f647f012c52b93f95cd57e03e078c`  
Live URL: <https://audio-reflection-markers.sociobot.in>

## Release decision

**FAIL.** The deployed artifact is byte-for-byte the candidate build for the app shell, but its service worker cannot install on the production host. This breaks the required `pwa-offline` offline reload and removes the update mechanism. The core capture product otherwise works locally and the deployed shell loads correctly.

## Release-blocking defect

### P1 — production service worker installation fails

`dist/sw.js` and the live `/sw.js` both precache these paths:

```
/assets/privacy-CbXDZzyc.js
/assets/terms-CbXDZzyc.js
```

Neither file is in `dist/assets`; live requests return `404 text/html` (confirmed 2026-08-28). `cache.addAll(PRECACHE)` therefore rejects during `install`, leaving the worker inactive. In a fresh Chromium context against the live URL, `await navigator.serviceWorker.ready` exceeded the 30-second test timeout; no active controller was established. The app consequently cannot meet the required first-visit-then-offline reload behavior or deliver its in-app update lifecycle on the live deployment.

This is deployment-specific and explains the apparent contradiction with the repository test: `npm run test:e2e` passes its offline test against `vite preview`, which SPA-falls back those missing JavaScript URLs to a `200` HTML document, so `cache.addAll` succeeds locally with invalid cached responses. The real static host returns 404.

## Other deployed-policy defects

### P2 — intended immutable asset caching is not live

`public/_headers` declares immutable one-year caching for `/assets/*`, but live `GET /assets/app-Csm3HaSu.js` and CSS responses return `Cache-Control: public, must-revalidate, max-age=30`. This is not the configured PWA/static caching policy and causes unnecessary revalidation.

### P2 — manifest has an incorrect response MIME type

Live `/manifest.webmanifest` returns `Content-Type: application/octet-stream`, rather than a manifest/JSON MIME type. Browser tolerance varies; it is an avoidable installability/response-policy risk.

### P2 — no Content-Security-Policy or Permissions-Policy response headers

The live root response has HSTS, `nosniff`, and a referrer policy, but no CSP or Permissions-Policy. There are currently no third-party runtime requests, no inline executable script, and no observed data exfiltration; this is defense-in-depth rather than evidence of a current privacy leak.

## Evidence and checks

### Clean candidate checkout and quality gates

- Started at clean `HEAD` `18ffc7c53a5f647f012c52b93f95cd57e03e078c`.
- `npm ci`: completed; audit reported 0 vulnerabilities.
- `npm test`: passed — 1 file, 5 assertions.
- `npm run build`: passed TypeScript and Vite production build; `dist/` generated.
- `npm run test:e2e`: passed — 4/4 Playwright Chromium tests (capture/persist/recall/export, local-file media mounting, 390px axe, and local-preview offline reload). The offline result is not sufficient for the live release for the reason above.
- No lint script is defined in `package.json`; TypeScript is checked by the build.

### Product flow and recovery

An additional independent Chromium exercise (desktop 1440×900 then 390×844) passed:

- Link source → +15 seconds → keyboard `M` capture → takeaway/cue/future action date → persisted marker → CSV download.
- Boundary timestamp `00:00` saved correctly. Invalid `4:99` remained in the dialog, announced a specific correction message, and recovered correctly after a valid value was entered.
- Malformed JSON backup showed “That file is not a valid backup. Nothing was changed.” and retained the existing marker.
- User-supplied HTML-like takeaway rendered as literal text; no injected image element was created.
- Tab/arrow keyboard use worked for source tabs; skip link had a visible solid focus outline. Reduced-motion emulation set orbit transitions to ≤0.01s and `scroll-behavior: auto`.
- Desktop and 390px screenshots were visually reviewed: primary capture task is clear, responsive stacking is intentional, text and targets are usable, and no content is hidden by a fixed bar.

### Accessibility, privacy, and browser behavior

- Axe on the populated 390px app: **0 serious/critical violations**.
- Normal-flow local browser run: no page errors or console errors. The intentionally malformed import logs a caught `SyntaxError` to the console while presenting the recovery toast; no data changed.
- All runtime requests in the independent local flow were same-origin. The live initial shell also made only same-origin runtime requests; no analytics, CDN fonts/scripts, uploads, or remote media fetches were observed.
- Markers and optional voice blobs use IndexedDB; source state uses localStorage; local media uses an object URL. Repository inspection found no backend endpoint, analytics code, third-party script, transcription, downloading, or sharing feature.
- Manifest content has name/short name, 192/512 maskable icon, theme/background colors, standalone display, and `/?v=1` start URL. The service-worker defect prevents the live PWA from satisfying its offline contract.

### Performance

- Production budget check passed: app JS 16.7 KB raw (≤200 KB), CSS 15.8 KB raw (≤50 KB), image 9.7 KB raw (≤300 KB); no webfont payload.
- Independent Lighthouse 13.4.1 mobile run against local production preview: Performance **90**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.1 s, LCP 1.1 s, CLS 0, TBT 400 ms. The performance score reaches the stated 90 floor, although the TBT should be monitored.

### Candidate/live identity and headers

SHA-256 matches exactly between local `dist/` and live responses:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `9cce31bb1cc44c92980f4d609b85cecb772b4c8a5792718613d9cabeff6742fb` |
| `sw.js` | `398bfa37e2d7e2187e286ba8dbff911ae6f5d7cf8f07322c99214f1509c289d7` |
| `manifest.webmanifest` | `54e2da7c8a42c580f41b1a52f2831239f89c0af6885eb08250248814f6580c7e` |
| `assets/app-Csm3HaSu.js` | `e82d804cee7683a392024b8de6d3961a39523334ae8c5385a509dacbf7a062c1` |

Live root responses are HTTPS 200 with HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`. The caching/MIME/security-policy gaps above were measured with `curl -I` against the live host.

## Required remediation before approval

1. Generate the service-worker precache from files that are actually emitted, or filter out non-emitted facade chunks; prove each precached URL returns 200 before install.
2. Deploy the repaired static build and rerun a fresh-context live browser test: wait for `navigator.serviceWorker.ready`, assert an active controller, then set offline and reload.
3. Make deployment honor immutable caching for hashed assets, serve the manifest with an appropriate MIME type, and add an appropriately scoped CSP and Permissions-Policy.
