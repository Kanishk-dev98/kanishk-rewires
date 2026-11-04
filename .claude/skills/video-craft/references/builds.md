# Meso motion: builds

How UI assemblies, panels, chains, diagrams and collections come together. All numbers at 30 fps. Build each with a component (`components.md`) or the recipe numbers. Rule for every build: elements arrive in reading order, nothing overlaps (old elements move away or fade fully; never ghost them at low opacity behind new content), and each item gets about one beat to be read.

## Assembling UI

| Build | Numbers | Use | Build |
|---|---|---|---|
| **UI assemble** | pieces ~3 f apart in reading order (icon f0, title +10, field 1 +16, field 2 +19, button +23), each 6 to 8 f `E.in` with a 6 to 8 px rise | any card or panel | recipe / `BlurIn` per piece |
| **Tile pop** | 5 f, scale 0.94 → 1, opacity 0.5 → 1, rise 10 → 0; stagger 3 f in reading order | grids of tiles, rule cards | recipe |
| **Card fly-in from depth** | spring {d22, s120} per card, stagger 3 f; scale 0.85 → 1, blur 8 → 0, rise 24 px | card decks | recipe |
| **Empty containers first** | outlined empty pills appear (3 f stagger), then the values type in at 30 cps | receipts, data pills | recipe |
| **Panel docking** | panel rises from the bottom: 75% of the travel (+400 px) in 6 f, then settles over 16 more frames = `E.arrive` over 22 f; or scales from its icon 0.85 → 1 over 8 f | assistant / side panels | recipe: `top = interpolate(f,[0,22],[1000,104],{easing:E.arrive})` |
| **Hero card → product panel** | the full-frame hero card already carries the panel chrome; it shrinks to the real panel rect in 10 f bezier(.6,0,.3,1) (or 14 f (.65,0,.25,1)), radius 0 → 14, content scales with it, chrome fades in on the last 4 f | the logo moment and the product as one object | `CardToPanel` |
| **Logo → UI chrome** | one element through three keys: lockup 360×120 → rail 64×520 (r 32) → window 1500×860 (r 16); children cross-fade per key; 60 f, spring {damping 200} per segment; icons pop 3 f apart | logo becomes the sidebar, then the window | recipe |
| **Anchored popover** | scales 0.9 → 1 from the clicked button's top-centre, spring {d16, s240}, 14 px tail pointing at the button, shadow `0 24px 48px rgba(20,20,60,.18)` | an explanation popping from the button that triggered it | recipe |
| **Modal from its origin** | scrim fades in 4 f; modal 0.92 → 1 in 4 f with `transformOrigin` at the button; background blurs ~20 px, veil to 85%, modal rises 40 px | an editor over a blurred list | recipe |
| **Persistent panel header, swapping body** | header pill fixed for the whole act; the body cross-fades + 20 px rise over 5 to 8 f per step | one object through many steps | recipe |
| **Identity / profile card build** | hard cut; card slides 60 px and settles in 7 f; tile pre-scaled 1.05 → 1.0; name mask-reveals 1 char per 1.2 f from f1; role +8 f; status pill draws then fills; hold ≥ 1.5 s with a slow 3% push over 1.5 s | introducing an actor (person, team, service) | recipe |
| **Line-up fan** | a deck at 0.75x right of centre spreads into a 5-card row in ~16 f bezier(.16,1,.3,1), back cards +2.4 f each, ~30% overlap, centre card raised; idle bob ±3 px | "meet the team" | recipe |
| **Card pop-swap through a point** | A scales 1 → 0.2 with blur in 4 f `in(quad)`, B 0.2 → 1 in 4 f `out(back(1.4))`, blur = (1 − scale) × 12 | swapping profiles | recipe |
| **Glass card stack with motion echo** | 3 cards slide in from the left in 10 f; trailing copies lag 3 to 4 f, offset 30 to 40 px, opacities 1 / .5 / .25 | pillar intro | recipe |

## Chains and pipelines

