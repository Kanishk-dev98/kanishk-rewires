# QA checklist, self-critique and scorecard

Look at the actual frames. Fix, re-check the fixed frames, then render. Never deliver an unseen frame.

## 1. Storyboard gate (before any build)

- [ ] Format, length and beat ratios chosen from `story-structures.md`.
- [ ] Stake / character in the first 3 s; problem statable by 5 s; product by 8 s (social) / 12 s (brand film).
- [ ] Every VO claim has a proof within 1.5 s; VO says the benefit, the screen the specific.
- [ ] One case end to end; proof escalates to an artefact; one refusal among approvals and one ask with a human (if the story has decisions).
- [ ] 2 or 3 transition systems named, plus 4 to 6 hero techniques; written reason why they differ from the previous film.
- [ ] Each beat cites 1 to 3 reference moments (id + timestamp); those frames were opened.
- [ ] Not a re-creation of any reference's scene order, layout or lines.
- [ ] Copy: human and specific; no em or en dashes on screen; fictional names unless supplied; real names and headlines verified.

## 2. Styleframe gate (12 to 14 stills, tiled into one board)

**Picture**
- [ ] Every text the viewer must read ≥ 26 px (UI body ≥ 28 px, key datum ≥ 40 px) at final framing; contrast ≥ 4.5:1.
- [ ] Key copy ≤ 4 words + subline; UI copy ≤ 12 words per beat.
- [ ] One focus target per frame, sharp, the thing the VO names; context blurred or dimmed.
- [ ] Dense, realistic screens; no sparse placeholder panels; one contrasting row in collections.
- [ ] Depth on every frame: background, mid, foreground.
- [ ] No plain white or flat backgrounds; grain on gradients; theme colours only; logo unmodified; states are shape + label.
- [ ] No overlaps: fixed zones; old elements move away or fade fully, never ghost behind new content.
- [ ] Safe area: nothing sharp within 80 px of any edge; grids sized to fit; titles on one line where intended; no awkward wraps or widows.
- [ ] Mature: calm opening, restrained type, no clip-art, stickers, mascots, confetti, emoji, drifting specks, glitch text.

## 3. Motion gate (preview or draft render, every-frame tiles around every move)

- [ ] Each UI act is one continuous take with 2 to 5 camera beats; nothing static > 1.5 s; every held element drifts or breathes.
- [ ] Every camera arrival has a settle (~3% / 18 f); no dead stops, pops, jitter or abrupt starts.
- [ ] Entrances on `E.settle`, moves on `E.flow`/`E.cam`, exits before cuts on `E.launch`; overshoot only on small pops.
- [ ] Moves > 20 px/f have motion blur, or stay ≤ 45 px/f; no strobing whips.
- [ ] Readable pacing: each item in a group gets about one beat; key datum held ≥ 1.2 s; not slow either (no dead air, no long lead-ins).
- [ ] Containment holds **during** every push, whip and dive (every-frame tiles across each move; `containment_check.py` on a `qa: true` render; `--skip` 3D shots).
- [ ] Every light ↔ dark change motivated; transition systems repeated, not multiplied.
- [ ] 3D shots pass `3d.md` §9.

## 4. Sound gate

- [ ] `mix_check.py` passes: voice ≥ 10 dB over the bed in every line and ≥ 4 dB over the loudest 100 ms of bed inside it.
- [ ] No spoken word on a hit (≥ 20 f after every impact); hits in breaths; what is said at the hero moment is also on screen.
- [ ] Fresh, instrumental bed with an energy curve (quiet under reading, drops on claims, dip on the contrast beat, silence before the reveal); resolved before the end card + ≥ 1 s hold.
- [ ] Foley on clicks, checks and the held moment (≈ −24 dBFS, ducked); typing ticks capped ~12/s; no whoosh on every cut.
- [ ] Silences and drops land on the planned frames (verify with `silencedetect` or the cue map) in every cut-down.

## 5. File gate (`qc.py` + eyes)

- [ ] Decodes clean; duration as intended.
- [ ] −14 LUFS (±0.5), ≤ −1.0 dBTP, LRA 6 to 9.
- [ ] yuv420p, limited range, bt709 tags, `+faststart`; per-second bitrate ≥ 4 Mb/s; no black first frame.
- [ ] No banding: no gradient step > 8 px; no blocking in dark glows at +2 stops.
- [ ] Contact sheet (1.5 to 2 fps) reviewed against SKILL.md §1 and §3.
- [ ] ≥ 80% of cuts on the beat grid; ASL within the planned mode per act.
- [ ] CTA on screen ≥ 4 s (films ≥ 30 s) or 2.5 s (spots ≤ 20 s); URL ≥ 48 px from its first frame.
- [ ] Each locale / cut-down: no clipped words, subtitle-safe area clear, end-card text matches the VO, bed re-timed.

## 6. Self-critique (write it before every delivery)

Write a short review in `NOTES.md` with frame evidence (timecodes, stills) against these points, then fix every gap you find unasked and re-check the fixed frames:

1. **Top-tier motion?** One continuous camera with real depth (tilted planes, DOF), speed-ramped moves with directional blur, lift-outs, built-up UI, shape irises, kinetic type. Flat cards fading in place = fail.
2. **Context first?** Could a cold viewer say what problem this is and what they will see in the first seconds?
3. **Backgrounds rich, never flat?**
4. **Rejections elegant?** No black screens; drain, push back, fold or dissolve.
5. **Our own visuals?** Script visual notes treated as optional; production-grade design.
6. **Fresh music?** Not the last film's formula.
7. **Voice?** Warm, clean, de-essed, primary; `mix_check` passed.
8. **Viewer-first sync?** Every visual beat on what the voice is saying; the focus points at it.
9. **Evolved?** Every past note applied without being asked again; differs from the last film's systems.
10. **Mature?** Calm opening, human copy, restrained type, silky motion, nothing off-frame, concept easy on first watch.
11. **Traceable?** Frame pairs ours vs reference for the key beats; we match or beat their craft.

## 7. Scorecard (put it in NOTES.md)

Score each 0 to 2 (0 = fails the floor, 1 = meets the floor, 2 = beats it), with the measured value:

| # | Dimension | Floor (SKILL.md §3) | Measured | Score |
|---|---|---|---|---|
| 1 | Stake by 5 s, payoff by 75% | | | |
| 2 | Voice over bed, worst line (dB) | ≥ 10 | | |
| 3 | Smallest read text (px) / contrast | ≥ 26 / 4.5:1 | | |
| 4 | Bitrate floor (Mb/s), colour tags | ≥ 4, bt709 tv | | |
| 5 | Banding (largest gradient step px) | ≤ 8 | | |
| 6 | Fastest unblurred move (px/f) | ≤ 45 | | |
| 7 | Camera arrivals with settle | all | | |
| 8 | Transition systems (count, motivated) | 2 to 3 | | |
| 9 | 3D finish (thickness, rim, DOF) | all four levers | | |
| 10 | Type (tracking, tabular, widows) | | | |
| 11 | States (shape + label, distinct) | | | |
| 12 | Loudness / peak / LRA; cuts on grid | −14 / −1 / 6 to 9; ≥ 80% | | |
| 13 | Max static time without new info (s); ASL | ≤ 1.5; per mode | | |
| 14 | CTA duration / URL size | ≥ 4 s / ≥ 48 px | | |
| 15 | Containment failures (frames) | 0 | | |

Any 0 blocks delivery. Report remaining 1s as known gaps.
