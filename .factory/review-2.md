# Adversarial first-read review 2 — FAIL

Date: 2026-08-29  
Live URL: <https://audio-reflection-markers.sociobot.in>  
Contexts: fresh Chromium profiles at 390 × 844 and 1440 × 900; a clean local clone for commands.

## Verdict

**FAIL.** The cold landing screen is clear, the declared claims pass, and demo storage is properly isolated. On a phone, however, the first screen *after entering the demo* does not show a saved sample marker. Several concrete README/UI promises also lack entries and tagged proof in `.factory/claims.json`. PASS requires zero findings.

## Cold first read

Before scrolling, at both widths, this is understandable as a tool to save a useful timestamped moment from a podcast or lecture with a cue to revisit. It names “podcast and lecture listeners,” and **Try it with sample data** is the evident first click. The adjacent copy says what should happen after it.

The home screen has one `<h1>`, the correct title, no console/page errors, and same-origin requests only. Its dark orbital-grid visual system is distinct and consistent with `.factory/design.md`, not a generic SaaS template.

## Findings

### Blocking

#### F-2-1 — Phone demo does not immediately show the product in use with a sample marker

**Location/quote:** at 390 × 844, tap **“Try it with sample data.”** The resulting first viewport repeats **“Mark useful moments in audio”**, a second **“Try it with sample data”** button, and **“What are you listening to?”**. The saved sample marker **“Name the decision before collecting more options.”** is below the viewport.

**Why:** The demo enters isolated mode but still looks like the landing/setup screen. The visitor cannot see the promised “saved lecture marker and its recall cue” without scrolling. The demo contract requires the first screen after clicking to already show realistic sample use.

**Concrete fix:** Give `/demo` and `?demo=1` a demo-first mobile layout: put one complete sample marker (timestamp, takeaway, cue, Review action) above the fold with the demo banner. Remove or compact the repeated hero in demo mode. Add a 390 × 844 Playwright assertion that the sample takeaway and cue are in the initial viewport after following the CTA.

### Minor, but required for PASS

#### F-2-2 — Capture and voice-note promise is an unlisted claim

**Location/quote:** README: “**Captures a timestamp plus a typed takeaway or optional local voice note.**”

**Why:** This is a product capability a visitor can rely on. No claim entry or `@claim:` test proves typed capture plus the optional local voice path from clean demo state.

**Concrete fix:** Add `capture-marker` and `local-voice-note` claims. Test demo typed capture to a rendered card, and test a fixture voice blob is playable and saved only to demo storage; otherwise remove the voice promise.

#### F-2-3 — Recall and action-date promises are unlisted claims

**Location/quote:** README: “**Adds an optional future recall cue and check date.**” and “**Shows your cue before the saved takeaway, then lets you mark what happened.**”

**Why:** These describe the central follow-up behavior but none of the seven declared claims proves them. The broad e2e test is not the required tagged claim proof.

**Concrete fix:** Add `recall-cue-and-date` and `reveal-first-review` claims. In demo, save a cue/date, assert the takeaway stays hidden until Reveal, then assert a selected review result updates the marker.

#### F-2-4 — Export/import promise is an unlisted claim

**Location/quote:** README: “**Exports Markdown, CSV, and a complete JSON backup; imports JSON backups.**”

**Why:** This is a concrete promise but has no claims entry. Existing broad coverage does not meet one observable tagged sandbox proof per claim.

**Concrete fix:** Add `marker-export` and `backup-import` entries. Test demo downloads for expected CSV/Markdown/JSON contents and import a valid backup only into demo storage.

#### F-2-5 — Voice privacy and browser-support promises lack proof

**Location/quote:** marker dialog: “**Optional · recorded and saved only on this device**”; README: “**Current Chromium, Firefox, and Safari are targeted.**”, “**Voice recording needs a browser that supports microphone recording.**”, and “**You can always type a takeaway instead.**”

**Why:** `local-only` saves a typed marker, not a voice recording. The suite runs Chromium only, so it does not substantiate cross-browser support or the typed fallback without `MediaRecorder`.

**Concrete fix:** Add a fixture-based voice/no-network claim and a `voice-unavailable-typed-fallback` test with `MediaRecorder` unavailable. Test claimed browsers in CI or narrow the support statement to what is verified.

#### F-2-6 — “Data” is not a result-naming button

