# Roadmap

## Waiting on the user

- [x] **Channel name + handle:** Kanishk.Rewires, @kanishk.rewires (2026-10-17)
- [ ] **Niche and audience**
- [ ] **The content flow** the user said they would share
- [x] Brand look: brand board, K·R monogram, palette, fonts (2026-10-17, `brand/`)
- [ ] Content mix for the 10/day (suggested below)
- [ ] Instagram Business/Creator account connected in Publora; confirm the plan allows ~300 posts/month
- [ ] Free Pexels API key (stock footage, also unlocks OpenMontage real-footage mode)
- [ ] Voice: keep Andrew (free) or ElevenLabs
- [ ] Posting times + timezone (suggested: every ~90 min, 8 AM–11 PM IST)
- [ ] Approval mode: approve daily for 2 weeks, then auto-post
- [ ] Reconnect Gmail connector (needed for emailed previews); `gh auth login` for pushing this repo
- [ ] 3–5 reference reels the user loves; 3–5 @roheit.ai reels for a teardown

## Suggested daily mix (10 reels)

| Type | Per day | Example |
|---|---|---|
| AI stat stories | 3 | "Time to 100M users" |
| Marketing tips | 3 | "3 hooks that doubled our reach" |
| AI tool breakdowns | 2 | "This free tool replaces Canva" |
| Brand / case-study stories | 1 | "How Duolingo's owl went viral" |
| AI news of the day | 1 | The day's biggest AI headline |

## Build next

1. **8–10 templates** so 10/day doesn't look repetitive: tip list, tool demo, news card, myth vs fact, before/after, quote, case study, top-3.
2. **Daily agent:** trending topic research → 10 scripts → fact-check → JSON specs → render → automatic frame QA → caption + hashtags → schedule via Publora → one preview page for approval.
3. **Scheduling:** launchd job on the Mac (or a cloud machine later).
4. **Weekly report:** views per format, shift the mix toward winners.
5. **Optional:** OpenMontage install for hero videos; real logos / Pexels footage in templates.

## Build next (Rewires pipeline)

1. Review the Klarna sample with the user; tune pacing, voice and music to taste.
2. ElevenLabs (or other paid) voice adapter, and forced alignment for recorded voice.
3. Pexels footage and image-treatment scene; interface and cursor demo scene; map and network scene.
4. On-screen spelling check and automatic overlap detection in QC.
5. Wordmark artwork file to replace the typeset wordmark.
6. Daily agent: topic research → several projects → batch render → Publora scheduling.

## Done

- [x] Kanishk.Rewires production pipeline: staged and resumable, 8 scene tools, signature outro, captions and SRT, original score and sonic logo, 14 QC checks, pytest suite (2026-10-17)
- [x] Sample video: `projects/klarna-ai-humans/` (52.6 s, passed QC) (2026-10-17)

- [x] Remotion project + official agent skills (2026-10-14)
- [x] StatRace v1 (dark) and v2 (cream, voice, music)
- [x] Story engine v3: 15 scenes, 76 s, captions, SFX, light leaks, beat-synced slams
- [x] v3 fixes: race chart margins, reveal redesign
- [x] Research: Roboverse video breakdown, @roheit.ai check, 84 verified reference accounts
- [x] OpenMontage assessment
