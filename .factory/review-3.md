# Adversarial first-read review 3 — FAIL

Date: 2026-08-29  
Live URL: <https://audio-reflection-markers.sociobot.in>  
Candidate: `fd58f43987694f8a458b24fbb2b00c3127b4aa2b`  
Contexts: fresh Chromium profiles at 390 × 844 and 1440 × 900; clean clone `/tmp/audio-reflection-review3.jW4Mmt/repo`

## Verdict

**FAIL.** The first screen is clear and the marker-first demo works, but PASS requires zero findings. The shipped demo contains a dead source link, the required mobile header navigation is hidden, one earlier storage claim remains broader than its listed test, and several copy/structure defects remain.

## Cold first read

Before scrolling, at both widths:

- **What it does:** saves a useful moment from audio as a short cue for later.
- **For whom:** podcast and lecture listeners.
- **First click:** **Try it with sample data**.

The exact first-screen copy that makes those answers possible is:

> “Mark useful moments in audio”

> “For podcast and lecture listeners who want one short cue to revisit later.”

> “Try it with sample data”

> “Opens a saved lecture marker and its recall cue.”

This part passes. At 390 px, the headline, audience, action, result sentence, and three facts all appear before the source form. At desktop width, the same information is above the fold. There is no horizontal overflow.

## Findings

### Blocking

#### F-3-1 — The demo’s sample source is a dead, non-realistic link

**Location/quote:** first demo marker, timestamp link **“12:34 ↗”**, generated from `https://example.com/designing-better-questions`; the active source link uses the same URL.

**Evidence:** both `https://example.com/designing-better-questions` and its timestamp URL return HTTP 404. The complete link crawl found this as the only dead link exposed by a valid product route.

**Why:** The demo is the required one-click proof of the product. Its core source reference does not open a lecture, so the supposedly realistic sample is not usable end to end. It also fails the explicit no-dead-links check.

**Concrete fix:** seed a stable, permission-safe lecture URL that returns 200 and accepts the generated timestamp parameter. Add a demo crawl test that opens every rendered sample-source link and fails on a non-2xx response.

#### F-3-2 — F-1-11 is reopened: the phone header hides all navigation

**Location/code:** live 390 px header; `src/styles.css` sets `.header-nav { display: none; }` below 620 px. Only the logo icon and **Manage marker data** remain. The wordmark text is also hidden below 400 px.

**Why:** F-1-11 required the standard header links on every route and was marked fixed. They are still visible on desktop but unavailable in the phone header, including Demo and Privacy. This is a half-fix of an earlier finding and is therefore blocking under the round-history rule.

**Concrete fix:** keep the wordmark and the Demo, main-task, and Privacy destinations available at 390 px. A 44 px **Menu** button with an accessible disclosure is acceptable. Add a mobile assertion that all three destinations are keyboard- and touch-reachable from every route.

#### F-3-3 — F-2-9 is only half-fixed: “close the page” has no matching claim or test

**Location/quote:** README: **“Local media files are available only until you reload or close the page.”** Privacy: **“Local media files are removed when you reload or close the page.”**

**Evidence:** `local-file-session-only` claims only that a file is not restored **after reload**. Its test reloads the same page; it never closes the page and opens a new one. F-2-9 explicitly required a fresh-session proof or narrower copy.

**Why:** The implementation is memory-only, but the claims contract requires observable proof for the exact published promise. The “close the page” clause remains an unlisted, untested claim and leaves the earlier finding half-fixed.

**Concrete fix:** either rewrite both sentences as `A local media file is removed when you reload.` or expand `local-file-session-only` to include closing the page, open a new page/context in its tagged test, and confirm that neither the filename nor a media element is restored.

#### F-3-4 — The 404 page reintroduces the “listening desk” metaphor

**Location/quote:** live `/does-not-exist`: **“Use the listening desk to mark a useful moment in audio.”** and **“Go to the listening desk.”**

