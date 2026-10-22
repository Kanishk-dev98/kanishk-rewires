# AI agents that upgrade themselves

Format: 9x16  
Body duration: 45.0 s plus the brand outro

## 1. s00 · xBeat · 2.9 s

**Voiceover:** Google researchers just open-sourced something wild.

**On screen:** NEW · JUST RELEASED / OPEN SOURCE · APACHE 2.0

**Transition:** cut

- Source license-release: Code licensed Apache 2.0 (third-party code, benchmarks and datasets keep upstream licenses). Paper licensed CC BY 4.0. Repo created 2026-10-06, initial public commit 2026-10-08, arXiv v1 submitted 2026-10-09, package version 0.1.0, Python >=3.12,<3.14. README: "This is not an officially supported Google product." (fact) Google Research GitHub org, 2026-10-08 https://github.com/google-research/harness2/blob/main/LICENSE

## 2. s01 · xBeat · 6.1 s

**Voiceover:** It lets your AI agent upgrade its own setup: its prompts, tools, memory and skills.

**On screen:** AI agent / ring / google-research / harness2 / Recursive Agent Harnessing for an Open World / Prompts / Tools / Memory / Skills

**Transition:** cut

- Source what-harness: A harness is the system around a model that lets it act as an agent: prompts, tools, memory, skills, orchestration. 'Harnessing' is optimizing that system. README: "A harness is the system around a model that enables it to act as an agent: prompts, tools, memory, skills, orchestration, and more." (definition) Google Research GitHub org, 2026-10-08 https://github.com/google-research/harness2
- Source eight-components: Eight editable harness components, each mounted as a file: system prompt, guardrails, memory, tool guidance, subagents, skills, scripts, and plugins (middleware plugin). Extends AHE's file-level decomposition by one component. (fact) Google Research GitHub org, 2026-10-08 https://github.com/google-research/harness2

## 3. s02 · xBeat · 2.1 s

**Voiceover:** Without retraining the model at all.

**Transition:** cut

- Source frozen-weights: Improves agents while keeping model weights fixed. README: "It connects two levels of recursion while keeping model weights fixed". Paper: harnessing = "optimizing the runtime scaffolding around a frozen base model"; "Model weights, stage instructions, and the decision rule remain fixed, while the library evolves." (core-claim) Google Research GitHub org, 2026-10-08 https://github.com/google-research/harness2

## 4. s03 · xBeat · 1.5 s

**Voiceover:** It's called Harness squared.

**On screen:** Harness / 2 / GOOGLE-RESEARCH / HARNESS2

**Transition:** cut


## 5. s04 · xBeat · 4.3 s

**Voiceover:** Right now, most teams tweak that setup by hand, test it, and tweak it again.

**On screen:** You are a careful research agent. / Always cite your sources. / Ask before you act. / Be more concise. Use the tools first.

**Transition:** cut


## 6. s05 · xBeat · 2.0 s

**Voiceover:** This does it for you, with one command.

**On screen:** harness2 --bench jb --k 1 --mode parallel

**Transition:** cut

- Source run-command: Install/run: `uv venv --python 3.12 .venv && source .venv/bin/activate && uv pip install -e '.[render]'`; credential-free demo `harness2-demo --output runs/demo --k 2`; benchmark e.g. `harness2-setup jb` then `harness2 --bench jb --k 1 --mode parallel`; also `harness2-judge` and `harness2-report`. `--substrate cx` uses Codex. Requires Linux; model runs need Node.js 20+, Google Cloud CLI, Vertex AI. (fact) Google Research GitHub org, 2026-10-08 https://github.com/google-research/harness2

## 7. s06 · xBeat · 6.4 s

**Voiceover:** It proposes two fixes, tests both on the same task, and keeps only what actually worked.

**On screen:** harness2.github.io / harness2 · run log / Propose / Two candidate edits / Test / Same task, same settings / Combine / Keep what helped / propose · general + domain edit / probe · same task, compared / compose · supported edits kept

**Transition:** cut

- Source loop-task-level: Task-level recursion: a contrastive Propose–Probe–Compose step. Run the current harness once as a reference; PROPOSE two candidate edits (an 'invariant' candidate for general agent weaknesses like planning, tool use, context, delegation; a 'domain-specific' candidate for the task's domain knowledge/procedures); PROBE: run each candidate on the same task under matched conditions and compare behaviour with the reference (a 'behavioral contrast'); COMPOSE: merge supported changes, revise conflicts, adopt one, or keep the current harness, then run the composed harness. No ground-truth answers are used. README: "propose edits, probe their effects on the same task, and compose a refined harness from behavioral contrasts between executions, without ground-truth feedback." (mechanism) Google Research GitHub org, 2026-10-08 https://github.com/google-research/harness2

## 8. s07 · xBeat · 6.0 s

**Voiceover:** In the paper, one round boosted a model by eleven and a half points, with the exact same weights.

**On screen:** WORKBUDDY-BENCH · GLM-5 + OPENCODE / points / BEFORE / 64.2 / AFTER / 75.7 / WEIGHTS / same / Mean of 3 runs · one improvement round (k=1)

**Transition:** cut

- Source headline-results: A single step (k=1) improves GLM-5 and Gemini 3.5 Flash over their base harnesses in all four model–harness configs (OpenCode, Codex). Max gains: +11.5 points WorkBuddy-Bench (GLM-5/OpenCode, 64.2 -> 75.7 avg), +4.5 points JobBench (Gemini 3.5 Flash/OpenCode, 31.5 -> 36.0), +11.8 percentage points LAB Partial pass rate (GLM-5/OpenCode, 59.6 -> 71.4). Means over three runs. (result) arXiv, 2026-10-09 https://arxiv.org/html/2610.14224v1
- Source setup-models: Frozen executors: Gemini 3.5 Flash and GLM-5 under OpenCode and Codex harnesses. Default harness editor: Claude Opus 4.8 under OpenCode. Library starts empty per benchmark stream. Same-model-as-editor test (k=2): all five models improve; GLM-5 +13.7 on LAB, Claude Opus 5 +3.3/+5.5/+3.0. (fact) arXiv, 2026-10-09 https://arxiv.org/html/2610.14224v1

## 9. s08 · xBeat · 1.8 s

**Voiceover:** But here's the real twist.

**On screen:** charcoal

**Transition:** cut


## 10. s09 · xBeat · 4.4 s

**Voiceover:** It writes down what it learned from every task, so the next one starts smarter.

**On screen:** TASK 41 · DONE / Lessons saved / Task 42 / Plan before calling tools / Check sources twice / Keep answers short

**Transition:** cut

- Source loop-harnessing-level: Harnessing-level recursion: after each task an experience reflector reviews the whole improvement record and saves the adopted harness plus evidence-supported lessons into a 'harness improvement library' (each entry = executable harness + EXPERIENCE.md). The next task starts from the same base harness, but proposals can reuse/adapt library entries. Paper: "Lessons are retained only when supported by execution contrasts". (mechanism) arXiv, 2026-10-09 https://arxiv.org/html/2610.14224v1

## 11. s10 · xBeat · 2.4 s

**Voiceover:** Your agent gets better at getting better.

**On screen:** SCORE ACROSS TASKS · ILLUSTRATIVE / better

**Transition:** cut


## 12. s11 · xBeat · 4.9 s

**Voiceover:** Want the repo? Follow, comment harness, and I'll send you the link.

**On screen:** harness / Here's the repo 👇 / github.com/google-research/harness2

**Transition:** cut


