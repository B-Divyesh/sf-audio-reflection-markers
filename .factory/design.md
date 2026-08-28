# Audio Reflection Markers — visual thesis

## Direction: generative geometry / the memory orbit

This is a focused listening instrument, not a podcast library. Its visual language treats a long recording as an orbital line and each useful thought as a precise node pulled into focus. Concentric arcs, timestamp ticks, and small irregular polygons explain the job: catch one moment, turn it into one cue, return to it later. Geometry is sparse and purposeful; there are no decorative waveform walls, generic gradients, or fake media artwork.

The app is intentionally single-mode and dark. A dim listening-room ground reduces glare during long sessions, while warm paper and citrus marker colors make the saved thought feel physical and retrievable.

## Tokens

- `ink-950` `#111512`: app background, like a quiet room.
- `ink-900` `#171D19`: raised work surfaces.
- `ink-800` `#252D27`: dividers and inactive controls.
- `paper-100` `#F4F0E5`: primary text (contrast 16.1:1 on the ground).
- `sage-300` `#B6C4B0`: supporting text (contrast 9.4:1).
- `citrus-400` `#D8F35A`: primary marker and focus (contrast 13.2:1 with `ink-950`).
- `coral-400` `#FF8066`: due/revisit signal; always paired with words or icons.
- `aqua-300` `#78D8C8`: completed/remembered signal; always paired with words or icons.
- `danger-300` `#FF9B86`: destructive/error text.

Surfaces use solid fills and one-pixel outlines; elevation is a short dark offset, not glass blur. The accent never fills large areas, so it remains a true marker.

## Type

Two system stacks avoid a font payload and remain fully offline:

- Display: `Georgia, 'Times New Roman', serif` — editorial, reflective, and distinct from dashboard software. Used only for the title and moment excerpts.
- Utility: `Inter, ui-sans-serif, system-ui, sans-serif` — compact, legible controls and metadata. Inter is not fetched; installed system fonts simply fall through.

The scale is 14 / 16 / 20 / 28 / clamp(40–68) px. Body copy is never below 16px. Timestamps use tabular figures and slightly expanded tracking.

## Spacing and responsive behavior

An 8px base rhythm with 4px optical adjustments. Interactive targets are at least 44px. The desktop shell tops out at 1180px and places the listening desk beside the marker ledger. At 760px they stack; the phone drops secondary explanatory copy, keeps the capture control near the thumb, and turns the marker editor into a bottom sheet. Safe-area insets pad both top and bottom.

## Interaction grammar

- The live playhead is a moving dot on a single orbital rail; marker ticks accumulate around it.
- “Mark this moment” opens an editor from the control’s physical location (bottom sheet on phones, centered dialog on wide screens).
- Saved markers arrive with a short 180ms lift. Review reveals the takeaway only after the listener attempts the cue.
- Actions acknowledge immediately through pressed states and a polite live status line. Deletion requires a specific confirmation.

Motion is limited to opacity and transform over 150–240ms. Nothing loops. Under `prefers-reduced-motion: reduce`, transitions and smooth scrolling are disabled and state changes are immediate.

## Original asset plan and provenance

The functional orbit, icons, and logo mark are hand-authored SVG/CSS so they remain sharp, accessible, and deterministic. One raster illustration gives the empty state a tactile product world: a topographic orbital sculpture with one citrus node becoming a small paper cue. It does not depict transcription, downloading, or any unsupported capability.

### Prompt sheet

- Use case: `stylized-concept`
- Asset type: app empty-state / onboarding illustration
- Subject: one abstract orbital path with a single luminous marker separating into a small folded cue-card shape
- World: dark listening-room void, diagrammatic but tactile
- Materials: charcoal paper, graphite, matte ceramic, one translucent acrylic node
- Light: narrow soft studio light, deep controlled shadows, no bloom
- Lens/composition: square, centered sculptural cluster, generous clean margins
- Palette words: near-black green, warm ivory, sharp citrus, restrained coral, muted aqua
- Negative list: people, faces, headphones, microphones, speakers, screens, text, letters, numerals, logos, brands, watermarks, generic waveform, gradients, glossy 3D app icons, clutter

Final prompt: “Use case: stylized-concept. Asset type: app empty-state and onboarding illustration. In a dark listening-room void, create one abstract orbital path made from charcoal paper and graphite, with a single translucent citrus marker separating into a small folded warm-ivory cue-card shape. Tactile editorial sculpture, restrained generative geometry, subtle muted-aqua and coral registration points, narrow soft studio light with deep controlled shadows, square centered composition and generous clean margins. No people, faces, headphones, microphones, speakers, screens, text, letters, numerals, logos, brands, watermark, generic waveform, gradients, glossy app icons, or clutter.”

- Generator: Azure AI Foundry factory image deployment via `/opt/fleet/lib/gen-image.sh`
- Generation date: 2026-08-28
- License/provenance: original generated asset made for this product; no external source material or copyrighted characters.