**Why:** “Listening desk” does not name a route or result for a first-time visitor. Round 2 removed the same metaphor from the main interface, but it remains on a route that exists specifically to recover a lost visitor.

**Concrete fix:** use `Use Audio Reflection Markers to save a useful audio moment.` and `Go to Audio Reflection Markers` (or simply `Go home`). Include 404 copy in the plain-words audit.

### Other findings required before PASS

#### F-3-5 — Navigation back to home does not move focus to the home h1

**Location/evidence:** from Privacy, activating **Mark audio** loads `/` with focus on `<body>`. Returning from Privacy with the browser Back button restores the prior scroll position but leaves focus on `<body>`.

**Why:** Keyboard and screen-reader users receive no route-change focus cue on home. Demo, Privacy, Terms, and 404 focus their h1; home is the inconsistent route.

**Concrete fix:** use the shared route bootstrap to focus `#page-title` on a normal navigation to home and restore a meaningful origin focus target on history traversal. Add forward/back assertions for URL, scroll, focus, and the polite route announcement.

#### F-3-6 — The landing page omits two required skeleton sections

**Location:** `/` proceeds from the first screen directly into the workspace and then the footer. There is no **How it works** three-step section and no plain **What it does not do / privacy** section.

**Why:** The live workspace is useful, but it does not replace the required three-step explanation or an explicit limitations/privacy summary. A visitor must infer the workflow from controls and leave the page to learn the boundaries.

**Concrete fix:** after the live workspace, add `How it works` with three verbs (`Set a source`, `Mark a moment`, `Review the cue`) and `What stays private` with the tested limits: reference-only links, no media upload, browser storage, and no transcription/sharing.

#### F-3-7 — “Due only” is not a result-naming action

**Location/quote:** saved-marker toolbar button **“Due only.”**

**Why:** It reads as a fragment or status, not an action. Its active counterpart, “Show all,” uses a different grammar.

**Concrete fix:** use `Show due markers` and `Show all markers`.

#### F-3-8 — “Before you reveal it…” is a context-dependent mood heading

**Location/quote:** review dialog h2 **“Before you reveal it…”**

**Why:** The pronoun does not identify the section when headings are read out of context, and the ellipsis adds mood rather than instruction.

**Concrete fix:** use `Recall the cue before seeing your takeaway` or `Recall check`.

#### F-3-9 — “How did this land?” is metaphorical result copy

**Location/quote:** review dialog prompt **“How did this land?”**

**Why:** “Land” does not say whether the app is asking about memory, follow-up, or action.

**Concrete fix:** use `What happened after this cue?`.

#### F-3-10 — “Own your markers” is a slogan, not a settings heading

**Location/quote:** marker-data dialog h2 **“Own your markers.”**

**Why:** It does not name export, import, or deletion and could be reused in unrelated software.

**Concrete fix:** use `Manage marker data`.

#### F-3-11 — “Everything lives in this browser” is metaphorical and over-broad

**Location/quote:** marker-data dialog: **“Everything lives in this browser.”**

**Why:** “Lives” is metaphorical, and “everything” can be read to include the local media file even though that file is session-only.

**Concrete fix:** use `Markers and voice notes stay in this browser.`

#### F-3-12 — The product uses three words for the same recall prompt

**Location/quote:** `Future recall cue`; empty state: **“write the question you want your future self to answer”**; filtered empty state: **“Your next prompt will appear here.”**

**Why:** The documented terminology says this concept is a “cue.” Switching to “question” and “prompt” makes the follow-up model harder to learn.

**Concrete fix:** use `cue` everywhere: `write one cue for your future self` and `Your next cue will appear here on its check date.`

#### F-3-13 — The update action has the wrong accessible name

**Location/code:** `#toast-action` always has `aria-label="Complete notification action"`; update code changes only its visible text to **Reload**.

**Why:** When an update is ready, a screen reader announces the vague label instead of the result-naming action “Reload.” The update test checks `textContent`, so it misses the accessible name.

