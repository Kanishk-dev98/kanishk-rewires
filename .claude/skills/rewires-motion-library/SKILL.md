---
name: rewires-motion-library
description: Catalogue of premium motion-graphics techniques studied from the user's reference videos (ref-1000319940 tutorial reel, ref-1000320070 vanshika.motion promo, ref-1000320075 OpenAI-style launch), each with how to build it in Remotion and how to apply it in the Kanishk.Rewires theme. Load when planning or animating any Kanishk.Rewires video, to pick techniques that literally show what the narration says.
---

# Kanishk.Rewires motion library

Source breakdowns are in `research/reference-videos/ref-*/ANALYSIS.md` (newest benchmark: ref-DepnbyJsLYK, @princegupta.ai, with zero stock footage, headline-as-caption and real product UIs). These are **techniques**, not assets: never reuse the creators' footage, handles, logos or copy. Always translate the colours to ours: coral or blue accents become **lime #A7FF3F**, cream stays **#F6F4ED**, dark scenes are **#0A0A0A**, the secondary accent (cursors, labels) is **stone #D9D6CC** or **pale lime #E8FFB8**, and a serif italic accent word uses Instrument Serif italic.

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
| 1 | Kinetic sentence (built: `pKinetic`, see promo-build.md) | Words land one by one, centred, small sans with one italic serif accent word; tiny lime specks drift around | Hooks, transitions, punchlines | Split the words; each word gets a blur-in at its cue; specks are 8 to 14 absolutely placed 4 px squares on a `random()` drift path | 🧩 (`Rich`, `MaskUp`) |
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
| 26 | Headline-as-caption + selection highlight (ref-DepnbyJsLYK R1, R2) | The spoken line builds word by word at the top in mixed type (grey sans, a bold key word, an italic serif accent); the emphasis word gets a Figma-style selection box with handles; no bottom subtitles | Every reel: one text system, no duplicate text | `KineticHeadline`: per-word blur-in, accent weights from `accents`, lime selection box with corner handles | 🆕 |
| 27 | Hub-and-chips diagram (R4) | A central node with a progress ring; satellite chips pop in on their words and get green checks | Explaining systems, agents, tool stacks | Polar layout, cue-timed chips, ring dashoffset | 🆕 |
| 28 | Real screenshot browser pan (R7) | The real README or site in a browser frame slowly pans and zooms to what's being named | Proving a product claim | `Browser` plus an image or recreated UI; translate and scale on cues | 🧩 (`real.tsx` Browser) |
| 29 | Two-layer concept + run log (R8) | A concept card above (step highlight moves) and a terminal log below adding ✓ lines | How-it-works for AI tools | Two stacked panels synced to cues | 🆕 |
| 30 | Dark-to-light act switch (R12) | A circular cream wipe flips the film into a light second act at the twist | "But here's the crazy part" moments | clip-path circle from the centre, charcoal to cream | 🆕 |
| 31 | CTA UI journey (R13) | Profile card Follow → Following, the comment keyword typed, a DM reply with a link card | Comment-to-DM CTAs | Profile, comment and DM cards; cursor with a click ripple | 🧩 (comment sheet) |
| 32 | Continuous light thread (ref-Dep8EFxSXK1 T1–T3) | One glowing point and line never cuts: it draws, pierces glow discs, closes into a ring, collapses to a glyph, stretches into a UI card | Agent or process stories ("watch one thing flow through every step") | Resample all shapes to N points and interpolate the path `d`; a stroke plus a blurred twin plus a haloed head dot | 🆕 |
| 33 | Dots → bars agent pipeline (T6) | A row of agent dots light up one by one, then rise into bars | "Agents line up the work", multi-agent steps | Staggered springs on height; colour per agent | 🆕 |
| 34 | Beaded chips on a string (T7) | A hairline threads pill chips; the active chip flips to the accent and swings like a pendulum | Step sequences on a cream act | SVG path through chip anchors; rotate spring per chip | 🆕 |
| 35 | Orb flood act-switch + bokeh outro (T8, T10) | A glowing orb fills the frame into cream; the outro orbs swirl and condense into the badge | Act changes, logo endings | Radial orb scale-up; blurred orbs on spiral paths | 🆕 |

