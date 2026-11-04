---
name: video-craft
description: Load before planning, scripting, storyboarding, building, rendering or reviewing any video made in this repo (product film, launch film, brand film, explainer, demo, ad spot, social reel, tutorial, sizzle). Holds the measured motion, typography, camera, transition, 3D, editing and sound craft distilled from ~60 analysed premium SaaS films, the hard quality rules, the end-to-end workflow (brief to delivery), the QA and self-critique gates, and the map of which reference file and Remotion component to use for each job.
---

# Video craft

This skill is a method, not a look. It holds **how** premium product films are made, with numbers measured frame by frame (all at **30 fps**). The brand (colours, logo, fonts, product, story) always comes from the brief and from `theme.ts`; never from this skill.

Code lives in the Remotion project: `src/motion/` (2D kit), `src/three/` (WebGL kit), `src/theme.ts` (the only file to re-skin), `pipeline/` (Python: VO timeline, mix check, containment check, master, QC, reference prep). The API of every component is in `references/components.md`.

## 1. Hard rules (never ship a film that breaks one)

**Clarity**
1. **Context first.** A cold viewer can state the problem by 5 s (social: by 3 s) and sees the product by 8 s (social) / 12 s (brand film). Never open on a logo alone or straight into a comparison.
2. **One idea per beat.** Key copy at most 4 words plus a small subline. A beat lasts 2.4 to 5 s. New information at least every 1.5 s, never a shot without new information for more than 1.5 s.
3. **Claim then proof within ~1.5 s.** Every VO claim gets a concrete on-screen proof. The VO says the benefit; the screen shows the specific (the amount, the name, the rule, the id). They never say the same words, except at a hero moment, where what is said is also written.
4. **Point the eye.** The camera or the focus is always on what the VO is talking about. One focus target at a time; it is sharp, inside the safe area, at least 28 px, held at least 1.2 s; everything else blurs or dims. Never blur what the VO names.
5. **Show one refusal.** In any approval story, one visible denial among approvals (HELD ■), one ask with a human (ASK ◆). All-green proves nothing. States are always shape plus label.

**Picture**
6. **Readable.** Read text at least 26 px, UI body at least 28 px, the key datum at least 40 px held at least 1.2 s (readable numbers 1.5 s), contrast at least 4.5:1. Push in to the one value; never show dense UI at 8 to 16 px in a wide.
7. **Contained.** Nothing sharp within 80 px of any frame edge, on any frame, including during camera moves. Verify with `pipeline/containment_check.py` on a `qa` render.
8. **Never static, never flat.** Every held element drifts or breathes (2 to 3% scale per 2 s). No plain white or flat colour backgrounds: use a stage with soft blooms and 2 to 6% grain. Grain on every gradient (no visible step over 8 px).
9. **Smooth.** Every camera arrival settles (about 3% overshoot over 18 f). Motion blur on anything faster than 20 px/frame, or keep it under 45 px/frame. Entrances fast-in, long soft settle; overshoot only on small pops (chips, checks, stamps).
10. **Mature, not gimmicky.** A calm, confident opening with one idea and space. Human, specific copy, never slogans or buzzwords. Restrained type: light big headlines with one bold payload, soft reveals; no per-letter scrambles, glitch text, confetti, emoji, clip-art icons, stickers, mascots or decorative drifting particles. Dense, realistic product screens; never sparse placeholder panels.
11. **Elegant rejection.** When something loses or is refused, never cut to black: drain it, push it back in depth, fold or dissolve it, then let the winner take the stage.

**System**
12. **2 or 3 transition systems per film, repeated** until they read as the film's style. Never reuse the previous film's transition system or signature move. Every light ↔ dark change is motivated.
13. **Learn from references, never copy them.** Extract techniques and numbers; never rebuild a reference's scene order, layout, lines, trademark shapes or palette. A benchmark film is only a floor to measure against.
14. **Fresh music per film**, instrumental under reading, resolved before the end card with at least 1 s hold.
15. **Voice first.** Warm VO, de-essed, 125 to 145 wpm (bursts up to 160 in 30 to 45 s ads; social reels 150 to 180). Voice at least 10 dB over the bed in every line (`mix_check.py`), no spoken word on a hit (voice starts at least 20 f after any impact). Master −14 LUFS, at most −1.0 dBTP, LRA 6 to 9.
16. **No em or en dashes in on-screen copy.** Fictional names and numbers only unless the brief supplies real ones; verify any real third-party name or headline before use.
17. **Quality over speed.** Full-quality renders, frame-by-frame QA and fixes before delivery; never deliver an unseen frame.

## 2. Workflow (brief to delivery)

Do the steps in order. Do not render the full film before steps 1 to 6 are approved.