**Concrete fix:** remove the static `aria-label` when visible button text exists, or set the label alongside the action text. Extend `npm run test:update` to assert the button’s accessible name is `Reload`.

#### F-3-14 — Several phone touch targets are below 44 px

**Location/evidence:** at 390 px, footer Privacy/Terms/Demo links have 14 px-tall boxes, the demo’s **Open source** link is 15 px tall, and **Reset demo** / **Start for real** are 36 px tall. `.toast button` also sets `min-height: 36px`.

**Why:** The accessibility baseline requires 44 px touch targets. These are normal phone navigation and demo controls, not incidental inline prose links.

**Concrete fix:** give footer/source links and banner/toast actions at least 44 × 44 CSS-pixel hit areas. Add a 390 px test that checks every visible interactive element’s target box.

## Demo and sandbox result

The required entry path works aside from F-3-1:

- `/`, `/?demo=1`, `/demo`, and `/demo/` were opened in fresh contexts.
- One click from the landing page opened `/?demo=1`.
- At 390 × 844, the first marker’s timestamp, takeaway, cue, and Review/Edit/Delete actions ended at y=438, above the fold.
- The persistent banner read **“Demo — sample data, nothing is saved”** and exposed **Reset demo** and **Start for real**.
- A real marker was created first in `reflection-markers`. It never appeared in demo mode.
- Demo changes were stored only in `demo:reflection-markers`; Reset restored exactly two fixtures and did not alter the real record.
- Start for real cleared the demo store and returned to the intact real marker.
- The whole exercised live demo flow made only same-origin GET requests. No console or page error occurred.
- After service-worker control, an offline reload kept the demo h1 and sample marker visible and showed **Working offline**.

## Claims audit

All 19 exact `test` commands from `.factory/claims.json` were run independently in the clean clone. Each command ran its tagged test in both configured projects.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `offline-reload` | Pass | Controlled `/demo`, went offline, reloaded sample marker. |
| `demo-isolation` | Pass | Real marker excluded; reset restored fixtures; Start for real preserved real data. |
| `local-only` | Pass | Demo capture stayed in demo IndexedDB; requests were same-origin GETs. |
| `reference-only-manual-timer` | Pass | Reference remained an href; `+15` advanced the manual timer; no source fetch. |
| `local-file-no-upload` | Pass | Fixture mounted locally; no upload or external request. |
| `no-account-or-analytics` | Pass | No account fields or third-party requests. |
| `no-payment-or-account` | Pass | Capture available with no checkout, password, upgrade, or payment UI. |
| `capture-marker` | Pass | Timestamped typed marker rendered. |
| `local-voice-note` | Pass | Fixture voice blob was playable in demo storage with no external request. |
| `recall-cue-and-date` | Pass | Cue and date rendered and existed in demo IndexedDB. |
| `reveal-first-review` | Pass | Cue preceded hidden takeaway; result persisted. |
| `marker-export` | Pass | Markdown, CSV, and JSON names and contents matched sample data. |
| `backup-import` | Pass | Valid backup replaced only demo markers. |
| `voice-unavailable-typed-fallback` | Pass | Unsupported voice path reported recovery and saved typed text. |
| `no-remote-media-processing` | Pass | Local file plus fixture voice produced only same-origin GETs. |
| `local-file-session-only` | Pass as written | Same-page reload removed the file; it does not cover the published close-page clause (F-3-3). |
| `microphone-on-action` | Pass | No request on load/editor open; one after Record. |
| `delete-all-markers` | Pass | Confirmation cleared the rendered list and demo object store. |
| `no-media-copying-or-sharing` | Pass | Local playback and absence of transfer/transcription/share controls confirmed. |

No listed test failed. F-3-3 is an unlisted-claim mismatch, so the claims audit is not complete enough for PASS.

## Copy audit

Counts split on whitespace. URLs, file paths, version strings, and time-format tokens count as one word. Repeated navigation terms are listed once. Commands and code literals in README fences are not sentences. No item exceeds 22 words and no banned marketing adjective appears. Flags below are still findings because length alone is not sufficient.

