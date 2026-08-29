# Polish 4 handoff — Audio Reflection Markers

## Status

**PASS.** Commit `e8d982b3706c5ecfd806ce5e232fe7512cc6d1c3` repairs the only remaining review finding, `F-4-1`: the advertised demo sample content now has a declared, independently runnable claim test. It is pushed to `origin/main` and deployed as static deployment `dd87192b-7fa7-47dd-a96b-e6225f6027dc`.

Live product: <https://audio-reflection-markers.sociobot.in>

## What changed

- Added `demo-sample-content` to `.factory/claims.json`: “The demo opens with two saved lecture markers, including a recall cue.”
- Converted the existing demo presentation check into its one required `@claim:demo-sample-content` test. From a fresh direct `/demo` context it asserts exactly two rendered and stored MIT OpenCourseWare lecture markers, the advertised cue, and the first marker/cue/Review action above the 390 × 844 fold.
- Kept the previously repaired direct demo isolation, route titles and metadata, legal routes, real status-404, phone navigation, local-only boundaries, and dark orbital visual system intact. `.factory/polish-4.md` maps F-1-1 through F-4-1 individually to current evidence.
- Bumped the displayed build version to `1.0.4` and updated every footer. The catalog description is a 69-character verb-first sentence.

## Exact verification evidence

Fresh clone: `/tmp/audio-reflection-polish4.Nngt5A/repo` at `e8d982b3706c5ecfd806ce5e232fe7512cc6d1c3` after `npm ci`.

- `npm test`: 5 unit tests passed.
- `npm run lint`: passed.
- `npm run build`: passed; verified 16 service-worker precache URLs and Azure policies. Main JavaScript is 20.2 KB raw, CSS is 20.8 KB raw.
- Each of the 20 declarations in `.factory/claims.json` was invoked independently with its declared `npm run test:e2e -- --grep @claim:<id>` command. Every command passed in both desktop and 390 px projects: 40 claim executions total.
- `npm run test:e2e`: 64 passed, 2 intentional mobile-only skips, out of 66 configured project tests. This includes Playwright Axe with zero serious/critical violations.
- `npm run test:update`: passed; verified the worker update lifecycle after two worker requests.
- Local cold verifier: `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/demo .factory/polish-4-local`. Result: title `Demo — Audio Reflection Markers`, `lang=en`, one h1, main landmark, zero missing alt attributes, zero unlabeled buttons, and zero console errors. Screenshots and JSON are in `.factory/polish-4-local/`.
- Live cold verifier: `/opt/fleet/lib/verify-url.sh https://audio-reflection-markers.sociobot.in/demo .factory/polish-4-live`. Result: the same structure checks and zero console errors. Screenshots and JSON are in `.factory/polish-4-live/`.
- Live fresh-browser re-check: home CTA entered `?demo=1`; a separate direct `/demo` context had exactly two demo markers, the recall cue, only same-origin GET requests, only `demo:reflection-markers`, an offline service-worker reload, zero serious/critical Axe violations, a 44 px phone Menu, correct privacy/terms/404 titles and metadata, and a real unknown-route HTTP 404.
- Live route audit returned 200 for `/`, `/demo`, `/privacy/`, `/terms/`, `/404.html`, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/favicon.svg`, and `/apple-touch-icon.png`; `/not-a-real-route` returned 404. CSP, Permissions-Policy, Referrer-Policy, and X-Content-Type-Options were present.
- Live mobile Lighthouse (`.factory/lighthouse-polish-4.json`): Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1,057 ms; CLS 0.031; transferred bytes 53,603. The run used the 390-class mobile preset against `/?demo=1`.

## Run and deploy

```bash
npm ci
npm test
npm run lint
npm run build
npm run test:e2e
npm run test:update
```

The static build directory is `dist/`. Deployment used `/opt/fleet/lib/deploy-static.sh audio-reflection-markers /work/repo/dist`.

## Known gaps

None. The brief deliberately excludes downloading, transcription, summaries, and public media sharing; the product continues to avoid those capabilities.
