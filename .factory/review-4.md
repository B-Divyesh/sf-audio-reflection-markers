# Adversarial first-read review 4 — FAIL

Date: 2026-08-29  
Live URL: <https://audio-reflection-markers.sociobot.in>  
Method: fresh Chromium contexts at 390 × 844 and 1440 × 900; fresh local clone at `95b71c5`.

## Verdict

**FAIL.** One unlisted, externally useful demo-content claim remains. The live product is otherwise clear, tryable, locally isolated, and structurally sound. PASS requires zero findings and every claim-like sentence to have a matching `claims.json` entry and tagged sandbox test.

## Cold first read

Before scrolling, I understood: this lets podcast and lecture listeners mark a useful audio moment and save a prompt for revisiting it later. It is for podcast and lecture listeners. I should click **Try it with sample data** first.

This answer was available on both viewports from the h1, audience sentence, primary action, and adjacent result text. No cold-first-screen blocking finding.

## Findings

### Minor, required for PASS

#### F-4-1 — The demo-content promise is not in the claims contract

**Location/quote:** landing hero, `Opens a saved lecture marker and its recall cue.`; demo h1, `Try two saved lecture markers`; README, `It loads two saved lecture markers in a separate demo area.`

**Why this fails:** These are useful promises about what the one-click demo will show. `.factory/claims.json` has no entry for the existence of two saved lecture markers or for the hero's saved-marker-and-cue result. The current untagged browser test, `demo opens with a complete sample marker in the phone viewport`, is evidence but is not a `@claim:` test and cannot be run through the declared claims contract. `demo-isolation` verifies separate storage and reset behavior, not the advertised sample count/content.

**Concrete fix:** Add, for example, `demo-sample-content` to `.factory/claims.json` with the claim `The demo opens with two saved lecture markers, including a recall cue`, locations `landing hero, demo h1, README`, and test `npm run test:e2e -- --grep @claim:demo-sample-content`. Tag the existing mobile demo test (and extend it to assert exactly two sample markers and the cue) with `@claim:demo-sample-content`. Keep its fresh-context `/demo` entry point. Alternatively, remove the count/content promises and use less specific copy, but the demo requirement still needs observable coverage.

## Demo, sandbox, and privacy checks

- Clicking **Try it with sample data** opened `/?demo=1`. At 390 px its first view already showed the `Try two saved lecture markers` heading, a complete timestamped MIT OpenCourseWare marker, its cue, and **Review**.
- The persistent banner read `Demo — sample data, nothing is saved` and exposed **Reset demo** and **Start for real**. The declared `demo-isolation` test passed from the fresh clone.
- A fresh live demo context created only `demo:reflection-markers`; its initial request log contained six same-origin GET requests only (document, `demo-mode.js`, app JS/CSS, and artwork). There were no console errors.
- The brief explicitly excludes downloads, transcription, summaries, and sharing. The supplied link/manual-timer, local-file playback, marker/review, export/import, and local voice-note workflow cover the obvious value implied by the brief. No AI feature is appropriate or expected for this constrained local-first tool, and no provider key or remote AI call is present.

## Claims audit

All 19 declared commands were run independently from `/tmp/audio-reflection-review4`, a fresh clone with `npm ci`. Each executed its desktop and 390 px Playwright projects and passed (38 claim executions total):

`offline-reload`, `demo-isolation`, `local-only`, `reference-only-manual-timer`, `local-file-no-upload`, `no-account-or-analytics`, `no-payment-or-account`, `capture-marker`, `local-voice-note`, `recall-cue-and-date`, `reveal-first-review`, `marker-export`, `backup-import`, `voice-unavailable-typed-fallback`, `no-remote-media-processing`, `local-file-session-only`, `microphone-on-action`, `delete-all-markers`, and `no-media-copying-or-sharing`.

The request-log claims use the demo entry point and require same-origin GETs. No declared test failed. F-4-1 is an unlisted claim, not a failing declared command.