### Landing and app document

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | OK |
| Reflection Markers | 2 | F-3-2 at 390 px: text hidden |
| Demo | 1 | F-3-2 at 390 px: nav hidden |
| Mark audio | 2 | F-3-2 at 390 px: nav hidden |
| Privacy | 1 | F-3-2 at 390 px: nav hidden |
| Offline-ready | 1 | `offline-reload` |
| Manage marker data | 3 | OK |
| Save a listening marker | 4 | OK |
| Mark useful moments in audio | 5 | OK |
| For podcast and lecture listeners who want one short cue to revisit later. | 13 | OK |
| Try it with sample data | 5 | OK |
| Opens a saved lecture marker and its recall cue. | 9 | OK |
| No payment or account | 4 | `no-payment-or-account` |
| Markers stay in this browser | 5 | `local-only` |
| Works offline after your first visit | 7 | `offline-reload` |
| Audio source | 2 | OK |
| What are you listening to? | 5 | OK |
| Saved in this browser | 4 | `local-only` |
| Use a link | 3 | OK action |
| Use a local file | 4 | OK action |
| Episode or lecture link | 4 | OK label |
| Title optional | 2 | OK label |
| Set source | 2 | OK action |
| The link is saved only as a reference. | 8 | `reference-only-manual-timer` |
| Start the manual timer here when playback starts. | 8 | `reference-only-manual-timer` |
| Choose an audio or video file | 6 | OK action |
| Played here only. | 3 | `local-file-no-upload` |
| The file is not uploaded or saved. | 7 | `local-file-no-upload`, `local-file-session-only` |
| Manual timer | 2 | OK state |
| No source set | 3 | OK empty state |
| Open source | 2 | OK action; seeded target fails in F-3-1 |
| Go back 15 seconds | 4 | OK accessible action |
| Start timer | 2 | OK accessible action |
| Go forward 15 seconds | 4 | OK accessible action |
| Mark this moment | 3 | `capture-marker` |
| Saved markers | 2 | OK |
| Your markers | 2 | OK |
| Due only | 2 | F-3-7 |
| Export markers | 2 | `marker-export` |
| followed up | 2 | OK status |
| No markers yet | 3 | OK empty state |
| Save your first marker | 4 | OK action |
| Set a source, press Mark this moment, and write the question you want your future self to answer. | 18 | F-3-12 |
| An abstract dark orbit with one glowing marker becoming a folded paper cue | 13 | OK alt text |
| Save short audio cues to revisit later. | 7 | OK |
| Built by Param Factory · v1.0.2 | 6 | OK |
| Demo — sample data, nothing is saved | 7 | `demo-isolation` |
| Reset demo | 2 | `demo-isolation` |
| Start for real | 3 | `demo-isolation` |
| Try two saved lecture markers | 5 | OK demo h1 |
| Nothing is due. | 3 | OK empty state |
| Your next prompt will appear here on its check date. | 10 | F-3-12 |
| Capture | 1 | OK dialog label |
| Timestamp | 1 | OK label |
| Use MM:SS or HH:MM:SS. | 4 | OK instruction |
| My takeaway | 2 | OK label |
| One useful thought, in your own words | 7 | OK placeholder |
| Or add a voice takeaway | 5 | OK |
| Optional · stored in this browser | 5 | `local-voice-note` |
| Record | 1 | OK in voice-takeaway context |
| Remove recording | 2 | OK action |
| Future recall cue optional | 4 | OK label |
| What will I try or remember? | 6 | OK placeholder |
| Check again optional | 3 | OK label |
| Cancel | 1 | Standard dialog action |
| Save marker | 2 | `capture-marker` |
| Recall check | 2 | OK label |
| Before you reveal it… | 4 | F-3-8 |
| Reveal my takeaway | 3 | `reveal-first-review` |
| What you captured | 3 | OK |
| How did this land? | 4 | F-3-9 |
| Remembered it | 2 | OK result |
| Needs another look | 3 | OK result |
| Action done | 2 | OK result |
| Local data | 2 | OK dialog label |
| Own your markers | 3 | F-3-10 |
| Everything lives in this browser. | 5 | F-3-11 |
| Export a complete backup before clearing site data or moving devices. | 11 | `marker-export` |
| Download JSON backup | 3 | `marker-export` |
| Import JSON backup | 3 | `backup-import` |
| Delete all local markers | 4 | `delete-all-markers` |

