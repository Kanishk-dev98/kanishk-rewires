# Kanishk.Rewires: video studio

This repo is the studio for **Kanishk.Rewires** (@kanishk.rewires), Alok Diwan's channel on AI, business, marketing and growth. Tagline: "Rethink how you think." Every video here is researched, written, animated, scored, rendered and checked from code. GitHub: `kanishk-986/kanishk-rewires` (private). Folder: `~/kanishk-rewires` (`~/reels-agent` is a symlink to it). Abstraxn and Apolio films also live here and keep their own brand.

The full creative and production standard is the master prompt, imported here:

@docs/MASTER_PROMPT.md

## Read first

1. `docs/PIPELINE.md`: the production system, the one command, config, troubleshooting, what is not built yet.
2. `docs/BRAIN.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`: history, preferences, decisions.
3. Project skills in `.claude/skills/`:
   - `rewires-brand`: palette, type, logo, wordmark, voice, copy rules (load for every Kanishk.Rewires video)
   - `rewires-film-pipeline`: all engines (Rewires plus the older Story, Film, Brand58, Apolio60, Launch90), beat grids, mastering
   - `rewires-video-qa`: the checklist built from the user's feedback (run before every render and delivery)
   - `rewires-motion-library`: catalogue of premium motion techniques from the user's reference videos, with Remotion build notes (load when planning visuals)
   - `abstraxn-brand`: only for Abstraxn work
   - `remotion-*`: official Remotion skills (load `remotion-best-practices` before writing Remotion code)

## Every topic is a production brief

When the user gives a topic, run the whole workflow without asking for creative direction:

```bash
.venv/bin/python -m pipeline.rewires.produce new <slug> --topic "..."
# research → projects/<slug>/research/sources.json + notes.md   (web research, primary sources)
# brief    → projects/<slug>/brief/brief.md
# script + storyboard → projects/<slug>/storyboard/storyboard.json
.venv/bin/python -m pipeline.rewires.produce run <slug> --until edit --stills   # styleframes: look at storyboard/board.png
.venv/bin/python -m pipeline.rewires.produce run <slug> --open                  # render, QC, deliver
```

Then look at `reports/contact_sheet.png`, fix what the checks cannot see (overlaps, pacing, taste), and rerun with `--from edit`. The sample project `projects/klarna-ai-humans/` shows every file filled in.

## How the user works

- Short, direct requests; wants results shown, not option lists. Recommend, then act.
- Deliver to `~/Downloads/Kanishk.Rewires/<slug>/` with a new file name per version (`_v1`, `_v2`), then open it.
- Commit and push after each finished task.
- On-screen copy exactly as scripted, no em or en dashes, brand spelled exactly: KANISHK.REWIRES / Kanishk.Rewires / @kanishk.rewires.

## Hard rules

- Animations only via `useCurrentFrame()` + `interpolate`/`spring` (CSS transitions do not render).
- Colours, fonts, logo paths come from `config/brand.config.json`; never hard-code them in components.
- Never redraw the K·R monogram: use `brand/logo/kr-monogram.png`.
- Never invent a number, quote or source. Company figures are labelled as the company's own.
- Never commit API keys (`.env` is ignored) or third-party videos over 95 MB.
- Remotion licence: free for Alok's personal channel. A company-owned channel would need a Remotion Company License.

## Map

```
brand/            logo (monogram cut-out + originals), brand board, logo sheet
config/           brand.config.json, production.config.json  (single source of truth)
pipeline/rewires/ the staged production pipeline (produce.py is the CLI)
studio/           Remotion project; src/rewires/ is the Kanishk.Rewires engine
projects/<slug>/  one folder per video: research, brief, script, storyboard, audio, timeline, renders, captions, reports
tests/            pytest suite for the pipeline
films/, reels/    earlier films and reel specs
docs/             MASTER_PROMPT, PIPELINE, BRAIN, ROADMAP, DECISIONS
references/       OpenMontage, Remotion, awesome-opus5-5-videos (submodules)
```
