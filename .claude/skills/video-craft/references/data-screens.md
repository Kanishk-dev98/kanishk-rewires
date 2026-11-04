# Showing data screens

The commonest failure in every reference set is UI text too small or too fast to read. The best films treat a product screen like a cinematographer treats a face: one subject, in focus, framed, held, with context soft behind it. This file is the method.

## 1. Build the screen like the real thing

- **Dense and realistic.** Rebuild product screens in React at full fidelity: real-looking navigation, headers, filters, 6 to 12 rows of plausible data, ids in mono, amounts with tabular numerals, status pills, timestamps. Sparse placeholder panels (three grey bars and a button) read as amateur.
- **Vector, never raster.** Every screen is React/SVG so it stays crisp at 2.4x and in 3D tilts. Upscaled screenshots go soft at 2.6x.
- **Specific copy.** "Supplier invoice · March · 96.20", "Rule 7F3A · amount ≤ 200", not "Lorem" or "Item 1". Fictional names unless the brief supplies real ones.
- **One contrasting row.** A table where everything is green proves nothing; one HELD row, one ASK row with a person.
- **Status language.** States are shape + label (● ALLOW / ◆ ASK / ■ HELD), readable without colour, each state colour clearly distinct from the accent.
- **Design the screen at the size it will be read.** If a row must be read at the final framing, its text is ≥ 28 px after the push (author it at ≥ 28 px / zoom). Everything else may be smaller because it will be soft.

## 2. Guide the eye: one focus target at a time

Rules: one target; it is sharp, inside the safe area, ≥ 28 px (key datum ≥ 40 px), held ≥ 1.2 s after its last change; smooth in and out; never blur what the VO is talking about. Pick the device by what the beat needs:

| Need | Device | Numbers | Build |
|---|---|---|---|
| Read one value | **Macro push** on a tilted plane | scale 1 → 2.4 to 2.5 over ~24 f `inOut(cubic)`, settle ~3% over 18 f; read at 40 to 60 px; tilt-shift: near sharp, far 6 to 10 px | `UIPlane` |
| Move to the next value | **Whip re-frame** | 6 to 8 f whip with 12 px blur in the middle frames | `UIPlane` (`move: "whip"`) |
| Keep the layout visible | **Spotlight** | everything else to black 52%, target ring 6 px r 12, 6 to 7 f in/out, no zoom | `Spotlight` |
| Pull one row out | **Lift-out** | target scales up and forward to centre (2.2x, 16 f) while the rest blurs 14 px, scales 0.88 and dims 55% | `LiftOut` |
| Magnify in place | **Row lift** | row 1.12 to 1.6x on a white plate, rest dims ~15%, ~10 f in | recipe |
| Compare options | **Option ring** | 32 f per option; pale → full in 6 f, hold, out 6 f | `OptionRing` |
| Make a typed prompt legible | **Input lens** | a 2.5x clone of the input bar in front of the panel while typing; on send it scales 2.5 → 1 into its slot in 10 f `inOut(cubic)` | recipe |
| Depth separation | **DOF band** | blur grows with distance from the focal row: 0 within ±200 to 250 px, up to 3.5 to 8 px beyond | `dofBlur`, `UIPlane` `focusY` |

When the focus is released (end of a chain, end of a build), pull focus back to the whole so the result reads in the hold (e.g. the full column of ✓ after the last step resolves).

## 3. Camera on a screen: one continuous take per act

- Lay every component of an act on **one virtual canvas** (e.g. 6000 × 3000). The camera moves between targets with 10 to 15 f moves bezier(.65,0,.35,1) between **30 to 60 f holds**; components animate only when the camera arrives.
- **2 to 5 camera beats inside each UI take**; takes of 6 to 15 s (the best references hold one take for 10 to 41 s). In-shot events outnumber hard cuts about 2:1.
- **Never static**: the plane always drifts (slow rotation ±1.6°, lateral sway, or scale +1.7%/s with y −5 px/s).
- **Tilt**: rotateX 6 to 12°, rotateY −6 to −22°, rotateZ −3 to −12°; alternate the tilt direction by chapter.
- **Velocity**: keep moves ≤ 40 to 45 px/f or add motion blur (σ = velocity × 180° shutter / 3, off below ~12 to 20 px/f).
- Push to the one value per string; one string per push. Do not pull back to show a dense diagram for 2 s; push in or don't show it.
- A **jump-zoom** (hard cut to 2 to 3x on the input) can replace a pan: "the cut is the zoom".
- Cap any single layout (e.g. left UI / right copy) at ~15 s before changing the composition.

## 4. Data-specific builds (numbers in `builds.md` and `micro-motion.md`)

| Data job | Best device |
|---|---|
| A table populating | rows stream one per ~9 f, each a 6 f rise of 12 px; or skeleton → content; or column wave fill |
| One row matters | held row on a music hit: its tint fades in 4 f with a left accent bar, then lift-out or spotlight |
| A record is created | receipt rises 6 to 8 f (y +40 → 0, opacity .4 → 1, blur 6 → 0) while the camera pushes on `E.cam` and the table scrolls ~110 px; "Verified" pops on the next hit |
| Many items processed | status cascade with one contrasting row; counted toasts n/N; counter stepping per event |
| Sorting | row re-sort with lifted rows, then a column sweep fills the result column |
| Auditable reasoning | reasoning log (rows ≥ 28 px, glyph first) or the audit staircase on the dark stage |
| A number that proves the claim | counter 0 → value in 3 f steps, held ≥ 1.5 s at ≥ 40 px, then depth-swapped behind the subject |
| A chart | bars fill 15 f `out(cubic)`, 2 to 4 f stagger, values fade in at the ends; line charts reveal by `strokeDashoffset`; delta chip pops 4 f ("↑ 4.37") |
| Settings change behaviour | live sliders: thumb 15 f, sentence cross-fades 6 f, old copy ghosted at 30% for 10 f |
| A long process | speed-ramp the waits 3 to 4x, add step pills or an agenda tick between steps, never 4 to 10 s of "Thinking…" |

## 5. Text and voice over a screen

- **UI sections carry no captions.** The VO says the benefit; the screen shows the specific. Never read UI text aloud. Lower thirds that repeat the VO verbatim during a demo are an anti-pattern.
- Each VO verb gets **exactly one** UI state (2 to 4 s each), with a crash push or modal between them.
- Status micro-copy carries system behaviour without VO: short first-person pills ≤ 5 words at ≥ 28 px ("Checking 4 rules…", "Held: payee changed").
- Prompts are plain-English imperatives a viewer reads in < 2 s; typed at 30 to 40 cps max.
- A claim card is followed by a picture of it within 1.5 s; show first, name second (the product shot comes before the card that names it).

## 6. Check it (before render)

- [ ] Every string the viewer must read is ≥ 28 px at final framing, ≥ 4.5:1, held ≥ 1.2 s after its last change.
- [ ] One focus target per moment, and it is the thing the VO names.
- [ ] Screens are dense and specific; one contrasting row in every collection.
- [ ] Each UI act is one continuous take with 2 to 5 camera beats; every arrival settles; nothing static > 1.5 s.
- [ ] Nothing sharp within 80 px of the frame edge during any push or whip.
- [ ] Storyboard cites the reference moments (id + timestamp) whose data-screen craft each beat matches, and you have opened those frames.
