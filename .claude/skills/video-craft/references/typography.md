# Typography and text motion

All numbers at 30 fps. "Build" names a component in `src/motion` (see `components.md`) or says **recipe** (the numbers are enough to write it; build it into the kit when first needed).

Easing names: `E.cam` bezier(.6,.05,.35,1) · `E.in` easeOutQuart (.25,1,.5,1) · `E.arrive` / `E.settle` easeOutExpo (.16,1,.3,1) · `E.smooth` (.22,1,.36,1) · `E.flow` (.84,0,.16,1) · `E.launch` (.7,0,.84,0) · `SETTLE` spring {damping 18, stiffness 120, mass 1} (~3% overshoot, ~18 f).

## 1. Type system rules

- **Two families**: one sans for all kinetic and UI type (weights 300 to 800), one mono for ids, amounts, hashes and small-caps system labels (+0.12 em tracking). Serif only to signal "document", or as the single italic emphasis word in reel captions.
- **Light stem + bold payload** in one line ("at **scale**", "**Unlock** insights"): one bold verb or number per line. Big statements in a light weight.
- **Optical tracking**: −0.04 em at ≥ 108 px, −0.035 em on bold headlines, −0.01 em at ≤ 36 px. Tabular numerals in tables and counters. No widows; titles on one line where intended.
- **Sizes at 1080p**: read text ≥ 26 px, UI body ≥ 28 px, key datum ≥ 40 px (40 to 60 px after a push-in), hero lines 84 to 140 px, one-word slams up to edge to edge.
- **House style that reads as mature**: bold sentence-case headline ending in a full stop, a grey regular subline, small uppercase mono labels for system words. The old line shrinks and greys into a header instead of cutting away (`HeaderShift`).
- **Copy economy**: key copy ≤ 4 words + subline; UI copy ≤ 12 words per beat held ≥ 2.5 s; a brand film carries only 3 to 5 supers; spots show 4 to 9 words at a time (about 45 words in a 16 s spot); cards 1 to 4 words held 0.5 to 1.6 s.
- **Never**: per-letter glitch scrambles on headlines, gradient rainbow text, more than one weight swap per line, em or en dashes on screen.

## 2. Reveal grammars (pick one primary grammar per film)

| Technique | Numbers | When | Build |
|---|---|---|---|
| **Blur-rise reveal** | opacity 16 f `E.in`, blur 12 → 0 in 9 f, +10 px rise, 2.3 f word stagger; exit 8 f `E.cam` | default entrance for any text or element; blur-out exit | `BlurIn` |
| **Word build, light → ink** | word every 5 f (spots: every 2.4 f), each enters ~12 px low at ~40% ink, full ink in 7 to 14 f; second line starts while the first settles; can accelerate to 1 word/f at the end of a card | hook questions, headlines, claim cards | `WordBuild` (`every`) |
| **Tinted-lead word reveal** | each word fades in 6 f at a light tint of the accent, settles to final colour over the next 8 f while the next word arrives; stagger 6 to 7 f (0.3 to 0.5 s on beats in music-led films) | taglines, lower thirds, end lines; softer than blur-rise | recipe: `interpolateColors(f-(at+i*6),[4,14],[tint,final])` |
| **Soft-mask L→R reveal** (product voice) | feathered mask ~150 to 200 px over 7 to 11 f per line; line 2 offset 7 f, 24 f per line | anything the product or assistant "says" | recipe: `maskImage: linear-gradient(90deg,#000 p%, transparent p+10%)` |
| **Hard type-on wipe** (brand voice) | unfeathered `clipPath: inset(0 ${100-p}% 0 0)`, glyphs sliced mid-letter, ~35 chars in 8 f (≈130 cps), then scale 1.00 → 1.03 over 45 f | brand claims. Rule: soft = product speaks, hard = brand claims; one grammar each per film | recipe |
| **Colour-tail type-on** | 18 to 22 cps; last 3 to 5 chars in the accent, cooling to ink 6 to 7 f after appearing | claims over picture, assistant messages | `TailType` (`fpc` 1.4 to 1.7, `tail` 5) |
| **Leading-edge type-on** | 22 cps; each char appears in the accent 6 px low, settles to ink in 5 f; visible accent run 4 to 6 chars; exit = re-tint L→R then fade | series titles, lower thirds | recipe |
| **Gradient-edge line reveal** | soft L→R mask ~1 char per 1.2 f; chars behind the edge tinted; tail word stays tinted ~10 f | names, checklist lines | `TailType` |
| **Motion-blur slogan** | x-blur 40 → 0 px in 4 f, x +60 → 0; exit x-blur + scale-down into the next move | the one slogan word | `BlurIn` (blur 40) or recipe |
| **Baseline-mask line rise** | glyphs rise 45 → 0 px in 5 f `out(quad)` clipped at the baseline, then drift up 0.08 px/f; line 2 at +10 f | chapter cards in roundups | recipe |
| **Karaoke fill** | whole sentence placed dim; a fill sweeps word by word on VO word timestamps (~0.25 s/word), each word with a 5 f soft gradient edge | the thesis line, at most twice per film | recipe: `backgroundImage: linear-gradient(90deg, ink f%, dim f+8%)` + `WebkitBackgroundClip: text` |
| **Tracking collapse** | letter-spacing 0.6 em → 0 over 15 f `out(quad)`; taglines 0.35 em → 0 / 15 f; word gaps 1.5x → 1x over 0.5 s | light-weight big titles, end lines | `TrackIn` |
| **Tracking blow-out exit** | 0 → +0.25 em in 12 f, opacity 1 → 0 over f4 to 12, x +40 | exit of a name card | recipe |

