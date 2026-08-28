# Adversarial first-read review 1 — FAIL

Date: 2026-08-28  
Live URL: <https://audio-reflection-markers.sociobot.in>  
Viewports: fresh Chromium contexts at 390 × 844 and 1440 × 900

## Verdict

**FAIL.** There are blocking gaps in the cold first screen, required one-click sandbox demo, claims contract, live 404 handling, and a previously recorded console-error defect. The visual system is product-specific and the existing core workflow tests pass, but that is not enough for a new visitor to try the product safely and honestly.

## Cold first screen

Before scrolling, I understood this as a tool to leave a note while listening and revisit it later. I could infer that I should enter a link or choose a local file, then press **Set source**. I could **not** answer who it is for from the first screen: it never names podcast or lecture listeners. I also could not try the product without providing personal material.

The exact copy that fails the five-second test is:

> “Keep the moment. Recall the meaning.”

> “Drop a marker while you listen. Leave one takeaway and one cue for your future self—without summarizing the whole thing.”

Neither names the audio/lecture context or an immediate, safe first action. At 390 px the source form fills the rest of the first screen; there is no sample-data CTA or explanation of what appears after it.

## Findings

### Blocking

#### F-1-1 — The first screen does not state the audience or provide a try-now action

**Location/quote:** landing `<h1>` “Keep the moment. Recall the meaning.” and hero copy quoted above; 390 px and desktop live views.

**Why:** A cold visitor cannot tell that this is for podcast and lecture listeners, and must supply a URL/file before seeing the job performed. The mood headline does not describe the job.

**Fix:** Replace the headline with `Mark useful moments in audio`; replace the supporting sentence with `For podcast and lecture listeners who want one short cue to revisit later.` Add a visible primary button `Try it with sample data` with adjacent text `Opens a saved lecture marker and its recall cue.`

#### F-1-2 — No one-click demo exists; `?demo=1` exposes real data

**Location/quote:** live `/demo` and `/?demo=1` both return the ordinary landing screen. Neither contains “Demo”, “sample data”, “Reset demo”, or “Start for real”.

**Why:** This violates the required try-before-setup path. In one fresh context I created the real marker “Actual marker should not appear in a demo.”, then opened `/?demo=1`; the marker was still present (one marker card) and no demo banner appeared. Demo mode is not isolated from real IndexedDB/localStorage.

**Fix:** Implement `/demo` or `?demo=1` with a realistic saved source, several markers, a visible persistent `Demo — sample data, nothing is saved` banner, `Reset demo`, and `Start for real`. Use only `demo:` storage keys/databases there; test that demo cannot read or write real keys.

#### F-1-3 — “Offline-ready” is an unlisted claim

**Location/quote:** landing header: `Offline-ready`.

**Why:** `.factory/claims.json` does not exist, and the clean clone has no `@claim:` test. A visitor can rely on this offline claim, but it has no declared sandbox proof.

**Fix:** Add an `offline-reload` claim with a tagged fresh-context Playwright test that activates the worker, sets the context offline, reloads `/demo`, and asserts the sample is usable. Otherwise remove the claim.

#### F-1-4 — “Stays on this device” is an unlisted claim

**Location/quote:** landing source panel badge: `Stays on this device`.

**Why:** This is a privacy/storage promise without a claim entry or request-log/storage-namespace test.

**Fix:** Add a `local-only` claim whose demo-flow test records requests and asserts same-origin only, and checks that no demo operation uses real storage. Otherwise remove the badge.

#### F-1-5 — The link/timer behavior is an unlisted and misleading claim

**Location/quote:** `The link is a reference only. Open it in its original app, then use the synced timer here.`

**Why:** The timer is manual, not synchronized to the original app. Both the reference-only behavior and alleged synchronization are claims with no entry/test.

**Fix:** Use `The link is saved only as a reference. Start the manual timer here when playback starts.` Add separate tested claims for reference-only storage and manual timing, or remove the promises.