| Build | Numbers | Use | Build |
|---|---|---|---|
| **Permission chain (audit staircase)** | step i at x0 + (i%2)·60, y0 + i·96 to 100; elbow connector `M x,y+40 V y+70 H x+48` draws 6 f; each card born as an 84 px square springing to full width in ~6 f {d18, s260} while its label types at 40 cps; badge ring → lock (4 f) → ✓ (scale .8 → 1, 6 f) at t0+14; steps 20 f apart; camera tilts down ~90 px/s; older steps go soft (DOF); two node types by colour (checks = accent gradient cards, entities = white cards with italic labels); exactly one calm denial | the "under the hood" proof | `AuditStaircase` (+ `ChipDive` to enter) |
| **Camera-tracked pipeline** | cards ~805×212 at a pitch of (+160, +318); a step every 13 f or one beat; camera moves one pitch per step on `E.cam` over 12 f; connector draws 6 f (arrowhead at 95%); card enters pending at 60% sliding +24 px over 6 f, activates 6 f after the step lands (check draws 8 f); only ~2.5 cards visible | step-by-step processing | recipe |
| **Stepper chain** | pill chips joined by a hairline; pending → active → done swaps in 4 f; the connector draws to the next chip in 10 f; a step every 45 f (36 f active); camera tracks the row `inOut(cubic)`; add a distinct HELD state | linear flows | recipe |
| **Agent / process tree on dark, beat-locked** | elbow draws 6 f, then the child pill slides in from −40 px (spring d18 s160) along the elbow; one child per beat; camera `translateY` tracks the newest child | hierarchy reveal | recipe |
| **Lateral chain dolly** | camera moves at a constant ~120 px/s linear; nodes enter at the right edge and morph into labelled cards at centre; a faint skeleton data layer parallaxes at the same speed; the active connector segment in the accent (it stops and pulses at a hold) | a request travelling through a system | recipe |
| **Elbow connector + travelling dot** | top card 1 → 0.82 and up (12 f `inOut(cubic)`), bottom card slides out from behind (−80 → 0, 10 f); 2 px connector with rounded 90° corners draws with `strokeDashoffset`; a dot travels along it | chat → record, source → destination | `Draw` + recipe |
| **Collect → collapse → drop** | items rise 7 to 10 f `out(cubic)`, 4 f stagger, pile behind a pill; the group scales to 20% in 6 f `in(cubic)` and swaps to one icon; the board fades in behind at 1.15 → 1 over 6 f; the icon lands in its cell and fans into 3 icons, 2.4 f stagger | many inputs → one record | recipe |
| **Object morph across surfaces** | one element, interpolated rect over 8 f bezier(.65,0,.35,1), scale peaks 1.1 at 35%; source surface fades out over 5 f, target fades in f2 to f8; label swaps at 80%; a held item "bounces" back instead of landing | invoice line → held card → ledger row | recipe |

## Diagrams

| Build | Numbers | Use | Build |
|---|---|---|---|
| **One layer per VO clause, breath-out pull-back** | each clause adds one row; rows never move relative to each other; the camera pulls back 1.00 → .78 → .66 → .58, each move 7 f bezier(.6,0,.2,1), plus always-on drift `s *= 1 − f·0.0004` | architecture explained once | recipe |
| **Architecture drawn three times** | the same diagram built three times, one layer each time, so every later screen "reads as an instance of a diagram the viewer already holds" | explainers | storyboard rule |
| **Hub and spoke** | centre orb settles (halo shrinks, drifts 40 px down, 5 f); dotted spokes grow clockwise, 2 to 3 f stagger, each 4 to 5 f; nodes appear as pale ghost circles, stroke darkens 6 to 7 f, ~2 f after their spoke; labels type later at 20 cps; full build ~3 s then a 1.5 s hold; afterwards a dash-offset "flow" | one thing connected to five | recipe |
| **Foundation slabs** | trapezoid top faces (`polygon(6% 0,94% 0,100% 100%,0 100%)`) + a band with a caps label; 40 px gap; dependency pills drop in on the VO nouns; continuous `scale(1 − f·0.0003)` | layers of a platform | `IsoSlab` (CSS) or `LayerStack3D` |
| **Isometric slab stack (calm 3D)** | slabs at `rotateX(55deg) rotateZ(-45deg)`, side faces as skewed divs, labels counter-rotated; dotted connectors flash API calls; used once per film | "you build this, we handle that" | `IsoSlab` |
| **Self-drawing flow** | nodes every 6 f, arrows draw 6 f (dashoffset), each node 1.6 → 1 + fade; camera 2.4 → 1 over 60 f about the first node | process maps | `Draw` + recipe |
| **Grounding graph, one lit route** | far layer of dim grey nodes at 40%; near layer of white nodes with a 2 px ring; the highlighted route's edges (3 px) draw 8 f each with a 4 f stagger; the end pair glows `0 0 24px 6px` | "the answer came from here" | recipe |
| **Frosted taxonomy chain** | cards white at 72% with backdrop blur 20 and an inset bottom glow; drop 30 px + fade, spring {d200, s140}, 8 f stagger; bracket connectors draw 6 f after each column; camera dollies back 1.6 → .85 and right over 180 f `inOut(cubic)` | what a concept is made of | recipe |
| **Architecture build, caption flies to its slot** | a centred 44 px caption lerps x, y and font size to an 18 px column header over 15 f; blocks scale .9 → 1 + fade 8 f, rows bottom-up 0.6 s apart; the diagram moves up 120 px / 15 f | slide-style explainers | recipe |
| **Accumulate, then collapse** | one hairline map grows denser with every pain point (pills, mono labels, icon tiles, a ticking counter); the answer redraws it with ~4 lines, then folds into one box | problem → simplification | `Camera` + `Draw` + `Pill` + `Counter` |
| **Hidden questions** | the scene keeps rolling under a tinted multiply wash (0 → 72% in 6 f); question pills start as 2 px dashes and open to full in ~6 f, 4 to 6 f stagger, sizes 28 to 36 px for depth; then all resolve at once into answers | the stake beat: one sentence, six hidden questions | `HiddenQuestions` |
| **Reasoning log** | a status card with a working hairline; on click its height springs 56 → 420 px {damping 200, mass .6} (~12 f); verbatim log rows in batches of 4 every 10 f, each glyph 2 f before its text; rows ≥ 28 px | auditable reasoning instead of a sparkle | `ReasoningLog` |

