---
name: rewires-channel-playbook
description: Operating playbook for Kanishk.Rewires reels, distilled from deep studies of the benchmark channels (@princegupta.ai 16 reels, @madetoscale2026 11 reels, @jackroberts___ 10 reels). Covers content strategy, topic selection, hook templates, script skeleton, simplification, caption system, motion grammar, theme flips, CTA journey, audio, post captions and failure modes. Load before writing any script, storyboard or caption.
---

# Kanishk.Rewires channel playbook

Evidence: `research/reference-videos/{prince,madetoscale,jackroberts}/ANALYSIS.md` (16 + 11 + 10 reels), with per-reel metrics, hooks, beats and motion, and why each won or lost. The techniques live in `rewires-motion-library` rows 36 to 80.


## 0. Non-negotiable: no repeated look

- Every reel picks its own transition grammar and 4–6 hero techniques from the motion library (rows 26–80). They must differ from the previous 2–3 reels. Write the pick into the storyboard brief before any code.
- The `world.tsx` camera (lime thread + whip-zoom + specks) was the Duet reel's signature. Do not reuse it as a default.
- **Maturity bar:**
  - one large hero object per act that transforms
  - faithful, information-dense UI (real code, real documents, real-looking pages)
  - editorial type
  - varied, purposeful entrances
  - no drifting particles, clip-art icons or sticker labels
- When the visual direction changes, show styleframes before the full render.

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


## 9. What Made to Scale adds (merge with sections 1 to 7)

Made to Scale's light look (cream mesh gradient, white soft-shadow cards, black grotesk with one italic-serif accent word) is the closest benchmark to our brand. Their reels are long (45 to 66 s winners) and full of chapters, and they still get 400 to 770 comments, because each one promises a strong DM payload.

**Strategy additions**
- **Money and time pillars beat news.** Their top reels are client acquisition ("your first client", "clients while you sleep", "price your quote") and free tools that replace paid ones. Their news reel got 25 comments.
- For our marketing/business pillar, frame each reel around a **money or time outcome for the viewer** (leads, clients, revenue, hours saved).
- **Make the DM payload bigger than the reel.** Examples: "full setup + copy-paste prompts + templates as a PDF", "the top 15 (the reel shows 10) + install commands". List the payload in the post caption as ✅ ticks.
- **Add a second action after the keyword** (pick one, never a double gate):
  - "Send this to the friend who [relatable habit]" (drives shares)
  - "Part 2: [named topic], follow"
  - "Day N tomorrow"
- Keep any follow plea to 3 s or less.

**Format additions**
- **Chapter chrome:** a tiny mono pill top-right reading `STEP 2 · FIND · 03 / 6`, plus a hairline progress bar that fills across the reel. It tells the viewer the reel is finite, so they stay. Use it on every multi-step reel over 35 s.
- **Persistent progress devices**, chosen by format:
  - Step tabs for a playbook.
  - A tool-chain rail whose logos light up for a workflow.
  - A rank ruler for a countdown.
- **List reels:** show a table-of-contents grid first, then `NN / N` cards. Cap at 5 to 7 items, about 4 s each. Hide #1 and reveal it last.
- **Use one named, local, concrete example** throughout: a person, a business, a rupee amount, a time ("Booked Friday 4:30 PM, at 12:04 AM while you slept").
- **Pick the hook number by format:**
  - "0 → N" counter for pain to promise.
  - Strike-and-replace (~~wrong~~ → right ✓) for decisions.
  - Countdown ring for stakes.
  - Lock-screen time-lapse (2:00 → 7:30, with notifications) for "while you sleep".
  - A real post with "0 replies" for an opportunity.
- **Insight as an equation card:** "Hiring = Budget + Urgency", "Boring page = lost sales".
- **Honest twist:** put the caveat as the climax ("not prediction, *rehearsal*", "one catch", "help first, not pitch"), not as the last line before the CTA.
- **Result shown as a conversation:** the client's or customer's reply in a chat UI ("Is this our website? How much to go live?").
- **Caption options** (we stay English):
  - (a) Prince-style top headline captions, for news and repo reels.
  - (b) Made to Scale style for chapter and tutorial reels: a top section headline with a serif accent word, plus low-centre word-by-word captions. The next word is ghosted; one keyword per line gets a filled pill (lime for the payoff, charcoal for tool or concept names).

  Never both at full size at once.
- **Recreated UI and photoreal object cut-outs** on cream, with official logos and image credits in the post caption. Label demo people, posts and numbers as an example.

**Limits learned**
- At most 4 tools per reel.
- 150 to 170 wpm in English.
- Give the bed about 10 dB of margin. Their best mix had it; most of their reels don't.
- No piracy-adjacent tools.
- Don't switch to an off-brand template for one series.

## 10. What Jack Roberts adds, plus the parked presenter format

