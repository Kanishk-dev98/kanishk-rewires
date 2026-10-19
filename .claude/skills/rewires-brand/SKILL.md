---
name: rewires-brand
description: Kanishk.Rewires brand system (palette, type, K·R monogram, wordmark, voice, copy and lime rules). Load for every Kanishk.Rewires video, thumbnail, caption or post.
---

# Kanishk.Rewires brand

Source of truth: `config/brand.config.json`. Originals: `brand/references/brand-board.png`, `brand/references/logo-sheet.png`. Full standard: `docs/MASTER_PROMPT.md`.

## Identity

- Name: **Kanishk.Rewires** · wordmark **KANISHK.REWIRES** · handle **@kanishk.rewires**
- Tagline: "Rethink how you think." Philosophy: "Information is the new social currency."
- Board motifs: Information → Insights → Action → Advantage; "New ideas. Real advantage."
- Bio lines from the board: "Rewiring how you think about AI, business & growth." "Practical insights. Smarter systems. Real-world edge."
- Positioning: an operator's perspective on AI, business, marketing and growth. Not motivational, not news-reading, not a content farm.
- Voice: curious, sharp, practical, slightly provocative, credible.

## Palette

| Token | Hex | Use |
|---|---|---|
| charcoal | #0A0A0A | primary background (keep it truly dark) |
| graphite | #1F1F1F | cards, overlays, bar tracks |
| cream | #F6F4ED | primary light surface, type on dark |
| stone | #D9D6CC | secondary surface, body text on dark |
| grey | #9A9A93 | labels, secondary text |
| lime | #A7FF3F | the accent: one number, phrase or transition per scene |
| paleLime | #E8FFB8 | light accent, rarely |

No purple, no blue tech gradients, no rainbow, no heavy glow. Lime on cream is used as an underline marker, not as text colour (contrast).

## Type

Space Grotesk (headlines) · Inter (body, captions) · IBM Plex Mono (labels, data, sources, tracked uppercase). All Google Fonts (OFL), loaded in `studio/src/rewires/brand.ts`. The wordmark's REWIRES uses Instrument Serif as a stand-in for the board's light serif until artwork exists.

## Logo

- Monogram: `brand/logo/kr-monogram.png` (transparent cut-out of the approved circular K·R). Never redraw, recolour, stretch or add effects.
- Every video ends with `LogoReveal`: strands converge, then the monogram, then the wordmark and tagline, then a still hold.

## Copy rules

- No em or en dashes on screen. Exact brand spellings. Short lines, deliberate breaks (`\n` in scene text).
- In scene text, `*word*` marks the lime accent. Use one or two per scene, never every line.
- Captions highlight at most one word per scene, and only when the on-screen text does not already accent it.

## Third-party brand logos (HARD RULE)
- Always use the **official full-colour logo**, unaltered, e.g. Google's four-colour G, Gmail's M, Figma's five colours, the Gemini gradient. Never use a monochrome Simple Icons glyph or a logo recoloured to our palette.
- Source: the brand's press or brand-resources page, or the official Wikimedia Commons SVG. Store it in `studio/public/media/logos/` with a PROVENANCE entry.
- Simple Icons only for brands whose real logo is single-colour (X, Apple, Notion), in that real colour.
- Check every logo on the storyboard board before the full render.