## Structure, routing, and visual checks

- Live `/`, `/demo`, `/privacy/`, `/terms/`, `/404.html`, `robots.txt`, `sitemap.xml`, manifest, favicon, and Apple-touch icon returned 200; an unknown live route returned HTTP 404.
- The home title is `Audio Reflection Markers — mark audio moments`; the home has one h1, description, canonical, OG/Twitter data, SVG favicon, and the designed dark orbital visual system. Legal/demo/404 pages have route-specific titles and metadata.
- Phone navigation exposes **Menu**, then **Demo**, **Mark audio**, and **Privacy**. Route focus and back/forward behavior are covered by the browser suite. The header/footer are consistent, include legal links and build text, and the 404 gives a direct route home.
- The generative-orbit illustration, editorial serif pairing, dark listening-room palette, outlined controls, and marker geometry match `.factory/design.md`; this does not present as a generic SaaS template.
- The full link set was checked through the live route audit and the existing browser tests, including the demo source links. No dead product link was found.

## Copy audit

Word counts use whitespace-delimited words. Labels and headings are included because the plain-words check applies to them. `F-4-1` is the sole flag; no unit exceeds 22 words, uses a banned marketing adjective, or has a non-result-naming button.

### Landing and app copy

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | pass |
| Reflection Markers | 2 | pass |
| Demo / Mark audio / Privacy / Menu | 1 / 2 / 1 / 1 | pass |
| Offline-ready | 1 | covered by `offline-reload` |
| Manage marker data | 3 | result-naming |
| Save a listening marker | 4 | factual label |
| Mark useful moments in audio | 5 | job-first h1 |
| For podcast and lecture listeners who want one short cue to revisit later. | 13 | pass |
| Try it with sample data | 5 | result-naming action |
| Opens a saved lecture marker and its recall cue. | 9 | **F-4-1** |
| No payment or account | 4 | `no-payment-or-account` |
| Markers stay in this browser | 5 | `local-only` |
| Works offline after your first visit | 6 | `offline-reload` |
| Audio source / What are you listening to? / Saved in this browser | 2 / 5 / 4 | pass |
| Use a link / Use a local file / Episode or lecture link / Title optional / Set source | 3 / 4 / 4 / 2 / 2 | pass |
| The link is saved only as a reference. | 8 | `reference-only-manual-timer` |
| Start the manual timer here when playback starts. | 8 | `reference-only-manual-timer` |
| Choose an audio or video file / Played here only. / The file is not uploaded or saved. | 6 / 3 / 7 | `local-file-no-upload`, `local-file-session-only` |
| Manual timer / No source set / Open source | 2 / 3 / 2 | pass |
| Go back 15 seconds / Start timer / Go forward 15 seconds / Mark this moment | 5 / 2 / 5 / 3 | result-naming controls |
| Saved markers / Your markers / Show due markers / Export markers | 2 / 2 / 3 / 2 | pass |
| No markers yet / Save your first marker | 3 / 4 | plain empty state |
| Set a source, press Mark this moment, and write one cue for your future self. | 15 | capture/review workflow |
| How it works / Save one useful audio moment | 3 / 5 | factual section |
| Set a source — Save a link as a reference or open a local file. | 14 | supported workflow |
| Mark a moment — Capture a timestamp, takeaway, and optional cue. | 10 | `capture-marker`, `recall-cue-and-date` |
| Review the cue — Reveal your takeaway after you try to recall it. | 12 | `reveal-first-review` |
| What stays private / Privacy limits | 3 / 2 | factual section |
| Links are saved only as references. | 6 | `reference-only-manual-timer` |
| Local media is not uploaded. | 5 | `local-file-no-upload` |
| Markers and voice notes stay in this browser. | 8 | `local-only`, `local-voice-note` |
| It does not transcribe or share media. | 7 | `no-media-copying-or-sharing` |
| Save short audio cues to revisit later. | 7 | factual footer line |
| Demo — sample data, nothing is saved / Reset demo / Start for real | 6 / 2 / 3 | `demo-isolation` |
| Try two saved lecture markers | 5 | **F-4-1** |
| Mark this moment / Timestamp / Use MM:SS or HH:MM:SS. | 3 / 1 / 4 | pass |
| My takeaway / Or add a voice takeaway / Optional — stored in this browser | 2 / 5 / 5 | `capture-marker`, `local-voice-note` |
| Record / Remove recording / Future recall cue optional / Check again optional / Cancel / Save marker | 1 / 2 / 4 / 3 / 1 / 2 | result-naming controls |
| Recall the cue before seeing your takeaway / Reveal my takeaway | 7 / 3 | `reveal-first-review` |
| What you captured / What happened after this cue? | 3 / 5 | pass |
| Remembered it / Needs another look / Action done | 2 / 3 / 2 | result-naming review controls |
| Local data / Manage marker data | 2 / 3 | factual settings heading |
| Markers and voice notes stay in this browser. | 8 | `local-only`, `local-voice-note` |
| Export a complete backup before clearing site data or moving devices. | 11 | `marker-export` |
| Download JSON backup / Import JSON backup / Delete all local markers | 3 / 3 / 4 | result-naming controls |
| Download Markdown / Download CSV / Reload | 2 / 2 / 1 | result-naming controls |

