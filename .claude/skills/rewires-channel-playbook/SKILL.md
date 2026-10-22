---
name: rewires-channel-playbook
description: Operating playbook for Kanishk.Rewires reels, distilled from deep studies of the benchmark channels (@princegupta.ai 16 reels done; @madetoscale2026 and @jackroberts___ pending links). Covers content strategy, topic selection, hook templates, script skeleton, simplification, caption system, motion grammar, theme flips, CTA journey, audio, post captions and failure modes. Load before writing any script, storyboard or caption.
---

# Kanishk.Rewires channel playbook

Evidence: `research/reference-videos/prince/ANALYSIS.md` (16 reels, per-reel metrics, hooks, beats, motion and why each won or lost). The techniques live in `rewires-motion-library` rows 36 to 55.

**The law, from the data:** these reels share an identical production kit, yet results vary about 130×.
- **Topic, hook and CTA mechanics decide reach and comments.** Motion is table stakes: it makes the reel watchable, it does not make it spread.
- Never trade a stronger hook for fancier animation.
- The best-animated reel of the set (Scion, 98 likes) lost to plainer reels with better hooks.

## 1. Content strategy

**Pillar mix** (benchmark pattern, adapt per week):
- About 70% **"[Big brand] just released / open-sourced X that lets you…"**: drops of free tools and repos. These reels carry a comment-keyword CTA that delivers a free asset.
- About 20% **tool tutorials and workflows** ("this [tool] does [painful task] for you").
- About 10% **reach plays**: mass-appeal "how does that work?" explainers (viral tech or business). No keyword; a Follow CTA only.
- Note: the user's own content-mix rule ("65 20 15", AI/marketing/business split) is not recorded. **Ask the user before applying a mix; never guess it.**

**Pick topics that pass all four tests:**
1. A brand or name viewers already know, or a character.
2. A dream outcome or pain that a non-developer feels.
3. Something free or usable today.
4. One proof number (stars, time, users, money).

Reject:
- Gated or enterprise-only news.
- "The open-source version of X".
- Infra topics without a "why you care" translation.

**Series:** a recurring "Day N" format (Day card, tile strip in the CTA, caption sells tomorrow) lifts retention. It never rescues a weak hook, so every episode still needs a hook that passes the tests above.

**Comment engine:**
- Every tool or repo reel ends with "Comment KEYWORD and I'll DM you [asset]".
- The keyword should be the **outcome word** (HIRED, SALES, GROW) or the product noun, never a generic word like LINK.
- Results: an outcome keyword drew more comments than likes. A reel with no keyword got 0 comments.

**Proof currency:**
- GitHub stars and time-to-N-stars.
- The big-brand name.
- A creator's real story with hard numbers (69 applications → 1 contract).

## 2. Hook (first 0 to 3 s)

The payoff is spoken at 0.0 s. The subject is named in the first sentence. The visual performs the claim while it is said. Proof follows by 4 to 7 s, **spoken and shown** as a counter.

**Winning templates** (fill them with our own words; never copy their lines):
1. `[Big brand] just open-sourced/released [thing] that lets your [thing you own] [dream outcome] — without [usual pain].`
2. `This [familiar thing] has ZERO [what you'd expect it needs] — and [huge proof number].` (a paradox)
3. `This [tool] does [painful task] for you — and [creator/proof story].`
4. `You've probably seen [viral thing] do [impossible act]… but how?` (reach play)
5. `What if you could just [easy action] and let AI [hard part]?`
6. `That little [character] in my [place] is [doing a human thing to] [tool you use].`

**Banned hooks:**
- Opening on someone else's product ("ChatGPT just started…").
- Two product names before any benefit.
- A feature claim with no tension.
- A hook that insults the viewer.
- Insider nouns in line 1.

## 3. Script skeleton (30 to 55 s, sweet spot about 40 s)

```
Hook (outcome claim, 0–5 s)
→ Proof number (spoken + counter, 4–7 s)
→ Name (can be late; benefit first)
→ One relatable pain, measured (hours, words, clicks, ₹)
→ Mechanism in 3 verbs / 3 steps, ONE example object carried throughout
→ Twist at 45–68% runtime ("But the crazy part…" / "here's the part that got me") + theme flip
→ Trust stack (free, open source, no account) — caveats go mid-body or into the post caption, never right before the CTA
→ CTA that echoes the pain, single ask
```

**Simplification rules:**
- One new word per reel, defined in plain words in the same breath.
- Every number gets a comparison ("2 G, more than its own weight", "12× in 4 months").
- At most one number per beat, and at most 3 numbers per reel.
- Use "you" framing throughout.
- Turn abstract ideas into physical actions: tapping a phone, typing, dragging.
- Sentences of about 15 to 17 words, split by commas into 3 to 6 word clauses. Each clause becomes one headline.
- Plant an open loop (a story teaser) by about 6 s and pay it off at about 60%.

