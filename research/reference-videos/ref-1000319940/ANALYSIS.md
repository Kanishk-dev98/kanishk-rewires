# Reference analysis: "How to edit your videos with Claude Code" (1000319940.mp4)

A 73 s vertical reel at 720×1280 and 30 fps, made with a human voiceover. The user shared it on 2026-10-17 as the quality bar. Files in this folder: `source.mp4`, `transcript.json` (word timings, faster-whisper small.en), `frames/`, `sheet_a.jpg`, `sheet_b.jpg`, `row1.jpg`, `row2.jpg`.

## Why it works

1. **The picture changes on almost every phrase, roughly every 1 to 2 s, and each change is the literal meaning of the words.** "Blocked" puts a red ✕ on the Instagram icon. "Use the Apify API" makes the Apify logo drop in and wire to the three icons. "Don't know what that is?" pops a "What's Apify?" sticker. "Full setup at the end" pops a sticker. "Use mine" brings in an avatar sticker. "Connecting Higgsfield" flips a toggle on. "Generates visuals" fills tiles one by one. "15 to 30 minutes" runs a circular timer from 2 to 27. "Save this" shows a bookmark. "Comment EDIT" shows a comment being posted.
2. **One persistent anchor.** A macOS-style terminal window ("claude · ~/videos") sits in the same spot through most steps, and things get typed into it. Everything else enters and leaves around it, so the video feels like one continuous screen, not a series of cuts.
3. **Three fixed zones, big elements.** At the top: a 7-segment progress bar, "STEP N", and a serif title with one italic accent word ("Add your *references*"). In the middle: one hero object, at about 85 % of the width. Right below it: the caption. The bottom third stays empty for the platform UI. Nothing is small; the smallest readable text is about 20 px at 720 wide (about 30 px at 1080).
4. **Real, recognisable things.** Real app logos (Instagram, TikTok, YouTube, Apify, Higgsfield, the Claude asterisk), real thumbnails, real file names (`SKILL.md`, `IMG_2231.HEIC`), and real terminal output (`Fetch(...)`, `Error 403 · blocked for AI tools`).
5. **Restraint.** One idea on screen at a time, soft shadows, rounded cards, light cream gradient, one accent colour (coral). No cursor, no 3D tilt, no camera zooms. Motion is pop-ins with a small overshoot, slide-ups, typing, check badges, slightly rotated stickers, counters, a toggle and a code-line highlight.
6. **Captions as a design element.** Two to four words, bold sans, centred under the hero object. One keyword per caption takes the accent colour ("Add your **references**", "is **blocked**", "you can use **mine**").
7. **The voice drives the edit.** A natural human voice at about 2.6 words per second including pauses, short sentences, the step numbers spoken aloud ("Two."), and cuts landing on pauses.
8. **Hook and CTA.** The hook is a title card over a timeline motif, then "So *easy*." with a big numeral counting to 7. The CTA is "Comment **EDIT**" in a big pill, a mock comment that posts, and a list of what you get ("My video editing skill", "Apify connector", "Higgsfield connector"), then "I'll send them to your DMs."

## Beat map (VO → visual)

