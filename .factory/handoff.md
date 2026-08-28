# Repair handoff — Audio Reflection Markers

## Status

Polish round 1 repairs every issue in `.factory/review-1.md`, including the earlier malformed-backup console finding. Product repair commit: `5ee1418d3e1188688582578868ad9f58f06624d3`.

## What changed

- Rewrote the first screen in plain language and added a visible one-click `?demo=1` path.
- Added isolated demo IndexedDB/localStorage namespaces, realistic lecture sample markers, reset, and start-real controls.
- Added `.factory/claims.json` and observable Playwright proof for every published product claim.
- Added canonical/share metadata, sitemap, social image, route titles/focus behavior, legal navigation, a designed 404, and Static Web Apps 404 configuration.
- Removed unsupported/misleading wording and the malformed-import console error; fixed IndexedDB writes to complete before a navigation can occur.
- Preserved the memory-orbit visual system while making the 390 px first screen and header clearer.

## Run and verify

```bash
npm ci
npm run lint
npm test
npm run build
npm run test:e2e
npm run test:update
```

The demo is `/?demo=1` (also `/demo`). Each exact claim command is listed in `.factory/claims.json`.

## Local evidence

- `npm run lint`: passed.
- `npm test`: 5/5 passed.
- `npm run build`: passed, 14 valid precache URLs; app JS 19.1 KB raw and CSS 17.5 KB raw.
- `npm run test:e2e`: 32/32 passed at desktop and 390 × 844, including Axe serious/critical = 0, offline, service-worker 404, metadata, privacy request logging, and invalid-backup console recovery.
- `npm run test:update`: passed; service-worker update toast/reload action observed.
- Fresh clone: `npm ci` plus `npm run test:e2e -- --grep @claim` passed all 14 claim browser checks from clean state.
- Screenshots: `.factory/polish-1-mobile.png`, `.factory/polish-1-desktop.png`, `.factory/polish-1-live-mobile.png`.

## Deployment and live verification

Deployed through the static work order configuration to <https://audio-reflection-markers.sociobot.in> (Azure deployment `81521017-0ca9-4727-9f90-7b316670de48`). A cold 390 × 844 live Chromium run passed: sample demo/banner/reset/start-real, same-origin request log, Axe serious/critical = 0, service-worker activation, offline reload, and no console errors. The live unknown route now returns HTTP 404 with the designed page even under service-worker control.

## Known constraints

- A local media file must be selected again after a browser restart; markers remain in the browser.
- Voice recording depends on microphone permission; typed takeaways remain available.
