# Audio Reflection Markers

Mark useful moments from podcasts and lectures. Save one short cue to revisit later.

Live product: <https://audio-reflection-markers.sociobot.in>

## What it does

- Saves an episode or lecture link and provides a manual timer.
- Plays a local audio or video file without uploading it.
- Captures a timestamp with a typed takeaway or optional voice note.
- Adds an optional future recall cue and check date.
- Shows your cue before the saved takeaway, then lets you mark what happened.
- Keeps markers and voice notes in this browser between visits.
- Exports Markdown, CSV, and a complete JSON backup; imports JSON backups.
- Works offline after the first visit.

## Try the demo

Open <https://audio-reflection-markers.sociobot.in/?demo=1>. It loads two saved lecture markers in a separate demo area. Reset demo restores the sample. Start for real discards demo changes.

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
npm run lint      # TypeScript-aware lint
npm run build     # typecheck, production build, precache/policy and budget checks
npm run test:e2e  # desktop + 390px workflows, axe, strict-host offline/policy tests
npm run test:update # real service-worker update and in-app reload notice
```

Playwright is pinned to 1.58.2. If its browser is not already available, run `npx playwright install chromium` once.

## Privacy and data model

The app has no account or analytics. It does not upload or remotely process your media. Markers and voice notes stay in this browser. Local media files are available only until you reload or close the page. A source link is saved only as a reference. Download a JSON backup before clearing site storage or moving devices.

See [`/privacy`](https://audio-reflection-markers.sociobot.in/privacy/) and [`/terms`](https://audio-reflection-markers.sociobot.in/terms/). Artwork provenance is recorded in `.factory/design.md` and `assets/src/`.

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

Automated browser checks use current Chromium. Voice recording needs microphone support. You can type a takeaway when voice recording is unavailable.

## License

MIT. See [LICENSE](./LICENSE).
