---
name: rewires-explainer-format
description: The Kanishk.Rewires "AI tool / launch explainer" format reverse-engineered from the benchmark reel ref-DepnbyJsLYK (@princegupta.ai, Harness²) and rebuilt in our theme. Headline-as-caption at the top, one designed object per beat, no stock footage, dark act → cream twist act → CTA journey. Use when making a 30-45 s reel about a new AI tool, repo, model or product release.
---

# AI tool explainer format (xBeat)

Benchmark: `research/reference-videos/ref-DepnbyJsLYK/ANALYSIS.md`. We borrow the **grammar** (structure, pacing, motion techniques), never the creator's wording or exact layouts. Scripts are always our own plain-English words, and the facts come from primary sources.

## Global settings
- `captionStyle: { "mode": "headline", "maxWords": 6, "size": 50, "top": 0.115 }`: the spoken line builds word by word at the top. Words in `accents` become italic serif lime; the first accent on each page gets a selection box with corner handles. There are no bottom subtitles, so text never appears twice.
- Put one or two `accents` per scene on the word that carries the meaning (the twist word, the number, the product name).
- Scene type `xBeat` with `data.kind`. Objects sit centred around y≈920 (`MID`). The top 200 px holds the headline; keep anything below 1400 clear for the Instagram UI.
- Rhythm: a new visual beat every 1-2 s, cued to the narration words. 30-45 s total.
- Acts: act 1 on charcoal (what it is, how it works, the proof). `act` flips to cream at "But the crazy part / here's the twist". Act 2 on cream (the deeper benefit). The CTA returns to charcoal.

## Beat template (in order) and the kind for each
| # | Beat | `kind` | Key data |
|---|---|---|---|
| 1 | Hook: who released what | `logo` | `logo` (official mark, unaltered) or `mark`, `badge`, `license`; cue `open` |
| 2 | What it does, as a system | `hub` | `center`, `chips:[{t,cue}]`, optional `repo:{owner,name,desc,logo}`, `ringCue` |
| 3 | The surprising constraint ("without retraining") | `weights` | cue `strike` |
| 4 | Name reveal | `reveal` | `name`, `sup`, `tagline` |
| 5 | Define the concept | `hub` or `browser` | a recreated diagram in a browser frame: `nodes`, `edges`, `url`, `panFrom/To`, `zoom` |
| 6 | The old painful way | `editor` | `lines`, `edit` (typed then deleted = fiddling by hand) |
| 7 | How you run it | `terminal` | `cmd` (real command from the docs) |
| 8 | How it works | `loop` | `steps:[{t,sub,cue}]`, `log:[{t,cue}]`, `logTitle`, `url` |
| 9 | The proof number | `stat` | `bench`, `value`, `unit`, `rows`, `note` (source and conditions); cue `stat` |
| 10 | Twist act switch | `act` | (circle wipe to cream) |
| 11 | The deeper benefit | `lessons` | `from`, `fromTitle`, `items:[{t,cue}]`, `toTitle`; cue `carry` |
| 12 | Compounding payoff | `chart` | `title`, `points`, `baseline`, `label` |
| 13 | CTA journey | `cta` | `word` (comment keyword), `dm`, `link`; cues `follow`, `comment`, `send` |

Drop or merge beats to fit the story; never add stock footage. If a real screenshot is needed, show it in a `browser` frame with a pan.

## Quality bar (must beat the benchmark)
- 1080x1920 at a 20 Mbps master (the benchmark was 720p).
- Every claim has a primary source in `research/sources.json`; numbers show their benchmark and conditions in `stat.note`.
- Official logos only, unaltered; otherwise use a type mark.
- Run `produce --stills`, check that no headline collides with the object zone, then render.
