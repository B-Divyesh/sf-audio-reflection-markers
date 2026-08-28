# Repair handoff — Audio Reflection Markers

## Status

Polish round 1 repairs every issue in `.factory/review-1.md`, including the earlier malformed-backup console finding. The final deployed commit and live evidence are appended after deployment.

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
- `npm run test:e2e`: 30/30 passed at desktop and 390 × 844, including Axe serious/critical = 0, offline, 404, metadata, privacy request logging, and invalid-backup console recovery.
- `npm run test:update`: passed; service-worker update toast/reload action observed.
- Screenshots: `.factory/polish-1-mobile.png`, `.factory/polish-1-desktop.png`.

## Known constraints

- A local media file must be selected again after a browser restart; markers remain in the browser.
- Voice recording depends on microphone permission; typed takeaways remain available.
