---
name: video-agent-project
description: "The user's Instagram reel \"video agent\" lives in its own git repo at ~/reels-agent, separate from the antier repo"
metadata:
  node_type: memory
  type: project
  originSessionId: f975e55a-053f-4e74-a741-55b4a4e21a24
  modified: 2026-10-17T05:34:17.030Z
---

The user is building an agent that makes and posts ~10 faceless motion-graphics Instagram Reels a day about AI + marketing, on their **personal** Instagram account (so Remotion's free licence applies). As of 2026-10-15 it lives in its own git repo at `~/reels-agent` (branch `main`), **not** in the antier-intelligence-agent repo. The user asked for everything for this agent (repos they shared, reference-video analysis, research data) to be stored there. Remote: private https://github.com/kanishk-986/kanishk-rewires (renamed from kanishk-wires the same day) (created 2026-10-17 at the user's request to split the studio out; full history). The older https://github.com/kanishk-986/video-agent (created 2026-10-15) stays in use for other videos; the user said never to delete it or its data. Since 2026-10-17 each repo has its own folder: `~/kanishk-rewires` (symlinked as `~/reels-agent`) is the **Kanishk.Rewires** studio, the final brand name; origin = kanishk-rewires, and `~/video-agent` is a separate clone of video-agent, used for the other videos. Pushes from this Mac worked through credentials saved in the macOS keychain even though `gh` is not logged in. `docs/BRAIN.md` in the repo holds the full project context. The user's name is **Alok Diwan** (credit on their films); they work at Antier, which builds Abstraxn. Since 2026-10-17 the user works on it in a **separate VS Code window opened on `~/kanishk-rewires` (open that path, not the symlink, so its memory folder loads)** (the Kanishk.Rewires workspace (formerly kanishk.wires)), which has its own CLAUDE.md, project skills and seeded memory; point video requests there. The repo also holds long-form 16:9 brand films under `films/` (first: the 5:39 Abstraxn introduction film for their interview portfolio, 2026-10-15).

**Why:** The user explicitly wanted a separate space so the video agent's material doesn't mix with the intelligence agent.

**How to apply:** Put new video-agent work, research and reference material in `~/reels-agent`; read its `CLAUDE.md`, `docs/ROADMAP.md` and `docs/DECISIONS.md` first. Blocking inputs from the user: channel name/handle, niche, and their content "flow". The [[push-after-each-task]] authorization covers only the antier repo; confirm before assuming it extends here. See [[antier-agent-repo-auth]] for why pushes need a fresh login.
