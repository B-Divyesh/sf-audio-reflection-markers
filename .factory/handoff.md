# Handoff — Audio Reflection Markers

## Independent verification status: FAIL

Candidate `18ffc7c53a5f647f012c52b93f95cd57e03e078c` was verified on 2026-08-28 against <https://audio-reflection-markers.sociobot.in>. The live site exactly matches the candidate app shell, but it does **not** meet the PWA/offline acceptance contract: its service worker precache references missing `privacy-CbXDZzyc.js` and `terms-CbXDZzyc.js` files, causing installation to fail on the real static host. See `.factory/verification.md` for commands, hashes, evidence, severity, and required remediation. Do not release this candidate as `pwa-offline` until a fresh live context reaches `navigator.serviceWorker.ready` and survives an offline reload.

## Shipped

- A mobile-first, installable PWA for link-based and local-file listening sessions.
- A synchronized manual timer for external links and native local audio/video playback. The app never fetches or copies source media.
- Fast timestamp capture with a typed takeaway or an optional on-device voice recording, future recall cue, and optional action date.
- An IndexedDB marker ledger with edit/delete, due filtering, reveal-first recall checks, review outcomes, and follow-up progress.
- Markdown and CSV exports plus complete JSON export/import, including embedded local voice notes.
- A versioned precaching service worker, offline fallback, connection state, and update-ready notice.
- Responsive 390px and desktop layouts, keyboard `M` capture shortcut, accessible dialogs/forms/tabs, visible focus styles, and reduced-motion support.
- Dedicated `/privacy/` and `/terms/` pages, MIT license, complete README, manifest, install icons, and immutable asset headers.
- A product-specific generative-geometry system and original memory-orbit illustration with prompt provenance in `.factory/design.md` and `assets/src/`.

## Verification completed 2026-08-28

- `npm test`: 5/5 Vitest assertions passed.
- `npm run build`: passed TypeScript checks and generated `dist/index.html`.
- Production budget check: app JS 16.7 KB, CSS 15.8 KB, hero WebP 9.7 KB (all raw sizes, below 200/50/300 KB budgets).
- `npm run test:e2e`: 4/4 Playwright Chromium tests passed on a Pixel 5 profile.
  - Link source → timestamp capture → persistence after reload → recall outcome → Markdown download.
  - Local audio file selection and in-browser media mounting.
  - Keyboard capture shortcut plus axe scan with zero serious or critical violations.
  - Explicit `context.setOffline(true)` reload kept the full app available and reported offline state.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ /tmp/arm-evidence`: HTTP 200, no console errors, title/lang/main present, exactly one `h1`, zero images missing alt text, zero unlabeled buttons.
- Lighthouse 13.4.1 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.2 s, TBT 10 ms, CLS 0.
- Manual visual review completed at desktop and Pixel 5 sizes. The generated illustration was checked for text artifacts, seams, unintended symbols, brands, and product-capability mismatches.

## Run and deploy

```bash
npm install
npm test
npm run build
npm run test:e2e
```

Deploy the static contents of `dist/`. The canonical build command is `npm run build`.

## Known gaps / honest constraints

- Browsers do not allow a PWA to reopen an arbitrary local media file after restart without fresh permission, so the user must select that file again; saved markers remain available.
- Voice recording format and support depend on `MediaRecorder` in the browser. When unsupported or denied, typed capture remains fully functional.
- “Check again” is an in-app due state, not a push notification; the product requests no notification permission and has no server.
- External link timestamps are appended only for YouTube URLs. Other links reopen unchanged because platforms use incompatible timestamp schemes.

## Suggested next steps

- Observe the brief’s four-week success measure locally or with an explicitly privacy-preserving opt-in study before adding scope.
- Add optional OPFS/File System Access handles only if real users strongly need resumable local-file permission and browser support is acceptable.