## Picking techniques for a script

For each narration line, ask what the sentence literally shows, then pick the catalogue row that shows it. Mix at most 4 or 5 techniques in one video so it feels designed, not like a sampler. The default pairing by format:

- **Tutorial:** 23 + 9 + 2 + 12 + 3
- **Product or tool explainer:** 1 + 2 + 7 + 10 + 13 + 22
- **Strategy or news:** 25 + 15 + 16 + 17 + 14
- **Data or CRM story:** 21 + 13 + 8

When a 🆕 technique is first needed, build it as a reusable component in `studio/src/rewires/`, add a scene type, register it in `pipeline/rewires/storyboard.py`, and mark it ✅ here.

## Additions from the @princegupta.ai 16-reel study (rows 36–55)

Evidence: `research/reference-videos/prince/ANALYSIS.md`. Theme translation: their black-first worlds become our cream-first; their blue selection becomes our lime.

| # | Technique | Looks like | Use it for | Build notes (Remotion) | Status |
|---|---|---|---|---|---|
| 36 | Noun → event cue map | Every spoken noun fires its own chip, check, toggle or count-up on its exact onset | Every reel | Storyboard `cues` for every noun; one event per cue; headline words from the transcript JSON | 🧩 (cues exist; enforce a full map per script) |
| 37 | Shared-element morph | Hook logo shrinks into a header card; gauge becomes star counter; sketch becomes UI | Continuity instead of cuts | Same element; interpolate rect, radius, scale and content cross-fade over 14–20 frames | 🧩 (`dDuet` chat bar → hub) |
| 38 | Theme flip by sphere or iris | A dark sphere (or cream iris) grows from the centre to swap worlds, on a breath | Twist, name reveal, each enumerated item | clip-path circle from centre with a shaded radial gradient sphere; 12–16 frames; whoosh | 🆕 |
| 39 | Voice-synced UI typing | The terminal or chat types the exact words being spoken | Commands, prompts | Characters revealed from transcript word times, not a fixed cps | 🆕 |
| 40 | Counter + sparkline proof | Stars roll 0 → 10.9k while a sparkline draws with a glowing tip | Any proof number (spoken too) | Odometer digits (per-digit translateY) plus an SVG path dashoffset synced to the count | 🧩 |
| 41 | Scan-line X-ray reveal | A bright horizontal bar sweeps down a UI and reveals its code or diagram underneath | "Under the hood", "what's really inside" | Two layers; clip the top layer by scan y; glow bar | 🆕 |
| 42 | Persistent stepper / status panel | A docked panel under the hero keeps state (Planning ✓ → Calling tool… → Done) while cards above change | Any multi-step process | Fixed component outside the beat world; row states keyed to cues | 🆕 |
| 43 | Accordion rule rows | Each rule row expands with its description while spoken, then collapses to a check | Rules, principles, steps | Row height spring; check draws on collapse | 🆕 |
| 44 | Rubber stamp | Rotated stamp slams with overshoot: FREE, NO ACCOUNT NEEDED, TOO MUCH, SELF-REPORTED | Trust stack, honesty beats, "too much" | Scale 1.6→1 with spring, rotate −8°, slight shake; at most 1–2 per reel | 🆕 |
| 45 | Bad → good gauge with glow re-tint | Ring gauge counts 6% → 100%, ring and background glow shift stone/red → lime | Transformations, "before vs after" | Arc dashoffset plus background radial gradient colour interpolation | 🆕 |
| 46 | Timer race | Slow timer climbs past 1:00 and turns red; blur-swap to a fast run that stops at 7 s | Speed claims | Two big mono timers; colour shifts at a threshold | 🆕 |
| 47 | Highlighter sweep on real text | Yellow/lime marker sweeps a phrase in a README, tweet or article | Proof from a source | Background-size width animation behind a text span | 🆕 |
| 48 | Tether lines | Dashed red line ties A to B ("locked in"); turns solid lime when freed | Dependence, lock-in, integrations | SVG path; dash animation; colour and dash switch on cue | 🆕 |
| 49 | Depth-of-field card field | Dozens of cards float at z-depths with blur; camera dollies through to one hero card | Openers for "every job / every lead / every post" | Cards with z → scale, blur, parallax; dolly on scale | 🆕 |
| 50 | Footage → blueprint with CV boxes | Real clip gets computer-vision boxes ("upside down"), then morphs in-card into a line diagram | When footage is the subject | Video in card; SVG boxes snap on with overshoot; cross-fade to a blueprint SVG in the same rect | 🆕 |
| 51 | Icon-flip grid | A grid of app icons flips one by one into code tiles | "Any app / any X" | rotateY 0→180 per tile with stagger; back face is the new state | 🆕 |
| 52 | Call graph draws node by node | Nodes appear on cue and curved connectors draw between them, ending on a focus ring | How data or calls flow | SVG nodes plus cubic paths with dashoffset; focus ring pulse | 🧩 (`Wires`) |
| 53 | Pain counter | Word count ticks 7 → 197, or "time spent" timer runs to 5:47:12 | Measuring the old way's pain | Counter badge plus amber/orange accent; then strike and fling the old card | 🆕 |
| 54 | Strike-and-fling | The old way (a paragraph card) gets a red strike, tilts in 3D and flies off before the CTA | Closing the before/after | Strike line draw, then rotateY/translate out with blur | 🆕 |
| 55 | Tape label + glitch | An amber DEVELOPER PREVIEW tape slaps on; RGB-split glitch on "break" | Caveats, honesty, warnings (mid-body) | Rotated tape div; 3–4 frames of offset coloured copies | 🆕 |

