# Editing

Measured across ~60 premium SaaS films (brand films, overviews, demos, explainers, ad spots, launch ads, roundups, tutorials). ASL = average shot length by hard cuts. "Events" = in-shot changes a cut detector misses; the best films have about twice as many events as cuts.

## 1. Rhythm numbers

| Format | Cuts | Perceived beat | Notes |
|---|---|---|---|
| Brand film (60 to 90 s, VO) | ASL 2.4 to 3.3 s by cut | 1.2 to 1.5 s (2 to 5 camera beats inside each UI take) | footage cuts 1.1 to 1.7 s, faces montage 1 beat (~0.5 s), UI takes 6 to 15 s |
| Our brand-film target | ASL 3.5 to 4 s | new info every ≤ 1.5 s | hero held at 35 to 40% of runtime when possible |
| Kinetic ad act | ASL 1.27 to 1.8 s | cards 0.5 to 1.6 s | UI holds 1.5 to 3 s |
| Workflow ad act | ASL 2.3 to 3.3 s | a state change every 1.3 to 1.6 s | continuous takes of 7 to 38 s |
| Ad spot (13 to 19 s) | ~6 to 8 shots | 1.3 to 1.6 s | the product shot is the longest shot (~3.1 s) |
| Explainer | ASL 3 to 4 s | diagrams in 7 to 11 s takes | a visual beat every 6 to 8 s; never a 55 s talking-head desert |
| Roundup / changelog | ASL 9 to 10 s | 1.5 to 2.5 s view changes | card 2 to 4 s + demo 8 to 20 s per feature |
| Social reel | new visual idea every 1.5 to 2.5 s | small reactive changes every 0.5 to 1 s | faster than ~1.5 s per idea did not help |
| Too frantic | ASL ~1.3 s with 2-beat shots | | add "breath and read" holds of 3 to 4 s every 4 to 8 cuts |

**Two cutting modes, chosen per act**: kinetic (hard and fast cuts, type cards) or workflow (rare cuts, density inside long takes). Default for product films: the workflow mode with one continuous camera and a single fast-cut act for claim cards.

## 2. Beat grid

- Prefer **120 BPM = exactly 15 f/beat** at 30 fps (timestamps land on whole frames). Other good grids: 128.57 BPM = 14 f/beat; 90 BPM = 20 f; 80 BPM = 22.5 f (a 3.0 s bar). Punchy ads sit at 113 to 143 BPM.
- **Every scene length rounds up to whole beats** so every cut lands on the grid (`build_vo_timeline.py` does this).
- **Cut on the beat or 0 to 3 f before it** for type and montage; type pops on 8ths/16ths; UI runs free inside a take; footage interludes on downbeats spaced in whole bars.
- Target **≥ 80% of cuts on the bar or beat grid** (weak benchmarks sit at 40 to 52%).
- Montage beat-locks: faces 1 beat each, breadth montage 2 beats, colour flips 1 beat.

## 3. Cutting to the voice (VO films)

- **The VO drives the cut.** Chapter changes sit inside VO breaths (gaps of 0.4 to 2 s); words land on syllables; music hits land in breaths, never on a word.
- Supers start 2 to 3 f before their word; one-word cards hard-cut 0 to 1 f before the syllable onset.
- **Claim → proof within ~1.5 s**: the picture of a claim lands within 1.5 s of the words.
- **Show first, name second**: the product shot runs before the card or line that names it.
- VO pauses of 1.1 to 3.2 s let the picture carry a payoff.
- Call-and-response rhythm: a human line under 2 s, then a visible UI change within 1 to 3 s; pairs of 3 to 5 s.
- Card → picture alternation every 2 to 5 s.

## 4. Getting word timings

- TTS: Edge TTS `WordBoundary` events give word start/end offsets (`build_vo_timeline.py`).
- Recorded voice: Whisper with word timestamps (`faster-whisper`, `word_timestamps=True` on a 16 kHz mono array).
- Write the props as frames: per scene `from/dur`, per line `at/end` and per word `t/e` (scene-local), per VO file `at` and `speech: [first word, last word end]` (absolute). Lock visuals to words with a helper (`wordAt(scene, line, "prefix")`).
- Compute named cue frames once (hits, drops, reveals) and assert guards: **no spoken word within 20 f after any hit**.

## 5. Structure-level editing rules

- **Context beat is short**: the "before" state is on screen 3 f to 0.5 s before it starts changing (spots); in VO films the context line lands by 3 to 5 s, as one line or one image, never a montage.
- **One continuous workflow beats a montage**; unrelated montages in the middle of a causal film are the weakest stretches.
- **Put one contrasting state** in every cascade or checklist (a held row among allowed rows; an unflipped tail).
- **Pre-reveal breath**: music dips or stops 0.5 to 1.6 s before every reveal; pictures hold still for that breath only inside type cards, never on UI.
- **Resolve on the product's own UI element** (a status column, a pill as the last word of a sentence) before the end card.
- **End card**: spots ≤ 20 s get 2.5 s with the URL ≥ 48 px from its first frame; films ≥ 30 s get ≥ 4 s with motion inside and a 1 s hold after the music resolves. End cards at 19 to 24% of a 13 s spot are too long.
- **Cap any layout at ~15 s**; cap the opening brand sequence (a 23 s branded open before the first teaching beat is a failure; tutorial titles ≤ 3 s).

## 6. Cut-downs and versions

- Cut-downs **re-order modules** (e.g. 15 s = drop the ask slot and open on the identity card; 13 s = the chip checklist variant).
- **Re-time the music bed for every cut-down** so its dropouts still land on the key cuts.
- Build the spine once as data-driven components so cut-downs and locales are data, not new edits.

## 7. Localisation as a template

| Layer | Rule |
|---|---|
| Picture and sound | lock them: timeline, camera, music and SFX frame-identical across languages |
| Card type | fixed size per card style, width floats, wrap to 2 lines; never fit-to-width on short cards; `minWidth` on one-word cards |
| Word pops | pre-laid at the final centred position, revealed in place; store pops as beats and write translations to the same pop count |
| Punch words | fixed curve; long words may overfill; check the edges |
| Glyph → icon morphs | anchor hand-placed per language; budget a manual pass |
| UI micro-copy | rendered from localised data, never screenshots |
| End card | duration is a parameter |
| Global master | VO in one language + subtitles; keep kinetic words short; reserve the bottom 140 px as subtitle-safe from day one |
| End-card text | generated from the same data as the VO script (never a stale template default) |

## 8. Live action inside motion graphics (when used)

- Presenter 2 to 3 s / UI 3 to 6 s alternation, UI within ~1 s of each line; at most two supers, only on emotional words.
- Overlays keep the speaker visible (a tinted wash, blur); punch-ins hide cuts; never a hard cut away mid-thought.
- At most one literal footage beat per film; no stock montage. Keep footage inside the graphic world (pull back into an inset).
