# Kanishk.Rewires production pipeline

A topic goes in and a branded, researched, QC-checked vertical video comes out. The stages are real and inspectable. Each stage writes into `projects/<slug>/`, is recorded in `manifest.json`, and is only marked done after its output has been checked. A rerun resumes from the first stage that is not done.

## Setup (once per machine)

```bash
cd ~/kanishk-rewires
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cd studio && npm install && cd ..
cp .env.example .env        # only needed for paid providers; the default stack needs no keys
.venv/bin/python -m pytest -q tests
```

You need Node 18 or newer and Python 3.10 or newer. FFmpeg comes from `imageio-ffmpeg`, and ffprobe from Remotion, so neither needs installing system-wide. Edge TTS needs internet access.

## Make the next video

```bash
.venv/bin/python -m pipeline.rewires.produce new my-topic --topic "What the video is about"
```

Then the agent (Claude, in this repo) writes the creative stages:

| File | What goes in it |
|---|---|
| `research/sources.json` | Source ledger: claims with type (fact, company_claim, estimate, interpretation, quote), event date, and sources with URL, publisher and publication date. Use `"research": "not-needed"` in the storyboard for opinion pieces. |
| `research/notes.md` | Story arc, usable quotes, caveats. |
| `brief/brief.md` | Audience, core insight, tension, progression, opening image, visual metaphor, takeaway, factual guardrails. |
| `storyboard/storyboard.json` | Scenes with narration, on-screen data, sync words, claims, source labels, transitions, energy, SFX and direction notes. The schema is in `pipeline/rewires/storyboard.py`. |

```bash
.venv/bin/python -m pipeline.rewires.produce run my-topic --until edit --stills   # styleframes in storyboard/board.png
.venv/bin/python -m pipeline.rewires.produce run my-topic --open                  # render, QC, deliver, open
.venv/bin/python -m pipeline.rewires.produce status my-topic
```

To redo only part of a video, use `--from edit` (re-time and re-render) or `--from assets` (re-voice). Narration is cached by text and voice, so unchanged lines are not regenerated.

## Stages

| Stage | Automated? | Checks before it is marked done |
|---|---|---|
| A. Intake | yes (`new`) | folder tree and manifest |
| B. Research | agent writes, tool verifies | ledger has claims; writes `sources.md` |
| C. Brief | agent writes, tool verifies | brief exists and is substantive |
| D. Script | agent writes, tool verifies | every scene has narration; writes `script/script.md` |
| E. Storyboard | agent writes, tool verifies | scene types, sync words actually spoken, every fact scene cites a claim that exists, no em or en dashes, exact brand spelling, lime-accent budget |
| F. Assets | yes | narration per scene with word timings (cached); provenance recorded in the manifest |
| G. Edit | yes | timeline, props, SRT, captions JSON, original score and sonic signature, styleframes with `--stills` |
| H. Render | yes | Remotion render, then master: bt709, -14 LUFS, AAC 48 kHz, faststart; versioned `_vN.mp4` |
| I. QC | yes | 14 checks (below); any failure blocks delivery |
| J. Delivery | yes | production report; copies to `~/Downloads/Kanishk.Rewires/<slug>/` |

**QC checks:** resolution, frame rate, codecs, exact duration, duration target, clean decode, black frames, freezes (on a blurred proxy so grain does not hide them), silent gaps, loudness, true peak, safe area (no ink near the sides on sampled frames), brand ending (lime plus cream type on the last frame), and a contact sheet. Overlaps, pacing and taste still need a human look at `reports/contact_sheet.png`.

## The engine (studio/src/rewires)

