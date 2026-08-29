# Review 4 handoff — Audio Reflection Markers

## Status

**FAIL.** This review changed no product code. It recorded one remaining acceptance issue in [review-4.md](review-4.md): `F-4-1`, an unlisted claim about the demo's advertised two saved lecture markers and recall cue.

## What was verified

- Fresh live Chromium checks at 390 × 844 and 1440 × 900 confirmed the cold first screen, demo presentation, metadata, routing, navigation, 404, and same-origin demo requests.
- A fresh clone at `95b71c5` was installed in `/tmp/audio-reflection-review4`.
- All 19 commands listed in `.factory/claims.json` passed independently, each in desktop and mobile projects (38 passing claim executions).
- No declared claim test failed. The remaining issue is that the demo-content promise is absent from the declared claims contract.

## How to verify

```bash
npm ci
npm test
npm run lint
npm run build
npm run test:e2e
```

For the required repair, add `demo-sample-content` to `.factory/claims.json`, tag/extend the existing phone demo test to assert exactly two seeded markers and a cue, then run its declared `@claim:` command plus the full suite.

## Known gap and next step

Add the missing demo-content claim contract described in `F-4-1`. No product behavior was modified in this work order.