## Additions from the @madetoscale2026 11-reel study (rows 56–70)

Evidence: `research/reference-videos/madetoscale/ANALYSIS.md`. Translate their orange to our lime and their peach mesh to our cream.

| # | Technique | Looks like | Use it for | Build notes (Remotion) | Status |
|---|---|---|---|---|---|
| 56 | Chapter chrome | Mono pill top-right `STEP 2 · FIND · 03 / 6` + hairline progress under the logo | Any multi-step reel > 35 s | Fixed overlay outside the beat world; pill text cross-fades per chapter; bar = frame/total | 🆕 |
| 57 | Step tabs / tool-chain rail / rank ruler | A row of tabs or tool logos (or a 10…1 tick ruler) docked at the top; the active one lights up | Playbooks, workflows, countdowns | One component, `items` + `active` from cues | 🆕 |
| 58 | Strike-and-replace number | ~~₹30,000~~ strike draws, greys, ✕; ₹55,000 drops in with ✓ | Decisions, pricing, "the right answer" | Strike line scaleX, grey filter, badge spring; new number y-drop | 🆕 |
| 59 | 0 → N proof counter hook | A giant "0" with zero-badged app icons, then it counts to 20 and the label swaps (CLIENTS → LEADS) | Pain → promise hooks | Blur-in hero number; counter with ease-out; label cross-fade | 🆕 |
| 60 | Lock-screen time-lapse | Phone lock screen 2:00 night → notifications stack → 7:30 sunrise | "While you sleep" automations | Clock digits + bg gradient interpolation + notification stack | 🆕 |
| 61 | Pin-drop counter on a map | Search types "dentists without website", red pins rain, a counter climbs to 312 | Local opportunity, lead finding | Stylised map SVG; pins with staggered drop; counter synced to pin count | 🆕 |
| 62 | Persistent hero card that grows | One card stays put while rows, chips, badges and tags keep arriving every 1–2 s | Every chapter | Card container + cue-keyed child list | 🧩 |
| 63 | Intent slider + score rings | Knob slides COLD→HOT; rings count 0→92 HOT, 0→18 SKIP | Qualification, scoring | Gradient track; ring arc dashoffset + label swap | 🆕 |
| 64 | Loser-dim / winner-crown | Result cards stack; losers dim to 40%, winner gets accent border + "Winner" badge | Comparisons, A/B, prices | Opacity + border + badge spring on a cue | 🆕 |
| 65 | Speedometer | Needle sweeps 47→121, overshoots to 319, settles 303; arc fills; "~2.5× faster" pops | Any "faster / more" claim | SVG arc + needle rotate with spring overshoot | 🆕 |
| 66 | Equation card | "Hiring = Budget + Urgency": chips assemble around = and + | The one-line insight | Chips fly in to slots; = and + scale in | 🆕 |
| 67 | Countdown card deck + hidden #1 | Cards fan into a deck, the top card blurred "???"; per-card star count + micro-demo panel | Top-N lists | Parametric card (colour, rank, name, stars, demo slot); fan rotate; blur on #1 | 🆕 |
| 68 | Skeleton → real site build | Grey placeholder browser; data chips fly into it; it resolves into a real page with a URL | "AI built it" | Skeleton blocks cross-fade to rendered layout; chips on bezier paths | 🆕 |
| 69 | Typed-keyword comment box → DM toast | Comment field types the KEYWORD; a DM toast with the payload ("4 prompts + template, Free") slides in | Every keyword CTA (lighter than the full profile journey) | Typing + toast slide; payload text from storyboard | 🧩 (row 31) |
| 70 | Zoom-out recap | The camera pulls back to reveal every scene laid out as one canvas before the CTA | Recaps of multi-step reels | Our `dDuet` world camera already supports it: zoom out to fit all beat positions | 🧩 (`dDuet`) |

