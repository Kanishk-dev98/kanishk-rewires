---
name: feedback-delivery-workflow
description: How Alok wants work delivered and saved: Downloads with new file names, opened, then committed and pushed to the repo
metadata:
  type: feedback
---

Deliver every video to `~/Downloads/<Project>/` under a **new file name per version** (v1, v2…) with styleframes, board and NOTES.md, then `open` it. Master with bt709 tags and `+faststart`. Then save it in `films/<project>/`, commit, and push to `origin main` of `kanishk-986/video-agent`; the user asked for "everything" (repos, videos, data, scripts, the brain) to live in this repo, and pushing after each finished deliverable has been the accepted pattern.

**Why:** once a file was overwritten while open in QuickTime and "it's not playing"; the user explicitly asked to keep everything in this repo.

**How to apply:** follow `.claude/skills/wires-film-pipeline` steps 4 to 6. Still ask before force-pushing, rewriting history, or committing anything that might hold secrets or third-party videos over 95 MB. Related: [[user-alok-kanishk-rewires]].