### Generated feedback and error sentences

| Copy | Words | Result |
| --- | ---: | --- |
| Playback could not start. | 4 | OK: says what happened |
| Try the file player controls. | 5 | OK: recovery action |
| Local storage is unavailable. | 4 | OK: says what happened |
| Check this browser’s privacy settings. | 5 | OK: recovery action |
| Enter a valid time such as 12:34 or 1:02:03. | 9 | OK: correction example |
| Write a takeaway or record a voice takeaway. | 8 | OK: correction action |
| Marker updated. | 2 | OK result |
| Marker saved in N seconds. | 5 | Runtime measurement, not a standing speed promise |
| Review saved. | 2 | OK result |
| This marker stays in your due list. | 7 | `reveal-first-review` |
| Follow-up saved. | 2 | OK result |
| Complete backup downloaded. | 3 | `marker-export` |
| Voice recording is not supported here. | 6 | OK: says what happened |
| You can still type your takeaway. | 6 | `voice-unavailable-typed-fallback` |
| Microphone access was not granted. | 5 | OK: says what happened |
| Voice takeaway recorded locally. | 4 | `local-voice-note` |
| Source set. | 2 | OK result |
| Start the timer when playback begins. | 6 | OK next action |
| Choose an audio or video file. | 6 | OK correction action |
| Local file ready. | 3 | OK result |
| It has not left your device. | 6 | `local-file-no-upload` |
| Marker deleted. | 2 | OK result |
| Save a marker before exporting. | 5 | OK recovery action |
| Markdown exported. | 2 | `marker-export` |
| CSV exported. | 2 | `marker-export` |
| Sample markers reset. | 3 | `demo-isolation` |
| Your real markers were not changed. | 6 | `demo-isolation` |
| That file is not a valid backup. | 7 | OK: says what happened |
| Nothing was changed. | 3 | OK data-safety result |
| There are no markers to delete. | 6 | OK empty state |
| All local markers deleted. | 4 | `delete-all-markers` |
| An app update is ready. | 5 | OK status |
| Reload | 1 | Visible result; accessible name fails in F-3-13 |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Audio Reflection Markers | 3 | OK title |
| Mark useful moments from podcasts and lectures. | 7 | OK |
| Save one short cue to revisit later. | 7 | OK |
| Live product: URL | 3 | OK |
| What it does | 3 | OK heading |
| Saves an episode or lecture link and provides a manual timer. | 11 | `reference-only-manual-timer` |
| Plays a local audio or video file without uploading it. | 11 | `local-file-no-upload` |
| Captures a timestamp with a typed takeaway or optional voice note. | 11 | `capture-marker`, `local-voice-note` |
| Adds an optional future recall cue and check date. | 9 | `recall-cue-and-date` |
| Shows your cue before the saved takeaway, then lets you mark what happened. | 13 | `reveal-first-review` |
| Keeps markers and voice notes in this browser between visits. | 10 | `local-only`, `local-voice-note` |
| Exports Markdown, CSV, and a complete JSON backup; imports JSON backups. | 10 | `marker-export`, `backup-import` |
| Works offline after the first visit. | 6 | `offline-reload` |
| Try the demo | 3 | OK heading |
| Open URL. | 2 | OK instruction |
| It loads two saved lecture markers in a separate demo area. | 11 | `demo-isolation`; source defect F-3-1 |
| Reset demo restores the sample. | 5 | `demo-isolation` |
| Start for real discards demo changes. | 7 | `demo-isolation` |
| Run locally | 2 | OK heading |
| Requires Node.js 20 or newer. | 5 | OK setup requirement |
| Vite prints the local development URL. | 6 | OK setup result |
| Production output is always written to dist. | 7 | Verified by build |
| The exact deployment build command is npm run build, and the static deploy directory is dist. | 15 | OK deployment instruction |
| Test and verify | 3 | OK heading |
| Playwright is pinned to 1.58.2. | 5 | OK test requirement |
| If its browser is not already available, run npx playwright install chromium once. | 13 | OK test instruction |
| Privacy and data model | 4 | OK heading |
| The app has no account or analytics. | 8 | `no-account-or-analytics` |
| It does not upload or remotely process your media. | 9 | `no-remote-media-processing` |
| Markers and voice notes stay in this browser. | 8 | `local-only`, `local-voice-note` |
| Local media files are available only until you reload or close the page. | 13 | F-3-3 |
| A source link is saved only as a reference. | 9 | `reference-only-manual-timer` |
| Download a JSON backup before clearing site storage or moving devices. | 11 | `marker-export` |
| See Privacy and Terms. | 4 | OK links |
| Artwork provenance is recorded in .factory/design.md and assets/src/. | 8 | OK documentation pointer |
| Project structure | 2 | OK heading |
| src/main.ts — app workflow, playback/timer, capture, review, import/export. | 8 | Technical inventory |
| src/db.ts — small IndexedDB persistence layer. | 6 | Technical inventory |
| src/styles.css — product-specific responsive visual system. | 6 | Technical inventory |
| public/manifest.webmanifest — install metadata and icons. | 6 | Technical inventory |
| vite.config.ts — multi-page build and post-emit precaching service worker. | 8 | Technical inventory |
| public/staticwebapp.config.json — Azure cache, MIME, CSP, and permissions policy. | 9 | Technical inventory |
| tests/ — Vitest unit tests and Playwright mobile/offline/accessibility tests. | 9 | Technical inventory |
| .factory/design.md — visual thesis, tokens, interaction rules, and asset provenance. | 10 | Technical inventory |
| Browser support | 2 | OK heading |
| Automated browser checks use current Chromium. | 6 | Accurate scope |
| Voice recording needs microphone support. | 5 | Capability requirement |
| You can type a takeaway when voice recording is unavailable. | 10 | `voice-unavailable-typed-fallback` |
| License | 1 | OK heading |
| MIT. | 1 | Matches LICENSE |
| See LICENSE. | 2 | OK link |