### README copy

| Copy | Words | Result |
| --- | ---: | --- |
| Audio Reflection Markers | 3 | title |
| Mark useful moments from podcasts and lectures. | 7 | plain job |
| Save one short cue to revisit later. | 7 | plain outcome |
| Live product | 2 | factual label |
| What it does | 3 | factual heading |
| Saves an episode or lecture link and provides a manual timer. | 11 | `reference-only-manual-timer` |
| Plays a local audio or video file without uploading it. | 11 | `local-file-no-upload` |
| Captures a timestamp with a typed takeaway or optional voice note. | 11 | `capture-marker`, `local-voice-note` |
| Adds an optional future recall cue and check date. | 9 | `recall-cue-and-date` |
| Shows your cue before the saved takeaway, then lets you mark what happened. | 13 | `reveal-first-review` |
| Keeps markers and voice notes in this browser between visits. | 10 | `local-only`, `local-voice-note` |
| Exports Markdown, CSV, and a complete JSON backup; imports JSON backups. | 10 | `marker-export`, `backup-import` |
| Works offline after the first visit. | 6 | `offline-reload` |
| Try the demo | 3 | factual heading |
| Open https://audio-reflection-markers.sociobot.in/?demo=1. | 2 | result-naming instruction |
| It loads two saved lecture markers in a separate demo area. | 11 | **F-4-1** |
| Reset demo restores the sample. | 5 | `demo-isolation` |
| Start for real discards demo changes. | 7 | `demo-isolation` |
| Run locally / Requires Node.js 20 or newer. / Vite prints the local development URL. | 2 / 5 / 6 | setup instructions |
| Production output is always written to dist. | 7 | build instruction |
| The exact deployment build command is npm run build, and the static deploy directory is dist. | 15 | deployment instruction |
| Test and verify | 3 | factual heading |
| Playwright is pinned to 1.58.2. | 5 | test instruction |
| If its browser is not already available, run npx playwright install chromium once. | 13 | test instruction |
| Privacy and data model | 4 | factual heading |
| The app has no account or analytics. | 8 | `no-account-or-analytics` |
| It does not upload or remotely process your media. | 9 | `no-remote-media-processing` |
| Markers and voice notes stay in this browser. | 8 | `local-only`, `local-voice-note` |
| A local media file is removed when you reload. | 10 | `local-file-session-only` |
| A source link is saved only as a reference. | 9 | `reference-only-manual-timer` |
| Download a JSON backup before clearing site storage or moving devices. | 11 | `marker-export` |
| See /privacy and /terms. | 4 | navigation instruction |
| Artwork provenance is recorded in .factory/design.md and assets/src/. | 8 | documentation pointer |
| Project structure | 2 | factual heading |
| Browser support | 2 | factual heading |
| Automated browser checks use current Chromium. | 6 | support scope |
| Voice recording needs microphone support. | 5 | capability condition |
| You can type a takeaway when voice recording is unavailable. | 10 | `voice-unavailable-typed-fallback` |
| License / MIT. / See LICENSE. | 1 / 1 / 2 | factual license text |

