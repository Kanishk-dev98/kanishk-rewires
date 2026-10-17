# The brain: everything known about Kanishk.Rewires

The full context from the founding sessions (2026-10-14 and 2026-10-15), so work can resume without the chat history. Read this first, then `ROADMAP.md` and `DECISIONS.md`.

## The goal

**Channel / page name: Kanishk.Rewires** (decided 2026-10-17). This repo is its studio: Abstraxn films, Apolio films, AI and marketing reels, and other brand videos.


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
13. **User asked** for one separate git space with everything → this repo, https://github.com/kanishk-986/video-agent (private). On 2026-10-17 it moved to its own repo, https://github.com/kanishk-986/kanishk-rewires (private), with full history. `video-agent` stays in use for other videos and must not be deleted.
14. **Abstraxn introduction film** (2026-10-15): 5:39 landscape institutional film for Alok Diwan's personal portfolio (interview selection), approved by Ankit. Brand pulled from abstraxn.com/brand-kit; Microsoft Andrew voice; original score; dashboard recreated as motion graphics; credit "Produced by Alok Diwan". See `films/abstraxn-intro/`.
15. **Abstraxn film v2** (2026-10-15): user feedback "too slow, slow piano music, mid-level visuals, overlaps". Rebuilt with a 120 BPM trailer score, cinematic FX, fixed zones, plain-English labels; 4:36.
16. **58 s brand film from the user's own motion brief** (2026-10-16, `films/abstraxn-58/`): 12 styleframes + animatic, 118 BPM beat grid, music full stop on the HELD stamp. Rev 2: dot grid became the **logo triangle**; busy moments slowed. Rev 3: extended to **61 s** for readability, playback-safe mastering (bt709 + faststart).
17. **awesome-opus5-5-videos** repo added as a reference; "Manus 2.0 Style Launch Video" turned out to be a paid Skillry Skill, so we built our own study instead.
18. **Manus 2.0 launch film breakdown** (`research/reference-videos/manus-2-0/`).
19. **Apolio · 60 s use-case film** (`films/apolio-60/`, v2): the user's script, Manus-light grammar plus our beat system, Apolio character, Abstraxn palette only.
20. **Abstraxn launch film · 90 s** (`films/launch-90/`): the Manus-style storyboard, 9 chapters at 120 BPM.
21. **Workspace setup** (2026-10-17): project skills in `.claude/skills/` (abstraxn-brand, rewires-film-pipeline, rewires-video-qa, remotion-*), `START_HERE.md`, CLAUDE.md for Kanishk.Rewires.


## Key insight: the gap

No account checked runs a **faceless, high-volume channel of animated data stories about AI + marketing**. Big faceless AI pages and data publishers mostly post carousels; reel-first accounts are creator-led. That is the positioning to aim for.

## Links

| What | Where |
|---|---|
| Repo | https://github.com/kanishk-986/video-agent (private) |
| Films | `films/abstraxn-intro/` (5:39 and 4:36), `films/abstraxn-58/` (61 s), `films/apolio-60/` (60 s), `films/launch-90/` (90 s) |
| Reel preview page (v3 fixed) | https://claude.ai/artifact/SJTkR1zZXyK2d1UGcmPyv2 (private to the user) |
| Reference accounts page | https://claude.ai/artifact/KrXogtoFXFPymkn3Yx9ZQC (private to the user) |
| Roboverse video | https://youtu.be/6_rCyryA6hg |
| Competitor | https://www.instagram.com/roheit.ai/ |
| Remotion | https://github.com/remotion-dev/remotion (pinned in `references/remotion` at v4.0.535, not checked out) |
| OpenMontage | https://github.com/calesthio/OpenMontage (submodule `references/OpenMontage`) |
| awesome-opus5-5-videos | https://github.com/yihui-dev/awesome-opus5-5-videos (submodule; shortlist in `research/opus55-prompt-shortlist.md`) |

## Accounts and connectors (status 2026-10-15)

| Service | Status |
|---|---|
| Publora (posting) | Connected in Claude; Instagram not yet linked inside Publora; quota for ~300 posts/month not yet checked |
| Gmail | Needs re-authentication in claude.ai connector settings; can only create drafts, not send; 25 MB attachment limit |
| GitHub | Pushes from this Mac work through saved credentials; `gh` CLI is not logged in |
| Pexels | No key yet (free) |
| ElevenLabs / Kling / Runway | Not used (paid, optional) |

## How the user likes to work

- Feedback themes so far: pace must be energetic (not slow), visuals premium and colourful within the brand, no overlapping elements, busy moments readable, music with adrenaline. All captured in `.claude/skills/rewires-video-qa`.

- Short, direct messages; wants Claude to act and show results, not long option lists.
- Gives visual feedback scene by scene ("only where you show ChatGPT millions needs refinement").
- Wants files they can watch: put renders in `~/Downloads` and open them.
- Wants everything persisted and organised in git.

## Open questions (blocking the daily agent)

1. ~~Channel name + handle~~ Decided: Kanishk.Rewires, @kanishk.rewires
2. Niche and audience
3. The content "flow" the user said they would share
4. Brand kit, posting times, approval mode, voice upgrade; full list in `ROADMAP.md`

## Resume checklist for a new session

1. `cd ~/reels-agent && git pull`
2. Read `CLAUDE.md`, this file, `docs/ROADMAP.md`
3. Setup steps in `README.md` (npm install, venv, regenerate music)
4. Ask the user for whichever open question above is still unanswered

## 2026-10-17: Kanishk.Rewires

- **Final brand name: Kanishk.Rewires** (the user's words: "its the brand name, full and final"). Handle @kanishk.rewires. Tagline "Rethink how you think." The brand board, logo sheet and circular K·R monogram are in `brand/`.
- The repo was split out of `video-agent` into its own repo, then renamed: **github.com/kanishk-986/kanishk-rewires**, folder `~/kanishk-rewires` (`~/reels-agent` is a symlink). `kanishk-986/video-agent` (clone at `~/video-agent`) stays in use for other videos and must never be deleted.
- The user supplied a master system prompt (`docs/MASTER_PROMPT.md`, imported by CLAUDE.md) and asked to install it and build the system.
- Built: the staged pipeline (`pipeline/rewires/`, `docs/PIPELINE.md`), the Rewires Remotion engine (`studio/src/rewires/`), central config (`config/`), tests (`tests/`), and the first sample, `projects/klarna-ai-humans/` (researched with 19 sourced claims).