## History re-check

Every earlier finding was checked against the live site and current code.

| Earlier finding | Result in round 3 |
| --- | --- |
| F-1-1 | Fixed: job, audience, first action, and result sentence are above the mobile and desktop fold. |
| F-1-2 | Fixed: one-click isolated demo, banner, reset, and exit work. |
| F-1-3 | Fixed: offline copy has `offline-reload`; live offline demo reload passes. |
| F-1-4 | Fixed: browser-storage copy has request and namespace proof. |
| F-1-5 | Fixed: reference-only/manual-timer wording and test agree. |
| F-1-6 | Fixed: local-file no-upload request test passes. |
| F-1-7 | Fixed: broad footer claim was replaced by specific tested facts. |
| F-1-8 | Fixed: unknown route is a styled HTTP 404. |
| F-1-9 | Fixed: malformed backup recovery produces no console error. |
| F-1-10 | Fixed: route metadata, sitemap, canonical, OG/Twitter data exist. |
| F-1-11 | **Reopened as F-3-2:** required nav exists on desktop but is hidden on phones. |
| F-1-12 | Fixed: job-first h1 is retained. |
| F-1-13 | Fixed: first-screen label is factual. |
| F-1-14 | Fixed: node metaphor is gone. |
| F-1-15 | Fixed: vague privacy slogan is gone from the landing page. |
| F-1-16 | Fixed: Export markers names the result category. |
| F-1-17 | Fixed: artwork provenance is outside the task UI. |
| F-1-18 | Fixed: README introduction is two short plain sentences. |
| F-1-19 | Fixed: manual timer replaces synced timer. |
| F-1-20 | Fixed in README; F-3-8/F-3-9 identify remaining dialog copy, not the earlier README sentence. |
| F-1-21 | Fixed: user prose uses browser language. |
| F-1-22 | Fixed: offline statement is plain and tested. |
| F-1-23 | Fixed: privacy prose is specific and tested except the distinct F-3-3 clause. |
| F-1-24 | Fixed in implementation; exact proof mismatch is reopened through F-2-9/F-3-3. |
| F-1-25 | Fixed: browser support is narrowed and typed fallback is tested. |
| F-2-1 | Fixed: complete sample marker is above the 844 px fold. |
| F-2-2 | Fixed: typed and fixture voice capture have tagged tests. |
| F-2-3 | Fixed: cue/date and reveal/result have tagged tests. |
| F-2-4 | Fixed: all export formats and valid import have tagged tests. |
| F-2-5 | Fixed: voice storage/no-network and typed fallback tests pass. |
| F-2-6 | Fixed: Manage marker data is retained. |
| F-2-7 | Fixed at its original two locations; F-3-4 records the same metaphor on 404. |
| F-2-8 | Fixed: legal and 404 icon/share metadata are complete. |
| F-2-9 | **Reopened as F-3-3:** test proves reload, not the retained close-page clause. |