**Location/quote:** header button **“Data.”**

**Why:** A cold visitor cannot tell that it opens export, import, and deletion controls.

**Concrete fix:** Rename it **“Manage marker data”** or **“Export and manage data.”**

#### F-2-7 — Two section labels use unexplained metaphors

**Location/quote:** **“Listening desk / live”** and **“Reflection ledger / 0.”**

**Why:** “desk” and “ledger” do not name the user task out of context. The useful headings below already do.

**Concrete fix:** Remove the decorative labels or use **“Audio source”** and **“Saved markers / 0.”**

#### F-2-8 — Legal and 404 routes have incomplete icon/share metadata

**Location/evidence:** live `/privacy/` and `/terms/` have no manifest or Apple-touch link. Live `/404.html` and the unknown-route 404 also lack those links and have no Open Graph/Twitter metadata. All routes point favicon only at `/icon-192.png`; none links an SVG favicon.

**Why:** The route skeleton does not meet the documented per-route icon/share requirements; a shared 404 has no product card.

**Concrete fix:** Link the manifest, Apple-touch icon, and self-hosted SVG favicon from every HTML route. Add 404-specific OG/Twitter title, description, and social image. Assert these in route-metadata tests.

#### F-2-9 — Two README privacy/storage statements exceed their observable proof

**Location/quote:** README: “**The app has no account, analytics, uploads, or remote media processing.**” and “**Local media files are opened only for this session and are not saved.**”

**Why:** The current request-log/account tests support no account, same-origin requests, and no local-file upload. They do not demonstrate that no remote media processing exists, nor that a selected local file is absent after a new browser session.

**Concrete fix:** Add a `no-remote-media-processing` request-log claim and a `local-file-session-only` fresh-context test that proves no source file survives. Otherwise remove those precise clauses.

## Claims and sandbox verification

From a clean clone, `npm ci`, `npm test`, `npm run build`, and `npm run lint` passed. Each exact `claims.json` command was run independently and passed.

| Claim | Result | Evidence |
| --- | --- | --- |
| `offline-reload` | Pass | `/demo` reloaded offline after worker control; sample lecture and “Working offline” rendered. |
| `demo-isolation` | Pass | A real marker stayed out of demo; reset restored samples; Start for real retained the real marker. |
| `local-only` | Pass | Demo capture made only same-origin GET requests and used `demo:reflection-markers`. |
| `reference-only-manual-timer` | Pass | Link stayed a reference; `+15` advanced the timer with no source fetch. |
| `local-file-no-upload` | Pass | Local WAV mounted in an audio element with no upload/non-same-origin request. |
| `no-account-or-analytics` | Pass | Demo worked without account fields or third-party requests. |
| `no-payment-or-account` | Pass | Demo was usable without payment/account/upgrade UI. |

The live demo request log was same-origin only. No AI feature is missing: the brief explicitly excludes transcription and summaries, and no raw provider key is present.

## Earlier findings re-check

Every finding in `review-1.md` was checked in the deployed site and current code. **F-1-1 through F-1-25 are fixed**, including malformed backup import: it gives the recovery message without a console error. F-2-1 is a new demo-presentation issue, not a demo-storage regression.

The styled unknown route returns HTTP 404 even after service-worker control. Home, demo, Privacy, Terms, sitemap, canonical URLs, titles, route focus, and crawled internal links work. No dead link was found.

## Copy audit

Word counts treat URLs, numbers, and keys as one word. This covers visible landing content and all README prose/headings; closed dialogs and data-dependent cards are excluded. No audited sentence is over 22 words.