1. **Brief.** Write down: format and length (§4), audience, the one-sentence point, the product layer(s) to show, the proof artefact at the end (a number on a record, a receipt, a shipped thing), CTA, brand tokens (fill `theme.ts`), and what the previous film used (transition system, signature moves, music) so this one differs. Ask the user for anything missing; do not invent brand facts.
2. **Reference study.** Pick 3 to 5 references for the format (user-supplied or from `references/sources.md`). Prep and break them down with `references/reference-study.md`. Extract techniques with numbers; never their scenes.
3. **Script.** One claim per sentence, one new noun per clause on diagrams, concrete over abstract, 125 to 145 wpm. Mark where each claim's proof appears. Load `references/story-structures.md`.
4. **Storyboard with traceability.** A table per beat: timecode, ON SCREEN, MOTION (technique name from the references), SOUND (bed state, SFX, VO line), product layer, transition system, **reference moments** (1 to 3 video ids + timestamps whose craft this beat matches). Pick the 2 or 3 transition systems and the 4 to 6 hero techniques here, and write why they differ from the last film. Save it as `STORYBOARD.md`.
5. **VO and beat grid.** Write the script into a builder JSON and run `pipeline/build_vo_timeline.py` (Edge TTS with word timings → scenes rounded to whole beats → props JSON with cue frames). Default grid 120 BPM = 15 f/beat. Supers land 2 to 3 f before their word; chapter changes in VO breaths; hits in breaths. Load `references/editing.md` and `references/sound.md`.
6. **Styleframes.** 12 to 14 full-res stills (`npx remotion still … --frame=N`, batches of at most 4 for 3D), tiled into one board. Open it and look. Fix, then show the user before any full render when the visual direction is new.
7. **Build.** Components first from `src/motion` and `src/three` (`references/components.md`); build missing techniques from their recipes into the kit with a labelled demo, not one-off code in a film folder. Animations only from `useCurrentFrame()`; absolute frame props (`at`, `…At`).
8. **Score and mix.** Fresh instrumental on the same grid with stops and drops on the story beats; SFX palette from `references/sound.md`; run `mix_check.py` until it passes.
9. **Render and master.** `pipeline/master.py render` then `master` (CRF 12 intermediate → CBR 14 Mb/s, bt709 limited, 2-pass linear loudnorm). Load `references/mix-master.md`.
10. **QA.** `qc.py` (loudness, peak, bitrate floor, tags, black first frame, decode), `containment_check.py` on a `qa: true` render, contact sheet at 1.5 to 2 fps, every-frame tiles across every camera move and transition. Run the full `references/qa-checklist.md`.
11. **Self-critique and scorecard.** Write a short review against §1 and the scorecard in `references/qa-checklist.md`, with frame evidence and frame pairs (ours vs reference). Fix every gap unasked, re-check the fixed frames.
12. **Deliver.** New file name per version (never overwrite a file the user may have open), plus styleframes, board and `NOTES.md` (decisions, traceability table, scorecard, known gaps). Open the file for the user.

## 3. The numbers to design to (floor targets)

| # | Target | Minimum |
|---|---|---|
| 1 | Stake | problem stated by 5 s, payoff by 75% of runtime; 4 of 5 cold viewers can say what the product does |
| 2 | Voice | warm VO, voice over bed ≥ 10 dB every line, ≥ 4 dB over the loudest 100 ms of bed, no word on a hit |
| 3 | Readability | read text ≥ 26 px, UI body ≥ 28 px, key datum ≥ 40 px, contrast ≥ 4.5:1, key datum held ≥ 1.2 s |
| 4 | Encode | bt709 limited, CRF 12 to 15 or CBR 12 to 16 Mb/s, aq-mode 3, per-second floor ≥ 4 Mb/s, no black first frame |
| 5 | Banding | grain or dither on every gradient, steps ≤ 8 px |
| 6 | Motion blur | on anything > 20 px/frame, or keep moves ≤ 45 px/frame |
| 7 | Easing | every camera arrival two-stage: ease + ~3% overshoot settling over 18 f |
| 8 | Transitions | 2 or 3 systems, repeated; every light ↔ dark change motivated |
| 9 | 3D | real thickness ~6% of width, bevel catching light, Fresnel rim, DOF focus ramp |
| 10 | Type | optical tracking (−0.04 em at ≥ 108 px, −0.01 em at ≤ 36 px), tabular numerals, no widows |
| 11 | States | allow ● / ask ◆ / held ■, each clearly distinct from the accent, always shape + label |
| 12 | Sound | foley on every click/check/hold (≈ −24 dBFS), ≥ 80% of cuts on the beat grid, −14 LUFS, ≤ −1.0 dBTP, LRA 6 to 9 |
| 13 | Pacing | nothing static without new info > 1.5 s; ASL 3.5 to 4 s (brand film); hero beat at 35 to 40% of runtime when possible |
| 14 | CTA | ≥ 4 s on screen (films ≥ 30 s; spots ≤ 20 s: 2.5 s), URL ≥ 48 px from its first frame, 1 s hold after the music resolves |

## 4. Formats at a glance

