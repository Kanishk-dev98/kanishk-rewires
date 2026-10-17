# kanishk-wires

For making production grade videos for Instagram, YouTube and all.

An automated factory for faceless, motion-graphics Instagram Reels about AI and marketing. The goal is 10 production-grade reels a day, at zero running cost. Everything renders from code on a Mac.

**Status (2026-10-15):** the engine works end to end and the first cinematic reel is done. Next: pick the channel name and niche, then build the daily agent.

## What's in here

```
films/          Long-form landscape films (abstraxn-intro: 5:39 brand film)
pipeline/       Python build scripts: voiceover, timing sync, score, render, loudness
reels/          One JSON spec per reel (script + data). The daily agent will write these.
studio/         Remotion project (React → MP4)
  src/story/    "Story" engine: 9 cinematic scene types + effects + captions
  src/film/     "Film" engine: 16:9 brand films (Abstraxn scenes, brand kit, word-synced type)
  src/StatRace.tsx  Single-scene stat race template (v1/v2)
  public/sfx/   Sound effects (Remotion's free library + our synthesized ones)
research/       Everything learned so far
  instagram/    84 verified reference accounts, findings, competitor notes
  reference-videos/  Breakdowns of videos the user shared (transcript + frames)
references/     External repos: OpenMontage (submodule), Remotion (pinned link), assessments
samples/        Rendered reels (v3 master + preview, v1, v2) and frame sheets
docs/           BRAIN.md (full project context), decisions, roadmap
tools/          analyze_reference.py (transcript + frame sheets), share-page template
```

## Run it

One-time setup (Node 18+ and Python 3.10+ required):

```bash
cd studio && npm install && cd ..
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python pipeline/make_music.py studio/public/music/soft_pad.wav 60
.venv/bin/python pipeline/make_sfx.py studio/public/sfx
```

Build a reel:

```bash
# Multi-scene cinematic reel (~60–80 s)
.venv/bin/python pipeline/build_story.py reels/race_100m_cinematic.json
# Single stat race (~30 s)
.venv/bin/python pipeline/build_reel.py reels/statrace_100m.json
```

Output lands in `out/<id>.mp4`: 1080×1920, 30 fps, H.264, AAC 48 kHz, normalized to −14 LUFS.

Live editor: `cd studio && npm run dev` (Remotion Studio). Add `--no-render` to `build_story.py` to generate the voiceover and props without rendering.

## How a reel is made

1. **Spec** (`reels/*.json`): a list of scenes, each with a `type`, voiceover line `vo` and scene `data`. `syncWord` lands a scene's big moment on a spoken word.
2. **Voice:** Edge TTS (Microsoft neural voice "Andrew", free) renders each scene's line, with **word-level timestamps**.
3. **Timing:** each scene lasts as long as its narration plus padding, so voice and visuals stay in sync automatically.
4. **Render:** Remotion renders the `Story` composition with captions, music, SFX, grain, light leaks and camera moves.
5. **Master:** FFmpeg loudnorm to −14 LUFS at 48 kHz.

### Scene types (`studio/src/story/scenes.tsx`)

| Type | Look | Used for |
|---|---|---|
| `slam` | Huge word slams in on the spoken word, shake, flash, streaks | Cold-open hooks |
| `title` | Metallic shine title, particles, boom | Title card |
| `counter` | Number rolls up + coloured dot grid + comparison bars | Scale moments |
| `app` | Full-bleed brand gradient, giant counting number, fact pill, swipe-in | One contender per scene |
| `race` | Bars race in, last item pulses as "?" | Comparison |
| `buildup` | Heartbeat rings, typed date, riser | Tension before a reveal |
| `reveal` | Milestone card → counter → slam, shockwave + confetti | Payoff |
| `chat` | Chat window typing, streamed answer, tag pills | AI product moments |
| `cta` | Follow button gets clicked by a cursor | End card |

## Cost

All free: Remotion (personal licence), Edge TTS, synthesized music and SFX, FFmpeg bundled with Remotion. Optional paid upgrades are listed in `docs/DECISIONS.md`.
