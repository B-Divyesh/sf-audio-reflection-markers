# Audio Reflection Markers

Audio Reflection Markers is a private, local-first PWA for podcast and lecture listeners who want to turn one useful moment into one short recall or action prompt. It deliberately does not download, transcribe, summarize, or share media.

Live product: <https://audio-reflection-markers.sociobot.in>

## What it does

- References a user-supplied episode/lecture URL with a manual synced timer.
- Plays a user-selected local audio or video file without uploading it.
- Captures a timestamp plus a typed takeaway or optional local voice note.
- Adds an optional future recall cue and check date.
- Runs a reveal-first recall check and records remembered/revisit/action outcomes.
- Persists markers and voice notes in IndexedDB across sessions.
- Exports Markdown, CSV, and a complete JSON backup; imports JSON backups.
- Installs as a PWA and keeps the app shell usable offline after the first visit.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Vite prints the local development URL. Production output is always written to `dist/`:

```bash
npm run build
npm run preview
```

The exact deployment build command is `npm run build`, and the static deploy directory is `dist`.

## Test and verify

```bash
npm test          # unit tests
npm run build     # typecheck, production build, precache/policy and budget checks
npm run test:e2e  # desktop + 390px workflows, axe, strict-host offline/policy tests
npm run test:update # real service-worker update and in-app reload notice
```

Playwright is pinned to 1.58.2. If its browser is not already available, run `npx playwright install chromium` once.

## Privacy and data model

There is no backend, account, analytics, remote media processing, or third-party runtime script/font. Marker records and optional voice recordings stay in the browser’s IndexedDB. Local media files use temporary object URLs and are not persisted. A source link is stored only as a reference. Users should download a JSON backup before clearing site storage or moving devices.

See [`/privacy`](https://audio-reflection-markers.sociobot.in/privacy/) and [`/terms`](https://audio-reflection-markers.sociobot.in/terms/). The generated empty-state artwork is original to this product; its prompt and provenance are recorded in `.factory/design.md` and `assets/src/`.

## Project structure

- `src/main.ts` — app workflow, playback/timer, capture, review, import/export.
- `src/db.ts` — small IndexedDB persistence layer.
- `src/styles.css` — product-specific responsive visual system.
- `public/manifest.webmanifest` — install metadata and icons.
- `vite.config.ts` — multi-page build and post-emit precaching service worker.
- `public/staticwebapp.config.json` — Azure cache, MIME, CSP, and permissions policy.
- `tests/` — Vitest unit tests and Playwright mobile/offline/accessibility tests.
- `.factory/design.md` — visual thesis, tokens, interaction rules, and asset provenance.

## Browser support

Current Chromium, Firefox, and Safari are targeted. Voice recording depends on `MediaRecorder` and microphone permission; typed takeaways remain available when recording is unsupported or denied.

## License

MIT. See [LICENSE](./LICENSE).
