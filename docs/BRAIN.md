# The brain: everything known about this project

The full context from the founding sessions (2026-10-14 and 2026-10-15), so work can resume without the chat history. Read this first, then `ROADMAP.md` and `DECISIONS.md`.

## The goal

The user is **Alok Diwan** (works at Antier, which builds Abstraxn). Run an agent that publishes **at least 10 marketing and AI videos a day**, starting on Instagram Reels and later YouTube and other platforms (the GitHub repo description says "production grade videos for instagram youtube and all"). The channel is the user's **personal** account, a new marketing channel they are about to start. The user wants production quality ("Marvel-grade"), not basic slideshows.

## What the user has told us they want

| Topic | User's words / preference |
|---|---|
| Volume | "at least 10 videos in a day" |
| Format | Instagram Reels, 30–45 s first; later ≥1 minute cinematic |
| Cost | First asked what's paid vs free, then: "without spending a single penny, only with this Claude Code" |
| Look | Cream or white backgrounds ("looks great"); more colours; "good frames"; cinematic, Marvel-grade |
| Audio | Voiceover + "thin light music"; keep the same voice and music in later versions |
| Depth | Explain more; at least 1 minute |
| Quality bar | "we need to do better than this, this is quite basic" (about v2) → v3 approved: "so good video" |
| Storage | One separate git space with everything: repos shared, videos, data, scripts, "the brain" |

## Timeline

1. **Feasibility** (10/day). Yes: Publora connected for posting, Claude for scripts, needs a video generator. Laid out free vs paid options.
2. **Zero-spend stack chosen:** Remotion + Edge TTS + Pexels (free key) + code-generated music + FFmpeg; posting via Publora.
3. **Competitor @roheit.ai** checked: 3-day-old, 38-follower account, captionless doodle slideshows. See `research/instagram/roheit-ai.md`.
4. **YouTube reference** (Roboverse, Claude Code + Remotion) analysed from transcript + frames. See `research/reference-videos/roboverse-claude-remotion/`.
5. **User shared** https://github.com/remotion-dev/remotion → licence checked (free for individuals) → user confirmed **personal account** → project scaffolded.
6. **v1** StatRace, dark, silent, 32 s (`samples/statrace-v1-dark.mp4`).
7. **v2** cream background + Andrew voice + synthesized music, 34 s (`samples/statrace-v2-cream-voice.mp4`). User asked where the script/voice/colours came from: all placeholders chosen by Claude, nothing from the user yet.
8. **v3** cinematic Story engine, 15 scenes, 76 s (`samples/race-to-100m-cinematic_master.mp4`).
9. **v3 fixes** from user feedback: race chart labels ran off the left edge (Facebook, Instagram); the ChatGPT "millions" reveal needed refinement → milestone card, counter, slam.
10. **Email attempt:** Gmail tool can only create drafts and needed re-authentication; shared via private claude.ai page instead.
11. **Research:** 84 verified Instagram reference accounts + the market gap (`research/instagram/`).
12. **User shared** https://github.com/calesthio/OpenMontage → assessed (`references/README.md`).
13. **User asked** for one separate git space with everything → this repo, https://github.com/kanishk-986/video-agent (private).
14. **Abstraxn introduction film** (2026-10-15): 5:39 landscape institutional film for Alok Diwan's personal portfolio (interview selection), approved by Ankit. Brand pulled from abstraxn.com/brand-kit; Microsoft Andrew voice; original score; dashboard recreated as motion graphics; credit "Produced by Alok Diwan". See `films/abstraxn-intro/`.

## Key insight: the gap

No account checked runs a **faceless, high-volume channel of animated data stories about AI + marketing**. Big faceless AI pages and data publishers mostly post carousels; reel-first accounts are creator-led. That is the positioning to aim for.

## Links

| What | Where |
|---|---|
| Repo | https://github.com/kanishk-986/video-agent (private) |
| Reel preview page (v3 fixed) | https://claude.ai/artifact/SJTkR1zZXyK2d1UGcmPyv2 (private to the user) |
| Reference accounts page | https://claude.ai/artifact/KrXogtoFXFPymkn3Yx9ZQC (private to the user) |
| Roboverse video | https://youtu.be/6_rCyryA6hg |
| Competitor | https://www.instagram.com/roheit.ai/ |
| Remotion | https://github.com/remotion-dev/remotion (pinned in `references/remotion` at v4.0.535, not checked out) |
| OpenMontage | https://github.com/calesthio/OpenMontage (submodule `references/OpenMontage`) |

## Accounts and connectors (status 2026-10-15)

| Service | Status |
|---|---|
| Publora (posting) | Connected in Claude; Instagram not yet linked inside Publora; quota for ~300 posts/month not yet checked |
| Gmail | Needs re-authentication in claude.ai connector settings; can only create drafts, not send; 25 MB attachment limit |
| GitHub | Pushes from this Mac work through saved credentials; `gh` CLI is not logged in |
| Pexels | No key yet (free) |
| ElevenLabs / Kling / Runway | Not used (paid, optional) |

## How the user likes to work

- Short, direct messages; wants Claude to act and show results, not long option lists.
- Gives visual feedback scene by scene ("only where you show ChatGPT millions needs refinement").
- Wants files they can watch: put renders in `~/Downloads` and open them.
- Wants everything persisted and organised in git.

## Open questions (blocking the daily agent)

1. Channel name + handle (ideas in `research/instagram/findings.md`)
2. Niche and audience
3. The content "flow" the user said they would share
4. Brand kit, posting times, approval mode, voice upgrade; full list in `ROADMAP.md`

## Resume checklist for a new session

1. `cd ~/reels-agent && git pull`
2. Read `CLAUDE.md`, this file, `docs/ROADMAP.md`
3. Setup steps in `README.md` (npm install, venv, regenerate music)
4. Ask the user for whichever open question above is still unanswered
