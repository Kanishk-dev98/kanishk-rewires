---
name: rewires-motion-library
description: Catalogue of premium motion-graphics techniques studied from the user's reference videos (ref-1000319940 tutorial reel, ref-1000320070 vanshika.motion promo, ref-1000320075 OpenAI-style launch), each with how to build it in Remotion and how to apply it in the Kanishk.Rewires theme. Load when planning or animating any Kanishk.Rewires video, to pick techniques that literally show what the narration says.
---

# Kanishk.Rewires motion library

Source breakdowns are in `research/reference-videos/ref-*/ANALYSIS.md`. These are **techniques**, not assets: never reuse the creators' footage, handles, logos or copy. Always translate the colours to ours: coral or blue accents become **lime #A7FF3F**, cream stays **#F6F4ED**, dark scenes are **#0A0A0A**, the secondary accent (cursors, labels) is **stone #D9D6CC** or **pale lime #E8FFB8**, and a serif italic accent word uses Instrument Serif italic.

## Rules every technique follows

1. **One idea per line.** Each narration line gets its own visual world (075), changing every 1 to 2 s (ref-1000319940).
2. **The visual is literal.** The element named in the sentence appears on the word that names it (use storyboard `cues`).
3. **Blur-in entrances.** Opacity 0 to 1 plus `filter: blur(12px)` to 0 plus a small rise, over 8 to 12 frames, eased out. Exits are quicker.
4. **Something small is always moving:** specks, cursors, spinners, strands. Never a dead frame.
5. **One accent word per line,** in italic serif lime or a pill. Never colour whole sentences.
6. **Hard cuts between cream and charcoal** set the rhythm. Transitions should be organic (ring pulse, strands, pixel wipe), not template wipes.

## Catalogue

Status: ✅ exists in the engine · 🧩 partly exists · 🆕 build when first needed.

