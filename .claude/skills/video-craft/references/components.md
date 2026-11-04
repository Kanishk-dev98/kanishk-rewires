# Components: API and the technique each implements

Import 2D from `src/motion` (`import { UIPlane, BlurIn, LightStage, T } from "../motion"`) and 3D from `src/three`. Conventions:
- **Absolute local frames**: every component takes `at` / `…At` in the frames of its enclosing `<Sequence>`; lay scenes out from the builder's timeline (scene-local word frames from the props).
- 1920 × 1080 at 30 fps; coordinates in px of that canvas.
- Colours from `T` (theme.ts); the brand shape from `ACCENT_SHAPE` / `SHAPE_PATH`; fonts `FIG` (sans), `FIG_I` (italic), `MONO` from `fonts.ts`.
- Animations only from `useCurrentFrame()`; no CSS transitions; canvas drawing in `useLayoutEffect`.

## Theme and core (`theme.ts`, `fonts.ts`, `motion/core.ts`)

| Export | What |
|---|---|
| `T` | colour tokens: `accent`, `accentDeep`, `accentBright`, `deep`, `accentText`, `accentSoft`, `accentSoft2`, `ink`, `muted`, `surface`, `soft`, `wash`, `border`, `borderDark`, `hair`, `dark`, `darkTint`, `deny`, `denyDeep`, `denyWash` |
| `ACCENT_GRAD`, `ACCENT_GRAD_SOFT` | accent gradient surfaces |
| `ACCENT_SHAPE`, `SHAPE_PATH` | brand shape polygon in a 100-unit box, and its SVG path |
| `FONTS`, `FORMAT`, `rgb(hex)` | font names, `{width, height, fps, safe: 80}`, "r,g,b" for rgba() |
| `FIG`, `FIG_I`, `MONO` | loaded font families (Google Fonts via `@remotion/google-fonts`) |
| `E` | easing family: `cam`, `in`, `arrive`, `settle`, `smooth`, `flow`, `flowSoft`, `launch`, `wipe`, `panel`, `slide`, `whip`, `inCubic`, `outCubic`, `inOutCubic`, `inOutQuad`, `expoIn` |
| `SETTLE` | spring {damping 18, stiffness 120, mass 1} (~3% overshoot, ~18 f) |
| `r(f, at, dur, ease?)`, `ramp(...)` | 0 → 1 progress (default `E.settle` / `E.smooth`) |
| `lerp`, `mix(hexA, hexB, t)`, `sp(f, at, springConfig)`, `typedCount(f, at, len, cps)`, `bounce(t)`, `cl`, `Rect` | helpers |

## Finishing (`motion/fx.tsx`)

| Component | Technique | Props |
|---|---|---|
| `Grain` | grain / dither on gradients | `opacity` (0.02 to 0.06), `blend`, `freq` |
| `MotionBlur` | directional blur from velocity (180° shutter, off below ~12 px/f) | `vx`, `vy` (px/frame), `threshold` 20, `shutter` .5, `fill` |
| `blurSigma`, `velocity` | blur math for custom moves | |
| `dofBlur(y, focusY, band, max)`, `Focus` | depth-of-field band | |
| `camAt(keys, f, drift)`, `CamKey` | keyed camera with optional overshoot settle + hold drift | `{f, dur=12, x, y, s, ease: "cam"/"arrive", settle}` |
| `TiltCamera` | keyed camera on a tilted plane, auto motion blur | `keys`, `drift`, `rx` 7, `ry` 5.5, `rz`, `blur` |
| `ShapeGrid`, `GRID`, `GridPaint` | 48×27 glyph field on a 40 px pitch ("system working", dark-stage texture) | `paint(i, j, f) → {c, a, r}`, `glyph` dot/shape, `opacity` |
| `useUid` | CSS-safe ids for SVG defs | |

## Stages and states (`motion/stages.tsx`)

