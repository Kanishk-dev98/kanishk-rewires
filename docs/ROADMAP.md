# Roadmap

## Waiting on the user

- [ ] **Channel name + Instagram handle** (ideas in `research/instagram/findings.md`)
- [ ] **Niche and audience**
- [ ] **The content flow** the user said they would share
- [ ] Brand look: logo, 2–3 colours, font (or approve a generated brand kit)
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

## Done

- [x] Remotion project + official agent skills (2026-10-14)
- [x] StatRace v1 (dark) and v2 (cream, voice, music)
- [x] Story engine v3: 15 scenes, 76 s, captions, SFX, light leaks, beat-synced slams
- [x] v3 fixes: race chart margins, reveal redesign
- [x] Research: Roboverse video breakdown, @roheit.ai check, 84 verified reference accounts
- [x] OpenMontage assessment