**Applies now (no presenter):**
- **Hooks that won him the most reach:**
  - extreme free scale: "This is what it looks like when 280 AI employees run your business" (10,679 comments)
  - two famous names in a novel combination: "…run Fable 5.1 and GPT 6 Astra together"
  - a prohibition: "Do not let Claude build your website unless…"
  - curiosity: "What happens when you give an AI its own phone, email and wallet?"
  - "Someone just open-sourced…"
- **Hooks that lost:** niche tools, unbelievable claims, lists read aloud, and googleable tools (no reason to comment).
- **Script spine to reuse:** provocative line → "It's called NAME" by about 9 s → "just drop it in" ease → mechanism in ONE everyday metaphor (employees and hats; two experts checking each other's homework) → one twist line → "So instead of [old way], just [new way]" → CTA. No recap.
- **Comment magnet:** the asset should be hard to find alone. That means a setup, a skill or a curated list, not a googleable product name. "Setup" payloads beat "link" payloads.
- **Mascot with role props:** one character stands in for "your AI" and changes props per job. Ours would be a lime-accented K·R character, never another brand's mascot.
- **Literal metaphor per number:**
  - coins shrinking for cost
  - a list collapsing for tokens
  - a 404 for "can't"
  - a PAID-stamp calendar for subscriptions
  - a notification flipping red → green for "cancelled"
  - code typed while its preview builds in sync
  - a live text edit to show "editable"
- **CTA keyword card:** the keyword appears big in italic serif with curly quotes. In our brand: charcoal "Comment" plus a lime-boxed italic-serif *"KEYWORD"*.
- **Post caption = a second script:** pain-first, one sentence per line. Add a "Like [analogy that isn't in the video]" line and a two-line contrast close.

**The parked presenter format (do not use until the user says so):**
- **Three states, joined by hard cuts:**
  - SPLIT: graphic on top (45–50%), face on the bottom (50–55%), no divider, eyes at about 63%, mic boom from the lower right, caption pill on the seam.
  - FULL-GRAPHIC.
  - FULL-FACE: a 1.3–1.5× punch-in.
- **Facts go to graphics; opinions go to the face.** Full-face only for:
  - the claim or payoff
  - "It's called…"
  - list pivots
  - opinion or contrast lines
  - the CTA (always the last 2.5–3.5 s)
- Face share is 15–40%. A face beat returns every 5–10 s and lasts 0.5–3 s.
- Graphic objects persist through layout changes, so the face slides under one continuous graphic story.
- **Our version:**
  - Keep our cream/lime graphic panel and continuous-take canvas; don't adopt his brand-colour palette jumps.
  - Set: a clean, softly lit set with a warm key and one lime accent practical. Bright graphics against a darker set keep his "channel change" contrast.
  - Locked camera and a good mic, with music at least 10 dB under the voice. His bed sits 3–9 dB under; don't copy that.
- **Build note:** a `Presenter` layer in Rewires.tsx with `layout: split|full|face` keyed per cue, footage object-fit cover, and punch-in via scale. The graphic world renders once and re-lays out between the top panel and the full frame.

## 11. Three-channel synthesis (what we do from now on)

1. **Topic and hook decide reach; the CTA mechanics decide comments; motion is table stakes.** All three channels prove it.
2. **Hook:** a payoff or provocation at 0.0 s, with a number or famous name proved on screen within 1 to 7 s. Pick from the 17 templates in sections 2, 9 and 10.
3. **Script:** 30 to 55 s (60 s for chapter tutorials), 150 to 180 wpm, one new word, one example object, one metaphor, a twist at about 50 to 65%, "So instead of X, just Y", and a single-ask CTA. Caveats go mid-body or in the caption.
4. **Visual grammar:** one continuous canvas (our `dDuet`-style world camera), with objects caused by words and morphs instead of cuts.
   - Chapter chrome for any multi-step reel over 35 s.
   - Cream world 1, charcoal flip for the twist.
5. **Captions:** pick one system per reel: top headline (news/repo), section headline + low-centre pills (tutorial/chapters), or seam pills (presenter, later). Lime box, at most one emphasis per phrase. The CTA keyword gets a big italic serif.
6. **CTA payload:** hard to find alone (setup, prompts, a curated list, a PDF), bigger than the reel, with the keyword as the outcome word. Add one secondary action (share to a named friend, or Part 2).
7. **Audio:** our standard holds. Voice first, music at least 10 dB under, a varied bed, no booms, effects between words. None of the three benchmarks meets it, so this is an edge for us.

## 8. Channels studied

- **@madetoscale2026:** done (11 reels). See section 9.
- **@jackroberts___:** done (10 reels). See section 10; his presenter format is parked until the user says so.

Process for both: `tools/breakdown_reels.py <channel> <videos>`, then parallel analysts with the same 8-section rubric. Merge the new findings into this playbook as additions per channel.