#### F-1-6 — The local-file privacy claim is unlisted

**Location/quote:** local-file panel: `Played here only. The file is never uploaded or copied.`

**Why:** This is a strong privacy claim without a request-log claim test.

**Fix:** Add a `local-file-no-upload` claim test that loads a sample local media file in demo and asserts no upload/non-same-origin request; remove the sentence if it cannot be maintained.

#### F-1-7 — The privacy/no-AI claim is unlisted

**Location/quote:** footer: `No uploads, accounts, analytics, or AI summaries.`

**Why:** Four externally meaningful promises have no claims entry or observable sandbox test.

**Fix:** Split into concise, separately testable claims (for example, `No account is required` and `Sample data makes no network request except this site`) with tagged tests. Do not assert an absence that the test cannot observe.

#### F-1-8 — The live site has no designed 404

**Location/quote:** `https://audio-reflection-markers.sociobot.in/does-not-exist` returned the home document with HTTP 200 in the initial live header check; `/demo` is also merely the ordinary landing screen.

**Why:** A bad URL is represented as a successful app page, so visitors and crawlers cannot identify it as missing. There is no `404.html`/404 route in the repository.

**Fix:** Add a designed `/404.html` with a plain h1, home link, product styling, and correct Static Web Apps `responseOverrides` configuration. Exclude the 404 route from navigation fallback and add a live route test for a 404 status.

#### F-1-9 — Historical P3 console-error finding remains unfixed

**Location/quote:** `.factory/verification-2.md`, `P3 — malformed backup import logs a caught SyntaxError`; live `src/main.ts` still runs `console.error(error)` in the JSON-import catch.

**Why:** Reproduced live: uploading `{not json` shows the correct recovery toast and also emits `SyntaxError: Expected property name or '}' in JSON at position 1`. Per the review instruction, an earlier finding that remains unfixed is blocking again.

**Fix:** Remove the user-input parse-error `console.error`, retain the visible recovery message, and add an end-to-end invalid-backup test that asserts no `console.error`/page error.

#### F-1-10 — Required metadata, share metadata, and sitemap are absent

**Location/quote:** live `/` has no canonical link, no Open Graph metadata, and no Twitter metadata. `curl` returned `404 text/html` for `/sitemap.xml`. Legal source pages likewise omit meta descriptions, canonical URLs, and share metadata.

**Why:** Routes cannot present correct, canonical, shareable identities. The current home title, `Audio Reflection Markers — remember what matters`, also ends in a mood slogan rather than what the product does.

**Fix:** Set every route’s title in the required pattern (home: `Audio Reflection Markers — mark audio moments`; legal routes retain their current product-name pattern), description, canonical, OG/Twitter title/description/image, and add `sitemap.xml` listing `/`, `/demo`, `/privacy/`, `/terms/`, and `/404.html`.

### Minor, but still required before PASS

#### F-1-11 — Header/footer omit required navigational and product context

**Location/quote:** the landing header contains only the wordmark, `Offline-ready`, and an unlabeled-in-context icon; its only visible text links are footer `Privacy` and `Terms`. Neither footer says `Built by Param Factory` or shows a version/build id.

**Why:** The standard skeleton is incomplete and legal/app navigation is inconsistent across routes.

**Fix:** Add visible header links for `Demo` and `Privacy` (and a clear `Data` action); add the required footer one-liner, Privacy, Terms, `Built by Param Factory`, and build/version text on every route.

#### F-1-12 — Landing headline is mood copy, not a job headline

**Location/quote:** `Keep the moment.` / `Recall the meaning.`

**Why:** These two three-word slogans carry no product-specific task information out of context.

**Fix:** `Mark useful moments in audio`.

#### F-1-13 — Landing eyebrow is a mood heading

**Location/quote:** `Listen with intent`.

**Why:** It does not name a section or tell the visitor what the app does.

**Fix:** `Save a listening marker`.