| Component | Technique | Props |
|---|---|---|
| `LightStage` | never-white light stage: wash + corner blooms + subject spot + grain | `grain` .035, `spot` [x%, y%], `qa` |
| `DarkStage` | "under the hood" stage: tinted centre, corner glow on the same diagonal, ~7% grid, grain | `grid` .07, `glyph`, `glow`, `grain` .06, `qa` |
| `StateGlyph`, `StatePill`, `stateColor`, `STATE_LABEL`, `State` | allow ● / ask ◆ / held ■, shape + label | `s`, `label`, `size`, `dark` |
| `TagChip` | chip with the brand-shape notch; `sel` 0 → 1 selects | `label`, `sel`, `size`, `state` |
| `AccentShape`, `SHAPE_CENTRE` | small brand shape (shards, notches, markers); its zoom anchor | `size`, `fill` |
| `UICard` | white product card, radius 22, long soft shadow | `w`, `pad` |
| `LabLabel` | demo label inside the safe area | `n`, `name`, `dark` |

## House kit (`motion/light.tsx`)

| Component | Technique | Props |
|---|---|---|
| `BlurIn` | blur-to-sharp + rise entrance, optional blur-out exit | `at`, `dur` 16, `rise` 18, `blur` 14, `out`, `outDur` 12 |
| `WordBuild` | word-by-word build, light → ink | `text`, `at`, `every` 5 (spots 2.4), `size`, `weight`, `color`, `align`, `maxWidth` |
| `HeaderShift` | old line shrinks and greys into a header | `at`, `shiftAt`, `to {y: -150, scale: .5}`, `dur` 18 |
| `Mark` | accent marker block behind words, grows L→R | `at`, `color`, `dur` 10 |
| `SlotRoll` | vertical slot-roll list with motion blur | `items`, `at[]`, `size`, `dur` 12 |
| `Typed` | typed text with caret | `text`, `at`, `cps` 18 (≤ 40 for read-along), `caretUntil` |
| `Mono`, `Pill`, `Tile` | mono system labels, outlined pills with status tags, icon tiles | |
| `Draw` | self-drawing hairline path (trim path; dashed variant uses a clip) | `d`, `at`, `dur` 24, `width` 1.5, `dash`, `opacity` |
| `Counter` | number ticking between keys | `keys [[frame, value]]`, `pad`, `suffixAbove`, `suffix` |
| `Camera` | one canvas, one camera (continuous take) | `keys [{at, x, y, zoom}]`, `dur` 36, `width`, `height` |
| `CornerBloom` | accent corner gradients bloom in when the brand arrives | `at`, `dur` 30 |
| `LetterMorph` | word morph punchline (drop letters, insert the accent letters, close up) | `at`, `head`, `drop`, `insert`, `tail`, `size` |
| `IsoSlab` | calm isometric slab (CSS 3D) | `x`, `y`, `w`, `h`, `depth`, `dark`, `at`, `lift` |
| `L`, `smooth` | light-theme palette derived from `T`; the `E.smooth` ease | |

## Moves (`motion/moves.tsx`)

