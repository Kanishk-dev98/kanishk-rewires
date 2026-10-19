# Harness² research notes (verified 2026-10-20)

Status: **verified**. Primary sources are the GitHub repo (github.com/google-research/harness2), arXiv 2610.14224 (v1, submitted 9 Oct 2026), and the project page harness2.github.io. I found no Google Research blog post.

## Plain English

An AI "agent" is a model plus everything wrapped around it: its instructions, the tools it may use, its memory, its how-to guides ("skills"), helper scripts, sub-agents and plug-ins. That wrapper is called the **harness**. Harness² keeps the model frozen, with no retraining and no weight changes, and lets the agent rewrite its own harness.

For each new task it works like this:
1. Do the task once with the current harness.
2. Write two possible fixes: a general one (for example "plan first, check your files") and a task-specific one (for example a skill for reconciling budget sheets).
3. Try each fix on the same task and compare how the agent behaved.
4. Keep what helped, merge it into a better harness, and run that.
5. Write down the lessons that held up, so the next task starts out smarter.

It never sees the right answer. It judges only by comparing runs.

## Key facts (exact)

1. **No retraining.** README: "keeping model weights fixed". The harness is 8 editable files: system prompt, guardrails, memory, tool guidance, subagents, skills, scripts, plugins.
2. **One improvement step (k=1)** improved every one of 4 model–harness setups (GLM-5 and Gemini 3.5 Flash, each under OpenCode and Codex).
3. **Headline gains (single step, mean of 3 runs):**
   - **+11.5 points** on WorkBuddy-Bench (GLM-5 / OpenCode: 64.2 → 75.7)
   - **+4.5 points** on JobBench (Gemini 3.5 Flash / OpenCode: 31.5 → 36.0)
   - **+11.8 percentage points** on LAB Partial pass rate (GLM-5 / OpenCode: 59.6 → 71.4)
4. **More rounds help.** Parallel recursion at k=5 adds 2.9 to 3.9 points (WorkBuddy), 3.0 to 4.2 (JobBench), and 2.6 to 6.7 pp (LAB) on top of one step. Gemini 3.5 Flash/OpenCode on WorkBuddy: 72.4 → 77.5 (k=1) → 80.8 (k=5), which is +8.4 in total.
5. **A weaker model can beat a stronger one.** After one step GLM-5 scores 75.7 on WorkBuddy, above base Gemini 3.5 Flash at 72.4.
6. **Case study:** one JobBench task went from 43.1 to 77.8.
7. **Who wrote the edits:** the default harness editor is Claude Opus 4.8. When each model edited its own harness (k=2), all 5 models tested improved, and GLM-5 gained +13.7 on LAB.
8. **Release:** Apache 2.0 code; paper CC BY 4.0. Repo created 6 Oct 2026, first public commit 8 Oct, arXiv 9 Oct, v0.1.0. Authors: Ruiyao Xu (Northwestern), Yanfei Chen, Zhongying CuiZhu, Bhavana Dalvi Mishra, Yifei Ming, Han Yu, Rujun Han, Chen-Yu Lee, Tomas Pfister (Google Cloud AI Research).

Run: `uv pip install -e '.[render]'`, then `harness2-setup jb`, then `harness2 --bench jb --k 1 --mode parallel`. A demo that needs no credentials: `harness2-demo --output runs/demo --k 2`.

## The loop (names used by the authors)

- **Execution harness**: the 8-file wrapper the agent runs with. Every task starts from the same base harness H0.
- **Propose**: a harness editor writes an **invariant** candidate (general agent weaknesses: planning, tool use, context, delegation) and a **domain-specific** candidate.
- **Probe**: each **candidate** runs on the same task under the same conditions. The comparison with the reference run is the "behavioral contrast".
- **Compose**: a harness composer merges the supported edits, revises conflicts, adopts one candidate, or keeps the current harness.
- **Select** (only when k>1): picks among the anonymized deliverables.
- **Reflect / update**: an experience reflector stores the adopted harness plus **evidence-supported lessons** (EXPERIENCE.md) in the **improvement harness** library, which guides the next task.
- Two ways to scale the budget k: **parallel** ("explores wider") and **sequential** ("refines deeper").

## Caveats

- **Costs more compute.** Every extra probe is another full run. Parallel runs cut waiting time but not compute. (Limitations, Appendix F.)
- **No ground truth.** The signals are "sensitive to execution variability and shared model biases" and "do not guarantee correctness or establish that an adopted change will transfer to a different task."
- **Benchmark results only.** These are 3 professional benchmarks with 3 runs each, not production deployments.
- **Not a clean sweep.** On LAB, Meta-Harness beats it for Gemini 3.5 Flash/Codex, and recursion does not always close the gaps between harnesses.
- **Safety and leakage.** The README says executor network access is unrestricted, Codex runs with its sandbox disabled, and public benchmark rubrics may be reachable online. Users should restrict the network before evaluating.
- **Not an officially supported Google product** (README disclaimer).
- The editor in the main results is a different and stronger model (Claude Opus 4.8). The same-model test addresses this, but at k=2 only.

## Unverified or conflicting

- **"+8.5": not found** in the paper, README or project page. The nearest figures are +8.4 (Gemini/OpenCode WorkBuddy average, base → k=5; also the Web domain) and +9.4 (Office). Don't use +8.5.
- **"Google Research"**: the repo sits under the google-research GitHub org, but the paper's affiliation is **Google Cloud AI Research + Northwestern University**. Safest wording: "researchers at Google Cloud AI Research and Northwestern".
- **"Up to 11.8 points"** (Menon Lab headline): 11.8 is *percentage points of LAB pass rate*, not the same unit as the 11.5 WorkBuddy score. Say "up to 11.5 points" or name each benchmark.
- **Date:** arXiv lists v1 as submitted 9 Oct 2026. A search result showed "2026-10-12" as the PDF date stamp, which I did not confirm. Code went public around 8 Oct.
- **No Google Research blog post** was found.
- MarkTechPost (18 Oct, secondary) returned 403. Its details (v0.1.0, Python 3.12/3.13) come from a search snippet and match pyproject.toml.

## Official images (URLs only)

- https://raw.githubusercontent.com/google-research/harness2/main/assets/harness2_pipeline.png (pipeline)
- https://raw.githubusercontent.com/google-research/harness2/main/assets/components.png (8 components)
- https://raw.githubusercontent.com/google-research/harness2/main/assets/harness2_recursion_modes.png (parallel vs sequential)
- https://raw.githubusercontent.com/google-research/harness2/main/assets/Harness2-wordmark.png, .../assets/logo.png, .../assets/harness2-video.mp4, .../assets/harness2-setup.gif
- https://harness2.github.io/assets/case-jobbench.png, https://harness2.github.io/assets/harnessmind.png

License: the repo is Apache 2.0 (the assets are in the repo, but no separate image license is stated) and the paper figures are CC BY 4.0. Credit "Xu et al., 2026 (arXiv:2610.14224)". Logo and trademark use is not addressed, so avoid presenting the Google mark as an endorsement.
