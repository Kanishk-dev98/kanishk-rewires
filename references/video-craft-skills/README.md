# video-craft-skills

A portable Claude Code skill pack plus Remotion components and Python pipeline for making premium product videos (launch and brand films, explainers, demos, ad spots, social reels). It holds **methods and techniques only**: measured motion, typography, camera, transition, 3D, editing and sound craft distilled from about 60 analysed SaaS films, the quality rules, the workflow from brief to delivery, and the QA gates. No brand, product or story is baked in; you re-skin everything in one file (`theme.ts`).

## What is inside

```
video-craft-skills/
  README.md
  skills/video-craft/
    SKILL.md                     entry skill: hard rules, workflow, floor targets, formats, which file to load when
    references/
      typography.md              text reveals, supers, layout behaviours, emphasis, typing rates, text/VO split
      micro-motion.md            cursor, clicks, chips, status flips, loaders, toasts, checklists
      builds.md                  UI assembly, chains, diagrams, collections, boards
      data-screens.md            how to make product screens, tables and logs read
      camera.md                  tilted planes, pushes, whips, continuous takes, dollies
      transitions.md             the transition catalogue and the 2-or-3-systems discipline
      3d.md                      real 3D: kit API, materials, lighting, cameras, render flags, QA
      look-and-rhythm.md         stages, colour roles, depth, grain, light/dark rhythm, maturity rules
      editing.md                 ASL, beat grid, cutting to the voice, cut-downs, localisation
      sound.md                   music, silences and hits, SFX palette, voice
      mix-master.md              mix standard, master, encode, render practice, delivery
      story-structures.md        beat sheets per format (incl. social reels), script rules
      reference-study.md         how to download, prep and break down a reference; traceability
      qa-checklist.md            gates, self-critique, scorecard
      components.md              API of every component and the technique it implements
      sources.md                 appendix: reference video ids (craft sources only)
  agents/motion-3d.md            optional sub-agent for 3D shots
  code/
    remotion/
      theme.ts                   THE file to edit: colours, brand shape, font names, format
      fonts.ts                   loads the fonts (Google Fonts via @remotion/google-fonts)
      motion/                    2D kit: core, fx, stages, light (house kit), moves, patterns, audio, index
      three/                     3D kit: core3d, Logo3D, GlassCard3D, Orb3D, LayerStack3D, TileField3D,
                                 LightStreaks, Text3D, camera, env, materials, post, stage, texture, index
      examples/                  CraftLab (demo of the kit), FilmTemplate (props contract), Root.example
    pipeline/
      build_vo_timeline.py       script JSON → Edge TTS with word timings → beat-grid scenes → props JSON + cues
      mix_check.py               voice ≥ 10 dB over the bed in every line (renders stems)
      containment_check.py       nothing sharp within 80 px of the edge, every frame
      master.py                  render (CRF 12) + master (CBR 14 Mb/s, bt709 limited, 2-pass linear loudnorm)
      qc.py                      decode, loudness, true peak, colour tags, bitrate floor, black first frame, contact sheet
      prep_reference.py          contact sheets, cuts, loudness/tempo, spectrogram, transcript for a reference
      sync_references.py         download a reference set (yt-dlp) and prep only new videos
      requirements.txt
```

## Install into a repo

From the target repo root (adjust `studio/` to wherever your Remotion project lives):

```bash
PACK=~/Downloads/video-craft-skills
mkdir -p .claude/skills .claude/agents
cp -R "$PACK/skills/video-craft" .claude/skills/
cp "$PACK/agents/motion-3d.md" .claude/agents/            # optional
cp "$PACK/code/remotion/theme.ts" "$PACK/code/remotion/fonts.ts" studio/src/
cp -R "$PACK/code/remotion/motion" "$PACK/code/remotion/three" "$PACK/code/remotion/examples" studio/src/
cp -R "$PACK/code/pipeline" ./pipeline
```

Then:
1. Edit `studio/src/theme.ts` (accent family, neutrals, deny family, brand shape polygon, font names) and `fonts.ts` (the two Google fonts, or your own loader).
2. Merge the `<Composition>` entries from `examples/Root.example.tsx` into your `Root.tsx` and render the lab to see the kit: `npx remotion still src/index.ts CraftLab out/lab.png --frame=170 --gl=angle`.
3. For `Text3D`, add a three.js typeface JSON of your display font to `public/fonts/` (convert a licensed static TTF offline, e.g. with facetype.js; keep the licence next to it) or pass `fontUrl`.
4. Put SFX wavs in `public/sfx/` (`<Sfx name="click" />` plays `public/sfx/click.wav`).
5. If the skill files move, keep the `references/` folder next to `SKILL.md`; paths inside the skill are relative to it. The skill refers to code as `src/motion`, `src/three`, `src/theme.ts` and `pipeline/`; adjust those mentions if your layout differs.

## Dependencies (tested versions)

| Package | Version | Notes |
|---|---|---|
| remotion, @remotion/cli | 4.0.535 | any recent 4.x should work |
| @remotion/three | 4.0.535 | match your Remotion version exactly |
| @remotion/media | 4.0.535 | `<Audio>` in `audio.tsx` |
| @remotion/layout-utils | 4.0.535 | `measureText` |
| @remotion/google-fonts | 4.0.535 | `fonts.ts` |
| react, react-dom | 19.2.3 | |
| @react-three/fiber | 9.8.1 | React 19 line |
| three | 0.186.1 | with `@types/three` 0.186.0; uses `examples/jsm` (no drei, no postprocessing) |
| typescript | 5.9.3 | strict, `moduleResolution: Bundler`, `jsx: react-jsx` |

```bash
npm i --save-exact remotion@4.0.535 @remotion/cli@4.0.535 @remotion/three@4.0.535 @remotion/media@4.0.535 \
  @remotion/layout-utils@4.0.535 @remotion/google-fonts@4.0.535 three@0.186.1 @react-three/fiber@9.8.1
npm i -D --save-exact @types/three@0.186.0
pip install -r pipeline/requirements.txt     # numpy, imageio-ffmpeg, edge-tts (+ optional yt-dlp, faster-whisper)
```
Everything is free: Edge TTS needs no key; ffmpeg comes from `imageio-ffmpeg`.

## Render flags

- **Always `--gl=angle`** for anything with WebGL (harmless for 2D). The default GL backend timed out on glass-heavy frames.
- `--timeout=120000` (first frame of each 3D sequence compiles shaders and bakes the environment).
- `--concurrency=4`; stills in batches of at most 4 for 3D, or bundle once and render stills from the bundle.
- Intermediate: `--codec=h264 --crf=12 --x264-preset=slow --pixel-format=yuv420p --color-space=bt709`. Then `python pipeline/master.py master raw.mp4 final.mp4` (CBR 14 Mb/s, bt709 limited, −14 LUFS / −1.0 dBTP, AAC 256k, faststart) and `python pipeline/qc.py final.mp4`.

## Typical run

```bash
python pipeline/build_vo_timeline.py --example > films/myfilm/script.json      # edit lines, scenes, cues
python pipeline/build_vo_timeline.py films/myfilm/script.json --project studio  # VO + timeline + mix check
# build scenes in a copy of examples/FilmTemplate.tsx, register it, then:
python pipeline/master.py render studio Film studio/out/myfilm.props.json studio/out/myfilm.raw.mp4
python pipeline/master.py master studio/out/myfilm.raw.mp4 studio/out/myfilm_v1.mp4
python pipeline/qc.py studio/out/myfilm_v1.mp4
# containment: render with props {"qa": true} and run pipeline/containment_check.py on it
```