| Format | Length | Shape (details in `story-structures.md`) | Cutting |
|---|---|---|---|
| Brand / launch film, VO + music | 60 to 90 s | greeting 1 to 3% · problem 6 to 15% · product acts in continuous takes 55 to 65% (one dark "machinery" block 6 to 11%) · payoff 15 to 20% · line + URL 6 to 10% | ASL 2.4 to 4 s by cut, perceived beat 1.2 to 1.5 s |
| Product overview / sizzle | 45 to 100 s | claim (dark, 1.5 to 4.5 s) / proof (light, 5 to 15 s) alternation, or a protagonist with a goal in 5 s and 3 verb chapters | name reveal at 20 to 25% |
| Agent / workflow demo | 60 to 100 s | benefit before UI ~30% · detect + propose 16% · human audits 12% · approve → execute → artefact 16% · recap 21% | loops of 10 to 15 s |
| Explainer | 100 to 245 s | problem · name · architecture drawn three times, one layer each · demo instantiating the diagram | visual beat every 6 to 8 s |
| Ad spot | 13 to 19 s | ask 0 to 2 s · product at work ~3.1 s (the longest shot) · two cards ~1.3 s · checklist 2.6 to 4.3 s · end card 2.5 s | hard cuts + 1-frame plates |
| Launch ad | 30 to 45 s | kinetic anthem, VO overview, call and response, or one-workflow take | kinetic ASL 1.3 to 1.8 s, workflow ASL 2.3 to 3.3 s |
| Social reel (9:16) | 30 to 55 s | payoff hook at 0.0 s · proof number by 7 s · mechanism in 3 steps · twist at 45 to 68% · single-ask CTA | new idea every 1.5 to 2.5 s |
| Roundup / tutorial / webinar shell | 75 s to 3 min | slot grid from data; shell 13% / body 60% / tips 12% / outro 12% | body takes 3 to 15 s with internal zooms |

## 5. Which reference file to load

| When you are… | Load |
|---|---|
| Writing the script or picking the structure for any format | `references/story-structures.md` |
| Studying a reference video (download, contact sheets, breakdown rubric, traceability) | `references/reference-study.md`, then `references/sources.md` for known-good references |
| Designing any text on screen: reveals, supers, captions, counters, typing | `references/typography.md` |
| Animating small state changes: cursor, click, toggle, chip, status flip, loader, toast, checklist | `references/micro-motion.md` |
| Building UI assemblies, panels, chains, diagrams, logs, hubs, cascades | `references/builds.md` |
| Showing a product screen, table, ledger, dashboard or log so it reads | `references/data-screens.md` |
| Moving the camera: tilted planes, pushes, whips, continuous takes, dollies | `references/camera.md` |
| Choosing and timing transitions between beats or acts | `references/transitions.md` |
| Any real 3D (extruded logo, glass, layer stack, tile field, streaks) | `references/3d.md` (and the `motion-3d` agent if present) |
| Setting the stage, colour roles, light/dark rhythm, depth, grain | `references/look-and-rhythm.md` |
| Cutting, ASL, beat grid, VO timing, cut-downs, localisation | `references/editing.md` |
| Music, SFX, silences and hits, the energy curve | `references/sound.md` |
| Mixing, mastering, encoding, delivery specs | `references/mix-master.md` |
| Checking styleframes or the final file; writing the self-critique | `references/qa-checklist.md` |
| Finding which component implements a technique, and its props | `references/components.md` |

## 6. Anti-patterns (seen in the reference sets; never ship these)

- Unreadable UI: 8 to 16 px labels in wides, raw 1:1 screen captures without zoom, fast unreadable scrolls, real-time typing, 4 to 10 s of "Thinking…" dead air (speed-ramp 3 to 4x, cut waits, add step pills).
- Generic stock (handshakes, people at laptops, aerials, visual puns), three soft metaphors instead of one sharp one, more than one literal footage gag.
- Vocal songs under reading; brick-wall flat beds that never duck; VO only 3 to 8 dB over the bed; VO above 185 wpm.
- Run-on claim VO, abstract buzzwords, "and soon" roadmap claims; lower thirds that repeat the VO verbatim during demos.
- No problem beat; breadth over depth (six features in one film); one layout held longer than ~15 s.
- Six transition systems in one film; decorative sparkles everywhere; brand-shape flashes on random footage.
- Clip-art personification: mascots, waves, winks, emoji, confetti on every payoff.
- Long tails: end card at 19 to 24% of a short spot; a 4.5 s static CTA; slow 9 s outros; tiny or QR-only CTAs.
- Production seams: template defaults left in, grammar slips, clipped copy, OS chrome, burned-in subtitles over UI text.
- From weak benchmarks: banding, no grain, no motion blur (judder at 60 to 150 px/frame), full-range BT.601 encode, a black first frame, empty 2 s beats, a 2.5 s CTA on a long film.

## 7. Extending the kit

When a storyboard needs a technique that has only a recipe: build it into `src/motion/` (or `src/three/`) as a component with absolute frame props, the house easing family, motion blur on fast moves and text at least 28 px; add a labelled demo scene to `examples/CraftLab.tsx`; add its row to `references/components.md` and replace "recipe" with the component name in the technique's reference file.
