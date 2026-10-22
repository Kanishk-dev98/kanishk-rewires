# @princegupta.ai: 16-reel channel study (Oct 8 to 22, 2026)

Sources: the reels in `references/local/prince/` (local only, never commit). Per-reel metrics, transcripts, 1 fps sheets and 4 fps hook sheets are in `research/reference-videos/prince/<ID>/`, produced by `tools/breakdown_reels.py`. Four parallel analysts read every frame. This file holds their findings, condensed. The operating rules derived from it are in `.claude/skills/rewires-channel-playbook/SKILL.md`.

## Scoreboard

| ID | Topic | Likes / comments | Duration, wpm | Hook template | Verdict |
|---|---|---|---|---|---|
| DehEdBbgQFZ | Google ARTEMIS: an agent drives a real Android phone | **5,989 / 1,060** | 63 s, 179 | [Big brand] just open-sourced a tool that lets your [agent] [physical action], and it already has [N] stars | Best reel. Brand plus visible magic plus proof by 7 s. Small example before the big one. Honest caveat mid-reel. |
| DewhNn1AZGQ | Karpathy Skills (Day 1 of series) | **5,781 / 511** | 51 s, 168 | This [thing] has ZERO [expected ingredient] and [huge proof number] | Paradox plus a spoken number. Borrowed authority. Rules useful without the repo, so it gets saved. |
| Dej2EeBMBT0 | Tesla Roadster upside-down physics | 2,830 / 39 | 53 s, 186 | You've probably seen [viral thing] do [impossible act]… but how? | Reach play: mass topic, no keyword. Likes high, comments low. |
| DepnbyJsLYK | Google Harness² | 2,564 / 848 | 38 s, 168 | [Brand] just open-sourced [thing] that lets your [X] [dream outcome] without [pain] | One new word defined at once, one number, a "crazy part" twist, a CTA that echoes the pain. |
| DeefsFdAQYC | Mochi notch mascot (Coucou) | 1,050 / 446 | 55 s, 202 | That little [character] in my [place] is [doing a human thing to] [your tool] | A character stops non-developers. Re-hook at 46% plus a world flip. |
| DeR8oSgsnfh | REA: reverse-engineer any app | 919 / 143 | 40 s, 180 | This repo lets you [forbidden-sounding verb] any [everyday thing] | Curiosity question. The twist doubles the value: it builds the feature, not just explains it. |
| DeOQ900K7ne | Brag: one command, launch video | 695 / 234 | 33 s, 193 | This repo turns [what you have] into [what you'd pay for] with one command | Short, playful aside. Karaoke pill captions. Proof plus FREE right before the ask. |
| DejpO6SgeTK | M3E Canvas: sketch to prompt | 608 / 216 | 56 s, 183 | What if you could just [easy action] and let AI [hard part]? | Whole transformation shown in the hook. Pain measured with a word-count badge. |
| Deq8KfOvQyQ | AI Job Search Claude skill | 562 / **776** | 40 s, 187 | This [tool] does [painful task] for you… because its creator used it to [outcome] | The keyword is the outcome (HIRED), so comments exceed likes. A story teaser planted at 6 s pays off at 24 s. |
| DeuRdcyspBX | DeepSeek DeepInfer engine | 408 / 104 | 42 s, 174 | [Famous AI co] just open-sourced the [hidden thing] behind [product], and it hit [N] in [tiny time] | Great jargon translations. Capped by an abstract topic and a "not for your laptop" caveat before the CTA. |
| DethBVBPDAC | VibeWise plugin | 276 / 110 | 28 s, 187 | I know you can't [embarrassing truth], but this [tool] makes sure you can next time | Bad-to-good gauge. Hook scolds the viewer. No proof point. |
| DemOApTAXOl | Jev Ultrafast browser agent | 144 / 51 | 42 s, 162 | Most [category] are painfully [pain]. This one did [task] in [N] | Best visual hook (timer race), but niche, unknown brand, 3 stats, caveat before CTA. |
| DeoXYcovvum | Anthropic leaves Git (Scion) → git-ai | 98 / 11 | 80 s, 184 | [Big name] just abandoned [standard tool] because AI did [absurd scale] | **Best motion of the set, weak result.** 80 s, payoff is a substitute revealed at 50 s, infra jargon, conditional CTA. |
| DerXsb8PtaB | Open Intelligent UI | 90 / 21 | 29 s, 180 | [Famous product] just started [feature], but you don't need [company] | Fastest visual tempo, weak result. The hook sells a competitor's feature; "version of X" framing. |
| DezGFkEgSuK | DeepSeek Harness (Day 2) | 73 / 5 (young) | 45 s, 184 | This repo turns every [part] into [Y], and it's from [brand] | Same visuals and series as Day 1, flopped. A feature-claim hook; its 252k stars never spoken. |
| DejpSfhgWxh | Claude Dashboards + Motion | 45 / 0 | 47 s, 221 | [Company] just dropped [A] and [B]… | Worst. No keyword, gated enterprise feature, split-screen face cam, 221 wpm, ends on a restriction. |

**The headline finding.** Production is identical across all 16 reels, yet results differ about 130×. The topic, the hook and the CTA mechanics drive reach and comments. Motion is the table stakes that make it watchable. The two clearest proofs:
- Karpathy (Day 1, 5,781 likes) vs DeepSeek Harness (Day 2, 73 likes): same series, same visuals, different hook.
- Scion: the best motion of the set and one of the weakest results.

## The house production kit (shared by every reel)

**1. Canvas.**
- One continuous animated canvas. The detector found only 0 to 7 "cuts", and almost all of them are theme flips.
- Near-black (#0a0a0b) with a faint square grid and a centre glow is world 1. Warm cream (#f3f1ec) with the same grid is world 2.
- The flip between worlds is the only real cut. It marks the twist, the name reveal, or each item in an enumeration.
- Flips land on a sentence-end breath (0.5 to 1.0 s). They are done with a 2-frame flash, a black sphere or iris growing from the centre, or a dot that expands.

**2. Captions are the headline.**
- They sit in the top 12 to 15% band, centred, 2 to 5 words visible, in a rolling phrase window.
- Each word blurs in on its exact onset. Upcoming words are never shown, or shown as a faint blurred ghost. The phrase blurs out at its boundary.
- Three tiers:
  1. Filler words in grey regular.
  2. Nouns in white bold.
  3. One italic-serif swap word, plus a Figma-style selection box with corner handles on one or two claim words.
- There are no bottom subtitles and no separate headline. When the box is overused (around 20 per reel) it stops meaning anything.
- Variant: Brag uses karaoke captions in the bottom third, with the active word in a solid brand-colour pill.

**3. One hero card per frame.**
- The hero card sits centred between 35% and 65% of the height. The bottom 20 to 30% stays empty for the IG UI.
- All UI is recreated as clean vectors in one design language: GitHub repo cards, terminals, chats, phones, dashboards, the IG profile, comments and DMs.
- Real footage appears only when footage is the subject (Tesla), and then it is annotated with computer-vision boxes rather than just played.
- No face cam. The one face-cam reel was the worst performer.

**4. Words cause visuals.**
- Every spoken noun triggers an event on its onset: a chip, a check, a toggle, a count-up, a highlight, typed text.
- The headline changes every 0.4 to 0.8 s and the object every 1.3 to 2.5 s.
- A faster tempo did not help: DerXsb8PtaB ran at about 1.7 s per idea and was among the weakest.

**5. Continuity over cuts.**
- Shared-element morphs: the logo becomes a card, the gauge becomes a star counter, a wireframe becomes UI, footage becomes a blueprint, a job card becomes a CV.
- Things "make room": the old card scales up and away or greys out into a "done" state before the next one arrives.

**6. Abstract ideas become literal UI states.**

| Idea | Device |
|---|---|
| Effort | Counters and timers |
| Speed | Timer race |
| "Not X" | Strike-through, red ✗, NO stamp |
| "Under the hood" | Scan-line X-ray wipe |
| Lock-in | Red dashed tether that turns green |
| Proof | Star counter plus sparkline, highlighter sweep on real README text |
| Caveats | Fine-print checklist or tape label |
| Progress | A persistent stepper or status panel docked under the hero |

**7. Motion feel.**
- Soft expo or quint ease-out over 8 to 12 frames. Entrances blur and rise; exits blur out quickly (150 to 200 ms).
- Only stamps, pills and checks overshoot. Characters squash and stretch.
- 3D is used sparingly: tilted card pairs, a depth-of-field card field, a shatter, an orb transition.

**8. The CTA journey** is the same in every reel, about 4 s long:
1. A recreated profile card.
2. The cursor clicks Follow, which turns to Following.
3. The comment sheet slides up and the keyword types itself, followed by "Sent! Check your DMs".
4. A DM banner drops in with a link card.

**9. Audio.**
- One clean voice, likely TTS or a clone (names are sometimes mispronounced), at 162 to 221 wpm. The winners sit at 168 to 186.
- Breath pauses fall only at beat boundaries, and the visual flips land on those breaths.
- A quiet music bed runs continuously, but only about 4 to 5 dB under the voice. That is closer than our ≥10 dB standard; do not copy their mix.
- Inferred sound design: pops on boxes and pills, typing ticks, counter ticks, whooshes on flips, stamp thuds, toggle clicks, and a DM ding. Effects land between words.

**10. Packaging.**
- The first line of the post caption is the CTA (Comment "KEYWORD" and I'll DM you…📩).
- Then the hook again, a 1-line what-it-is, arrow or emoji bullets, the proof number, a Follow line, and 5 to 15 hashtags, including tool-name tags.
- The caption is a prose backup of the script.

## Script skeleton of the winners

`Hook: outcome claim (payoff said by 0 to 3 s) → proof number by 4 to 7 s (spoken AND shown as a counter) → name (often late) → one relatable pain → mechanism in 3 verbs or 3 steps, with one example object carried throughout → "But the crazy part / here's the part that got me" twist at 45 to 68% runtime, with a theme flip → trust stack (free, open source, no account) → CTA that echoes the pain`

- **Jargon:** one new word per reel, defined immediately in plain words. Every number gets a comparison: "2 G, more than its own weight", "12× in 4 months".
- **Translations that worked:**

  | Technical term | Plain version used |
  |---|---|
  | Speculative decoding | "guesses a few words ahead" |
  | Deterministic | "same input, same output every time" |
  | DOM indexing | "numbers every button" |
  | Reviewer agent | "a second agent critiques it" |

- **Sentences:** about 17 words, split by commas into 3 to 6 word clauses. Each clause becomes one headline.

## Failure modes (from the bottom 6)

- A hook that sells someone else's product.
- "The open-source version of X" framing.
- An unknown brand.
- A feature claim instead of a paradox, pain or desire.
- A proof number shown but never spoken.
- 3 or more stats.
- Insider jargon in line 1.
- More than 55 s.
- More than 190 wpm.
- Caveats, hardware gates or "Team/Enterprise only" placed right before the CTA.
- A conditional CTA ("if that's you").
- A double ask (follow AND comment).
- No keyword at all, which produced 0 comments.
- A generic keyword (LINK) where an outcome keyword (HIRED) would work.
- A split-screen face cam that halves the graphics.

## Content strategy

- **Pillars:** about 70% open-source repo or tool drops, framed as news from a big brand ("X just open-sourced"). About 20% tool tutorials. About 10% reach plays (viral tech physics) with no keyword.
- **Cadence:** about 1 reel per day, plus a series ("Day N of repos you should know") with a Day card, a tile strip in the CTA, and a caption that sells the next day.
- **Comment engine:** a free asset behind a one-word keyword. Comments per like run 33 to 138% on keyword reels, against 1.4% on the no-keyword reel.
- **Proof currency:** GitHub stars, a time-to-N-stars stat, big-brand names, a creator's personal story.

## Technique catalogue

These are the new rows for the motion library (#36 to #55). They are listed there with build notes.

Ideas, with the reels they come from:
- Shared-element logo-to-card morph (DehEd, DepnbyJ).
- Noun-locked event map.
- Voice-synced UI typing.
- Counter plus sparkline proof.
- Theme flip by sphere or iris.
- Scan-line X-ray reveal (DeR8o, DethB, DeuRd).
- Persistent stepper or status panel (DeR8o, Dej2E, DethB).
- Accordion rule rows that tick (DewhN).
- Rubber stamps (TOO MUCH, FREE, SELF-REPORTED, NO ACCOUNT NEEDED, INTERNAL).
- Bad-to-good gauge with a glow re-tint (DethB).
- Slow-vs-fast timer race (DemOA).
- Highlighter sweep on real text (Deq8K, DeuRd).
- Tether lines that go from dashed red to green (DeuRd).
- 3D depth-of-field card field (Deq8K).
- Tilted 3D card pair (DerXs).
- Computer-vision boxes on footage, and footage that morphs into a blueprint (Dej2E).
- Icon-flip grid for "any X" (DeR8o).
- Call graph that draws node by node (DeR8o).
- "=" tile equation for analogies (DezGF).
- Tape label plus glitch for caveats (DezGF).
- Word-count or time-wasted pain counter (DejpO, DeOQ9).
- Connector-line pipeline with a camera pan (DeOQ9).
- Strike-and-fling the old way (DejpO).
- Crack-and-shatter hook (DeoXY).
- Calendar flip (DeoXY).
- Disabled-button "you can't have this" (DeoXY).
- Mascot anchor (DeefsF).
- CTA journey with the series tile strip (DewhN).