## Earlier-finding re-check

Every prior finding was rechecked on the current live site and source. None is reopened; the following compact table records each ID rather than relying on earlier “fixed” labels.

| Earlier ID | Current result |
| --- | --- |
| F-1-1 | fixed: job, audience, and sample action are above both folds |
| F-1-2 | fixed: isolated direct demo, banner, reset, and exit pass |
| F-1-3 | fixed: qualified offline copy and fresh offline-reload claim pass |
| F-1-4 | fixed: browser-storage claim has namespace/request proof |
| F-1-5 | fixed: reference-only/manual-timer wording and claim agree |
| F-1-6 | fixed: local-file no-upload claim passes |
| F-1-7 | fixed: privacy/account statements have individual claims |
| F-1-8 | fixed: unknown route is styled HTTP 404 |
| F-1-9 | fixed: invalid import remains a UI recovery, not console error |
| F-1-10 | fixed: canonical, share data, sitemap, and route titles exist |
| F-1-11 | fixed: complete desktop nav and reachable phone Menu exist |
| F-1-12 | fixed: home h1 names the job |
| F-1-13 | fixed: first label is factual |
| F-1-14 | fixed: empty-state metaphor removed |
| F-1-15 | fixed: vague privacy slogan removed |
| F-1-16 | fixed: export control names its result |
| F-1-17 | fixed: asset provenance is outside task UI |
| F-1-18 | fixed: README opening is plain and short |
| F-1-19 | fixed: manual timer is consistent |
| F-1-20 | fixed: README review wording is direct |
| F-1-21 | fixed: user text says browser, not storage implementation |
| F-1-22 | fixed: offline wording is plain and tested |
| F-1-23 | fixed: privacy text has specific request-log coverage |
| F-1-24 | fixed: local-file lifetime is limited to reload |
| F-1-25 | fixed: typed fallback and Chromium scope are explicit |
| F-2-1 | fixed: first mobile demo view contains usable sample marker/cue/review |
| F-2-2 | fixed: typed and voice capture claims pass |
| F-2-3 | fixed: cue/date and review result claims pass |
| F-2-4 | fixed: export/import claims pass |
| F-2-5 | fixed: voice privacy and typed fallback claims pass |
| F-2-6 | fixed: data control names its result |
| F-2-7 | fixed: source/marker sections use plain names |
| F-2-8 | fixed: legal and 404 icon/share metadata exist |
| F-2-9 | fixed: local-file statement matches reload test |
| F-3-1 | fixed: live MIT source links return successfully |
| F-3-2 | fixed: phone nav is exposed through Menu |
| F-3-3 | fixed: unsupported close-page lifetime wording removed |
| F-3-4 | fixed: 404 recovery contains no listening-desk metaphor |
| F-3-5 | fixed: home focus/announcement back-forward test passes |
| F-3-6 | fixed: How it works and privacy sections are present |
| F-3-7 | fixed: filter names shown result |
| F-3-8 | fixed: review heading is direct |
| F-3-9 | fixed: review result prompt is direct |
| F-3-10 | fixed: data heading is plain |
| F-3-11 | fixed: storage copy is precise |
| F-3-12 | fixed: recall-prompt terminology is consistent |
| F-3-13 | fixed: update action is named Reload |
| F-3-14 | fixed: audited mobile targets meet 44 px baseline |

## What would make this perfect

Add the one missing `demo-sample-content` claim entry and tagged count/cue assertion, then rerun the full claims audit. With that contract gap closed, the current product would be PASS-ready.