| Time | Voiceover | Visual | Motion |
|---|---|---|---|
| 0.0–2.1 | How to edit your videos with Claude Code | Kicker "A TUTORIAL FOR BEGINNERS", serif title, "Claude Code✳" in coral italic, editing timeline with playhead | title fade-up, playhead scrubs |
| 2.1–4.8 | It's so easy! Only 7 steps! | "So *easy*." with an underline swash; "only 7 steps", numeral counts 3→7 | swash draws, numeral rolls |
| 5.4–6.9 | One. Open Claude Code | Progress bar step 1; terminal window opens, `claude` typed, welcome box | window scales in, typing |
| 7.4–14.2 | Two. Add your references… copy the links… let Claude Code study | Three tilted video cards with platform icons and "Copy link" buttons that become "Link copied"; the prompt types into the terminal | cards fan in, button state flips, typing |
| 14.6–18.7 | You only do this the first time… remembers your style | A STYLE.md memory card builds a bullet list; a strip of thumbnails scrolls | list items pop, strip slides |
| 19.2–24.1 | If your AI is blocked… use the Apify API | Logos only: a red ✕ on Instagram; the Apify logo drops in, wires to all three, checks appear; terminal shows a 403, then `apify(instagram-scraper)` Downloaded | logo drop, connector draw, badge pops |
| 24.7–27.8 | Don't know what that is? … full setup at the end | Stickers "What's Apify?" and "Full setup at the end ↓" | sticker pop with rotation |
| 27.8–32.7 | Three. If you have a video editing skill, add it… use mine | SKILL.md code card (frontmatter plus 5 numbered rules), lines appear, "installed" badge; "Use mine" avatar sticker | lines type, row highlight |
| 33.2–37.4 | Four. Prepare your footage. Shoot your videos plus any images | 2×3 grid of footage thumbnails with durations and REC badges | grid pops in sequence |
| 37.6–47.1 | Want AI to make them? … Higgsfield … generates visuals… | Higgsfield connector card, toggle flips on ("Connected to Claude"); 2×2 tiles go from "Generating…" to graphic, image, video | toggle, shimmer → content |
| 47.5–51.6 | Five. Upload everything to Claude Code. Or Codex… | Assets fly into the terminal, attachment chips appear (4 clips, 2 photos, 4 AI visuals, STYLE.md); "Claude Code / Codex" tabs | fly-in, chips pop |
| 51.9–55.8 | Six. Send the prompt | Prompt types in the terminal; "return ↵" key pops | typing, key press |
| 55.8–60.1 | Seven. Wait. Normally 15 to 30 minutes… | Circular timer counts minutes; the terminal streams tool calls; model chips (Opus, Sonnet, Codex) | ring fills, counter |
| 60.5–61.9 | Want changes? Just ask | A phone mock plays the edit; the terminal shows "make the intro faster" | phone slides in |
| 62.8–64.7 | Save this video… | "Save." with a coral bookmark icon | icon drops |
| 65.1–72.4 | Comment EDIT and I'll send you… | "Comment" plus a big coral "EDIT" pill; a comment box posts "EDIT"; a checklist of deliverables builds; "I'll send them to your DMs" | pill pop, list builds |

## What our LinkedIn reel got wrong, by comparison

- **Voice too fast.** TTS at +24 % to force 40 s; the reference breathes.
- **Interface too small and too dense.** Text at 15 to 23 px and whole dashboards on screen; the reference shows one big object at a time.
- **Changes too infrequent.** About one panel per 7 s scene; the reference changes something every 1 to 2 s, keyed to words.
- **Busy camera.** 3D tilt, zooms and a cursor add motion without meaning; the reference uses none of them.
- **No real logos.** Placeholder avatars instead of recognisable brand marks.
- **Captions without accents.** No keyword per caption in the accent colour.
- **Brand chrome competes.** A rail and brand mark at the top; the reference's only chrome is the step progress bar.

## How to rebuild it in our theme (plan)

- **Theme mapping.** Cream background → charcoal #0A0A0A with a soft graphite gradient. White cards → cream #F6F4ED cards (or graphite cards with cream text). Coral accent → lime #A7FF3F. Serif title → Instrument Serif with the accent word in italic lime (this matches the serif "REWIRES" on our brand board). Captions → Inter bold with one lime keyword.
- **New engine pieces.** A word-cued beat timeline: each element enters on a spoken word, not on scene fractions. Also: a persistent terminal, a step header with a progress bar, logo tiles with real brand marks (Simple Icons, CC0 SVGs), stickers, cards, a code card, a toggle card, a timer ring, a media grid, attachment chips, a comment CTA and keyword captions.
- **Voice at natural speed.** Length follows the voice.
- **Ending.** Comment "WORKFLOW" CTA, then a small lowercase **kanishk.rewires** lockup.
- **What we copy and what we don't.** We copy the structure, pacing and motion grammar. We use our own script, voice, music, brand and assets, and we don't reuse the creator's thumbnails, face, handle or copy.

## Applied (2026-10-17)

- `projects/claude-code-video-edit/`: the first rebuild in our theme (to be posted 2026-10-18).
- `projects/linkedin-automation-claude/`: the second rebuild. It adds realistic product interfaces (`studio/src/rewires/real.tsx`), official logos, Unsplash headshots and the real `claude mcp add` syntax.
