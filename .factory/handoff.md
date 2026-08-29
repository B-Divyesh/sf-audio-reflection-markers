# Review 2 handoff — Audio Reflection Markers

## Status

Independent adversarial review 2 is **FAIL**. This review made no product-code changes. The full report is `.factory/review-2.md`.

The deployed product and clean checkout pass the existing quality gates and every declared claim command. The report records one blocking presentation issue and required copy/claims/metadata repairs.

## What was verified

- Fresh live desktop and 390 × 844 contexts: cold first read, headers, service worker, request log, console errors, demo isolation/reset/start-real, metadata, route focus, 404, and internal-link crawl.
- Fresh clone: `npm ci`, `npm test`, `npm run build`, `npm run lint`, then every exact command in `.factory/claims.json` independently.
- Live demo after service-worker activation: offline reload showed sample data and `Working offline` with no console errors.
- Previous `review-1.md` items F-1-1 through F-1-25 were checked as fixed, including malformed import without a console error.

## Run and verify

```bash
npm ci
npm run lint
npm test
npm run build
npm run test:e2e
```

The demo is `/?demo=1` (also `/demo`). Each exact claim command is listed in `.factory/claims.json`.

## Review evidence

- All seven declared claims passed independently from a fresh clone.
- The live demo request log was same-origin only.
- The live phone demo repeated the hero and source form; its actual sample marker was below the 844px viewport. This is blocking F-2-1.

## Required next steps

1. Make the demo route show a saved sample marker and cue above the fold at 390 × 844, with a regression test.
2. Add exact claims and tagged demo tests for capture, voice, recall/date/review, export/import, and retained browser/privacy statements.
3. Rename the Data button, replace the two metaphor labels, and complete manifest/Apple-touch/SVG-favicon/OG-Twitter metadata across legal and 404 pages.