| Piece | File |
|---|---|
| Brand tokens from config, fonts | `brand.ts` |
| Grain, vignette, wire motif, camera, mask reveal, labels, source tag, lime accent markup (`*word*`) | `fx.tsx` |
| Scene tools: `hook`, `stat`, `compare`, `quote`, `timeline`, `route`, `headline`, `takeaway` (each in `theme: dark` or `cream`) | `scenes.tsx` |
| **Motion UI kit**: tilt-in cards, focus camera (zoom capped at 1.06 so labels never crop), cursor with click ripples, typing and retyping, panels, chips, avatars, checks, layer headers | `ui.tsx` |
| **Demonstration scenes** (the default for tutorials): `systemHook`, `profile`, `prospects`, `personalize`, `workflow`, `convert`. Each shows the narrated step happening in an illustrative interface. | `uiScenes.tsx` |
| Captions (short pages, no karaoke, one highlighted word at most) | `Captions.tsx` |
| Signature ending: strands converge, the K·R monogram, then the wordmark and tagline. Reusable, with adjustable size, strands and duration. | `LogoReveal.tsx` (also the `RewiresOutro` and `RewiresOutroWide` compositions) |
| Composition (formats 9:16, 4:5, 1:1, 16:9 via `format` in the storyboard) | `Rewires.tsx` |

Layout zones are fractions of frame height (`ZONE` in `brand.ts`): content 12 to 63 %, captions from 66.5 %, source label at 77.5 %. That keeps everything above the Instagram and TikTok UI.

**Rule from the user (2026-10-17): never a typography-only video.** Every scene must show what the narration says through UI, diagrams, cursor actions, data in motion and camera moves. The type scenes (`hook`, `stat`, `headline`...) are supporting tools only. Keep the brand small: `"chrome": {"bug": true, "rail": [...]}` for a corner mark and a step rail, and `"outro": {"size": 300, "wordSize": 62, "nodes": [...], "cta": "..."}` for a compact ending. See `projects/linkedin-client-stack/` for the reference build.

**Exact length:** set `"targetSeconds"` in the storyboard. Scenes are timed on the last spoken word, then stretched in proportion to `plannedSeconds`. If the narration is too long the edit stage warns you, and you raise `voice.edge.rate` or cut words. **Click and SFX timing:** `"sfx": [{"name": "click", "on": {"sync": 2, "offset": -2}}]` lands on a sync word.

## Configuration

- `config/brand.config.json`: palette, fonts, logo paths, wordmark, handle, caption rules, outro length, spelling rules.
- `config/production.config.json`: formats, fps, duration target, voice provider, timing pads, music level, render preset, loudness target, QC thresholds.
- A storyboard can override `format`, `captions` and `voice`.

## Providers and secrets

| Need | Default (free, tested) | Alternatives |
|---|---|---|
| Narration | Edge TTS `en-US-AndrewMultilingualNeural`, +6 % | `recorded`: put `audio/vo/sNN.mp3` files in place and set `"voice": {"provider": "recorded"}`. `elevenlabs`: adapter slot only, **not implemented**. |
| Music | `pipeline/rewires/music.py`, original and generated | licensed tracks: drop a WAV at `audio/music.wav` after the edit stage |
| SFX | `studio/public/sfx/` (generated in code) | none |
| Research | the agent's web search | none |

Keys go in `.env` (see `.env.example`), never in code or commits.

## Not built yet (honest list)

- An ElevenLabs or other paid TTS adapter, and forced alignment for recorded voice (recorded word timings are spread evenly).
- Generated video or image adapters (Veo, Kling, Runway). Nothing in the pipeline calls a paid model.
- Stock or real footage retrieval (Pexels) and an image-treatment scene.
- Interface demo and cursor scenes, map and network scenes.
- Automated spelling check of on-screen text, and automatic overlap detection.
- Posting (Publora) is outside the pipeline.
- The KANISHK.REWIRES wordmark is set in type (Space Grotesk Bold plus Instrument Serif as a stand-in for the board's serif) because no wordmark artwork file exists. Drop the real artwork in `brand/logo/` and the outro can switch to it.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `BLOCKED: ...` | The message names the stage and the reason; fix the file and rerun the same command. |
| Edge TTS fails or hangs | Needs internet; retry. Switch to `recorded` if the service is down. |
| QC "no freezes" fails | A scene holds still too long; add motion or shorten it, then `--from edit`. |
| QC "safe area" fails | Text reaches the frame edge; shorten the line or lower `size` in the scene data. |
| QC "loudness" fails | Usually very short or very quiet narration; check `audio/vo`. |
| Fonts look wrong in a still | The first render downloads Google Fonts; rerun once online. |
| `ffprobe` errors | Run `npm install` in `studio/`. |
| Push fails | `gh auth login` once on this Mac. |