## Collections and boards

| Build | Numbers | Use | Build |
|---|---|---|---|
| **Status cascade** | rows flip state with a radial wipe 6 f, 2.4 to 7 f apart; leave one contrasting row (a HELD among ALLOWs, or an unflipped tail) | batch processing | recipe |
| **Row re-sort with lifted rows** | rows slide past each other into groups over 15 f bezier(.65,0,.35,1); in-flight rows get `0 8px 24px rgba(40,30,90,.15)` | sorting into states | recipe |
| **Column sweep** | a tinted band travels down each column in 12 f, columns overlap 8 f; cells resolve behind the band | a column filled automatically | recipe |
| **Column wave fill** | per-cell delay = col × 6 + row × 1.5 f; fade + 4 px rise over 4 to 6 f | tables populating | recipe |
| **Counted cascade** | a row of cards slides up from +200 px, 4 f stagger, camera pans 600 px over 60 f; the winner highlighted later | attempts / options | recipe |
| **Slot reel lookup** | names at 137 px pitch, 85 px light weight; spin then decelerate ~21 f `out(cubic)` with blur `(1−p)·6`; the active row recolours at p > .95 | picking one from many | `SlotRoll` / recipe |
| **Live sliders rewrite text** | thumbs move 15 f `inOut(cubic)`; changed sentences cross-fade 6 f, old copy ghosted at 30% for 10 f | settings that change behaviour | recipe |
| **Pinned element over a carousel** | an element pinned in screen space while host screens slide −1920·i with 9 f ease-in-out, a tinted band leading by 3 f, label cross-fades 4 f; or screens stack up from below (y 700 → −8i, spring d200 s140) under a fixed panel | "one identity, every surface" | recipe |
| **Persistent HUD** | a toast grows out of an avatar: width 80 → 640 in 10 f `out(quad)`, label types 1 char/f, state tag swaps per step (~55 f apart); rendered **outside** the camera transform while the board pushes 1.6x; docked variant: bottom-right in 4 f (24 px slide + fade) with a live counter | one actor's state across a whole act | recipe |
| **Co-authored checklist** | two cursors enter from centre and drift apart over 14 to 20 f; each writes a line like a pen in 12 f; lines 38 f and 24 f apart; chip variant: 3 lines at 5 f stagger, done in ~0.85 s | human + system agreeing | recipe |
| **Humans and agents columns** | two stacks (systems in ~140 px rounded squares, people in ~130 px circles) scroll opposite ways at 40 to 110 px/s, slide apart to the thirds over 40 to 48 f `inOut(cubic)` to open a stage for the title | team composition | recipe |
| **Chapter grid, one tile enlarged** | 2×2 glass tiles; the active tile 1.6x, others 20% opacity + 6 px blur, 12 to 15 f `inOut(cubic)` on the product name | pillars in long films | recipe |
| **Activity feed** | the newest entry enters at the top (−16 → 0, 8 f), older ones fade to 40% and move down, 5 f stagger, status dots | history beside a card | recipe |
| **Prompt anatomy table** | grey pill labels left (slide −60 → 0, 8 f), worked example right (word fade); keyword colour shared between label and example; one row per VO clause | tutorials | recipe |
| **Field of icons flips, then gathers** | a 12×6 field of warning icons flips to safe in random order over 30 f (8 f each), then gathers to centre in 20 f and becomes one hero icon | risk → protected | `IconFlip` |
| **Orbit with depth** | items on a tilted ellipse (rx 560, ry 180), back items smaller (0.7) and blurred (3 px) | integrations around a core | `Orbit` |