| Component | Technique | Props |
|---|---|---|
| `SpeedRamp` | speed-ramp a shot so cuts read as one camera (or zoom variant) | `dur`, `dir`, `dist` 260, `inF` 14, `outF` 8, `zoom` |
| `ShapeIris` | iris through the brand shape | `at`, `dur` 24, `path` (default `SHAPE_PATH`), `spin` |
| `TailType` | colour-tail typewriter | `text`, `at`, `fpc` 1.7, `tail` 5, `ink`, `accent` |
| `Slam` | slam 2.5 → 1 and settle, no overshoot | `at`, `from`, `dur` 8 |
| `FollowLine` | headline follows its newest word, then centres | `words [{t, at, color}]`, `size`, `color` |
| `TrackIn` | tracked letters lock in (tracking collapse) | `text`, `at`, `dur` 12, `spread` .5, `color` |
| `Scan` | brackets, a scan band, then outline boxes on key fields | `at`, `w`, `h`, `color`, `boxes` |
| `ClickCursor` | circle cursor lands and clicks (fill flash + two ripples) | `path [[f, x, y]]`, `clickAt`, `color` |
| `LiftOut` | lift one element out; everything else blurs and falls back | `at`, `dur` 16, `base`, `item`, `itemBox`, `scale` 2.2 |
| `TiltWindow` | floating tilted window with rim light, pulls back from close-up | `at`, `rx` 12, `ry` −14, `rz` −4, `from` 2.6, `rim` |
| `RingCheck` | progress ring completes, check draws | `at`, `size`, `color`, `dur` 26 |
| `IconFlip` | field of icons flips bad → good, then gathers into a hero | `at`, `cols`, `rows`, `bad`, `good`, `gatherAt`, `hero` |
| `TypingDots` | three typing dots | `color`, `size` |
| `BlurCount` | count-up with motion blur | `from`, `to`, `at`, `dur` 40, `format` |
| `Orbit` | items orbiting on a tilted ellipse with depth | `items`, `rx`, `ry`, `speed`, `at` |
| `Float` | per-element slow float so holds never freeze | `seed`, `amp` 6, `period` 110 |
| `FLOW`, `FLOW_SOFT`, `launch` | AE Flow ease, its soft variant, the accelerating exit | |

## Patterns (`motion/patterns.tsx`)

