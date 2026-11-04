# Camera

The camera never stops and never wanders. It holds on what the VO names, moves fast-in / long-settle between targets, and arrives with a small overshoot. All numbers at 30 fps.

## Principles

1. **One continuous camera.** 3 to 16 hard cuts per minute at most. Every other change happens inside the shot: a morph, a zoom-through, a match cut on one element, or a pan across one canvas. When you do cut, speed-ramp across it (`SpeedRamp`) so it still reads as one camera.
2. **Never static.** Holds drift: scale +1.7%/s and y −5 px/s (default `camAt` drift), or slow rotation and sway on tilted planes, or `withDrift` in 3D.
3. **Two-stage arrivals.** Every hero arrival: ease to the target, overshoot ~3%, settle within 18 f (`SETTLE` spring {d18, s120, m1}, `planeCam`, `pushSettle`, `CamKey.settle = 0.027` returning over 10 f on `E.in`).
4. **Velocity budget.** ≤ 40 to 45 px/f, or motion blur on (> 20 px/f). Moves measured at 62 and 146 px/f with no blur strobe visibly.
5. **Point the eye.** The camera target is always the thing the VO is talking about; one target per move.

## Moves

| Move | Numbers | When | Build |
|---|---|---|---|
| **Tilted UI plane + drift** | rotateX 6 to 12°, rotateY −6 to −22°, rotateZ −3 to −12° (or a gentle `perspective 2000, rotateX 7, rotateY 5.5`); constant drift; tilt direction alternates by chapter | every product-screen act | `UIPlane`, `TiltCamera`, `TiltWindow` |
| **Tilt-shift DOF** | near edge sharp, far edge 6 to 10 px blur; or blur 4 to 8 px on anything > ~250 px from the focal row | depth on any plane | `UIPlane` (`far`, `focusY`, `band`), `dofBlur` |
| **Macro push** | scale 1 → 2.4 to 2.5 over ~24 f `inOut(cubic)`; buttons 2 to 4x over 15 to 20 f | read one value | `UIPlane` `move: "push"` |
| **Push with settle** | +25% in 9 to 10 f on `E.cam`, then a 2.7% overshoot returning over 10 f on `E.in` | punctuating a beat | `camAt` key with `settle` |
| **Whip re-frame** | 6 to 8 f with a 12 px blur peak mid-move bezier(.7,0,.3,1) | between two targets on the same canvas | `UIPlane` `move: "whip"` |
| **Cut-in pull-back** | after a cut, scale ~2.6 → 1 in 25 f `E.arrive`, revealing the window; then slow drift (x −1 px/f, scale +0.1%/f) | opening a UI act | `camAt` key `ease: "arrive"` |
| **Re-frame / pan** | pull −16 to −21% over 13.5 to 16 f `E.cam`; pan y −148 px with scale +20% in 17 f | small adjustments | `camAt` |
| **One take per act** | components on one virtual canvas (e.g. 6000 × 3000); camera {x, y, zoom} keys with 10 to 15 f moves bezier(.65,0,.35,1) between 30 to 60 f holds; components animate only when the camera arrives | the continuous-take grammar | `Camera` (flat canvas), `UIPlane` (tilted) |
| **Breath-out pull-back** | 1 → .78 → .66 → .58, 7 f each bezier(.6,0,.2,1), plus drift ×(1 − f·0.0004) | a diagram gaining a row per clause | recipe |
| **Lateral dolly along a chain** | constant ~120 px/s linear; a parallax data layer at the same speed | following one item through a system | recipe |
| **Track-down a chain** | one pitch per step on `E.cam` 12 f; or a constant tilt-down ~90 px/s | pipelines, staircases | `AuditStaircase` (`tilt`) |
| **Dive into a node** | ~3x in 20 f bezier(.6,0,.2,1), then a hard settle; or the node's screen scales to fill the frame | entering a detail | recipe |
| **Crash push** | 1 → 3.5 in 6 f bezier(.7,0,.84,0), blur on f2 to f5, cut at f6 to the close-up; or snap 1.8x in 6 f / 2x in 8 f then slow lateral drift | energy beats in ads | recipe |
| **Zoom-through into a screen** | push 1 → 1.4 over 12 f `in(cubic)` (or ×3.2 in 5 f) with radial blur on the last 1 to 2 f; land on the UI at 0.8x + 8 px blur → 1.0 sharp in 5 f `out(quad)` | footage → UI, act changes | `SpeedRamp` (`zoom`) |
| **Zoom-out to the crowd** | start inside one tile at ~4x, pull back to a 10×6 to 13×6 wall; most travel in 10 f, settled by 22 f; radial blur 16 → 0 over 18 f `out(exp)` | one → many | recipe |
| **Cursor-led camera** | target = cursor, lagged by spring {d30, s60}; parallax `cam·(1 + z/800)`, far items blur `−z/200` px | demos driven by clicks | recipe |
| **Caret-tracking camera** | keep the caret at x ≤ 1400 with a spring pan {d30, s200}; macro prompt drifts ~2 px/f | typing at macro scale | recipe |
| **Screen-locked element over a move** | the HUD / pill / badge is rendered **outside** the camera container while the board scales 1 → 2.6 under it | persistent state | recipe |
| **Continuous object take** | one hero object for the whole act, reframed with eased dolly/zoom and 3D tilts ±10 to 15°; transitions are object transformations (Y-flip 6 f with perspective 1200 and a brightness dip at 90°; fold ~15 f) | a single object's journey | recipe |
| **Rail pan** | a 2 px hairline with an endpoint dot grows out of the outgoing scene (12 f); the camera tracks the tip ~1 s and plugs into the next scene | linking two scenes by a path | `Draw` + `Camera` |
| **Speed-ramped jump-zoom** | a hard cut to 2 to 3x on the input instead of a pan | "the cut is the zoom" | cut |

## Building blocks

- **Flat canvas camera**: `Camera` (keys `{at, x, y, zoom}`, 36 f moves on `E.smooth`): shows canvas point (x, y) at screen centre at the zoom.
- **Tilted plane camera**: `UIPlane` with `planeCam` keys (`push` 24 f inOut(cubic), `whip` 7 f with blur, `ease` 18 f `E.cam`; ~3% settle built in). Two copies render a tilt-shift band.
- **Keyed screen camera**: `camAt` + `TiltCamera` (12 f moves on `E.cam`, optional `settle`, hold drift, velocity motion blur applied automatically).
- **Speed ramp across cuts**: `SpeedRamp` wraps a shot so it eases in fast-then-slow at its start and accelerates out at its end along one direction with directional blur (in 14 f, out 8 f, 260 px, blur up to 18 px).
- **3D cameras**: `pushSettle`, `orbit`, `dolly`, `keyed`, `withDrift`, rack focus via `focusDistance` (see `3d.md`).

## Framing

- Keep everything sharp ≥ 80 px from every edge on every frame, including mid-move (`containment_check.py`).
- Leave the hero right of centre when a label column sits top-left; offset the target so the subject clears the copy.
- A 3D object framed so its labels are ≥ 28 px on screen; otherwise pin a 2D caption to it with `projectToScreen`.
