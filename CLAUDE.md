# kanishk.wires: video studio

This repo is the workspace for **kanishk.wires**, Alok Diwan's marketing channel and page. Here we make Abstraxn films, Apolio films, AI and marketing reels, and other brand videos, all rendered from code. GitHub: `kanishk-986/kanishk-wires` (private).

## Read first

1. `docs/BRAIN.md`: who the user is, everything done so far, preferences, links, account status.
2. `docs/ROADMAP.md` and `docs/DECISIONS.md`.
3. The project skills in `.claude/skills/`:
   - `wires-film-pipeline`: engines, beat grids, music, styleframes, render, mastering, delivery, git
   - `wires-video-qa`: the checklist built from the user's feedback (run it before every render and delivery)
   - `abstraxn-brand`: palette, logo, type, product facts, copy rules
   - `remotion-*`: official Remotion skills (load `remotion-best-practices` before writing Remotion code)

## How the user works

- Short, direct requests; wants results shown, not long option lists. Give a recommendation, then act.
- Typical flow: script or storyboard → styleframes → full render. They review and send feedback per scene.
- Always deliver to `~/Downloads/<Project>/` with a **new file name per version**, then open it.
- Save every deliverable in `films/<project>/` (video, styleframes, board, NOTES.md) and push to GitHub after each finished task.
- On-screen copy exactly as scripted, no em or en dashes, Abstraxn palette only for Abstraxn work.

## Hard rules

- Animations only via `useCurrentFrame()` + `interpolate`/`spring` (CSS transitions do not render).
- Safe area ≥ 80 px from the sides; no overlapping elements; readable pacing.
- Never commit API keys (`.env` is ignored). Never commit third-party videos over 95 MB.
- Remotion licence: free because these are Alok's personal and portfolio pieces. If a film becomes an official Antier/Abstraxn company asset, it needs a Remotion Company License or a port to HyperFrames (Apache-2.0).

## Map

```
.claude/skills/   project skills (brand, pipeline, QA, Remotion)
studio/           Remotion project: story/ (reels), film/ (narrated), film58/ (beat film), apolio/, launch90/
pipeline/         builders and music generators (Python, .venv)
films/            delivered films with styleframes and notes
reels/            reel specs
research/         reference videos, Instagram landscape, prompt shortlist
references/       OpenMontage, Remotion, awesome-opus5-5-videos (submodules)
docs/             BRAIN, ROADMAP, DECISIONS
```
