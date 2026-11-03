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

## Behaviour guidelines (karpathy-guidelines)

Follow these on every task. Skill: plugin `andrej-karpathy-skills@karpathy-skills` (auto-updating, declared in `.claude/settings.json`). Project-specific instructions above take precedence where they conflict.
**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Grilling, Pocock skills and last30days

- **Grill on anything new.** Whenever we start something new (content, plan, strategy, design, topic, setup or tool), run the `grilling` skill first: ask the open decisions in numbered rounds with a recommended answer for each, and act only once the user confirms. Skip it for direct, fully specified instructions on agreed work.
- **Pocock skills** come from the auto-updating plugin `mattpocock-skills@mattpocock` (27 skills, named `mattpocock-skills:<name>`), declared in `.claude/settings.json`; his 12 in-progress and misc skills stay as copies in `.claude/skills/`. Use only the ones that fit the work: content and research (`grilling`, `research`, `handoff`, `teach`, `writing-for-agents`); code (`diagnosing-bugs`, `tdd`, `code-review`, `pr`, `prototype`).
- **last30days** comes from the auto-updating plugin `last30days@last30days-skill`, declared in `.claude/settings.json`. Use it to research the last 30 days of Reddit, X, YouTube, Hacker News and the web on a topic. It needs Python 3.12: run its script with `uv run --no-project --python 3.12`. Claude Code offers to install all three plugins when this repo is opened.
