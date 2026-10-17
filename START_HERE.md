# Start a kanishk.wires chat

## 1. Open the workspace (once)

In VS Code: **File → New Window → Open Folder… → `~/reels-agent`**. Then open the Claude Code panel in that window.

Everything loads by itself from this folder:

| What | Where it lives | Loaded how |
|---|---|---|
| Project instructions | `CLAUDE.md` | automatically at the start of every chat |
| Skills (brand, pipeline, QA, Remotion) | `.claude/skills/` | listed automatically; used when relevant |
| Full history and preferences ("the brain") | `docs/BRAIN.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md` | Claude reads them on the first message (see prompt below) |
| Code, films, styleframes, research | the repo | always there |
| Repos you shared (Remotion, OpenMontage, awesome-opus5-5-videos) | `references/` | pinned submodules |
| Connectors (Publora, Gmail, Drive…) | your claude.ai account | available in every chat |

## 2. First message in the new chat (copy and paste)

> This is my kanishk.wires workspace. Read CLAUDE.md, docs/BRAIN.md, docs/DECISIONS.md and docs/ROADMAP.md, and look at the skills in .claude/skills. Then give me a 5-line summary of where we are and what's next.

## 3. If something is missing

- **On another computer:** `git clone https://github.com/kanishk-986/kanishk-wires.git ~/reels-agent`, then `git submodule update --init --depth 1 references/OpenMontage references/awesome-opus5-5-videos`, then follow the setup in README.md (npm install in `studio/`, Python venv, regenerate music).
- **Pushing fails:** run `gh auth login` once.
- **Gmail tools fail:** reconnect Gmail in claude.ai connector settings.
