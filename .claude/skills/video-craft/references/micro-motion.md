# Micro motion: state changes you can read

The smallest layer: cursors, clicks, toggles, chips, status flips, loaders, toasts, checklists. Rule: **every click ends in a visible state change** 2 to 4 f after the press. All numbers at 30 fps.

## Cursor and click

| Element | Numbers | Build |
|---|---|---|
| **Cursor flight** | appears ~6 f before moving; moves 10 to 14 f (`E.cam`, or bezier(.05,.7,.1,1) on a path curving up-left from bottom-right); arrow scales with the camera (36 px on screen in wides, ~90 px on macro shots); swaps to a hand on hover | `ClickCursor` (circle style) or recipe |
| **Park before the click** | parks 0.3 to 0.5 s before clicking; hover-hold 22 f before a "creation" click | timing rule |
| **Press** | press scale 0.96 to 0.97 for 2 to 3 f; state change 2 to 4 f after the press lands | recipe |
| **Click ring** | ring 0.6 → 1.15 scale, opacity 0 → 1 → 0 at 0 / 3 / 10 f, 3 px stroke + 10 to 18 px blur; or two ripples 4 f apart, each 12 f `out(quad)`, growing 40 → 160 px | `ClickCursor` |
| **Click-squash trigger** | the clicked text block squashes to 0.92 in 4 f, springs back in 4 f {d14, s260}; the hard cut lands on the next frame | recipe (spots: last word of a card) |
| **Hard-frame swap** | content changes on one frame, no tween; the clicked target keeps a 2 px selection ring | applying a setting |
| **Hover lift** | row scale 1.02 + shadow `0 8px 24px rgba(0,0,0,.12)`; icon 1.1x | recipe |
| **Cursor-led camera** | camera target = cursor, lagged by spring {d30, s60}; parallax `cam·(1 + z/800)`, far items blur `−z/200` px | recipe (see `camera.md`) |
| **Named multiplayer cursors** | coloured arrow + role tag glides between cells ~24 f per move bezier(.45,0,.2,1), 2 to 3 cursors at once; shape and colour identify the actor (circle tag = human, rounded square = system/agent) | recipe |

Avoid: cartoon press-and-release (whole bar to 85% and grey); a cursor that never parks; clicks with no state change.

## Toggles, chips, pills

| Element | Numbers | Build |
|---|---|---|
| **Toggle / radio / segmented** | knob slides 4 f, track fills; radio dot transfers with a 6 f scale pop; segmented highlight slides 8 f ease-in-out; fill grows from centre 5 f | recipe |
| **Checkbox** | fill in 2 f, check draws in 1 to 6 f | `RingCheck` / recipe |
| **Chip select** | outline → filled in 4 f with a soft bloom; `sel` 0 → 1 = fill → ink, label → accent | `TagChip` |
| **Status pill birth** | appears at 35% scale and grows to 1.0 in 5 f expo-out, no fade | recipe + `StatePill` |
| **Pill state swap** | cross-fade 4 f; the label wipes and retypes 1 char/f | recipe |
| **Lifecycle chip** | empty outline draws first, the status dot pops (spring {s500, d20}), label fades in 4 f (Inactive → Active, Unverified → Verified) | recipe |
| **Badge flip** | old badge shrinks to a dot in 2 f, new one springs in 4 f {s400, d18} (~8% overshoot) | recipe |
| **Hero status-chip pop** | the chip springs to centre at 2.5 to 3x (spring damping 12), holds 10 f, flies back to its row in 10 f `inOut(quad)` | recipe → HELD / APPROVED as hero moments |
| **Provenance chip** | small chip under every produced item ("Checked by rule 7F3A"), tiny spring {d10} | `TagChip` |
| **Brand-ification of a button** | macro button (~400%); fill cross-fades neutral → accent gradient over 10 to 14 f `inOut(quad)`; 3 to 5 small brand-shape shards pop (spring d9 s220, 0 → 1.15 → 1, rotate 0 → 20°, out at +18 f), 2 f stagger; as a trilogy ~2.5 s apart; held variant tries, then settles into the HELD square with no shake | `Brandify` |

## Status changes

| Element | Numbers | Build |
|---|---|---|
| **Lock → ✓** | badge ring spins → lock (4 f) → ✓ morph in 6 f (scale 0.8 → 1) | inside `AuditStaircase` |
| **Calm denial** | a hatch sweeps L→R in 8 f (diagonal 2 px lines every 16 px), HELD square + deny wash; **no shake, no red flash** | inside `AuditStaircase` |
| **✕ → ✓ on the last digit** | a field is selected, cleared, value typed at ~10 cps, icon flips ✓ the instant the last digit lands | recipe (correction that teaches) |
| **Radial status wipe** | new colour grows as `clip-path: circle()` from the centre or the click point in 6 f `out(cubic)`; rows 2.4 f apart (flood) or 5 to 7 f (cascade) | recipe |
| **Row flips on a decelerating scroll** | scroll ~9 rows over 54 f bezier(.2,.8,.2,1); flips lead the scroll by 1 to 2 f per row, cross-fade 2 f; leave the last 4 rows unflipped (a contrasting tail the eye catches) | recipe |
| **Status scramble** | 6 to 10 f of jumbled glyphs, colour grey → state | one state change only |
| **Per-row ownership mark** | filled brand shape = handled, outline = not yet | `AccentShape` |