## Additions from the @jackroberts___ 10-reel study (rows 71–80)

Evidence: `research/reference-videos/jackroberts/ANALYSIS.md`.

| # | Technique | Looks like | Use it for | Build notes (Remotion) | Status |
|---|---|---|---|---|---|
| 71 | Mascot with role props | One character (our K·R lime mascot) pops in staggered as a crowd and changes props per role: code screen, megaphone, scales, hard hat, "?" marks when confused | Standing in for "your AI / your agents" | SVG character + prop slot; staggered spring spawns; idle bob | 🆕 |
| 72 | Held count-up on a stretched number | Grid fills while 54→157→259→280 counts; held while the VO stretches "280" | Extreme-scale hooks | Counter + grid fill synced; hold until the word ends | 🧩 |
| 73 | GitHub Star ticker + confetti | Star button counts 0→170→712, star fills gold, sparkles burst | First-second social proof | Button UI + odometer + particle burst | 🆕 |
| 74 | Logo stroke draw-on + glow | Logo outline draws on black, then fills with a glow | Brand/repo reveal | SVG paths with pathLength dashoffset; fill opacity + blur glow | 🆕 |
| 75 | Swap-orbit | Two logos orbit a loop and swap sides on "then they swap roles" | A↔B mechanisms, audits, handoffs | Polar positions with phase; swap = +180° spring | 🆕 |
| 76 | Code-typed, preview-builds-in-sync | The editor types `Write(motion.js)` lines while the preview below builds sky → sun → hills → character | "AI writes it as code" | Each code line's reveal frame drives the matching preview element | 🆕 |
| 77 | Live text edit | Card "Hi, Sam" → cursor selects → types "Alex" → colour swap | "Editable", personalisation | Cursor path + selection highlight + retype | 🆕 |
| 78 | Notification state-flip | "Your monthly payment was processed" (red glow) flips to "Subscription cancelled" (green glow); pending → approved cards | Cancel, approve, before/after | Two-face card rotateX flip + glow colour interpolation | 🆕 |
| 79 | Metaphor-per-stat set | Coins stacks shrink (cost), token list collapses (tokens), 404 player (can't), PAID-stamp calendar (subscription), melting site + rejecting crowd (slop) | Making numbers physical | Small reusable components keyed to a number prop | 🆕 |
| 80 | Prohibition open | Red ✕ stamp with pulse ring + caution tape slaps across the tool | "Do not let X unless…" hooks | Stamp spring + ring scale/opacity + two tape strips sliding with rotation | 🆕 |