## 3. Supers locked to the voice

| Technique | Numbers | When | Build |
|---|---|---|---|
| **Word-locked super** | text travels ~1400 px in 5 f from off-right (bezier .05,.9,.3,1), no fade, then keeps drifting ~100 px over 1 s; starts 2 to 3 f before the VO word | the 3 to 5 supers of a brand film | recipe |
| **Trail then lock** | supers trail the word by ~10 f in the first half of a film ("underlining"), lock exactly in the second half ("stating") | VO films | timing rule |
| **Scale-settle + endless drift** | arrive 0.66 → 1.0 spring {d14, s120, m.8} (~14 f, ~1% overshoot), then scale ×(1 → 0.9) linear over 60 f; a caption persisting across cuts scales 1.0 → 0.74 over 90 f | every held caption: type never sits still | recipe |
| **Persistent stem** | stem fixed across cuts; bold payload swaps every 2 beats (18 to 26 f), dropping in +10 px → 0 over f6 to 14, fade f6 to 10 | breadth montages ("Works with ___") | recipe |
| **Sentence split across shots** | 3 fragments of 3 to 4 words, 36 f each, one chunk per cut; last fragment lands on a clean field with the bold payload | a brand line over vignettes | recipe |
| **One-word card on the syllable** | hard cut 0 to 1 f before the syllable onset; 0.7 → 1.0 in 6 f `out(cubic)`, then +0.04 linear creep | the dramatic pause before a slogan | recipe |
| **Type it as you say it** | product nouns type while the VO says them: start ~0.5 s before the word, end on its last syllable | VO explainers | `Typed` |

## 4. Layout behaviours