| Component | Technique (numbers in `transitions.md` / `builds.md`) | Props |
|---|---|---|
| `ChipDive`, `chipDiveSquare` | dive into a chip → dark world → surface back (~13 f each way) | `at`, `surfaceAt`, `chip {x, y}`, `label`, `surfaceLabel`, `surfaceState`, `light`, `dark` (the light scene must leave the chip's slot empty) |
| `AuditStaircase`, `AuditStep` | permission chain: 20 f steps, square → card spring, lock → ✓, one calm HELD with hatch; camera tilt; DOF; pull-back | `at`, `steps [{label, kind: check/entity/held/ask}]`, `every`, `x0`, `y0`, `dx`, `dy`, `width`, `tilt`, `bornFrom`, `times[]`, `resolveAts[]`, `title`, `pullBack` |
| `ShapeWindowZoom` | 25 f brand-shape window whip-zoom | `at`, `title`, `stage`, `children` (incoming world), `slide`, `area0` .072, `peek [x, y]` |
| `CardToPanel` | hero card shrinks into the product panel in 10 f | `at`, `rect`, `head`, `hero`, `children`, `dur`, `radius`, `stage` |
| `ReasoningLog`, `LogRow` | status card springs open, verbatim rows in batches of 4 every 10 f, glyph first | `at`, `openAt`, `title`, `doneTitle`, `doneState`, `rows [{text, state, mono}]`, `width`, `openH`, `batch`, `every`, `x`, `y` |
| `HiddenQuestions`, `Question` | wash + question pills born as dashes, all resolve at once | `at`, `resolveAt`, `outAt`, `questions [{q, a, x, y, size}]`, `stagger`, `tint` |
| `UIPlane`, `planeCam`, `PlaneKey` | tilted UI plane: drift, tilt-shift DOF, macro push (24 f), whip (7 f, 12 px blur), ease (18 f), ~3% settle | `width`, `height`, `keys [{at, x, y, zoom, move, dur}]`, `rx`, `ry`, `rz`, `drift`, `far`, `focusY`, `band`, `stage` |
| `Brandify` | macro button neutral → accent with shape shards; held variant | `at`, `label`, `doneLabel`, `held`, `heldLabel`, `size`, `fill` 12, `shards` |
| `CaptionToInput` | caption selected, deleted, becomes the prompt field; camera 2.2 → 1; types | `at`, `caption`, `prompt`, `cps` 25, `size`, `inputW`, `y`, `zoom` |
| `Spotlight` | 52% dim + 6 px ring, no zoom | `at`, `out`, `rect`, `radius`, `dim`, `stroke`, `color`, `dur`, `pad` |
| `OptionRing` | ring stepping through options, 32 f each | `at`, `options Rect[]`, `per`, `stroke`, `keepLast` |

## Audio (`motion/audio.tsx`)

| Export | What | Props |
|---|---|---|
| `Soundtrack` | VO + music + SFX with speech ducking, dynamics keys, stem switch for `mix_check.py` | `vo`, `music`, `mix`, `stem` vo/bed, `dynamics [[frame, level]]`, `sfx`, `muted` |
| `Sfx`, `SfxGain` | one effect from `public/sfx/<name>.wav`, ducked via context | `name`, `at`, `volume` |
| `MIX_START`, `Mix`, `VoLine`, `awayFromSpeech` | start gains and types | |

## 3D (`three/`): see `3d.md` for recipes

| Export | Technique |
|---|---|
| `Stage3D`, `Layer3D` | studio stage (procedural env, light rig, gridded backdrop, PostFX) / transparent layer between 2D layers |
| `Logo3D` | extruded logo from SVG path(s) or polygons, pieces assemble and ripple, glass/crystal extras |
| `GlassCard3D` | glass slab with canvas-drawn UI |
| `Orb3D` | glass sphere with the logo inside, pulsing core |
| `LayerStack3D`, `stackLayerY`, `stackLayerAnchor`, `DEFAULT_LAYERS` | architecture slabs with a travelling dot; ALLOW or HELD gate |
| `Text3D`, `useTypeface` | extruded display type with staggered settle (needs a typeface JSON) |
| `TileField3D` | ~1000 instanced tiles with a work wave and a followed tile |
| `LightStreaks` | sweep wipe or tunnel push-through streaks |
| `pushSettle`, `orbit`, `dolly`, `keyed`, `withDrift`, `CameraRig`, `focusDistance`, `projectToScreen` | frame-pure cameras, rack focus, 2D pinning |
| `PostFX` (`dof`, `bloom`, `grain`, `rolloff`, `motionBlur`) | BokehPass DOF, bloom, grain, highlight roll-off, depth-reprojection camera blur |
| `StudioEnv`, `LightRig`, `Backdrop`, `ShadowFloor`, `CastShadows`, `ContactShadow`, `GlassCaustic`, `GlowSprite`, `make*Material` | lighting and finish helpers |
| `glass`, `crystal`, `frosted`, `accentMetal`, `satin`, `slabGlass`, `finishMaterials` | material recipes |
| `useCanvasTexture`, `text`, `roundRect`, `stateGlyph` | crisp text on 3D surfaces |

## Examples (`examples/`)

| File | What |
|---|---|
| `CraftLab.tsx` | one labelled 120 f demo per core technique (including a dense data screen and a 3D logo); render stills to see the kit |
| `FilmTemplate.tsx` | the composition shape the pipeline builder writes props for (scenes, VO, music, cues, stem, qa); `wordAt()` locks visuals to words |
| `Root.example.tsx` | `<Composition>` registrations to merge into your Root |

## Techniques with recipes only (build when first needed)

Counted toasts · stepper chain · field → chip card · diagram build with breath-out · lateral chain dolly · live sliders · anchored popover · hero chip pop · loader zoom-through · karaoke line · soft/hard reveal pair · speed-ramped title wipe · input lens · grounding route · strike → pill · pinned carousel · checklist receipt · logo → chrome · breath-and-hit audio helper · persistent HUD · dim → lit state machine · token carried across a cut · status cascade · identity card · kinetic card (pre-laid pops) · object morph · co-authored cursors · prompt macro match cut · from → to caption · people/system columns · row re-sort · column sweep · sentence → token · cursor emphasis · glyph morph · skeleton fill · collapse → drop · toggle mark · flip card + step panel · chapter grid · keyword ladder · step carousel · prompt lift · activity feed · zoom-out to crowd · line-up fan · punch word · elbow connector · roundup cards. Numbers for each are in `typography.md`, `micro-motion.md`, `builds.md`, `camera.md` and `transitions.md`.