#### F-1-14 — Empty-state headings use unexplained metaphor

**Location/quote:** `Your first node is waiting` and `Mark the thought—not the whole episode.`

**Why:** “node” is not a product term elsewhere, and neither heading names the empty state or next action plainly.

**Fix:** Use `No markers yet` and `Save your first marker`.

#### F-1-15 — “Private by design” is a vague marketing phrase

**Location/quote:** footer: `Private by design.`

**Why:** It gives no usable privacy detail and is inconsistent with the more concrete device/browser language elsewhere.

**Fix:** After adding the relevant claim test, use `Your markers stay in this browser.`

#### F-1-16 — “Export” does not name its result

**Location/quote:** landing ledger button: `Export`.

**Why:** The button opens a menu for different artifacts, so the result is not clear before activation.

**Fix:** `Export markers` (then retain explicit `Download Markdown` and `Download CSV`).

#### F-1-17 — Artwork provenance is irrelevant first-screen product copy

**Location/quote:** `Orbital artwork generated for this product with Azure AI Foundry.`

**Why:** It does not help a listener understand or operate the product and introduces unexplained AI wording in the main task view.

**Fix:** Keep provenance in `.factory/design.md` and an optional About/credits detail, not the first-use footer.

#### F-1-18 — README introduction exceeds the 22-word limit and uses jargon

**Location/quote:** README opening sentence (27 words): `Audio Reflection Markers is a private, local-first PWA for podcast and lecture listeners who want to turn one useful moment into one short recall or action prompt.`

**Why:** “local-first PWA” is technical jargon and the sentence takes too long to parse.

**Fix:** `Mark useful moments from podcasts and lectures. Save one short cue to revisit later.`

#### F-1-19 — README repeats the misleading “synced timer” term

**Location/quote:** `References a user-supplied episode/lecture URL with a manual synced timer.`

**Why:** A timer cannot be both manual and synced; it is inconsistent with actual behavior.

**Fix:** `Saves an episode or lecture link and provides a manual timer.`

#### F-1-20 — README uses unexplained recall jargon

**Location/quote:** `Runs a reveal-first recall check and records remembered/revisit/action outcomes.`

**Why:** “reveal-first” and the slash-delimited outcome names are not first-read language.

**Fix:** `Shows your cue before the saved takeaway, then lets you mark what happened.`

#### F-1-21 — README exposes implementation jargon for storage

**Location/quote:** `Persists markers and voice notes in IndexedDB across sessions.`

**Why:** “IndexedDB” is not useful to the intended listener.

**Fix:** `Keeps markers and voice notes in this browser between visits.`

#### F-1-22 — README’s offline bullet uses PWA/app-shell jargon

**Location/quote:** `Installs as a PWA and keeps the app shell usable offline after the first visit.`

**Why:** It hides the actual user result behind implementation terms.

**Fix:** `Can be installed and opened offline after the first visit.` (Only after the claim test in F-1-3.)

#### F-1-23 — README privacy text uses unnecessary implementation terms

**Location/quote:** `There is no backend, account, analytics, remote media processing, or third-party runtime script/font.`

**Why:** “backend” and “runtime script/font” are developer terms in a listener-facing privacy explanation.

**Fix:** `The app has no account, analytics, uploads, or remote media processing.`

#### F-1-24 — README storage explanation uses object-URL jargon

**Location/quote:** `Local media files use temporary object URLs and are not persisted.`

**Why:** It makes a simple privacy fact harder to understand.

**Fix:** `Local media files are opened only for this session and are not saved.`

#### F-1-25 — README browser-support sentence uses implementation jargon

**Location/quote:** `Voice recording depends on MediaRecorder and microphone permission; typed takeaways remain available when recording is unsupported or denied.`

**Why:** “MediaRecorder” is an internal browser API name rather than a user-facing condition.

**Fix:** `Voice recording needs a browser that supports microphone recording. You can always type a takeaway instead.`