| Technique | Numbers | When | Build |
|---|---|---|---|
| **Growing sentence, shrink-to-fit** | each new word appends right; the line scales down and re-centres to fit ~1100 px; spring {d20, s120 to 140} (~12 f) per append; may start 1.8x → 1.0x | one sentence carried across several beats | `FollowLine` (centred newest word) or recipe: `scale = min(1.8, maxW/width)` |
| **Headline follows its newest word** | the line slides so the newest word stays centred (12 f per word), words blur in on cue (blur 16 → 0, 9 f); when complete, eases to the whole line centred over 16 f | kinetic manifesto lines | `FollowLine` |
| **Pre-laid word pop** (localisation-safe) | every word occupies layout from f0 (opacity 0, never `display:none`), so nothing re-centres; each word appears in 1 f at 112%, 8 px low, settles to 100% in 4 f `out(cubic)`; +4 to +8 f apart; whole line breathes 1.03 → 0.98 | role / chapter cards, any film that will be translated | recipe (store pops as beats) |
| **Re-centring append** | new word drops 20 px in 4 f and the line slides to re-centre over 7 f ease-out | only when no localisation is planned | recipe |
| **Shrink-settle opener** | first card starts 1.45x and decelerates to 1.0 over 31 f (half the travel in the first 10 f); the next card grows (0.6 → 1.0 over 12 f) so consecutive cards breathe in opposite directions | hook cards | recipe |
| **Word append with clip edge** | first part alone 1.0 s, then the bold payload slides in from the right with soft blur and a 1-frame clip edge, ~0.2 s; the first part nudges left to re-centre | payoff line | recipe |
| **Field → chip** | full-frame saturated field holds ~20 f with word 1 bold, collapses into a chip behind it in 4 to 6 f (bezier .8,0,.2,1; 1 f is missed), revealing a pale tint of the same hue; chip drifts −64 px over 13 f ease-out; word 2 appends, gap closing 40 → 12 px over 10 f | chapter cards in VO breaths ("the colour you just saw becomes the highlight") | recipe |
| **Line add / replace** | line 2 arrives +4 to +5 f after line 1; line 1 jumps up half a line in 1 to 2 f; replace variant swaps line 1 for a 2-line block in 1 f while the background persists | 2-line cards | recipe |
| **Word staircase** | x +120 px per line, 12 f stagger, scale 1.15 → 1 over 6 f; ragged indents 40 to 60 px; tagline line 2 indented ~1.2 em and ~70 px lower with an accent slab between | hero kinetic lines, taglines | recipe |
| **Echo ghost from depth** | duplicate at scale .62 → 1, offset (+220, +70) → 0, 30% opacity, blur 6 → 0, spring {d18, s120}, slides into the main line | one premium headline per film | recipe |
| **Outline pillar words** | giant outline words ~330 px, 2 px stroke at ~40%, echo copies ±1 line-height delayed 2 + 2k f, drifting 6 px/s opposite; an underscore cursor on the last pillar | chapter / pillar words | recipe: `WebkitTextStroke: '2px <accent>'; color: transparent` |
| **Rolodex stack** | new term pushes in under the last; older goes Regular and up one line; new is Bold with an accent tail | lists of 3 to 4 capabilities | `SlotRoll` or recipe |
| **Slot roll** | items roll up out of an overflow-hidden line, 12 f each `E.smooth`, vertical blur peaking mid-move (5 px) | "Simplifying X / Y / Z" lists | `SlotRoll` |
| **Active-word list** | "One · Two · **Three**": active word goes heavy + accent (stack two weight layers and cross-fade), others fade, active one centres over 12 f | lists of 3 | recipe |
| **Typed chapter question** | stage A: first words 130 to 150 px on the brand field, block caret, 25 cps; stage B: 4 to 8 f dissolve + scale 1.08 → 1 to a pale card, full question at 48 to 52 px, frame 1.3 → 1; key term recolours and an underline sweeps 12 f ~6 f after typing ends | series spine ("What is X?") | recipe |
| **Caption becomes the input** | selection highlight draws 6 f; text deletes over 8 f to the caret; input box springs in {d200, s90} while the camera pulls 2.2 → 1 from the caret; new typing at ~25 cps | a claim line turning into the product | `CaptionToInput` |
| **Centre-typed sentence ending in a UI token** | types from the centre outward at ~17 cps (block stays centred); camera slides −700 px in 8 f `inOut(cubic)`; a status pill lands as the last "word" | payoff line ending in a state | recipe + `StatePill` |
| **From → to caption** | left-anchored 2-line caption at x ≈ 300; a media window slides in from the right in 8 f `out(cubic)`; caption scales to 55% and slides left; the window is the hinge | workflow ads ("From request / to receipt") | recipe |
| **Text behind subject** | full-scale on frame 1, ~380 px cap height, between the plate and a person matte; gradient sweep 0.5 s per pass; exit hard cut or 10 f fade | only with real live action and an alpha matte | recipe |
| **3D placed type** | extruded or planar type tracked into a scene; plane at 60 to 70° with a camera dolly | once per film at most | `Text3D` (see `3d.md`) |

## 5. Emphasis