### Landing

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | OK |
| Reflection Markers | 2 | OK wordmark |
| Demo / Mark audio / Privacy | 1 / 2 / 1 | OK links |
| Offline-ready | 1 | Tested offline fact |
| Data | 1 | F-2-6 → Manage marker data |
| Save a listening marker | 4 | OK factual label |
| Mark useful moments in audio | 5 | OK job headline |
| For podcast and lecture listeners who want one short cue to revisit later. | 13 | OK |
| Try it with sample data | 5 | OK action |
| Opens a saved lecture marker and its recall cue. | 9 | F-2-1 on phone |
| No payment or account | 4 | `no-payment-or-account` |
| Markers stay in this browser | 5 | `local-only` for typed markers |
| Works offline after your first visit | 7 | `offline-reload` |
| Listening desk / live | 3 | F-2-7 → Audio source |
| What are you listening to? | 5 | OK |
| Saved in this browser | 4 | `local-only` for typed markers |
| Use a link / Use a local file | 3 / 4 | OK |
| Episode or lecture link / Title optional | 4 / 2 | OK labels |
| Set source | 2 | OK action |
| The link is saved only as a reference. | 8 | `reference-only-manual-timer` |
| Start the manual timer here when playback starts. | 8 | `reference-only-manual-timer` |
| Manual timer / No source set | 2 / 3 | OK states |
| Mark this moment | 3 | F-2-2 needs capture claim |
| Reflection ledger / 0 | 3 | F-2-7 → Saved markers / 0 |
| Your markers / Due only | 2 / 2 | F-2-3 needs follow-up claim for behavior |
| Export markers | 2 | F-2-4 needs export claim |
| No markers yet / Save your first marker | 3 / 4 | OK empty state |
| Set a source, press Mark this moment, and write the question you want your future self to answer. | 18 | F-2-2/F-2-3 need claim coverage |
| Save short audio cues to revisit later. | 7 | OK |
| Terms / Built by Param Factory · v1.0.1 | 1 / 5 | OK |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Audio Reflection Markers | 3 | OK title |
| Mark useful moments from podcasts and lectures. | 7 | OK |
| Save one short cue to revisit later. | 7 | OK |
| Live product: URL / What it does | 3 / 3 | OK |
| Saves an episode or lecture link and provides a manual timer. | 11 | `reference-only-manual-timer` |
| Plays a local audio or video file without uploading it. | 11 | `local-file-no-upload` |
| Captures a timestamp plus a typed takeaway or optional local voice note. | 12 | F-2-2 |
| Adds an optional future recall cue and check date. | 9 | F-2-3 |
| Shows your cue before the saved takeaway, then lets you mark what happened. | 13 | F-2-3 |
| Keeps markers and voice notes in this browser between visits. | 10 | F-2-5 for voice notes |
| Exports Markdown, CSV, and a complete JSON backup; imports JSON backups. | 10 | F-2-4 |
| Can be installed and opened offline after the first visit. | 11 | `offline-reload` |
| Try the demo / Open URL. | 3 / 2 | OK |
| It loads two saved lecture markers in a separate demo area. | 11 | F-2-1 on phone |
| Reset demo restores the sample. | 5 | `demo-isolation` |
| Start for real leaves demo data behind. | 7 | `demo-isolation` |
| Run locally / Requires Node.js 20 or newer. | 2 / 5 | OK setup |
| Vite prints the local development URL. | 6 | OK setup |
| Production output is always written to `dist/`. | 6 | OK setup |
| The exact deployment build command is `npm run build`, and the static deploy directory is `dist`. | 15 | OK setup |
| Test and verify / Playwright is pinned to 1.58.2. | 3 / 5 | OK setup |
| If its browser is not already available, run `npx playwright install chromium` once. | 13 | OK setup |
| Privacy and data model | 4 | OK heading |
| The app has no account, analytics, uploads, or remote media processing. | 11 | F-2-9 |
| Markers and voice recordings stay in this browser. | 8 | F-2-5 for recordings |
| Local media files are opened only for this session and are not saved. | 12 | F-2-9 |
| A source link is saved only as a reference. | 9 | `reference-only-manual-timer` |
| Download a JSON backup before clearing site storage or moving devices. | 11 | F-2-4 |
| See Privacy and Terms. | 4 | OK |
| The generated empty-state artwork is original to this product; its prompt and provenance are recorded in `.factory/design.md` and `assets/src/`. | 18 | Provenance documentation |
| Project structure / Browser support / License | 2 / 2 / 1 | OK headings |
| Current Chromium, Firefox, and Safari are targeted. | 7 | F-2-5 |
| Voice recording needs a browser that supports microphone recording. | 9 | F-2-5 |
| You can always type a takeaway instead. | 7 | F-2-5 |
| MIT. / See LICENSE. | 1 / 2 | OK |

## What would make this perfect

Make demo mode lead with a complete sample marker on a phone, attach named sandbox proof to every retained workflow/voice/export promise, replace the vague/metaphorical labels, and finish route-level icon/share metadata. That would leave a first-time listener with an immediate example, accurate promises, and a consistent shell.
