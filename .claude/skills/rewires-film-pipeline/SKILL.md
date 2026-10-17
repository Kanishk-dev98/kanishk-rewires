---
name: rewires-film-pipeline
description: How Kanishk.Rewires videos are built and delivered in this repo: compositions, beat grids, music generators, styleframes, full render, mastering, delivery and git. Use whenever making or revising a reel, brand film or launch film.
---

# Kanishk.Rewires film pipeline

Everything renders from code with Remotion in `studio/` (Node 18+, Python venv in `.venv`). Load the `remotion-best-practices` skill before writing Remotion code, and `abstraxn-brand` for Abstraxn work.

## Engines (pick one, or copy one as a starting point)

| Composition | Folder | What | Builder |
|---|---|---|---|
| **`Rewires`** | `studio/src/rewires/` | **Default for Kanishk.Rewires.** Any format, 8 scene tools, captions, source labels, signature outro | `python -m pipeline.rewires.produce run <slug>` (see `docs/PIPELINE.md`) |
| `RewiresOutro` / `RewiresOutroWide` | `studio/src/rewires/LogoReveal.tsx` | the 3 s brand ending on its own, 9:16 and 16:9 | render directly |
| `Story` | `studio/src/story/` | 9:16 reels with voiceover, word captions, 9 scene types | `pipeline/build_story.py reels/<spec>.json` |
| `StatRace` | `studio/src/StatRace.tsx` | single stat-race reel | `pipeline/build_reel.py` |
| `Film` | `studio/src/film/` | 16:9 narrated brand film (voice per line, chapter timeline) | `pipeline/build_film.py films/<x>/script.json` |
| `Brand58` | `studio/src/film58/` | 16:9 music-led brand film, 118 BPM beat grid, triangle grid | render directly |
| `Apolio60` | `studio/src/apolio/` | 16:9 use-case film, Manus-light grammar, Apolio character | render directly |
| `Launch90` | `studio/src/launch90/` | 16:9 Manus 2.0 style launch film, 120 BPM | render directly |

**Beat grids:** prefer **120 BPM** (exactly 15 frames per beat at 30 fps, script timestamps land on beats). Scenes get `B(b)` = frame of local beat b. Every cut on a beat.

**Music placeholders** (code-generated, royalty-free): `pipeline/make_*_score.py`, all built on the instruments in `make_epic_score.py`. Put dead stops and impacts on the story's key beats.

## Workflow (what the user expects)

1. Script or storyboard first if it is new, then styleframes (12 to 14 stills at full 1920×1080), then the full render.
2. Styleframes: `npx remotion bundle --out-dir=../out/bundle`, then `npx remotion still ../out/bundle <Comp> out.png --frame=N` in parallel; tile with ffmpeg into a board and **look at it** (see `rewires-video-qa`).
3. Full render: `npx remotion render ../out/bundle <Comp> ../out/x.raw.mp4 --codec=h264 --crf=16 --concurrency=6`.
4. Master (always, keeps QuickTime happy):
   ```bash
   npx remotion ffmpeg -loglevel error -y -i in.raw.mp4 -c:v copy \
     -bsf:v h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1 \
     -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
     -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 256k -ar 48000 -movflags +faststart out.mp4
   ```
   In zsh, write these flags out in full; a `$VAR` holding flags will not word-split.
5. Deliver: copy to `~/Downloads/<Project folder>/` with a **new file name per version** (v1, v2…), plus styleframes, board and NOTES.md, then `open` the video. Never overwrite a file the user may have open.
6. Save: `films/<project>/` (video, styleframes, board, NOTES.md with decisions), commit, push to `origin main` (github.com/kanishk-986/kanishk-rewires). Videos over ~95 MB will not push; keep those local or use Git LFS.

## Gotchas

- Animations must use `useCurrentFrame()` with `interpolate`/`spring`. CSS transitions do not render.
- Canvas (triangle grid) draws in `useLayoutEffect`.
- Word rolls: each word's exit is keyed to the next word's arrival, not to the "active" index (an earlier bug overlapped words).
- The ffmpeg used for analysis lives in the scratchpad venv (`imageio-ffmpeg`); Remotion ships its own via `npx remotion ffmpeg`.