## Copy audit

This lists every visible landing copy unit (including headings/control labels) and every README sentence/heading. Word counts treat a URL as one word. `F-*` refers to the flag above; `—` means no plain-words issue beyond any separate claims finding.

### Landing page

| # | Copy | Words | Result |
|---|---|---:|---|
| 1 | Skip to main content | 4 | — |
| 2 | Offline-ready | 1 | F-1-3 |
| 3 | Listen with intent | 3 | F-1-13 |
| 4 | Keep the moment. | 3 | F-1-12 |
| 5 | Recall the meaning. | 3 | F-1-12 |
| 6 | Drop a marker while you listen. | 6 | F-1-1 context missing |
| 7 | Leave one takeaway and one cue for your future self—without summarizing the whole thing. | 15 | F-1-1 context missing |
| 8 | Listening desk / live | 3 | — |
| 9 | What are you listening to? | 5 | — |
| 10 | Stays on this device | 4 | F-1-4 |
| 11 | Use a link | 3 | — |
| 12 | Use a local file | 4 | — |
| 13 | Episode or lecture link | 4 | — |
| 14 | Title optional | 2 | — |
| 15 | Set source | 2 | F-1-1: setup before trying |
| 16 | The link is a reference only. | 6 | F-1-5 |
| 17 | Open it in its original app, then use the synced timer here. | 12 | F-1-5 |
| 18 | Manual timer | 2 | — |
| 19 | No source set | 3 | — |
| 20 | Mark this moment | 3 | — |
| 21 | Your markers | 2 | — |
| 22 | Due only | 2 | — |
| 23 | Export | 1 | F-1-16 |
| 24 | Your first node is waiting | 5 | F-1-14 |
| 25 | Mark the thought—not the whole episode. | 7 | F-1-14 |
| 26 | Set a source, press Mark this moment, and write the question you want your future self to answer. | 18 | — |
| 27 | Private by design. | 3 | F-1-15 |
| 28 | No uploads, accounts, analytics, or AI summaries. | 7 | F-1-7 |
| 29 | Orbital artwork generated for this product with Azure AI Foundry. | 10 | F-1-17 |

### README