**Voice:**
- 165 to 180 wpm, with a hard cap of 185. 200+ wpm reads as rushed and hurt reach.
- Breaths of 0.5 to 1.0 s go only at beat boundaries, and the theme flip lands on the breath.
- Check TTS pronunciation of names.

## 4. On-screen system (our skin on their grammar)

**Worlds:**
- **Cream (#F6F4ED) with a faint grid is our world 1.**
- Charcoal (#0A0A0A) with a grid is world 2. Flip to it for the problem or the twist, then flip back.
- Flips are a sphere or iris growing from the centre, or a 2-frame flash, timed on a breath.
- 1 to 4 flips per reel. These are the only "cuts".

**Captions = headline** (top band, about 12 to 15% from the top):
- 2 to 5 words visible in a rolling phrase window. Each word blurs in on its onset, and the phrase blurs out.
- Three tiers:
  1. Grey regular for filler words.
  2. Charcoal bold for nouns.
  3. One Instrument Serif italic swap word, plus a **lime selection box with corner handles**.
- Limits: at most 1 box per phrase, about 1 every 3 to 4 s, about 8 to 10 per reel.
- No bottom subtitles alongside a top headline. Never duplicate text.
- Variant for playful tool reels: karaoke captions in the bottom third, with the active word in a lime pill.

**Layout:**
- One hero card centred between 35% and 65% of the height.
- Keep the bottom 25% clear for the IG UI.
- Recreate all UI cleanly in one design language, with official full-colour logos.
- No face cam (split-screen face cam flopped), until the Jack Roberts half-presenter format is deliberately started.

**Motion grammar** (techniques in motion-library rows 26 to 55):
- **Words cause visuals.** Build a noun → event cue map for every script. Every named item gets its chip, check, toggle, count-up or typed text on its exact word.
- **Continuity over cuts.** Use shared-element morphs (logo → card, gauge → counter, sketch → UI, footage → diagram). Old elements "make room" or grey into a done state.
- **Tempo.** A new visual idea every 1.5 to 2.5 s, with small reactive changes every 0.5 to 1 s. Faster than about 1.5 s per idea did not help.
- **Abstract becomes literal UI state:**
  - Counters and timers for effort or speed.
  - Strike or stamp for "not X".
  - Scan-line X-ray for "under the hood".
  - Tethers for lock-in.
  - A persistent stepper or status panel for processes.
  - A highlighter on real text for proof.
- **Easing.** Soft expo ease-out over 8 to 12 frames, blur and rise entrances, quick blur exits. Only stamps, pills and checks overshoot. Use 3D sparingly.

**CTA journey (about 4 s, every keyword reel):**
1. Profile card.
2. Cursor clicks Follow, which turns to Following.
3. The comment sheet types the keyword, then "Sent! Check your DMs".
4. A DM banner with a link card drops in.

Add a series tile strip if it's a series. **Single ask.**

## 5. Audio

- The voice is the authority, per our standard: music sits at least 10 to 20 dB under the voice and ducks under speech. The benchmark runs only about 4 to 5 dB under; do not copy that.
- Vary the music character per reel. No boom or impact hits.
- Sound design: soft pops on boxes and pills, typing ticks, counter ticks, an airy whoosh on flips, a stamp thud at most once, toggle clicks, and a DM ding. Always place effects between words, never on them.

## 6. Post caption formula

```
💬 Comment "KEYWORD" and I'll DM you [asset] 📩
[Hook restated + 1 emoji]
[1-line what it is]
→ / emoji bullets (3–5): what it does, proof number
[Trust line: free · open source · no sign-up]  [caveat here, not in the video's last beat]
Follow @kanishk.rewires for [promise] 🔔
[5–10 hashtags incl. tool-name tags]
```
Tag brands only by verified handles.

## 7. Pre-flight checklist (run on every script before approval)

- [ ] The topic passes the 4 tests (known name, felt outcome, usable today, one proof number).
- [ ] The subject and payoff are in the first sentence, with a visual that performs it.
- [ ] The proof number is spoken and shown by 7 s.
- [ ] One new word, defined. At most 3 numbers. Each number has a comparison.
- [ ] One example object carried throughout.
- [ ] A twist at 45 to 68%, with a theme flip.
- [ ] No caveat in the last 8 s. No conditional CTA. Single ask. Keyword = outcome or product noun.
- [ ] 30 to 55 s, 165 to 180 wpm.
- [ ] Noun → event cue map written. Captions boxed at most 1 per phrase.
- [ ] Music at least 10 dB under the voice. Varied bed. No booms.

## 8. Channels still to study

- **@madetoscale2026:** waiting for reel links (Instagram blocks profile listing; single links download fine).
- **@jackroberts___:** waiting for links. His half-presenter, half-animation split format is a **parked format**; the user wants it later.

Process for both: `tools/breakdown_reels.py <channel> <videos>`, then parallel analysts with the same 8-section rubric. Merge the new findings into this playbook as additions per channel.