## Loaders and "working"

| Element | Numbers | Build |
|---|---|---|
| **Typing dots** | 3 dots, scale 0.6 ↔ 1.0 (or rise 0.8 × size), 4 f phase, 0.5 s cycle | `TypingDots` |
| **Ellipsis** | "…" cycles every ~10 f | recipe |
| **Ring spinner** | 270° arc, 1 rev / 0.6 to 0.8 s | recipe |
| **Ring completes + check** | ring draws 26 f `inOut(cubic)`, check draws in 10 f starting 4 f before the ring closes, 8% pop | `RingCheck` |
| **Stepper states** | pending = dashed circle, active = dashed ring spinning round a dot (+2 px glow), done = solid dot; swap 4 f | recipe |
| **Working hairline** | a gradient band travels along a 3 px line under the status card while working (~6 px/f), rests solid in the result colour | inside `ReasoningLog` |
| **Rotating gradient border** | conic accent hairline 2 to 3 px, 4°/frame (12°/f reads busy) | recipe |
| **Brand-shape field** | a grid of small brand shapes pulsing (dot r × (1 + .45 sin), 3 f stagger) as "the system is working", collapsing to centre in 6 to 8 f when done | `ShapeGrid` |

## Toasts, checklists, feedback

| Element | Numbers | Build |
|---|---|---|
| **Counted toasts** | slide down ~60 px + fade over 8 f `out(cubic)`, 24 f apart, pushing earlier ones down; bold subject + regular predicate + right-aligned **n/N** counter ("**Invoice** matched 2/4") | recipe |
| **Checklist** | Tasks (0/N): active row in the accent with a ring spinner, check stroke draws 6 f, 15 f per row, header counter ticks | recipe |
| **Checklist receipt** | 4 px bar widens to a card in 6 f `out(cubic)`; checks appear top-down 2 f apart **before** the text; then all rows type in parallel at 25 cps | recipe |
| **Answer card** | user bubble drops in top-right; answer card fades up 8 f with a 20 px rise; panel content auto-scrolls ~60 px/s, never jumps | recipe |
| **Spotlight dim** | everything but the target darkens to black 52%; the target gets a 6 px ring, radius 12; 6 to 7 f in/out; **no zoom** | `Spotlight` |
| **Sequential option ring** | ring fades pale → full stroke in 5 to 6 f, holds 15 to 18 f, fades 6 f; ~1.05 s (32 f) per option; the chosen one stays | `OptionRing` |
| **Row lift in place** | row scales 1.12 to 1.6x in place on a white plate with a soft shadow, the rest dims ~15%, ~10 f in, holds up to ~4 s | `LiftOut` (lift to centre) or recipe |
| **Node born as light** | f0 accent streak 40 × 4 px → f1 to 2 inflates to a blurred pill (blur 8, glow 24) → f3 to 5 label fades in → f6 to 8 glow decays to a halo; ~10 f; siblings 12 f apart | recipe |
| **Sweep reveal** | a card revealed by `inset(0 ${(1-t)*100}% 0 0)` while a 60 px blurred bar (blur 20) rides the edge; 8 to 10 f per card, 3 f stagger | recipe ("issued", "created") |
| **Skeleton → content** | tinted bars with a moving highlight band ~0.8 s; cross-fade to real rows top-down over ~1 s (bar → text 5 f as a marker passes row i, +2 f per column) | recipe |
| **Celebration** | **one** `RingCheck` pulse or 3 to 5 brand-shape shards. Never confetti, emoji sprays or 💯 | `RingCheck`, `Brandify` |
| **Doodle annotation** | a hairline label writes on in 10 to 12 f, arrow last; exit = the same stroke reversed in 9 f | `Draw` (reversed) |

## Common timing rules

- State change 2 to 4 f after a press; status flips 4 to 6 f; pops 5 f (scale .94 → 1, opacity .5 → 1, rise 10 → 0); entrances 8 to 14 f on `E.settle`; exits 8 f on `E.cam` or `E.launch` right before a cut.
- Overshoot only on small pops (chips, checks, stamps, badges). Large elements and cameras settle with ~3% at most.
- Every micro event that matters gets its foley (`sound.md`): soft click, check tick, low thunk on HELD.