| # | Copy | Words | Result |
|---|---|---:|---|
| 1 | Audio Reflection Markers | 3 | — |
| 2 | Audio Reflection Markers is a private, local-first PWA for podcast and lecture listeners who want to turn one useful moment into one short recall or action prompt. | 27 | F-1-18 |
| 3 | It deliberately does not download, transcribe, summarize, or share media. | 10 | — |
| 4 | Live product: URL | 3 | — |
| 5 | What it does | 3 | — |
| 6 | References a user-supplied episode/lecture URL with a manual synced timer. | 11 | F-1-19 |
| 7 | Plays a user-selected local audio or video file without uploading it. | 11 | F-1-6 claim |
| 8 | Captures a timestamp plus a typed takeaway or optional local voice note. | 12 | — |
| 9 | Adds an optional future recall cue and check date. | 9 | — |
| 10 | Runs a reveal-first recall check and records remembered/revisit/action outcomes. | 11 | F-1-20 |
| 11 | Persists markers and voice notes in IndexedDB across sessions. | 9 | F-1-21 |
| 12 | Exports Markdown, CSV, and a complete JSON backup; imports JSON backups. | 11 | — |
| 13 | Installs as a PWA and keeps the app shell usable offline after the first visit. | 15 | F-1-22 |
| 14 | Run locally | 2 | — |
| 15 | Requires Node.js 20 or newer. | 5 | — |
| 16 | Vite prints the local development URL. | 6 | — |
| 17 | Production output is always written to dist. | 7 | — |
| 18 | The exact deployment build command is npm run build, and the static deploy directory is dist. | 16 | — |
| 19 | Test and verify | 3 | — |
| 20 | Playwright is pinned to 1.58.2. | 5 | — |
| 21 | If its browser is not already available, run npx playwright install chromium once. | 13 | — |
| 22 | Privacy and data model | 4 | — |
| 23 | There is no backend, account, analytics, remote media processing, or third-party runtime script/font. | 14 | F-1-23 |
| 24 | Marker records and optional voice recordings stay in the browser’s IndexedDB. | 11 | F-1-21 |
| 25 | Local media files use temporary object URLs and are not persisted. | 11 | F-1-24 |
| 26 | A source link is stored only as a reference. | 9 | F-1-5 claim |
| 27 | Users should download a JSON backup before clearing site storage or moving devices. | 13 | — |
| 28 | See /privacy and /terms. | 4 | — |
| 29 | The generated empty-state artwork is original to this product; its prompt and provenance are recorded in .factory/design.md and assets/src/. | 21 | — |
| 30 | Project structure | 2 | — |
| 31 | src/main.ts — app workflow, playback/timer, capture, review, import/export. | 10 | — |
| 32 | src/db.ts — small IndexedDB persistence layer. | 6 | — |
| 33 | src/styles.css — product-specific responsive visual system. | 6 | — |
| 34 | public/manifest.webmanifest — install metadata and icons. | 6 | — |
| 35 | vite.config.ts — multi-page build and post-emit precaching service worker. | 8 | — |
| 36 | public/staticwebapp.config.json — Azure cache, MIME, CSP, and permissions policy. | 9 | — |
| 37 | tests/ — Vitest unit tests and Playwright mobile/offline/accessibility tests. | 10 | — |
| 38 | .factory/design.md — visual thesis, tokens, interaction rules, and asset provenance. | 10 | — |
| 39 | Browser support | 2 | — |
| 40 | Current Chromium, Firefox, and Safari are targeted. | 7 | — |
| 41 | Voice recording depends on MediaRecorder and microphone permission; typed takeaways remain available when recording is unsupported or denied. | 18 | F-1-25 |
| 42 | License | 1 | — |
| 43 | MIT. | 1 | — |
| 44 | See LICENSE. | 2 | — |

## Claims and sandbox audit

`.factory/claims.json` is absent. A fresh clone at the reviewed commit passed `npm ci` and `npm test` (5/5), but contains no `@claim:` tag, so there were no listed claim tests to run. This is not a passing claims audit: every unlisted live claim is recorded above.

Manual fresh-context evidence showed only same-origin live requests (`/`, app JS/CSS, and the self-hosted artwork) during ordinary and attempted-demo navigation. The core test suite also passed `npm run lint`, `npm run build`, and `npm run test:e2e` (10/10). Those results do not prove the missing demo namespace or claims contract.

## History check

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. I read the earlier verification reports and handoff. The previous service-worker/caching defects described in `.factory/verification.md` are confirmed fixed by the current passing build/e2e suite and current response headers. The only earlier open item, P3 malformed-backup console noise, is confirmed unfixed in F-1-9.

## Structure, routes, and visual review

The landing has one h1, `lang="en"`, a `<main>`, a visible skip link, local assets, and a distinctive dark orbital identity that matches `.factory/design.md`; this is not a generic SaaS template. No useful AI feature is missing: the brief explicitly prohibits transcription and summaries, and import/export is present.

However, the home route lacks canonical/OG/Twitter metadata, legal pages lack route descriptions and share metadata, `sitemap.xml` is missing, and the live unknown URL behavior is the blocking 404 defect above. The current live title is a slogan rather than a plain description. The product does provide Privacy and Terms links, but its header/footer still fails the required standard skeleton as recorded in F-1-11.

## What would make this perfect

Open with the plain listening-marker job and a one-click realistic demo. Keep that demo genuinely separate from personal browser data; document and test every promise in `claims.json`; repair 404 and route metadata; then tighten the remaining copy until every line explains a concrete action or fact. The existing distinctive orbit visual system and local-first core can then support a genuinely clear, private first-use experience.
