# Look and rhythm

Brand colours, logo and fonts come from `theme.ts` (and the brand's own guidelines). This file is about **roles**: how premium films use light, dark, accent, depth and texture.

## 1. Stages (never flat)

- **Light stage** (product, people, answers): a near-white wash, soft accent corner blooms top-right and bottom-left, a lighter "spotlight" behind the subject, grain 2 to 3.5% (soft-light). Never flat `#FFFFFF`. Build: `LightStage`.
- **Dark stage** ("under the hood", the system acting on its own, thesis lines, the end): near-black corners to a tinted centre, a 1 px hairline or dot grid at ~6 to 7%, an accent glow from one corner, grain 5 to 6% (overlay). Keep the glow corner on the **same diagonal** as the light stage's blooms so light ↔ dark cuts feel continuous. Build: `DarkStage`.
- **Accent surface** (hero cards, the brand card that becomes the panel): an accent gradient used as a *surface*, never as a full-frame wash held for long. Build: `ACCENT_GRAD`, `CardToPanel`.
- **Chapter fields**: 2 to 3 hues from the accent family at most, one per chapter, or a luminance ramp (dark → mid → light) used as a progress bar across chapters.
- **Two dark looks with separate roles** are fine (thesis/hero dark with a corner glow; machinery dark with a grid); never two dark plates back to back.
- `qa` mode on stages: flat black, no grain, for containment checks.

## 2. Colour roles

| Role | Rule |
|---|---|
| Accent | one accent family only; on the things that matter (the brand moment, the active state, the marker behind a key word, the CTA) |
| Neutrals | ink for text, muted grey for sublines, hairlines at 1.5 px |
| Deny / held | its own family, used only for refused or held items; never the accent, never a red flash or shake |
| States | allow ● / ask ◆ / held ■: shape + label always; each clearly distinct from the accent (aim for a visible hue or lightness gap, e.g. ΔE ≥ 25) |
| "System is working" | the accent on a hairline, a conic border at 4°/f, or a pulsing brand-shape grid; never a sparkle cliché |
| Contrast | ≥ 4.5:1 for anything read; check light text on light washes and mid-grey on dark |

## 3. Depth on every frame

Three planes every time: **background** (stage, grid or scenery), **mid** (the UI or object), **foreground** (type, cursor, a pinned HUD). Add separation with depth of field (blur the context 4 to 10 px), soft long shadows (`0 30px 80px rgba(…,0.12)`), rim light on tilted windows, and parallax when the camera moves. Flat cards fading in place read as amateur.

## 4. Texture and finish

- Grain or dither on every gradient and glow (no visible step > 8 px; 8-bit banding shows as 50 px rings on dark glows).
- Motion blur on fast moves (`MotionBlur`, `UIPlane` whips, `SpeedRamp`), so nothing strobes.
- Vector UI everywhere (crisp at 2.4x).
- Encode with enough bits for dark glows (see `mix-master.md`).

## 5. Light / dark rhythm

| Pattern | Rule |
|---|---|
| **Light is product, dark is machinery** | light ~65 to 70% of runtime; **one** dark "under the hood" block (6 to 11% of runtime) for the under-the-hood claim; at most two (e.g. ~55% and ~95%) |
| **Dark claim / light proof** | 2 to 5 word claims on 1.5 to 4.5 s dark scenes, each followed by a 5 to 15 s light proof; vary it (eight identical flips get predictable by the fourth) |
| **Gets brighter when the product enters** | light = the answer |
| **Mode colour** | the background alone says who is acting (light = people set rules, dark = the system acts); reuse ≥ 2 times so the code is learned |
| **Kinetic hook strobe** | black ⇄ white type cards almost every card, but only through the hook act; later the dark cards become chapter titles |
| **Theme flip for the twist** | one circle or shape wipe for the single biggest turn (reels: 1 to 4 flips, the only "cuts", timed on a breath) |
| Every light ↔ dark change is motivated | a dive, a collapse, a sweep, a shared-glow cut on a downbeat; never a run of plain hard cuts |

## 6. Graphic language that reads as mature

- 1.5 px hairlines, pills with mono labels, icon tiles (rounded squares), metro lines at 45°, dashed rails; calm isometric 3D used once per film.
- **One large hero object per act that transforms** (shared-element morphs) instead of many small cards floating in space.
- Faithful, information-dense UI (real-looking code, documents, tables), editorial type, varied and purposeful entrances (not the same rise + blur on every element).
- **Ban list**: small generic white cards floating in empty space, self-drawn clip-art icons, sticker labels, drifting specks or particles as decoration, mascots, confetti, emoji, rainbow gradients, glitch effects.
- **One brand shape does the big jobs**: iris transitions, windows, the logo reveal and the "working" marker all use the brand's own shape (`ACCENT_SHAPE` / the logo silhouette). Never borrow another brand's signature shape (sparkles, gems, parallelograms, blobs, 3×3 loaders).

## 7. Pacing feel

- **Fast in, long soft settle.** Entrances 8 to 14 f on `E.settle`; position moves on `E.flow`; exits before a cut on `E.launch`. Overshoot only on small pops.
- **One idea per beat**, 2.4 to 5 s, held long enough to read; new information at least every 1.5 s.
- **Calm opening**: one idea and space; no gimmick openers.
- **Readable pacing**: when several items animate together, give each about one beat; prefer adding seconds to rushing. Not slow either: no dead air or long lead-ins.
- **Nothing static > 1.5 s** except deliberate holds; every held element has its own slow float (`Float`, amplitude ~6 px, period ~110 f).

## 8. Containment

Everything stays ≥ 80 px from each edge at 1080p on every frame, including during camera moves; grids sized to fit; titles fit on one line where intended. Verify with every-frame tiles across each move and `containment_check.py`.
