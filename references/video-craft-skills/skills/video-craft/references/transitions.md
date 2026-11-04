# Transitions

## Discipline

- **Pick 2 or 3 systems per film and repeat them** until they read as the film's style. Six systems in one film reads as a template pack; nine transition types dilutes a film.
- **Never reuse the previous film's system** (or its signature move). Write the pick and the reason it differs into the storyboard before any code.
- **Every light ↔ dark change is motivated** (a dive, a collapse, a sweep, a shared corner glow), never a run of plain hard cuts.
- Strong default trio for a calm product film: **blur-in / blur-out**, **the brand-shape iris or window**, **camera pan or zoom across one canvas**. Punchy ads can use hard cuts only and get all energy from motion inside shots.
- Prefer transitions that **carry an object** across the boundary (a chip, a card, a caption, a dot): the viewer's eye never has to hunt.
- Timing: transitions land on the beat or 0 to 3 f before it; light ↔ dark hard cuts on a downbeat ±1 f; chapter changes inside VO breaths.

All numbers at 30 fps.

## Catalogue

| Transition | Numbers | When | Build |
|---|---|---|---|
| **Brand-shape window whip-zoom** | 25 f total: the outgoing title whips out f0 to 5 (ease-in, +128 px in 4 f, then off with blur); a small window in the brand shape (~7.2% of the frame) slides in f6 to 13 (per-frame deltas 72/40/32/16/8/0 px, bezier .1,.8,.2,1); hold 1 f; exponential grow f14 to 21, area ×~1.5 per frame (.072 → .081 → .101 → .137 → .202 → .313 → .520 → .787); corner clear f22 to 25. Variant: hangs at 6 to 8% for 8 f, then expo-in to 100% in ~10 f | opening into the product world; at most twice per film | `ShapeWindowZoom` (`peek` frames one datum in the small window) |
| **Brand-shape iris** | the shape mask closes 2600 → 0 px in 18 to 20 f `in(cubic)`, or opens 0.55 → 3.2 over 30 f; a UI chip stays above both scenes as the bridge object | act changes, the dark ↔ light twist | `ShapeIris` |
| **Dive into a chip → dark world → surface** | f0 to 6 hold; f7 to 9 chip selected (fill → ink, label → accent); f9 to 12 camera pushes 1.8x toward the chip `in(cubic)` while a dark overlay rises 0 → 70%; f13 a 2-frame dissolve into the dark world where a small square sits at the chip's last position; f14 to 19 the square springs wide into the first node. ~13 f from select to new world. Return: the chip comes back as a giant (3x), motion-blurred foreground sliding in from +600 px over 6 f, the light UI cross-fades back 6 f, the chip scales 3 → 1 into its slot | the one "under the hood" block | `ChipDive` + `AuditStaircase bornFrom={chipDiveSquare(chip)}` |
| **Hero card → product panel** | 10 f bezier(.6,0,.3,1), radius 0 → 14, chrome already inside the card | the brand moment becomes the product | `CardToPanel` |
| **Field collapses to a chip** | 4 to 6 f (1 f is missed by the eye), then the chip drifts −64 px over 13 f | chapter cards | recipe (`typography.md`) |
| **Caption becomes the input** | select 6 f, delete 8 f, input springs {d200, s90}, camera 2.2 → 1 | a claim turning into the product | `CaptionToInput` |
| **Logo → UI chrome** | 60 f, three keys, spring {damping 200} per segment | logo becomes the app | recipe (`builds.md`) |
| **Loader zoom-through** | loader dots scale ~15x in 18 f expo-in about the target dot, which already shows the next scene inside (`overflow:hidden`, round); cut when its diameter > 2200 px; variant: 3x in 4 f → 1 f white flash → light-streak tunnel | "it is working" → the result | recipe (`ShapeGrid` tile) |
| **Speed-ramped title wipe** | a panel's right edge 0 → 420 px in 13 f `out(cubic)`, glides 420 → 900 linear over 54 f (~9 px/f) while the title types inside, whips out 900 → 1940 in 10 f `in(cubic)`; trailing 60 px white strip | product-name bookends only | recipe |
| **Speed ramp across hard cuts** | outgoing shot accelerates out (8 f `E.launch`), incoming eases in fast-then-slow (14 f), same direction, directional blur up to 18 px | fast sequences that must read as one camera | `SpeedRamp` |
| **Zoom-through** | push 1 → 1.4 / 12 f `in(cubic)` + radial blur last 1 to 2 f; land at 0.8x + 8 px blur → 1.0 in 5 f | footage → UI, screen → screen | `SpeedRamp zoom` |
| **Avatar / circle matte** | a selected card shrinks to an avatar, the avatar becomes a circle, the circle expands `clipPath: circle(36 → 1300px)` in 15 f bezier(.7,0,.2,1) (portal variant: push ~6x into the circle in 11 f `in(cubic)`) | object → the person behind it | recipe |
| **Theme flip (circle wipe)** | `clipPath: circle(r at x y)` with r 0 → 150% from a word or object; palettes swap at full coverage; used once for the single biggest turn | the twist in a reel or film | recipe |
| **Inset breath** | the full-frame shot scales to 0.93 to 0.94 with radius 24 in 6 f `out(quad)`, revealing the brand plate; card-stack exit: scale .95, r 16, then y −1100 in 14 f `in(cubic)` while the next card comes y 1100 → 0 `out(cubic)` | pacing breaths between acts | recipe |
| **Icon bridge (no cut)** | the scene clears except one small icon (others scale to 0 over 6 f, 1 f stagger), which grows 0.1 → 1 in 15 f `out(back(1.4))` into the next hero object | chaining objects | recipe |
| **Object match cut + smear read** | a physical object cuts to the same object in the UI; the layer duplicates 8x with x += k·40·p, scaleX 1 + k·.15·p, opacity .25, over 6 f with a scan-line mask, cross-fading to the parsed fields at f4 to 8 | document → structured data | recipe |
| **Locked diagram across changing plates** | a diagram mounted at a fixed transform for ~190 f while 4 plates hard-cut under it every ~45 f; sub-elements build on their own clock | "the same rule everywhere" | recipe |
| **Pinned element over a carousel** | element pinned in screen space while screens slide −1920·i with 9 f ease-in-out, a tinted band leading 3 f | one identity across contexts | recipe |
| **Token carried across a cut** | a value chip lifts off its message (−8°, shadow), is carried 12 f with a camera follow on a hairline tether (1.5 px, glowing tip), **cut on action**, re-enters the next UI at the same y and drops in, settling 5 f | handing a value between two UIs | recipe (hairline, no cartoon limbs) |
| **Prompt macro → context match cut** | a macro prompt fills the frame, cropped off the right, drifting ~2 px/f; **cut mid-word while typing continues** to a wide where the same box is a ~780 px card; typing accelerates 12.5 → 25 to 47 cps; send; hard cut to the product on a music dropout | ad openers | recipe |
| **Band wipe** | 3 bands slide in 3 f apart, each 8 f bezier(.7,0,.3,1), 3 px accent leading edge | chapter changes in keynotes | recipe |
| **Gradient world sweep** | the background gradient changes with a vertical mask sweep over 12 f while the hero holds centre | mode change (people ↔ system) | recipe |
| **Mode-colour cut** | the background colour alone signals the act (e.g. light = people set things, dark = the system acts alone); reuse ≥ 2 times so the code is learned | modes | `LightStage` ↔ `DarkStage` |
| **Dip to dark** | dark layer 0 → 1 over 10 f `E.in` | rare; prefer a motivated dive | recipe |
| **Hard cut light ↔ dark on a downbeat** | 1-frame cut ±1 f of the downbeat; keep the glow corner on the same diagonal in both stages so it feels continuous | claim (dark) / proof (light) alternation | cut |
| **Empty-plate cut** | 1 frame of the empty stage between two type cards; never a cross-fade between type cards | kinetic card runs | recipe |
| **Footage pull-back into an inset** | the full-bleed first frame shrinks to an inset card (30 px margin, r 24, gradient border) in 2 f | live action kept inside the graphic world | recipe |
| **Sizzle settles into a frame** | full-bleed UI scales 1 → 0.70 in 12 f `out(cubic)` into the demo slot | webinar shells | recipe |
| **Desaturate freeze** | `grayscale(1)` + a light veil at 62% + 2 px blur over 5 f `E.in`, on a music stop; out in 4 f; hold ≤ 1.5 s | a "wait, what?" beat | recipe |
| **Push-through tunnel (3D)** | camera z +1.2 → 0, fov 40 → 63 over 46 f, tunnel streaks `speed 1 + f/12`, 8 f flash to the light wash | into a new act | `LightStreaks mode="tunnel"` |
| **Ignition / logo flare** | the logo scales 0.03 → 1 over 30 f expo-in, bloom grows, radial streaks scaleY 0 → 3 on f28 to 40, flash to white f34 to 44 | once, as an opener | recipe |
| **Logo slam** | scale 4 → 1 over 18 f `out(exp)` (measured 4, 1.9, 1.35, 1.12, 1.05, 1.0 every 3 f), 1 f after a hard cut, hold 1.5 s | end card | recipe (logo unmodified) |
| **Elegant rejection** | the losing option drains (saturation → 0, 8 to 12 f), pushes back in depth (scale 0.9, blur 6 to 10 px) or folds/dissolves, while the winner takes the stage; never a cut to black | comparisons, refusals | recipe |

## Avoid

- Whips without motion blur (they judder); decorative sparkle flashes; brand-shape flashes on random footage; a cross-fade between two type cards; warp-to-a-vanishing-point "campaign" end blocks; glitch transitions.