## Structure, accessibility, and visual identity

- Titles follow the required pattern and stay within 60 characters: home, Demo, Privacy, Terms, and 404.
- Every tested route has `lang="en"`, one h1, one main landmark, description, canonical, OG/Twitter metadata, SVG favicon, Apple-touch icon, and manifest.
- `/does-not-exist` returns 404 with the designed page; `/404.html` itself returns 200 as a static document.
- Sitemap, robots, social image, favicon, manifest, home, demo, Privacy, and Terms return successfully.
- The sample external link fails as F-3-1.
- Route scroll restoration passed; home focus failed as F-3-5.
- The factory URL verifier passed with zero console errors, one h1, `lang`, main, image alt text, and labeled buttons.
- Live Axe scans of mobile home, mobile demo, and desktop home returned zero violations.
- Reduced-motion CSS disables transitions and smooth scrolling. F-3-14 records the 36 px banner/toast action targets.
- The dark orbital grid, editorial serif, citrus marker, original orbit art, square outlines, and restrained motion match `.factory/design.md`. The site is visually distinct and is not a generic gradient/card SaaS template.
- F-3-6 records the missing standard content sections; F-3-2 records the phone header exception.

## Quality-gate evidence

From the clean clone at the reviewed commit:

- `npm ci`: passed; 142 packages installed, 0 vulnerabilities.
- `npm test`: 5 passed.
- `npm run lint`: passed.
- `npm run build`: passed; `dist/` emitted; main JS 19.6 KB raw and CSS 18.5 KB raw.
- Every claims command: 19 commands, 38 project executions passed.
- `npm run test:e2e`: 57 passed, 1 intentional desktop skip, 0 failed.
- Live request/privacy log: same-origin GETs only during the full demo mutation/reset/exit flow.
- Live offline reload: passed after worker control.

## Missed leverage

No missing AI feature is recorded. The brief explicitly prohibits transcription and summaries; adding model use would violate the product boundary. Import/export already covers device transfer, and cloud sync would conflict with the current local-only contract unless it became a separate, explicit scope. Repository search found no embedded provider key or runtime AI endpoint.

## What would make this perfect

Use a working sample lecture link, restore phone header navigation, align the close-page promise with a tagged test, replace the remaining metaphorical and inconsistent copy, fix home route focus and the update action’s accessible name, and add the required workflow/privacy sections. Then rerun the full link crawl, exact claims list, phone demo, back/forward focus checks, and copy audit; PASS requires all of them to return zero findings.
