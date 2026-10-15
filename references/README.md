# External repositories

| Repo | What it is | How we use it | Licence |
|---|---|---|---|
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | React framework that renders video from code | Our render engine, installed via npm in `studio/` (v4.0.535). Official agent skills vendored in `studio/.agents/skills/`. Pinned as `references/remotion` at tag v4.0.535 (`update = none`, 4.3 GB, so it is not fetched by default; run `git submodule update --init --depth 1 references/remotion` only if you need the source). | Remotion License: free for individuals and companies ≤3 employees; paid Company License above that |
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | Open-source agentic video production system (research → script → assets → compose), 60+ providers, reference-video analysis, real-footage documentary pipeline, Backlot storyboard | Git submodule at `references/OpenMontage` (pinned commit). Planned for 1–2 hero videos/week and "make something like this reel" analysis; not used for the daily batch | AGPLv3: fine for making and posting our own videos; obligations only if we modify and distribute it or run it as a service for others |

## OpenMontage assessment (2026-10-15)

**Strengths:** reference-video analysis (paste a Reel, get pacing/hook/style breakdown + 2–3 original concepts); free real-footage montage from Pexels/Archive.org/NASA/Wikimedia; research stage with 15–25 web searches and citations; quality gates (ffprobe, frame sampling, audio analysis); Backlot live storyboard with approval gates; Piper TTS free voice.

**Weaknesses for 10/day:** interactive, one production at a time with approval gates; heavy (2,173 files, 157 skill files read per production); no Instagram publishing (export only).

**Decision:** daily batch stays on our engine; OpenMontage for hero pieces and reference analysis. Setup needs FFmpeg (Homebrew not installed yet), Python deps, its own Remotion project. Not installed as of this commit.

To fetch the submodule after cloning: `git submodule update --init --depth 1`.