| # | Technique | Looks like | Use it for | Build notes (Remotion) | Status |
|---|---|---|---|---|---|
| 1 | Kinetic sentence | Words land one by one, centred, small sans with one italic serif accent word; tiny lime specks drift around | Hooks, transitions, punchlines | Split the words; each word gets a blur-in at its cue; specks are 8 to 14 absolutely placed 4 px squares on a `random()` drift path | 🧩 (`Rich`, `MaskUp`) |
| 2 | UI inline in a sentence | "Create [icon tile with a cursor] a task": a live UI element sits between words, then expands into a window | Showing an action inside the narration | Flex row of text, element, text; the element pops on its cue, then animates width and height into a card | 🆕 |
| 3 | Word pill | The key word sits in a dark rounded pill ("Share with (hundreds) of…"), or an outline pill that morphs its text | Numbers, quantities, keywords | `<span>` with border-radius 999 and a charcoal background, lime text; morph by cross-fading two spans with a width tween | 🆕 |
| 4 | Logo cloud in depth | Brand app tiles float at 3 depths: far ones small and blurred, near ones big with motion streaks | "Works with every AI tool", ecosystems | Tiles from `LogoTile`; per tile, depth z gives scale, blur and parallax speed; streaks are a 3 frame trail of decaying copies | 🧩 (`LogoTile`) |
| 5 | Pixel-mosaic frame | Accent squares build inward from the edges to frame a line | Emphasis beats, chapter breaks | A grid of 14 px squares; a square shows when its distance to the edge is less than progress times maxDist, with a little jitter | 🆕 |
| 6 | Corner-bracket reveal | Two big L-brackets slide in to frame a word or logo ("Meet [ ]") | Product or brand reveal | Two divs with thick left/top borders, translated from offscreen to the word's box | 🧩 (viewfinder brackets in `cineScenes`) |
| 7 | Stacked feature cards over a duotone photo | White cards (icon, title, subtitle) stagger over a photo tinted to one colour | Feature lists, wins, logs | Photo with `grayscale(1)` plus a lime or charcoal overlay in `mix-blend: multiply/screen`; cards blur-in with a 5 frame stagger | 🧩 |
| 8 | Avatar collage | Profile cards with photos drift with parallax and depth blur around a centre sentence | Audience, people, "hundreds of…" | Licensed headshots (Unsplash); per card z gives scale, blur and drift; centre text with a word pill | 🧩 (`media/li2` faces) |
| 9 | Code editor plus mascot plus named cursor | Dark editor, a typed prompt, a cursor with a name tag ("Candidate") | Coding and agent stories | `Terminal`/`CodeCard` plus a cursor with a label chip; a mascot is optional (our K·R monogram can play it) | 🧩 (`tut.tsx`) |
| 10 | Tilted window over a painterly gradient | App window in 3D perspective over a soft blurred landscape; a side list whose active item changes | Product walkthroughs | `TiltCard` plus a photo with blur(30px) and saturate(0.8); the list's active item is a lime marker that moves on cues | 🧩 (`ui.tsx` `TiltCard`) |
| 11 | Gradient bands plus inline spinner | Blurred bands around a dark strip with "Agents ( analyze…": a spinner inside the sentence | "AI is working" moments | Two blurred lime-to-charcoal gradient divs above and below; spinner is an SVG arc rotating with frame*12 | 🆕 |
| 12 | Focus-scroll checklist | A big list scrolls; the centred item is checked and full opacity, the others fade | Criteria, rules, skills | Items in a column translated by -index*rowH; opacity and scale come from the distance to centre; a check draws on the centred item | 🆕 |
| 13 | Score rows | Avatar plus name plus grade pill, cascading with blur | Rankings, lead scores | Exists as `ScoreCard` and `ApolloSearch` rows; add a grade-pill variant | 🧩 (`real.tsx`) |
| 14 | Card burst into a cluster | Many small cards explode from the centre and settle into a cluster between two words | "All of it, automatically" | 30 to 50 small cards, each with a spring from the centre to a `random()` target; colours are cream, stone and lime | 🆕 |
| 15 | Depth-of-field code field | Faint code snippets float in depth, blurred near and far; the centre phrase's keyword swaps in place with a glow | Chaos, overload, "too many tabs" | 30 snippet divs with z-based scale and blur, a slow dolly; the keyword cross-fades with a text-shadow glow | 🆕 |
| 16 | Signal strands to labelled nodes | Thin curves fan out from a glow; each ends in a node with an icon and label | Systems, integrations, data sources | Our `Wires` motif plus SVG paths drawn with dash offset; a node circle plus a `LogoTile` or icon plus label at each end | 🧩 (`Wires`, outro strands) |
| 17 | Dots converge to a ring | Scattered dots orbit into a circle, which becomes a glowing ring round a dark disc; text types inside; the ring pulses out as a transition | "It all connects", product reveal | Dots on paths from random to the circle; then a ring stroke with a conic lime gradient plus blur glow; the pulse is 3 expanding rings at low opacity | 🧩 (`LogoReveal` strands) |
| 18 | Perspective headline over a photo | A big headline tilted in 3D with depth blur over a landscape photo, then a prompt bar | Big questions, "what will we build" | rotateX/rotateY on the text, a blur ramp via a mask-image gradient; licensed photo backdrop | 🆕 |
| 19 | Radial card fan | Many cards fan out around a central button | Generation results, "multiple options in seconds" | Cards rotate to angle i/n×360 and translate by a radius on a spring; the button pulses | 🆕 |
| 20 | Editor state flood | Code lines go green with ✓ or red with ✗ and the whole background photo tints red when something breaks | Debugging, testing, pass/fail | `CodeCard` lines with a background colour; a backdrop photo with a red or lime overlay crossfade keyed to the ✗ cue | 🧩 (`CodeCard`) |
| 21 | Data nodes grow into a tree | Labelled nodes with counts float on cream, then become the tips of a branch that grows across the frame | "Connect the dots", knowledge, CRM data | Nodes first (depth float), then an SVG branch drawn with stroke-dash; nodes move to the branch tips | 🆕 |
| 22 | Cycling accent word | "One place to *Imagine / Build / Discover*": one slot swaps words | Taglines, endings | A fixed prefix plus a slot whose words blur-swap on cues | 🆕 |
| 23 | Tutorial grammar (ref-1000319940) | Progress bar, STEP N, a serif title with an italic accent, a persistent terminal, keyword captions, a Comment CTA | Step-by-step tutorials | `tut.tsx`, `tutScenes.tsx` | ✅ |
| 24 | Realistic product UIs | LinkedIn, Apollo, HubSpot, Publora screens in real colours | Tool walkthroughs | `real.tsx` | ✅ |
| 25 | Cinematic news | Letterbox, a tracked real-footage window, spec shatter, headline wall, a graded crowd, viral growth | Newsjacking and trend pieces | `cineScenes.tsx`, `cine3d.tsx` | ✅ |

## Picking techniques for a script

For each narration line, ask what the sentence literally shows, then pick the catalogue row that shows it. Mix at most 4 or 5 techniques in one video so it feels designed, not like a sampler. The default pairing by format:

- **Tutorial:** 23 + 9 + 2 + 12 + 3
- **Product or tool explainer:** 1 + 2 + 7 + 10 + 13 + 22
- **Strategy or news:** 25 + 15 + 16 + 17 + 14
- **Data or CRM story:** 21 + 13 + 8

When a 🆕 technique is first needed, build it as a reusable component in `studio/src/rewires/`, add a scene type, register it in `pipeline/rewires/storyboard.py`, and mark it ✅ here.