| Technique | Numbers | When | Build |
|---|---|---|---|
| **Accent marker** | flat pale accent block behind 1 or 2 words, grows L→R like a selection in 10 f | the words that matter, the CTA | `Mark` |
| **Selection highlight with handles** (reel captions) | rounded accent box with corner handles behind one keyword, width 0 → 100% over ~5 f; the keyword swaps to an italic serif | at most 1 per phrase, ~1 every 3 to 4 s, 8 to 10 per reel | recipe |
| **Cursor-touch emphasis transfer** | a cursor touches a word: it scales to 1.45x with overshoot and goes bold (`wght` 300 → 700) in 6 f bezier(.34,1.56,.64,1); a second cursor touches another word and the weight moves there | "You approve. / It acts." role splits | recipe |
| **Punch word performs its meaning** | 0.25x → 1.0 (edge to edge) in 6 f `out(cubic)`, hold 4 f, shrink to 0.3x in 10 f `in(cubic)`, hard cut into a zoom-blur shot | one word per film | recipe (`Slam` is the 2.5 → 1 opposite) |
| **Slam and settle** | lands at 2.5x, eases to 1.0 in 8 f with blur 10 → 0, no overshoot | section openers ("Done.") | `Slam` |
| **Glyph → icon morph** | a glyph whose shape resembles the icon deforms and resolves into it in 8 to 12 f: glyph out 5 f while icon strokes draw f2 to f12 (`strokeDashoffset`, stroke = stem width ~0.09 em, `inOut(cubic)`); anchor chosen per language | "Verified", "Held" | recipe |
| **Word swap in a fixed frame** | old word out (−20 px, 4 f), new in (+20 → 0); frame width springs to the new text | "Any → Every" | recipe |
| **Strike on spoken words** | line drawn L→R in 6 f at mid x-height, 4 px; line 2 +5 f; on the VO word. Strike → pill variant: coral strike 10 f `inOut(cubic)`, block moves up 420 px in 12 f, a 4 px bar grows into a 60 px pill in ~10 f, replacement types inside | the "before" words | recipe |
| **Text colour sweep inside an artefact** | two stacked copies, top one in the accent clipped `inset(0 ${100-p}% 0 0)`, p over 36 f `inOut(sin)` | the one line of a receipt that matters | recipe |
| **Status scramble** | 6 to 10 f of jumbled glyphs while the colour moves grey → state colour | one state change only; never on headlines (reads cheap) | recipe |

## 6. Typing and counting

- **Typing rates.** Prompts 18 to 25 cps with a caret (blink on a 15 f cycle when idle, ~2 Hz); titles typed as spoken 14 to 17 cps; key words synced to speech 10 to 12 cps; assistant replies stream 25 to 30 cps or 6 to 8 words/s; texture-only config text 50 to 75 cps. **Anything a VO viewer must read: 30 to 40 cps max.** A macro prompt may type 12.5 cps before a match cut and 25 to 47 cps after it. One keyboard tick SFX per character (cap ~12/s). Build: `Typed`, `typedCount`.
- **Deliberate typo**: one per film, human voice only, corrected in 2 f.
- **Counters**: 0 → target in steps every 3 f (~0.6 s), rising from below with ease-out; then optionally a depth swap behind the subject (scale → 0.62). KPI ticks in 0.1 steps (1 step per 2 to 3 f) while the camera pushes. Counter +1 per landed event (~4 f apart). Count-up with vertical motion blur while digits move fast (blur ∝ speed², 4 px max, 40 f `out(cubic)`). Build: `Counter`, `BlurCount`.

## 7. Text and voice: who says what

- **Brand film**: 3 to 5 supers, all verbatim VO fragments on the exact word.
- **UI sections: no captions.** The VO says the benefit; the screen shows the specific (amounts, names, rule ids). They never say the same thing.
- **Feature verbs are never captioned**: the UI state is the caption (each VO verb gets exactly one UI state).
- **Lists**: the text is the VO's nouns, 1 to 4 words, on the syllable. **Diagrams**: labels are the nouns the VO says; the VO supplies the verbs.
- **Chapter cards are silent** and sit in VO breaths.
- **Human vs system voice**: the human speaks and types; the product's words exist only on screen (status pills, logs). A spoken ad-lib is not typed. If a user voice speaks a prompt, mark it visually (quoted, different style).
- **Live action**: one caption chunk per shot, cut with the shot. Never burn subtitles over UI text; reserve the bottom 140 px as subtitle-safe when localising.
- **Social reel captions** (one system per reel): a rolling top headline 12 to 15% from the top, 2 to 5 words visible, each word blurs in on its onset, the phrase blurs out; three tiers (grey regular filler, ink bold nouns, one italic serif swap word with the selection box). Keep the bottom 25% clear for the platform UI. Never both a top headline and bottom subtitles.
- Copy is human and specific ("Supplier invoice · March · 96.20"), never generic slogans; proof-read every frame for slips and clipped words.
